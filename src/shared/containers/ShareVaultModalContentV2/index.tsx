import { useEffect, useRef, useState } from 'react'

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

import { createStyles } from './ShareVaultModalContentV2.styles'
import { useModal } from '../../context/ModalContext'
import { useToast } from '../../context/ToastContext'
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard'
import { useAutoLockPreferences } from '../../../hooks/useAutoLockPreferences'

export const ShareVaultModalContentV2 = () => {
  const { setToast } = useToast() as {
    setToast: (toast: { message: string; type?: string }) => void
  }
  const { closeModal } = useModal()
  const { theme } = useTheme()
  const { colors } = theme
  const [qrSvg, setQrSvg] = useState('')
  const { createInvite, deleteInvite, data } = useInvite() as {
    createInvite: () => Promise<void> | void
    deleteInvite: () => Promise<void> | void
    data: { publicKey?: string; vaultId?: string } | undefined
  }
  const { data: activeVault } = useVault()
  const { setShouldBypassAutoLock } = useAutoLockPreferences() as {
    setShouldBypassAutoLock: (value: boolean) => void
  }
  const { copyToClipboard, isCopied } = useCopyToClipboard({
    onCopy: () => {
      setToast({ message: t`Copied to clipboard` })
    }
  }) as {
    copyToClipboard: (text: string) => boolean
    isCopied: boolean
  }

  const expireTime = useCountDown({
    initialSeconds: 120,
    onFinish: closeModal
  })

  useEffect(() => {
    setShouldBypassAutoLock(true)
    return () => setShouldBypassAutoLock(false)
  }, [setShouldBypassAutoLock])

  // Refs keep the latest functions without re-running the create/delete effect
  // every render — useInvite returns fresh references each time.
  const createInviteRef = useRef(createInvite)
  createInviteRef.current = createInvite
  const deleteInviteRef = useRef(deleteInvite)
  deleteInviteRef.current = deleteInvite
  const hasInviteRef = useRef(!!data?.publicKey)
  hasInviteRef.current = !!data?.publicKey

  // Mount/unmount only — refs hold the latest references so the effect doesn't
  // re-run on every render of useInvite.
  useEffect(() => {
    if (!hasInviteRef.current) {
      void createInviteRef.current()
    }

    return () => {
      void deleteInviteRef.current()
    }
  }, [])

  useEffect(() => {
    if (data?.publicKey) {
      generateQRCodeSVG(data.publicKey, { type: 'svg', margin: 0 }).then(
        (value: string) => setQrSvg(value)
      )
    }
  }, [data])

  const styles = createStyles(colors)

  const handleCopyKey = () => {
    if (data?.publicKey) {
      copyToClipboard(data.publicKey)
    } else {
      setToast({ message: t`Invite code not found` })
    }
  }

  const displayLink = isCopied ? t`Copied!` : (data?.publicKey ?? '')

  const vaultName = activeVault?.name ?? t`Vault`

  return (
    <Dialog
      title={t`Share ${vaultName}`}
      onClose={closeModal}
      testID="share-vault-dialog-v2"
      closeButtonTestID="share-vault-close-v2"
    >
      <div style={styles.body}>
        <Text variant="caption" color={colors.colorTextSecondary}>
          {t`Access Code`}
        </Text>
        <div style={styles.accessPanel}>
          <div style={styles.qrWrap}>
            <div
              style={styles.qrInner}
              dangerouslySetInnerHTML={{ __html: qrSvg }}
            />
          </div>
          <div style={styles.timerRow}>
            <RingSpinner />
            <div style={styles.timerTextRow}>
              <Text as="span" variant="label" color={colors.colorTextSecondary}>
                {t`Code expires in`}
              </Text>
              <Text as="span" variant="label" color={colors.colorTextSecondary}>
                {` ${expireTime}s`}
              </Text>
            </div>
          </div>
          <div role="separator" style={styles.divider} />
          <div style={styles.vaultLinkSection}>
            <div style={styles.vaultLinkTextColumn}>
              <Text variant="caption" color={colors.colorTextSecondary}>
                {t`Vault Link`}
              </Text>
              <div style={styles.vaultLinkValue} title={data?.publicKey ?? ''}>
                <Text as="span" variant="label" color={colors.colorTextPrimary}>
                  {displayLink}
                </Text>
              </div>
            </div>
            <Button
              variant="tertiary"
              size="small"
              aria-label={t`Copy vault key`}
              data-testid="share-vault-v2-copy-link"
              onClick={handleCopyKey}
            >
              <ContentCopy
                width={24}
                height={24}
                color={colors.colorTextPrimary}
              />
            </Button>
          </div>
        </div>
      </div>
    </Dialog>
  )
}
