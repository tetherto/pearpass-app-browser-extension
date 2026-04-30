import type { ChangeEvent } from 'react'
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState
} from 'react'

import { t } from '@lingui/core/macro'
import {
  Button,
  Dialog,
  InputField,
  Text,
  useTheme
} from '@tetherto/pearpass-lib-ui-kit'
import { ContentPaste } from '@tetherto/pearpass-lib-ui-kit/icons'
import { usePair, useVault } from '@tetherto/pearpass-lib-vault'

import { ImportVaultPreviewModalContent } from '../ImportVaultPreviewModalContent'
import { useGlobalLoading } from '../../context/LoadingContext'
import { useModal } from '../../context/ModalContext'
import { useToast } from '../../context/ToastContext'
import { useAutoLockPreferences } from '../../../hooks/useAutoLockPreferences'
import { logger } from '../../utils/logger'

const getPlatformInfo = (): Promise<{ os: string; arch: string } | null> =>
  new Promise((resolve) => {
    try {
      chrome.runtime.sendMessage(
        { type: 'GET_PLATFORM_INFO' },
        (response: { os?: string; arch?: string } | undefined) => {
          if (chrome.runtime.lastError || !response?.os) {
            logger.error(
              'ImportItemOrVaultModalContentV2',
              'Failed to get platform info',
              chrome.runtime.lastError
            )
            resolve(null)
            return
          }
          resolve({ os: response.os, arch: response.arch ?? '' })
        }
      )
    } catch (error) {
      logger.error(
        'ImportItemOrVaultModalContentV2',
        'Failed to send platform info request',
        error
      )
      resolve(null)
    }
  })

export const ImportItemOrVaultModalContentV2 = () => {
  const { theme } = useTheme()
  const { colors } = theme
  const { closeModal, closeAllModals, setModal } = useModal()
  const { setToast } = useToast() as {
    setToast: (toast: { message: string; type?: string }) => void
  }

  const [shareLink, setShareLink] = useState('')
  const { refetch: refetchVault, addDevice } = useVault()
  const {
    pairActiveVault,
    isLoading: isPairing,
    cancelPairActiveVault
  } = usePair() as {
    pairActiveVault: (code: string) => Promise<string | undefined>
    isLoading: boolean
    cancelPairActiveVault: () => void
  }
  const { setShouldBypassAutoLock } = useAutoLockPreferences() as {
    setShouldBypassAutoLock: (value: boolean) => void
  }
  const shareLinkInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    setShouldBypassAutoLock(true)
    return () => setShouldBypassAutoLock(false)
  }, [setShouldBypassAutoLock])

  useGlobalLoading({ isLoading: isPairing })

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isPairing) {
        cancelPairActiveVault()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [cancelPairActiveVault, isPairing])

  const handleLoadVault = useCallback(
    async (code: string) => {
      try {
        const vaultId = await pairActiveVault(code)

        if (!vaultId) {
          throw new Error('Vault ID is empty')
        }

        await refetchVault(vaultId)

        const platform = await getPlatformInfo()
        const host = platform
          ? `${platform.os} ${platform.arch}`.trim()
          : 'unknown'
        await addDevice(host)

        closeAllModals()
        setModal(<ImportVaultPreviewModalContent />)
      } catch (error) {
        logger.error(
          'ImportItemOrVaultModalContentV2',
          'Error pairing vault:',
          error
        )
        setShareLink('')
        setToast({
          message: t`Something went wrong, please check invite code`
        })
      }
    },
    [
      pairActiveVault,
      refetchVault,
      addDevice,
      closeAllModals,
      setModal,
      setToast
    ]
  )

  const handleChange = (value: string) => {
    if (isPairing) {
      return
    }
    setShareLink(value)
  }

  const processPastedText = useCallback(
    (pastedText: string) => {
      const text = (pastedText ?? '').trim()
      if (!text) {
        return
      }
      setShareLink(text)
      if (!isPairing) {
        void handleLoadVault(text)
      }
    },
    [isPairing, handleLoadVault]
  )

  const handlePaste = useCallback(
    (e: ClipboardEvent) => {
      const pastedText = e.clipboardData?.getData('text')
      processPastedText(pastedText ?? '')
    },
    [processPastedText]
  )

  useLayoutEffect(() => {
    const el = shareLinkInputRef.current
    if (!el) {
      return
    }
    const listener = (event: Event) => {
      handlePaste(event as ClipboardEvent)
    }
    el.addEventListener('paste', listener)
    return () => {
      el.removeEventListener('paste', listener)
    }
  }, [handlePaste])

  const handlePasteClick = async () => {
    try {
      const pastedText = await navigator.clipboard.readText()
      processPastedText(pastedText)
    } catch (error) {
      logger.error(
        'ImportItemOrVaultModalContentV2',
        'Failed to paste from clipboard:',
        error
      )
      setToast({ message: t`Failed to paste from clipboard` })
    }
  }

  const handleContinue = () => {
    const trimmed = shareLink.trim()
    if (!trimmed || isPairing) {
      return
    }
    void handleLoadVault(trimmed)
  }

  const canContinue = Boolean(shareLink.trim()) && !isPairing

  return (
    <Dialog
      title={t`Import Vault`}
      onClose={closeModal}
      testID="import-vault-dialog-v2"
      closeButtonTestID="import-vault-close-v2"
      footer={
        <div className="flex w-full items-center justify-end gap-[var(--spacing8)]">
          <Button
            variant="secondary"
            size="small"
            type="button"
            data-testid="import-modal-discard"
            onClick={closeModal}
          >
            {t`Discard`}
          </Button>
          <Button
            variant="primary"
            size="small"
            type="button"
            data-testid="import-modal-continue"
            disabled={!canContinue}
            onClick={handleContinue}
          >
            {t`Continue`}
          </Button>
        </div>
      }
    >
      <div className="flex w-full flex-col items-stretch">
        <Text variant="caption" color={colors.colorTextSecondary}>
          {t`Share Link`}
        </Text>
        <div className="mt-[var(--spacing12)]">
          <InputField
            label={t`Vault Link`}
            placeholder={t`Enter Share Link`}
            inputRef={shareLinkInputRef}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              handleChange(e.target.value)
            }
            value={shareLink}
            testID="import-share-link-input"
            rightSlot={
              <Button
                variant="tertiary"
                size="small"
                aria-label={t`Paste from clipboard`}
                data-testid="import-share-link-paste"
                onClick={handlePasteClick}
                iconBefore={
                  <ContentPaste
                    width={18}
                    height={18}
                    color={colors.colorTextPrimary}
                  />
                }
              />
            }
          />
        </div>
        {isPairing && (
          <div className="mt-[var(--spacing12)]">
            <Text variant="caption" color={colors.colorTextSecondary}>
              {t`Click Escape to cancel pairing`}
            </Text>
          </div>
        )}
      </div>
    </Dialog>
  )
}
