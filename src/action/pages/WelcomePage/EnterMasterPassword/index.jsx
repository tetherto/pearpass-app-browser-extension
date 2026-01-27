import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { useForm } from 'pear-apps-lib-ui-react-hooks'
import { Validator } from 'pear-apps-utils-validator'
import { useUserData, useVaults } from 'pearpass-lib-vault'

import { ButtonPrimary } from '../../../../shared/components/ButtonPrimary'
import { CardWarning } from '../../../../shared/components/CardWarningText'
import { CardWelcome } from '../../../../shared/components/CardWelcome'
import { InputPasswordPearPass } from '../../../../shared/components/InputPasswordPearPass'
import { AUTH_ERROR_PATTERNS } from '../../../../shared/constants/auth'
import { NAVIGATION_ROUTES } from '../../../../shared/constants/navigation'
import { useLoadingContext } from '../../../../shared/context/LoadingContext'
import { useRouter } from '../../../../shared/context/RouterContext'
import { secureChannelMessages } from '../../../../shared/services/messageBridge'
import { logger } from '../../../../shared/utils/logger'

export const EnterMasterPassword = () => {
  const { isLoading, setIsLoading } = useLoadingContext()
  const { navigate, currentPage, state: routerState } = useRouter()

  const { logIn, refreshMasterPasswordStatus } = useUserData()

  const { initVaults } = useVaults({
    onInitialize: () => {
      setIsLoading(false)

      if (routerState?.inPasskeyFlow) {
        navigate(currentPage, {
          params: { state: 'vaults' },
          state: routerState
        })
      } else {
        navigate(currentPage, { params: { state: 'vaults' } })
      }
    }
  })

  const schema = Validator.object({
    password: Validator.string().required(t`Password is required`)
  })

  const { register, handleSubmit, setErrors } = useForm({
    initialValues: { password: '' },
    validate: (values) => schema.validate(values)
  })

  const onSubmit = async (values) => {
    if (isLoading) {
      return
    }

    if (!values.password) {
      setErrors({
        password: t`Password is required`
      })

      return
    }

    try {
      setIsLoading(true)

      // First, unlock/initialize the secure-channel client keystore using the
      // password the user provided. This ensures that subsequent secure
      // handshakes (performed as part of vault initialization) can obtain the
      // client private key without triggering MasterPasswordRequired.
      try {
        await secureChannelMessages.unlockClientKeystore(values.password)
      } catch (e) {
        // If the keystore explicitly reports a master password problem, treat
        // it as an authentication failure for the user.
        if (
          e?.message &&
          e.message.includes(AUTH_ERROR_PATTERNS.MASTER_PASSWORD_REQUIRED)
        ) {
          setIsLoading(false)
          setErrors({
            password: t`Incorrect password. Please try again.`
          })
          logger.error('Error unlocking secure channel keystore:', e)
          return
        }
        // For any other keystore error, log and continue; vault login will
        // still validate the password and may surface more specific errors.
        logger.error('Error initializing secure channel keystore:', e)
      }

      await logIn({ password: values.password })

      await initVaults({ password: values.password })
    } catch (error) {
      const status = await refreshMasterPasswordStatus()

      const { isLocked, remainingAttempts } = status || {}

      setIsLoading(false)

      if (isLocked) {
        navigate('welcome', {
          params: { state: NAVIGATION_ROUTES.SCREEN_LOCKED }
        })
        return
      }

      setErrors({
        password:
          typeof error === 'string'
            ? error
            : t`Incorrect password. You have ${remainingAttempts} attempts before the app locks for 5 minutes.`
      })

      logger.error('Error unlocking PearPass:', error)
    }
  }

  return (
    <CardWelcome>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex h-full w-full flex-col items-center justify-center gap-[10px]"
      >
        <div className="text-white-mode1 text-center">
          <h1 className="text-[20px]">
            <Trans>Unlock PearPass</Trans>
          </h1>

          <p className="text-[16px] font-light">
            <Trans>Unlock PearPass with your master password</Trans>
          </p>
        </div>

        <InputPasswordPearPass
          placeholder={t`Enter Password`}
          {...register('password')}
        />

        <CardWarning
          text={t`Don’t forget your master password. It’s the only way to access your vault. We can’t help recover it. Back it up securely.`}
        />

        <ButtonPrimary type="submit" disabled={isLoading}>
          <Trans>Continue</Trans>
        </ButtonPrimary>
      </form>
    </CardWelcome>
  )
}
