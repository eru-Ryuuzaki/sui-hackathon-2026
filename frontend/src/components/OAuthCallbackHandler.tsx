import { useEffect } from 'react'
import { jwtDecode } from 'jwt-decode'
import { jwtToAddress } from '@mysten/zklogin'
import { api } from '@/services/api'
import { useUserStore } from '@/hooks/useUserStore'
import { triggerAlert } from '@/components/ui/SystemAlert'

export function OAuthCallbackHandler() {
  useEffect(() => {
    if (window.location.pathname !== '/auth/callback') return
    const fromHash = new URLSearchParams(window.location.hash.replace(/^#/, '')).get('id_token')
    const fromSearch = new URLSearchParams(window.location.search).get('id_token')
    const idToken = fromHash || fromSearch
    if (!idToken) {
      triggerAlert({ type: 'error', title: 'OAUTH ERROR', message: 'Missing id_token' })
      return
    }
    ;(async () => {
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
      const res = await api.get('/zklogin/salt', { params: { sub } })
      const salt = res.data?.salt
      const address = jwtToAddress(idToken, salt)
      const codename = decoded?.name || `NEURAL-${address.slice(-4)}`
      // If user exists, we respect their stored profile (especially if they customized their avatar)
      // If not, we register them with default codename from Google or truncated address
      const store = useUserStore.getState();
      const existingUser = store.users[address];
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
    })()
  }, [])
  return null
}
