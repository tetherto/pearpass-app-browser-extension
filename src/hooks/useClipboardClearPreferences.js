import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react'

import { DEFAULT_CLIPBOARD_CLEAR_TIMEOUT } from '@tetherto/pearpass-lib-constants'

import { MESSAGE_TYPES } from '../shared/services/messageBridge'

export const ClipboardClearContext = createContext({
  clipboardClearTimeoutMs: DEFAULT_CLIPBOARD_CLEAR_TIMEOUT,
  setClipboardClearTimeoutMs: () => {}
})

export const ClipboardClearProvider = ({ children }) => {
  const [clipboardClearTimeoutMs, setClipboardClearTimeoutMsState] = useState(
    DEFAULT_CLIPBOARD_CLEAR_TIMEOUT
  )

  useEffect(() => {
    chrome.storage.local.get('clipboardClearTimeoutMs', (res) => {
      if (
        typeof res.clipboardClearTimeoutMs === 'number' ||
        res.clipboardClearTimeoutMs === null
      ) {
        setClipboardClearTimeoutMsState(res.clipboardClearTimeoutMs)
      }
    })

    const listener = (changes) => {
      if (
        changes.clipboardClearTimeoutMs ||
        changes.clipboardClearTimeoutMs?.newValue === null
      ) {
        setClipboardClearTimeoutMsState(
          changes.clipboardClearTimeoutMs.newValue
        )
      }
    }

    chrome.storage.onChanged.addListener(listener)
    return () => chrome.storage.onChanged.removeListener(listener)
  }, [])

  const setClipboardClearTimeoutMs = useCallback((ms) => {
    setClipboardClearTimeoutMsState(ms)
    chrome.runtime.sendMessage({
      type: MESSAGE_TYPES.SET_CLIPBOARD_CLEAR_TIMEOUT,
      clipboardClearTimeoutMs: ms
    })
  }, [])

  const value = useMemo(
    () => ({ clipboardClearTimeoutMs, setClipboardClearTimeoutMs }),
    [clipboardClearTimeoutMs, setClipboardClearTimeoutMs]
  )

  return createElement(ClipboardClearContext.Provider, { value }, children)
}

export const useClipboardClearPreferences = () =>
  useContext(ClipboardClearContext)
