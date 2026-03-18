import { useEffect } from 'react'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { useForm } from '@tetherto/pear-apps-lib-ui-react-hooks'
import { Validator } from '@tetherto/pear-apps-utils-validator'
import { PROTECTED_VAULT_ENABLED } from '@tetherto/pearpass-lib-constants'
import { useCreateVault, useVault } from '@tetherto/pearpass-lib-vault'

import { ButtonPrimary } from '../../../../shared/components/ButtonPrimary'
import { ButtonSecondary } from '../../../../shared/components/ButtonSecondary'
import { CardWelcome } from '../../../../shared/components/CardWelcome'
import { InputPasswordPearPass } from '../../../../shared/components/InputPasswordPearPass'
import { InputPearPass } from '../../../../shared/components/InputPearPass'
import { NAVIGATION_ROUTES } from '../../../../shared/constants/navigation'
import { useLoadingContext } from '../../../../shared/context/LoadingContext'
import { useRouter } from '../../../../shared/context/RouterContext'
import { logger } from '../../../../shared/utils/logger'
import { WelcomeCardHeader } from '../components/WelcomeCardHeader'

export const CreateNewVault = () => {
  const { navigate, currentPage } = useRouter()
  const { isLoading, setIsLoading } = useLoadingContext()

  const { addDevice, refetch: refetchVault } = useVault()
  const { createVault } = useCreateVault()

  const schema = Validator.object({
    name: Validator.string().required('Name is required'),
    password: Validator.string(),
    passwordConfirm: Validator.string()
  })

  const { register, handleSubmit, setErrors } = useForm({
    initialValues: {
      name: ''
    },
    validate: (values) => schema.validate(values)
  })

  const onSubmit = async (values) => {
    if (isLoading) {
      return
    }

    if (values.password !== values.passwordConfirm) {
      setErrors({
        passwordConfirm: t`Passwords do not match`
      })
      return
    }

    chrome.runtime.sendMessage(
      { type: 'GET_PLATFORM_INFO' },
      async (platform) => {
        try {
          await createVault({
            name: values.name,
            password: values.password
          })

          await addDevice(`${platform.os} ${platform.arch}`)

          setIsLoading(false)
          navigate('vault', { state: { recordType: 'all' } })
        } catch (error) {
          logger.error(error)
          setIsLoading(false)
        }
      }
    )
  }

  useEffect(() => {
    refetchVault()
  }, [])

  return (
    <CardWelcome>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex w-[500px] flex-col justify-center gap-[20px]"
      >
        <WelcomeCardHeader
          title={t`Enter Name and Password for new Vault`}
          onBack={() =>
            navigate('welcome', {
              params: { state: NAVIGATION_ROUTES.VAULTS }
            })
          }
        />

        <div className="flex w-full flex-col gap-2.5">
          <InputPearPass placeholder={t`Enter Name`} {...register('name')} />
          {PROTECTED_VAULT_ENABLED && (
            <>
              <InputPasswordPearPass
                placeholder={t`Enter Password`}
                {...register('password')}
              />

              <InputPasswordPearPass
                placeholder={t`Confirm Password`}
                {...register('passwordConfirm')}
              />
            </>
          )}
        </div>

        <div className="flex gap-6 self-center">
          <ButtonPrimary size="md" type="submit" disabled={isLoading}>
            <Trans>Create a new vault</Trans>
          </ButtonPrimary>

          <ButtonSecondary
            size="md"
            type="button"
            onClick={() =>
              navigate(currentPage, { params: { state: 'vaults' } })
            }
            disabled={isLoading}
          >
            <Trans>Go back</Trans>
          </ButtonSecondary>
        </div>
      </form>
    </CardWelcome>
  )
}
