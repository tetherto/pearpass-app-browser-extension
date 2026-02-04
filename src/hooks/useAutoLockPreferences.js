import { useEffect, useState, useCallback } from 'react'

import {
  BE_AUTO_LOCK_ENABLED,
  DEFAULT_AUTO_LOCK_TIMEOUT
} from 'pearpass-lib-constants'

import { MESSAGE_TYPES } from '../shared/services/messageBridge'

export function useAutoLockPreferences() {
  const [isAutoLockEnabled, setIsAutoLockEnabledState] =
    useState(BE_AUTO_LOCK_ENABLED)
  const [timeoutMs, setTimeoutMsState] = useState(DEFAULT_AUTO_LOCK_TIMEOUT)

  // Subscribe to storage
  useEffect(() => {
    chrome.storage.local.get(
      ['autoLockEnabled', 'autoLockTimeoutMs'],
      (res) => {
        if (typeof res.autoLockEnabled === 'boolean') {
          setIsAutoLockEnabledState(res.autoLockEnabled)
        }
        //newValue can be null when selected "never"
        if (
          typeof res.autoLockTimeoutMs === 'number' ||
          res.autoLockTimeoutMs === null
        ) {
          setTimeoutMsState(res.autoLockTimeoutMs)
        }
      }
    )

    const listener = (changes) => {
      if (changes.autoLockEnabled) {
        setIsAutoLockEnabledState(changes.autoLockEnabled.newValue)
      }
      //newValue can be null when selected "never"
      if (
        changes.autoLockTimeoutMs ||
        changes.autoLockTimeoutMs?.newValue === null
      ) {
        setTimeoutMsState(changes.autoLockTimeoutMs.newValue)
      }
    }

    chrome.storage.onChanged.addListener(listener)
    return () => chrome.storage.onChanged.removeListener(listener)
  }, [])

  const setAutoLockEnabled = useCallback((autoLockEnabled) => {
    chrome.runtime.sendMessage({
      type: MESSAGE_TYPES.SET_AUTO_LOCK_ENABLED,
      autoLockEnabled
    })
  }, [])

  const setTimeoutMs = useCallback((ms) => {
    chrome.runtime.sendMessage({
      type: MESSAGE_TYPES.SET_AUTO_LOCK_TIMEOUT,
      autoLockTimeoutMs: ms
    })
  }, [])

  return {
    isAutoLockEnabled,
    timeoutMs,
    setAutoLockEnabled,
    setTimeoutMs
  }
}
