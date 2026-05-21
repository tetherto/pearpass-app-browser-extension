import { useEffect, useState } from 'react'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { useCountDown } from '@tetherto/pear-apps-lib-ui-react-hooks'
import { generateQRCodeSVG } from '@tetherto/pear-apps-utils-qr'
import { useTheme } from '@tetherto/pearpass-lib-ui-kit'
import {
  authoriseCurrentProtectedVault,
  useInvite,
  useVault
} from '@tetherto/pearpass-lib-vault'

import { useAutoLockPreferences } from '../../../hooks/useAutoLockPreferences'
import { ButtonLittle } from '../../../shared/components/ButtonLittle'
import { ButtonRoundIcon } from '../../../shared/components/ButtonRoundIcon'
import { CardWarning } from '../../../shared/components/CardWarningText'
import { useModal } from '../../../shared/context/ModalContext'
import { useRouter } from '../../../shared/context/RouterContext'
import { useToast } from '../../../shared/context/ToastContext'
import { useCopyToClipboard } from '../../../shared/hooks/useCopyToClipboard'
import { BackIcon } from '../../../shared/icons/BackIcon'
import { CopyIcon } from '../../../shared/icons/CopyIcon'
import { TimeIcon } from '../../../shared/icons/TimeIcon'
import { XIcon } from '../../../shared/icons/XIcon'
import { ImportItemOrVaultModalContent } from '../../containers/Modal/ImportItemOrVaultModalContent'
import { VaultPasswordForm } from '../../containers/VaultPasswordForm'

export const AddDevice = () => {
  const { theme } = useTheme()
  const { setShouldBypassAutoLock } = useAutoLockPreferences()

  useEffect(() => {
    setShouldBypassAutoLock(true)
    return () => setShouldBypassAutoLock(false)
  }, [setShouldBypassAutoLock])

  const { navigate } = useRouter()
  const { closeModal, setModal } = useModal()
  const [qrSvg, setQrSvg] = useState('')
  const { createInvite, deleteInvite, data } = useInvite()

  const [isProtected, setIsProtected] = useState(true)
  const { data: vaultData, isVaultProtected } = useVault()
  const expireTime = useCountDown({
    initialSeconds: 120,
    onFinish: closeModal
  })

  const { setToast } = useToast()

  const { copyToClipboard, isCopied } = useCopyToClipboard({
    onCopy: () => {
      setToast({
        message: t`Copied to clipboard`,
        icon: CopyIcon
      })
    }
  })

  useEffect(() => {
    createInvite()

    return () => {
      deleteInvite()
    }
  }, [])

  useEffect(() => {
    if (data?.publicKey) {
      generateQRCodeSVG(data.publicKey, { type: 'svg', margin: 0 }).then(
        setQrSvg
      )
    }
  }, [data])

  useEffect(() => {
    const checkProtection = async () => {
      const result = await isVaultProtected(vaultData?.id)
      setIsProtected(result)
    }
    checkProtection()
  }, [vaultData])

  if (isProtected) {
    return (
      <div className="bg-grey500-mode1 flex h-full w-full flex-col items-center gap-3 px-6 py-5 pb-2.5">
        <div className="flex w-full items-center justify-start gap-2.5 text-[18px] font-bold text-white">
          <ButtonLittle
            onClick={() => navigate('vault')}
            variant="secondary"
            startIcon={XIcon}
          />

          <Trans>Insert Vault’s password</Trans>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center gap-4">
          <div className="flex flex-col items-start gap-[10px]">
            <span className="text-grey100-mode1 font-inter text-xs font-normal">
              {t`Unlock with the ${vaultData.name ?? vaultData.id} Vault password`}
            </span>
          </div>
          <div className="">
            <VaultPasswordForm
              className={'items-center'}
              onSubmit={async (password) => {
                if (await authoriseCurrentProtectedVault(password)) {
                  setIsProtected(false)
                }
              }}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-grey500-mode1 flex h-full w-full flex-col items-center justify-between gap-2 px-6 py-4 pb-2.5">
      <div className="flex w-full flex-col gap-5">
        <div className="flex w-full items-start gap-2.5">
          <ButtonRoundIcon
            onClick={() => navigate('vault')}
            variant="secondary"
            startIcon={BackIcon}
          />

          <p className="text-white-mode1 font-inter h-[38px] flex-1 text-center text-[12px] font-normal">
            <Trans>
              Scan this QR code or paste the vault key into the PearPass app on
              your other device to connect it to your account. This method keeps
              your account secure.
            </Trans>
          </p>

          <div className="h-[32px] w-[32px] shrink-0" />
        </div>

        <div className="border-grey100-mode1 flex h-[36px] w-full rounded-[10px] border">
          <button className="bg-primary400-mode1 h-full w-1/2 rounded-[8px] px-4 py-2 text-sm font-medium text-black transition-colors">
            <Trans>Share this vault</Trans>
          </button>
          <button
            onClick={() => {
              setModal(<ImportItemOrVaultModalContent onClose={closeModal} />)
            }}
            className="text-primary400-mode1 h-full w-1/2 rounded-[8px] px-4 py-2 text-sm font-medium transition-colors"
          >
            <Trans>Import vault</Trans>
          </button>
        </div>
      </div>

      <>
        <div className="flex flex-col items-center gap-2">
          <div className="text-white-mode1 font-inter text-sm font-medium">
            <Trans>Scan this QR-code while in the PearPass App</Trans>
          </div>

          <div
            className="bg-white-mode1 h-[110px] w-[110px] rounded-[10px] p-2"
            dangerouslySetInnerHTML={{ __html: qrSvg }}
          />
        </div>

        <div className="bg-grey400-mode1 flex items-center justify-center gap-2 rounded-[10px] p-[7px_10px]">
          <div className="text-white-mode1 font-inter flex items-center gap-0.5 text-sm font-medium">
            <Trans>Expires in</Trans>
            <span className="text-primary400-mode1">{expireTime}</span>
          </div>

          <div className="flex-shrink-0">
            <TimeIcon color={theme.colors.colorPrimary} />
          </div>
        </div>

        <div
          className="bg-grey400-mode1 flex max-w-full cursor-pointer flex-col items-center gap-1.5 rounded-[10px] px-2.5 py-1.5"
          onClick={() => copyToClipboard(data?.publicKey)}
        >
          <div className="flex gap-2">
            <div className="flex-shrink-0">
              <CopyIcon color={theme.colors.colorPrimary} />
            </div>

            <div className="text-white-mode1 font-inter text-sm font-medium">
              <Trans>Copy vault key</Trans>
            </div>
          </div>

          <div className="text-grey200-mode1 font-inter max-w-full truncate text-base font-medium">
            {isCopied ? <Trans>Copied!</Trans> : data?.publicKey}
          </div>
        </div>

        <CardWarning
          text={t`Keep this code private. Anyone with it can connect a device to your vault.`}
        />
      </>
    </div>
  )
}
