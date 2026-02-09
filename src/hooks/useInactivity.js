import { useEffect, useRef } from 'react'

import { useUserData, useVaults } from 'pearpass-lib-vault'

import { useAutoLockPreferences } from './useAutoLockPreferences'
import { NAVIGATION_ROUTES } from '../shared/constants/navigation'
import { useLoadingContext } from '../shared/context/LoadingContext'
import { useModal } from '../shared/context/ModalContext'
import { useRouter } from '../shared/context/RouterContext'
import { MESSAGE_TYPES } from '../shared/services/messageBridge'
import { createHeartbeat } from '../shared/utils/heartBeat'
import { logger } from '../shared/utils/logger'

const sendResetTimer = createHeartbeat(() => {
  chrome.runtime.sendMessage({
    type: MESSAGE_TYPES.RESET_TIMER
  })
}, 1000)

export function useInactivity() {
  const { isAutoLockEnabled, timeoutMs } = useAutoLockPreferences()

  const { setIsLoading } = useLoadingContext()
  const { navigate } = useRouter()
  const { refetch: refetchUser } = useUserData()
  const { closeAllModals } = useModal()
  const { resetState } = useVaults()

  const timerRef = useRef(null)

  const resetTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    if (!isAutoLockEnabled || timeoutMs === null) {
      return
    }

    sendResetTimer()

    timerRef.current = window.setTimeout(async () => {
      const userData = await refetchUser()
      logger.log(
        'INACTIVITY-TIMER',
        `Triggered, user data: ${JSON.stringify(userData)}`
      )

      if (!userData.isLoggedIn) return

      setIsLoading(true)
      closeAllModals()

      setIsLoading(false)

      navigate('welcome', {
        params: { state: NAVIGATION_ROUTES.MASTER_PASSWORD }
      })

      resetState()
      logger.log('INACTIVITY-TIMER', 'Completed')
    }, timeoutMs)
  }

  useEffect(() => {
    const events = ['mousemove', 'keydown', 'mousedown', 'touchstart', 'scroll']

    events.forEach((e) => window.addEventListener(e, resetTimer))

    // reset when settings change
    resetTimer()

    return () => {
      events.forEach((e) => window.removeEventListener(e, resetTimer))
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isAutoLockEnabled, timeoutMs])
}
