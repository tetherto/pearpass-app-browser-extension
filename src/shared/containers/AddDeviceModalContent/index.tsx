import { useEffect, useState } from 'react'

import { t } from '@lingui/core/macro'
import { useCountDown } from '@tetherto/pear-apps-lib-ui-react-hooks'
import { generateQRCodeSVG } from '@tetherto/pear-apps-utils-qr'
import {
  Button,
  Dialog,
  RingSpinner,
  Text,
  useTheme
} from '@tetherto/pearpass-lib-ui-kit'
import { ContentCopy } from '@tetherto/pearpass-lib-ui-kit/icons'
import { useInvite, useVault } from '@tetherto/pearpass-lib-vault'

import { useAutoLockPreferences } from '../../../hooks/useAutoLockPreferences'
import { useModal } from '../../context/ModalContext'
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard'

export const AddDeviceModalContent = () => {
  const { closeModal } = useModal() as { closeModal: () => void }
  const { theme } = useTheme()
  const { colors } = theme

  const [qrSvg, setQrSvg] = useState('')
  const { createInvite, deleteInvite, data } = useInvite()
  const { data: activeVault } = useVault()
  const { setShouldBypassAutoLock } = useAutoLockPreferences() as {
    setShouldBypassAutoLock: (v: boolean) => void
  }

  const expireTime = useCountDown({
    initialSeconds: 120,
    onFinish: closeModal
  })

  const { copyToClipboard, isCopied } = useCopyToClipboard()

  useEffect(() => {
    setShouldBypassAutoLock(true)
    return () => setShouldBypassAutoLock(false)
  }, [setShouldBypassAutoLock])

  useEffect(() => {
    createInvite()
    return () => {
      deleteInvite()
    }
  }, [])

  useEffect(() => {
    if (data?.publicKey) {
      generateQRCodeSVG(data.publicKey, { type: 'svg', margin: 0 }).then(
        (value: string) => setQrSvg(value)
      )
    }
  }, [data])

  const handleCopyKey = () => {
    if (data?.publicKey) {
      copyToClipboard(data.publicKey)
    }
  }

  const displayLink = isCopied ? t`Copied!` : (data?.publicKey ?? '')

  const vaultName = activeVault?.name ?? t`Vault`

  return (
    <Dialog
      title={t`Share ${vaultName}`}
      onClose={closeModal}
      testID="add-device-dialog"
      closeButtonTestID="add-device-close"
    >
      <div className="box-border flex flex-col gap-[12px]">
        <Text variant="caption" color={colors.colorTextSecondary}>
          {t`Access Code`}
        </Text>
        <div className="bg-surface-primary border-border-primary box-border flex flex-col items-stretch rounded-[8px] border">
          <div className="mt-[24px] mb-[16px] flex items-center justify-center">
            <div
              className="bg-surface-hover box-border flex h-[160px] w-[160px] items-center justify-center rounded-[8px] p-[10px]"
              dangerouslySetInnerHTML={{ __html: qrSvg }}
            />
          </div>
          <div className="mb-[24px] flex flex-row flex-wrap items-center justify-center gap-[8px]">
            <RingSpinner size={14} />
            <div className="flex flex-row flex-wrap items-center gap-[4px]">
              <Text as="span" variant="label" color={colors.colorTextSecondary}>
                {t`Code expires in`}
              </Text>
              <Text as="span" variant="label" color={colors.colorTextPrimary}>
                {expireTime}s
              </Text>
            </div>
          </div>
          <div
            role="separator"
            className="bg-border-primary m-0 h-px w-full shrink-0 border-none p-0"
          />
          <div className="box-border flex w-full min-w-0 flex-row items-center gap-[4px] p-[12px]">
            <div className="flex min-w-0 flex-1 flex-col items-stretch gap-[8px]">
              <Text variant="caption" color={colors.colorTextSecondary}>
                {t`Vault Link`}
              </Text>
              <div
                className="block max-w-full min-w-0 overflow-hidden text-ellipsis whitespace-nowrap"
                title={data?.publicKey ?? ''}
              >
                <Text as="span" variant="label" color={colors.colorTextPrimary}>
                  {displayLink}
                </Text>
              </div>
            </div>
            <Button
              variant="tertiary"
              size="small"
              aria-label={t`Copy vault key`}
              data-testid="add-device-copy-link"
              onClick={handleCopyKey}
              iconBefore={
                <ContentCopy
                  width={24}
                  height={24}
                  color={colors.colorTextPrimary}
                />
              }
            />
          </div>
        </div>
      </div>
    </Dialog>
  )
}
