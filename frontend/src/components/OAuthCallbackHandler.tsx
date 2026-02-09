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
      const sub = decoded?.sub
      if (!sub) {
        triggerAlert({ type: 'error', title: 'OAUTH ERROR', message: 'Invalid token' })
        return
      }
      const res = await api.get('/zklogin/salt', { params: { sub } })
      const salt = res.data?.salt
      const address = jwtToAddress(idToken, salt)
      const codename = decoded?.name || `NEURAL-${address.slice(-4)}`
      const store = useUserStore.getState()
      if (!store.users[address]) store.register(address, codename)
      store.login(address)
      triggerAlert({ type: 'success', title: 'ZKLOGIN READY', message: address })
      history.replaceState(null, '', '/')
    })()
  }, [])
  return null
}
