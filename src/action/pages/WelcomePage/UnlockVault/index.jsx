import { useMemo } from 'react'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { useForm } from '@tetherto/pear-apps-lib-ui-react-hooks'
import { Validator } from '@tetherto/pear-apps-utils-validator'
import { useVault, useVaults } from '@tetherto/pearpass-lib-vault'

import { ButtonPrimary } from '../../../../shared/components/ButtonPrimary'
import { ButtonSecondary } from '../../../../shared/components/ButtonSecondary'
import { CardWelcome } from '../../../../shared/components/CardWelcome'
import { InputPasswordPearPass } from '../../../../shared/components/InputPasswordPearPass'
import { NAVIGATION_ROUTES } from '../../../../shared/constants/navigation'
import { useLoadingContext } from '../../../../shared/context/LoadingContext'
import { useRouter } from '../../../../shared/context/RouterContext'
import { logger } from '../../../../shared/utils/logger'
import { useVaultOpenedRedirect } from '../../../app/hooks/useVaultOpenedRedirect'
import { WelcomeCardHeader } from '../components/WelcomeCardHeader'

export const UnlockVault = () => {
  const { isLoading, setIsLoading } = useLoadingContext()

  const { navigate, currentPage, params } = useRouter()
  const navigateAfterVaultOpened = useVaultOpenedRedirect()

  const { refetch: refetchVault } = useVault()
  const { data: vaults } = useVaults()
  useMemo(
    () => vaults.find((vault) => vault.id === params.vaultId),
    [vaults, params]
  )
  const schema = Validator.object({
    password: Validator.string().required(t`Password is required`)
  })

  const { register, handleSubmit, setErrors } = useForm({
    initialValues: { password: '' },
    validate: (values) => schema.validate(values)
  })

  const onSubmit = async (values) => {
    if (!params.vaultId || isLoading) {
      return
    }

    try {
      setIsLoading(true)

      await refetchVault(params.vaultId, { password: values.password })

      setIsLoading(false)

      navigateAfterVaultOpened()
    } catch (error) {
      setErrors({
        password: t`Invalid password`
      })

      setIsLoading(false)

      logger.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <CardWelcome>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex w-[500px] flex-col justify-center gap-[10px]"
      >
        <WelcomeCardHeader
          title={<Trans>Enter Your Vault Password</Trans>}
          description={
            <Trans>
              Unlock your Personal Vault to access your stored passwords.
            </Trans>
          }
          onBack={() =>
            navigate('welcome', {
              params: { state: NAVIGATION_ROUTES.VAULTS }
            })
          }
        />

        <InputPasswordPearPass
          placeholder={t`Enter Password`}
          {...register('password')}
        />

        <div className="flex gap-[25px] self-center">
          <ButtonPrimary type="submit" disabled={isLoading}>
            <Trans>Continue</Trans>
          </ButtonPrimary>

          <ButtonSecondary
            onClick={() =>
              navigate(currentPage, {
                params: { state: NAVIGATION_ROUTES.VAULTS }
              })
            }
            disabled={isLoading}
          >
            <Trans>Select vaults</Trans>
          </ButtonSecondary>
        </div>
      </form>
    </CardWelcome>
  )
}
