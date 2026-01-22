import React, { useMemo } from 'react'

import { t } from '@lingui/core/macro'
import { useForm } from 'pear-apps-lib-ui-react-hooks'
import { Validator } from 'pear-apps-utils-validator'

import { ButtonPrimary } from '../../components/ButtonPrimary'
import { FormModalHeaderWrapper } from '../../components/FormModalHeaderWrapper'
import { InputPasswordPearPass } from '../../components/InputPasswordPearPass'
import { ModalContent } from '../../containers/ModalContent'
import { useLoadingContext } from '../../context/LoadingContext'
import { useModal } from '../../context/ModalContext'
import { logger } from '../../utils/logger'

/**
 * @param {{
 *  vault: { id: string, name?: string },
 *  onSubmit: (password: string) => Promise<void>
 * }} props
 */
export const VaultPasswordFormModalContent = ({ vault, onSubmit }) => {
  const { closeModal } = useModal()
  const { setIsLoading } = useLoadingContext()

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
    if (!vault.id) {
      return
    }

    try {
      setIsLoading(true)

      await onSubmit?.(values.password)

      setIsLoading(false)
    } catch (error) {
      logger.error('VaultPasswordFormModalContent', error)

      setIsLoading(false)

      setErrors({
        password: t`Invalid password`
      })
    }
  }

  const titles = useMemo(
    () => ({
      title: t`Enter Your Vault Password`,
      description: t`Unlock your ${vault.name ?? vault.id} Vault to access your stored passwords.`
    }),
    [vault.name, vault.id]
  )

  return (
    <ModalContent
      onClose={closeModal}
      headerChildren={
        <FormModalHeaderWrapper>
          <div className="flex flex-col items-start gap-[10px]">
            <span className="font-inter text-xs font-normal text-white">
              {titles.title}
            </span>
            <span className="text-grey100-mode1 font-inter text-xs font-normal">
              {titles.description}
            </span>
          </div>
        </FormModalHeaderWrapper>
      }
    >
      <form
        onSubmit={handleSubmit(submit)}
        className="flex flex-col items-start gap-5"
      >
        <InputPasswordPearPass
          placeholder={t`Enter password`}
          {...register('password')}
        />

        <ButtonPrimary type="submit">{t`Unlock Vault`}</ButtonPrimary>
      </form>
    </ModalContent>
  )
}
