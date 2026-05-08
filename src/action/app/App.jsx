import { useEffect, useRef } from 'react'

import { rawTokens, useTheme } from '@tetherto/pearpass-lib-ui-kit'
import { useVaults } from '@tetherto/pearpass-lib-vault'

import { useRedirect } from './hooks/useRedirect'
import { useWindowResize } from './hooks/useWindowResize'
import { Loading } from './Loading'
import { Routes } from './Routes'
import { FadeInWrapper } from '../../shared/components/FadeInWrapper'
import { WelcomePageWrapper } from '../../shared/components/WelcomePageWrapper'
import { DYNAMIC_WINDOW_MAX_HEIGHT } from '../../shared/constants/windowSizes'
import { useBlockingStateContext } from '../../shared/context/BlockingStateContext'
import { useGlobalLoading } from '../../shared/context/LoadingContext'
import { useVaultAccessRevoked } from '../../shared/hooks/useVaultAccessRevoked'
import { isV2 } from '../../shared/utils/designVersion'
import { AppHeaderContainer } from '../containers/AppHeaderContainer'

export const App = () => {
  const { isChecking: isBlockingStateChecking } = useBlockingStateContext()
  const { isLoading: isRedirectLoading } = useRedirect()
  const { theme } = useTheme()
  const windowSize = useWindowResize()
  const containerRef = useRef(null)
  const observerRef = useRef(null)

  const isLoading = isBlockingStateChecking || isRedirectLoading

  useGlobalLoading({ isLoading })

  const { triggerAccessRevoked } = useVaultAccessRevoked()
  const { data: vaultsForDevTrigger } = useVaults()
  useEffect(() => {
    // Dev hook: action-bus mechanism is not implemented yet, so for now the
    // delete handler is fired manually from devtools or tests.
    if (typeof window === 'undefined') return
    const list = vaultsForDevTrigger ?? []
    const devTrigger = (vaultIdOrName, deviceName) => {
      const match =
        list.find((v) => v.id === vaultIdOrName) ??
        list.find((v) => v.name === vaultIdOrName)
      if (!match) {
        // eslint-disable-next-line no-console
        console.error(
          `[pearpassTriggerAccessRevoked] no vault matched "${vaultIdOrName}". Available:`,
          list.map((v) => ({ id: v.id, name: v.name }))
        )
        return
      }
      return triggerAccessRevoked(match.id, deviceName)
    }

    window.__pearpassTriggerAccessRevoked = devTrigger
    return () => {
      delete window.__pearpassTriggerAccessRevoked
    }
  }, [triggerAccessRevoked, vaultsForDevTrigger])

  const containerClassName = isV2()
    ? 'bg-background flex flex-col'
    : 'bg-black-mode1 flex items-center'

  const heightStyle =
    windowSize.height !== null && windowSize.height !== undefined
      ? { height: `${windowSize.height}px` }
      : windowSize.minHeight !== null && windowSize.minHeight !== undefined
        ? { minHeight: `${windowSize.minHeight}px` }
        : {}

  // For dynamic-height pages (v2 passkey flow): measure the rendered content
  // height and keep the Chrome popup window in sync via ResizeObserver.
  useEffect(() => {
    if (!windowSize.dynamic) {
      observerRef.current?.disconnect()
      observerRef.current = null
      return
    }

    const el = containerRef.current
    if (!el || typeof ResizeObserver === 'undefined') return

    let cancelled = false

    chrome.windows.getCurrent?.((currentWindow) => {
      if (cancelled) return
      if (chrome.runtime.lastError || currentWindow?.type !== 'popup') return

      observerRef.current?.disconnect()

      const computeClampedHeight = (rawContentHeight) => {
        const contentHeight = Math.ceil(rawContentHeight)
        if (!contentHeight) return null
        const frameHeight = Math.max(0, window.outerHeight - window.innerHeight)
        return Math.min(
          DYNAMIC_WINDOW_MAX_HEIGHT + frameHeight,
          contentHeight + frameHeight
        )
      }

      // Immediate first sync — don't wait for the async ResizeObserver to fire
      // (during which the OS shows the window at its default opening size).
      const initialHeight = computeClampedHeight(
        el.getBoundingClientRect().height
      )
      if (initialHeight) {
        chrome.windows.update?.(currentWindow.id, { height: initialHeight })
      }

      const observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const blockSize =
            entry.borderBoxSize?.[0]?.blockSize ?? entry.contentRect.height
          const clampedHeight = computeClampedHeight(blockSize)
          if (clampedHeight === null) continue
          chrome.windows.update?.(currentWindow.id, {
            height: clampedHeight
          })
        }
      })

      observer.observe(el)
      observerRef.current = observer
    })

    return () => {
      cancelled = true
      observerRef.current?.disconnect()
      observerRef.current = null
    }
  }, [windowSize.dynamic])

  const containerStyle = {
    ...heightStyle,
    width: `${windowSize.width}px`,
    ...(isV2()
      ? {
          padding: '4px',
          border: `1px solid ${theme.colors.colorBorderTertiary}`,
          borderRadius: `${rawTokens.radius8}px`,
          boxSizing: 'border-box'
        }
      : {})
  }

  return (
    <div
      ref={containerRef}
      className={containerClassName}
      style={containerStyle}
    >
      {isLoading ? (
        isV2() ? (
          <Loading />
        ) : (
          <FadeInWrapper>
            <WelcomePageWrapper />
          </FadeInWrapper>
        )
      ) : isV2() ? (
        <>
          <AppHeaderContainer />
          <div className="flex min-h-0 flex-1 flex-col">
            <Routes />
          </div>
        </>
      ) : (
        <Routes />
      )}
    </div>
  )
}
