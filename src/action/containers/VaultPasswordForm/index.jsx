import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { useForm } from '@tetherto/pear-apps-lib-ui-react-hooks'
import { Validator } from '@tetherto/pear-apps-utils-validator'

import { ButtonPrimary } from '../../../shared/components/ButtonPrimary'
import { InputPasswordPearPass } from '../../../shared/components/InputPasswordPearPass'
import { logger } from '../../../shared/utils/logger'

export const VaultPasswordForm = ({ onSubmit, className }) => {
  const schema = Validator.object({
    password: Validator.string().required(t`Password is required`)
  })

  const { register, handleSubmit, setErrors } = useForm({
    initialValues: {
      password: ''
    },
    validate: (values) => schema.validate(values)
  })

  const submit = async (values) => {
    try {
      await onSubmit(values.password)
    } catch (error) {
      logger.error(error)
      setErrors({ password: t`Invalid password` })
    }
  }

  return (
    <form
      onSubmit={handleSubmit(submit)}
      className={`flex flex-col gap-[20px] ${className}`}
    >
      <InputPasswordPearPass {...register('password')} />
      <div>
        <ButtonPrimary type="submit">
          <Trans>Unlock Vault</Trans>
        </ButtonPrimary>
      </div>
    </form>
  )
}
