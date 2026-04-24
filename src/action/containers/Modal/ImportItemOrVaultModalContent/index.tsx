import { useCallback, useEffect, useState } from 'react'

import { t } from '@lingui/core/macro'
import { usePair, useRecords, useVault } from '@tetherto/pearpass-lib-vault'
import { Button, Dialog } from '@tetherto/pearpass-lib-ui-kit'

import { useAutoLockPreferences } from '../../../../hooks/useAutoLockPreferences'
import { useGlobalLoading } from '../../../../shared/context/LoadingContext'
import { useRouter } from '../../../../shared/context/RouterContext'
import { useToast } from '../../../../shared/context/ToastContext'
import { logger } from '../../../../shared/utils/logger'

import { ShareLinkEntryContent } from './ShareLinkEntryContent'
import type { PreviewRecord } from './types'
import { VaultFoundPreviewContent } from './VaultFoundPreviewContent'

type Step = 'entry' | 'preview'

export type ImportItemOrVaultModalContentProps = {
  onClose: () => void
}

export const ImportItemOrVaultModalContent = ({
  onClose
}: ImportItemOrVaultModalContentProps) => {
  const { navigate } = useRouter() as {
    navigate: (
      page: string,
      opts?: {
        params?: Record<string, unknown>
        state?: Record<string, unknown>
      }
    ) => void
  }
  const { setToast } = useToast() as {
    setToast: (data: { message: string }) => void
  }
  const { setShouldBypassAutoLock } = useAutoLockPreferences() as {
    setShouldBypassAutoLock: (bypass: boolean) => void
  }

  const {
    data: vaultData,
    refetch,
    addDevice
  } = useVault() as {
    data?: { id?: string; name?: string; role?: string }
    refetch: (vaultId: string) => Promise<void>
    addDevice: (host: string) => Promise<void>
  }

  const {
    pairActiveVault,
    cancelPairActiveVault,
    isLoading: isPairing
  } = usePair() as {
    pairActiveVault: (code: string) => Promise<string | null | undefined>
    cancelPairActiveVault: () => void
    isLoading: boolean
  }

  const { data: records } = useRecords({
    variables: { filters: {} }
  }) as {
    data?: PreviewRecord[]
  }

  const [step, setStep] = useState<Step>('entry')
  const [shareLink, setShareLink] = useState('')

  useGlobalLoading({ isLoading: isPairing })

  useEffect(() => {
    setShouldBypassAutoLock(true)
    return () => setShouldBypassAutoLock(false)
  }, [setShouldBypassAutoLock])

  const handleClose = useCallback(() => {
    if (isPairing) {
      cancelPairActiveVault()
    }
    onClose()
  }, [cancelPairActiveVault, isPairing, onClose])

  const runPair = useCallback(
    async (code: string) => {
      const trimmed = code.trim()
      if (!trimmed) return

      return new Promise<void>((resolve) => {
        chrome.runtime.sendMessage(
          { type: 'GET_PLATFORM_INFO' },
          async (platform: { os?: string; arch?: string } | undefined) => {
            try {
              const vaultId = await pairActiveVault(trimmed)

              if (!vaultId) {
                throw new Error('Invalid invite code')
              }

              await refetch(vaultId)

              const host = platform?.os
                ? `${platform.os} ${platform.arch ?? ''}`.trim()
                : 'unknown'
              await addDevice(host)

              setStep('preview')
            } catch (error) {
              logger.error(
                'ImportItemOrVaultModalContent',
                'Pair failed',
                error
              )
              setToast({
                message: t`Failed to load vault. Please check your invite code.`
              })
            } finally {
              resolve()
            }
          }
        )
      })
    },
    [addDevice, pairActiveVault, refetch, setToast]
  )

  const handleContinue = useCallback(() => {
    void runPair(shareLink)
  }, [runPair, shareLink])

  const handlePasteClick = useCallback(async () => {
    try {
      const pastedText = await navigator.clipboard.readText()
      setShareLink(pastedText)
      void runPair(pastedText)
    } catch {
      setToast({
        message: t`Failed to paste from clipboard`
      })
    }
  }, [runPair, setToast])

  const handleSaveSharedVault = useCallback(() => {
    navigate('vault', {
      params: {},
      state: { recordType: 'all' }
    })
    onClose()
  }, [navigate, onClose])

  const isEntry = step === 'entry'
  const title = isEntry ? t`Import Item or Vault` : t`Import Vault`

  const footer = isEntry ? (
    <div className="flex w-full justify-end gap-[8px]">
      <Button
        variant="secondary"
        size="small"
        onClick={handleClose}
        data-testid="import-modal-discard"
      >
        {t`Discard`}
      </Button>
      <Button
        variant="primary"
        size="small"
        disabled={!shareLink.trim() || isPairing}
        isLoading={isPairing}
        onClick={handleContinue}
        data-testid="import-modal-continue"
      >
        {t`Continue`}
      </Button>
    </div>
  ) : (
    <div className="flex w-full justify-end gap-[8px]">
      <Button
        variant="secondary"
        size="small"
        onClick={handleClose}
        data-testid="import-modal-discard"
      >
        {t`Discard`}
      </Button>
      <Button
        variant="primary"
        size="small"
        onClick={handleSaveSharedVault}
        data-testid="import-vault-preview-save"
      >
        {t`Save Shared Vault`}
      </Button>
    </div>
  )

  return (
    <Dialog
      title={title}
      onClose={handleClose}
      testID="import-vault-dialog"
      closeButtonTestID="import-vault-close"
      footer={footer}
    >
      {isEntry ? (
        <ShareLinkEntryContent
          shareLink={shareLink}
          onShareLinkChange={setShareLink}
          onPasteClick={handlePasteClick}
          disabled={isPairing}
        />
      ) : (
        <VaultFoundPreviewContent
          vaultName={vaultData?.name}
          vaultRole={vaultData?.role}
          records={records ?? []}
        />
      )}
    </Dialog>
  )
}
