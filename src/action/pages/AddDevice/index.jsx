import { useEffect, useState } from 'react'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { useCountDown } from 'pear-apps-lib-ui-react-hooks'
import { generateQRCodeSVG } from 'pear-apps-utils-qr'
import { colors } from 'pearpass-lib-ui-theme-provider'
import {
  authoriseCurrentProtectedVault,
  useInvite,
  usePair,
  useVault
} from 'pearpass-lib-vault'

import { ButtonLittle } from '../../../shared/components/ButtonLittle'
import { ButtonRoundIcon } from '../../../shared/components/ButtonRoundIcon'
import { CardWarning } from '../../../shared/components/CardWarningText'
import {
  useGlobalLoading,
  useLoadingContext
} from '../../../shared/context/LoadingContext'
import { useModal } from '../../../shared/context/ModalContext'
import { useRouter } from '../../../shared/context/RouterContext'
import { useToast } from '../../../shared/context/ToastContext'
import { useCopyToClipboard } from '../../../shared/hooks/useCopyToClipboard'
import { BackIcon } from '../../../shared/icons/BackIcon'
import { CopyIcon } from '../../../shared/icons/CopyIcon'
import { ErrorIcon } from '../../../shared/icons/ErrorIcon'
import { PasteIcon } from '../../../shared/icons/PasteIcon'
import { TimeIcon } from '../../../shared/icons/TimeIcon'
import { XIcon } from '../../../shared/icons/XIcon'
import { logger } from '../../../shared/utils/logger'
import { VaultPasswordForm } from '../../containers/VaultPasswordForm'

export const AddDevice = () => {
  const { navigate } = useRouter()
  const { closeModal } = useModal()
  const [qrSvg, setQrSvg] = useState('')
  const [activeTab, setActiveTab] = useState('share')
  const [inviteCode, setInviteCode] = useState('')
  const { createInvite, deleteInvite, data } = useInvite()

  const [isProtected, setIsProtected] = useState(true)
  const { data: vaultData, isVaultProtected, refetch, addDevice } = useVault()
  const { isLoading, setIsLoading } = useLoadingContext()
  const {
    pairActiveVault,
    cancelPairActiveVault,
    isLoading: isPairing
  } = usePair()
  const expireTime = useCountDown({
    initialSeconds: 120,
    onFinish: closeModal
  })

  useGlobalLoading({
    isLoading: isPairing
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

  const handleInviteCodeChange = (e) => {
    setInviteCode(e.target.value)
  }

  const handlePaste = (e) => {
    const pastedText = e.clipboardData?.getData('text')
    setInviteCode(pastedText)
    handleLoadVault(pastedText)
  }

  const handlePasteClick = async () => {
    try {
      const pastedText = await navigator.clipboard.readText()
      setInviteCode(pastedText)
      handleLoadVault(pastedText)
    } catch {
      setToast({
        message: t`Failed to paste from clipboard`,
        icon: ErrorIcon
      })
    }
  }

  const handleLoadVault = async (inviteCode) => {
    setIsLoading(true)

    chrome.runtime.sendMessage(
      { type: 'GET_PLATFORM_INFO' },
      async (platform) => {
        try {
          const vaultId = await pairActiveVault(inviteCode)

          if (!vaultId) {
            throw new Error('Invalid invite code')
          }

          await refetch(vaultId)
          await addDevice(`${platform.os} ${platform.arch}`)
          navigate('vault', { state: { recordType: 'all' } })
          setIsLoading(false)
        } catch (error) {
          logger.error('Something went wrong', error)
          setIsLoading(false)
          setToast({
            type: 'error',
            message: t`Failed to load vault. Please check your invite code.`
          })
        }
      }
    )
  }

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
            {activeTab === 'share' ? (
              <Trans>
                Scan this QR code or paste the vault key into the PearPass app
                on your other device to connect it to your account. This method
                keeps your account secure.
              </Trans>
            ) : (
              <Trans>
                Paste the vault key from the PearPass app on your other device
                to connect it to your account. This method keeps your account
                secure.
              </Trans>
            )}
          </p>

          <div className="h-[32px] w-[32px] shrink-0" />
        </div>

        <div className="border-grey100-mode1 flex h-[36px] w-full rounded-[10px] border">
          <button
            onClick={() => setActiveTab('share')}
            className={`h-full w-1/2 rounded-[8px] px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'share'
                ? 'bg-primary400-mode1 text-black'
                : 'text-primary400-mode1'
            }`}
          >
            <Trans>Share this vault</Trans>
          </button>
          <button
            onClick={() => setActiveTab('load')}
            className={`h-full w-1/2 rounded-[8px] px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'load'
                ? 'bg-primary400-mode1 text-black'
                : 'text-primary400-mode1'
            }`}
          >
            <Trans>Import vault</Trans>
          </button>
        </div>
      </div>

      {activeTab === 'share' && (
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
              <TimeIcon color={colors.primary400.mode1} />
            </div>
          </div>

          <div
            className="bg-grey400-mode1 flex max-w-full cursor-pointer flex-col items-center gap-1.5 rounded-[10px] px-2.5 py-1.5"
            onClick={() => copyToClipboard(data?.publicKey)}
          >
            <div className="flex gap-2">
              <div className="flex-shrink-0">
                <CopyIcon color={colors.primary400.mode1} />
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
      )}

      {activeTab === 'load' && (
        <div className="flex w-full flex-1 pt-[30px]">
          <div className="border-grey100-mode1 text-grey100-mode1 flex w-full items-center self-start rounded-[10px] border-[1px] bg-transparent p-[10px]">
            <div className="flex-1">
              <div className="text-white-mode1 font-inter text-[12px] font-medium">
                <Trans>Vault key</Trans>
              </div>
              <input
                className="placeholder:text-grey100-mode1 w-full bg-transparent text-base font-normal focus:outline-none"
                placeholder={t`Insert vault key...`}
                value={inviteCode}
                onChange={handleInviteCodeChange}
                onPaste={handlePaste}
              />
            </div>

            <button
              className="bg-black-dark text-primary400-mode1 font-inter flex cursor-pointer items-center justify-center gap-[7px] rounded-[10px] px-[15px] py-[9px] text-[12px]"
              onClick={isPairing ? cancelPairActiveVault : handlePasteClick}
              disabled={isLoading}
            >
              {!isPairing && <PasteIcon color={colors.primary400.mode1} />}
              {isPairing ? <Trans>cancel pairing</Trans> : <Trans>Paste</Trans>}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
