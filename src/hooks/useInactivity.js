import { useEffect, useRef } from 'react'

import { closeAllInstances, useUserData, useVaults } from 'pearpass-lib-vault'

import {
  getAutoLockTimeoutMs,
  isAutoLockEnabled
} from './useAutoLockPreferences'
import { NAVIGATION_ROUTES } from '../shared/constants/navigation'
import { useLoadingContext } from '../shared/context/LoadingContext'
import { useModal } from '../shared/context/ModalContext'
import { useRouter } from '../shared/context/RouterContext'
import { logger } from '../shared/utils/logger'

/**
 * @returns {void}
 */
export function useInactivity() {
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

    if (!isAutoLockEnabled()) {
      return
    }

    const timeoutMs = getAutoLockTimeoutMs()

    timerRef.current = setTimeout(async () => {
      const userData = await refetchUser()
      logger.log(
        'INACTIVITY-TIMER',
        `Inactivity timer triggered, user data: ${JSON.stringify(userData)}`
      )

      if (!userData.isLoggedIn) {
        return
      }

      setIsLoading(true)
      closeAllModals()
      await closeAllInstances()
      setIsLoading(false)
      navigate('welcome', {
        params: { state: NAVIGATION_ROUTES.MASTER_PASSWORD }
      })
      resetState()

      logger.log('INACTIVITY-TIMER', 'Inactivity timer reset')
    }, timeoutMs)
  }

  const activityEvents = [
    'mousemove',
    'keydown',
    'mousedown',
    'touchstart',
    'scroll'
  ]

  useEffect(() => {
    // Handler for settings changes - reset timer with new values
    const handleSettingsChange = () => resetTimer()

    activityEvents.forEach((event) =>
      window.addEventListener(event, resetTimer)
    )

    // Listen for auto-lock settings changes
    window.addEventListener('auto-lock-settings-changed', handleSettingsChange)

    resetTimer()

    return () => {
      activityEvents.forEach((event) =>
        window.removeEventListener(event, resetTimer)
      )
      window.removeEventListener(
        'auto-lock-settings-changed',
        handleSettingsChange
      )
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])
}
