import { useEffect, useRef } from 'react'
import { jwtDecode } from 'jwt-decode'
import { jwtToAddress } from '@mysten/zklogin'
import { api } from '@/services/api'
import { useUserStore } from '@/hooks/useUserStore'
import { triggerAlert } from '@/components/ui/SystemAlert'
import { useGlobalLoader } from '@/components/ui/GlobalLoader'

export function OAuthCallbackHandler() {
  const processedRef = useRef(false);
  const loader = useGlobalLoader();

  useEffect(() => {
    if (processedRef.current) return;

    if (window.location.pathname !== '/auth/callback') return
    const fromHash = new URLSearchParams(window.location.hash.replace(/^#/, '')).get('id_token')
    const fromSearch = new URLSearchParams(window.location.search).get('id_token')
    const idToken = fromHash || fromSearch
    if (!idToken) {
      // Don't mark as processed here, maybe the user navigated here by mistake and will refresh? 
      // Or actually, if it's missing, it's an error. But to be safe against double-invocations in strict mode:
      if (!processedRef.current) {
         triggerAlert({ type: 'error', title: 'OAUTH ERROR', message: 'Missing id_token' })
         processedRef.current = true;
      }
      return
    }

    processedRef.current = true;
    loader.show("INITIALIZING NEURAL LINK...");

    ;(async () => {
      try {
        const decoded: any = jwtDecode(idToken)
        const expectedNonce = sessionStorage.getItem('engram_oauth_nonce')
        if (!decoded?.nonce || decoded.nonce !== expectedNonce) {
          triggerAlert({ type: 'error', title: 'OAUTH ERROR', message: 'Nonce mismatch' })
          return
        }
        const sub = decoded?.sub
        if (!sub) {
          triggerAlert({ type: 'error', title: 'OAUTH ERROR', message: 'Invalid token' })
          return
        }
        
        loader.show("RETRIEVING ZK PROOFS...");
        const res = await api.get('/zklogin/salt', { params: { sub } })
        const salt = res.data?.salt
        const address = jwtToAddress(idToken, salt)
        const codename = decoded?.name || `NEURAL-${address.slice(-4)}`
        // If user exists, we respect their stored profile (especially if they customized their avatar)
        // If not, we register them with default codename from Google or truncated address
        const store = useUserStore.getState();
        const existingUser = store.users[address];
        
        loader.show("ESTABLISHING CONSTRUCT CONNECTION...");
        await new Promise(resolve => setTimeout(resolve, 800)); // Cinematic delay

        if (!existingUser) {
            // NEW USER: Register with basic info
            store.register(address, codename);
            
            // NOTE: For new users, we might want to trigger the "First Login" animation in Terminal.
            // The Terminal component watches `currentUser` changes. 
            // If `store.users[address]` was undefined, `register` sets `currentUser`.
            // Terminal detects `!history.some(...)` and starts the sequence.
        } else {
            // EXISTING USER: Just login
            store.login(address);
        }
        
        sessionStorage.removeItem('engram_oauth_nonce')
        // triggerAlert({ type: 'success', title: 'ZKLOGIN READY', message: address })
        history.replaceState(null, '', '/')
        // Manually set the connected account in the dApp Kit context if possible, 
        // but standard dApp Kit doesn't support programmatic injection easily for zkLogin without a custom provider.
        // Since HUD relies on `useCurrentAccount()`, we need to mock it or make HUD support our custom user store login state.
        
        // For now, we rely on our UserStore 'currentUser' as the source of truth for ZK Login users.
        // We will update HUD to check UserStore in addition to useCurrentAccount.
      } catch (e) {
        console.error("ZKLogin Error:", e);
        triggerAlert({ type: 'error', title: 'LOGIN FAILED', message: 'Neural link connection refused.' });
      } finally {
        loader.hide();
      }
    })()
  }, [])
  return null
}
