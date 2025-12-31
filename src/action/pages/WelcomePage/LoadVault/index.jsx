import { useState } from 'react'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { usePair, useVault } from 'pearpass-lib-vault'

import { ButtonPrimary } from '../../../../shared/components/ButtonPrimary'
import { ButtonSecondary } from '../../../../shared/components/ButtonSecondary'
import { CardWelcome } from '../../../../shared/components/CardWelcome'
import { NAVIGATION_ROUTES } from '../../../../shared/constants/navigation'
import { useLoadingContext } from '../../../../shared/context/LoadingContext'
import { useRouter } from '../../../../shared/context/RouterContext'
import { useToast } from '../../../../shared/context/ToastContext'
import { logger } from '../../../../shared/utils/logger'
import { WelcomeCardHeader } from '../components/WelcomeCardHeader'

export const LoadVault = () => {
  const { isLoading, setIsLoading } = useLoadingContext()
  const { navigate } = useRouter()
  const { setToast } = useToast()

  const [inviteCode, setInviteCodeId] = useState('')

  const { refetch, addDevice } = useVault()

  const {
    pairActiveVault,
    cancelPairActiveVault,
    isLoading: isPairing
  } = usePair()

  const handleChange = (e) => {
    setInviteCodeId(e.target.value)
  }

  const handleLoadVault = async () => {
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

  return (
    <>
      <CardWelcome>
        <WelcomeCardHeader
          title={t`Import an existing vault`}
          onBack={() =>
            navigate('welcome', {
              params: { state: NAVIGATION_ROUTES.VAULTS }
            })
          }
        />

        <p className="text-white-mode1 text-center text-[14px]">
          <Trans>
            Using PearPass on your other device, use "Add Device" to generate a
            QR or connection code to pair your account. This method keeps your
            account secure.
          </Trans>
        </p>

        <input
          className="border-grey100-mode1 text-grey100-mode1 w-full rounded-[10px] border-[1px] bg-transparent px-[20px] py-[12px] focus:outline-none"
          placeholder={t`Enter your vault code…`}
          value={inviteCode}
          onChange={handleChange}
        />

        <div className="flex gap-[10px]">
          {isPairing ? (
            <ButtonSecondary
              onClick={cancelPairActiveVault}
              disabled={isLoading}
            >
              <Trans>Cancel Pairing</Trans>
            </ButtonSecondary>
          ) : (
            <ButtonPrimary onClick={handleLoadVault} disabled={isLoading}>
              <Trans>Import vault</Trans>
            </ButtonPrimary>
          )}
        </div>
      </CardWelcome>
    </>
  )
}
