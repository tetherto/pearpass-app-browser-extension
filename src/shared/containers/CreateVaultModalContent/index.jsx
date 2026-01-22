import { useMemo, useState } from 'react'

import { t } from '@lingui/core/macro'
import { useForm } from 'pear-apps-lib-ui-react-hooks'
import { Validator } from 'pear-apps-utils-validator'
import { PROTECTED_VAULT_ENABLED } from 'pearpass-lib-constants'
import { useCreateVault, useVault } from 'pearpass-lib-vault'
import { checkPasswordStrength } from 'pearpass-utils-password-check'

import { ButtonPrimary } from '../../components/ButtonPrimary'
import { ButtonRoundIcon } from '../../components/ButtonRoundIcon'
import { ModalContent } from '../../containers/ModalContent'
import { useLoadingContext } from '../../context/LoadingContext'
import { useRouter } from '../../context/RouterContext'
import { ArrowDownIcon } from '../../icons/ArrowDownIcon'
import { ErrorIcon } from '../../icons/ErrorIcon'
import { EyeClosedIcon } from '../../icons/EyeClosedIcon'
import { EyeIcon } from '../../icons/EyeIcon'
import { LockCircleIcon } from '../../icons/LockCircleIcon'
import { OkayIcon } from '../../icons/OkayIcon'
import { YellowErrorIcon } from '../../icons/YellowErrorIcon'
import { logger } from '../../utils/logger'

/**
 * @param {{
 *  onClose: () => void
 *  onSuccess?: () => void
 * }} props
 */
export const CreateVaultModalContent = ({ onClose, onSuccess }) => {
  const { navigate } = useRouter()
  const { isLoading, setIsLoading } = useLoadingContext()

  const [isPasswordOpen, setIsPasswordOpen] = useState(false)
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [isPasswordConfirmVisible, setIsPasswordConfirmVisible] =
    useState(false)

  const schema = Validator.object({
    name: Validator.string().required(t`Name is required`),
    password: Validator.string(),
    passwordConfirm: Validator.string()
  })

  const { addDevice } = useVault()
  const { createVault } = useCreateVault()

  const { register, handleSubmit, setErrors } = useForm({
    initialValues: {
      name: '',
      password: '',
      passwordConfirm: ''
    },
    validate: (values) => schema.validate(values)
  })

  const nameField = register('name')
  const { onChange: onPasswordChange, ...passwordField } = register('password')
  const { onChange: onPasswordConfirmChange, ...passwordConfirmField } =
    register('passwordConfirm')

  const passwordStrengthResult = useMemo(
    () =>
      checkPasswordStrength(passwordField.value || '', {
        rules: {
          length: 12
        },
        errors: {
          minLength: t`Password must be at least 12 characters long`,
          hasLowerCase: t`Password is missing a lowercase letter`,
          hasUpperCase: t`Password is missing an uppercase letter`,
          hasNumbers: t`Password is missing a number`,
          hasSymbols: t`Password is missing a special character`
        }
      }),
    [passwordField.value]
  )

  const StrengthIcon = useMemo(() => {
    switch (passwordStrengthResult.strengthType) {
      case 'error':
        return ErrorIcon
      case 'warning':
        return YellowErrorIcon
      case 'success':
        return OkayIcon
      default:
        return null
    }
  }, [passwordStrengthResult.strengthType])

  const strengthColorClass = useMemo(() => {
    switch (passwordStrengthResult.type) {
      case 'safe':
        return 'text-primary400-mode1'
      case 'vulnerable':
        return 'text-errorRed-dark'
      case 'weak':
        return 'text-errorYellow-mode1'
      default:
        return 'text-white'
    }
  }, [passwordStrengthResult.type])

  const submit = async (values) => {
    if (isLoading) {
      return
    }

    if (values.password) {
      const strengthResult = checkPasswordStrength(values.password, {
        rules: { length: 12 },
        errors: {
          minLength: t`Password must be at least 12 characters long`,
          hasLowerCase: t`Password is missing a lowercase letter`,
          hasUpperCase: t`Password is missing an uppercase letter`,
          hasNumbers: t`Password is missing a number`,
          hasSymbols: t`Password is missing a special character`
        }
      })

      if (!strengthResult.success) {
        setErrors({
          password:
            strengthResult.errors?.[0] || t`Password is not strong enough`
        })
        return
      }

      if (values.password !== values.passwordConfirm) {
        setErrors({
          passwordConfirm: t`Passwords do not match`
        })
        return
      }
    }

    try {
      setIsLoading(true)

      await createVault({
        name: values.name,
        password: values.password
      })

      chrome.runtime.sendMessage(
        { type: 'GET_PLATFORM_INFO' },
        async (platform) => {
          try {
            await addDevice(`${platform.os} ${platform.arch}`)
            onSuccess?.()
            navigate('vault', { state: { recordType: 'all' } })
          } catch (error) {
            logger.error(
              'CreateVaultModalContent',
              'Error adding device:',
              error
            )
          } finally {
            setIsLoading(false)
          }
        }
      )
    } catch (error) {
      setIsLoading(false)
      logger.error('CreateVaultModalContent', 'Error creating vault:', error)
    }
  }

  return (
    <ModalContent
      onClose={onClose}
      onSubmit={handleSubmit(submit)}
      headerChildren={
        <div className="flex items-center gap-3">
          <ButtonRoundIcon
            startIcon={ArrowDownIcon}
            type="button"
            onClick={onClose}
            className="rotate-90"
            data-testid="createvault-back"
          />
          <span className="font-inter text-xl font-bold text-white">
            {t`Create new Vault`}
          </span>
        </div>
      }
    >
      <div className="flex flex-col gap-[25px]">
        <div className="flex flex-col gap-[10px]">
          <div className="bg-grey400-mode1 flex min-h-[62px] items-center gap-[10px] rounded-[10px] px-4 py-[14px]">
            <div className="flex shrink-0 items-center justify-center">
              <LockCircleIcon size="24" color="white" />
            </div>
            <input
              type="text"
              placeholder={t`Insert Vault name...`}
              autoFocus
              value={nameField.value}
              disabled={nameField.isDisabled}
              onChange={(e) => nameField.onChange?.(e.target.value)}
              className="placeholder:text-grey100-mode1 font-inter min-w-0 flex-1 border-none bg-transparent text-sm font-bold text-white outline-none"
            />
          </div>

          {!!nameField.error?.length && (
            <div className="text-errorRed-mode1 font-inter flex items-center gap-[5px] text-sm font-bold">
              <ErrorIcon size="20" />
              {nameField.error}
            </div>
          )}
        </div>

        {PROTECTED_VAULT_ENABLED && (
          <div className="flex flex-col gap-[10px]">
            <div className="flex items-center justify-between gap-[10px]">
              <span className="font-inter text-sm font-bold text-white">
                {t`Set Vault Password (optional)`}
              </span>
              <ButtonRoundIcon
                startIcon={ArrowDownIcon}
                type="button"
                onClick={() => setIsPasswordOpen(!isPasswordOpen)}
                className={`transition-transform duration-200 ${isPasswordOpen ? '' : '-rotate-90'}`}
                data-testid="createvault-password-toggle"
              />
            </div>

            <div
              className="flex flex-col gap-[10px] overflow-hidden transition-all duration-[250ms]"
              style={{
                paddingTop: isPasswordOpen ? '10px' : '0',
                maxHeight: isPasswordOpen ? '520px' : '0'
              }}
            >
              <div className="bg-grey400-mode1 flex min-h-[62px] items-center justify-between gap-[10px] rounded-[10px] p-[10px]">
                <div className="flex min-w-0 flex-1 items-center gap-[10px]">
                  <input
                    type={isPasswordVisible ? 'text' : 'password'}
                    placeholder={t`Create Vault Password (optional)`}
                    value={passwordField.value}
                    disabled={passwordField.isDisabled}
                    onChange={(e) => onPasswordChange?.(e.target.value)}
                    className="placeholder:text-grey100-mode1 font-inter min-w-0 flex-1 border-none bg-transparent text-sm font-bold text-white outline-none"
                  />
                </div>
                <div className="flex items-center justify-end gap-[10px]">
                  {passwordField.value?.length > 0 && (
                    <div
                      className={`font-inter flex items-center gap-[5px] text-xs ${strengthColorClass}`}
                    >
                      {StrengthIcon && <StrengthIcon size="16" />}
                      {passwordStrengthResult.strengthText}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                    className="flex h-[42px] w-[42px] cursor-pointer items-center justify-center rounded-[30px] border-none bg-transparent p-[9px] hover:opacity-90"
                    data-testid="createvault-password-visibility"
                  >
                    {isPasswordVisible ? (
                      <EyeClosedIcon color="var(--color-primary400-mode1)" />
                    ) : (
                      <EyeIcon color="var(--color-primary400-mode1)" />
                    )}
                  </button>
                </div>
              </div>

              <div className="bg-grey400-mode1 flex min-h-[62px] items-center justify-between gap-[10px] rounded-[10px] p-[10px]">
                <div className="flex min-w-0 flex-1 items-center gap-[10px]">
                  <input
                    type={isPasswordConfirmVisible ? 'text' : 'password'}
                    placeholder={t`Repeat Vault Password`}
                    value={passwordConfirmField.value}
                    disabled={passwordConfirmField.isDisabled}
                    onChange={(e) => onPasswordConfirmChange?.(e.target.value)}
                    className="placeholder:text-grey100-mode1 font-inter min-w-0 flex-1 border-none bg-transparent text-sm font-bold text-white outline-none"
                  />
                </div>
                <div className="flex items-center justify-end gap-[10px]">
                  <button
                    type="button"
                    onClick={() =>
                      setIsPasswordConfirmVisible(!isPasswordConfirmVisible)
                    }
                    className="flex h-[42px] w-[42px] cursor-pointer items-center justify-center rounded-[30px] border-none bg-transparent p-[9px] hover:opacity-90"
                    data-testid="createvault-passwordconfirm-visibility"
                  >
                    {isPasswordConfirmVisible ? (
                      <EyeClosedIcon color="var(--color-primary400-mode1)" />
                    ) : (
                      <EyeIcon color="var(--color-primary400-mode1)" />
                    )}
                  </button>
                </div>
              </div>

              {passwordConfirmField.error?.length ? (
                <div className="text-errorRed-mode1 font-inter flex w-full items-center justify-start gap-[5px] text-sm font-bold">
                  <ErrorIcon size="20" />
                  {passwordConfirmField.error}
                </div>
              ) : passwordField.error?.length ? (
                <div className="text-errorRed-mode1 font-inter flex w-full items-center justify-start gap-[5px] text-sm font-bold">
                  <ErrorIcon size="20" />
                  {passwordField.error}
                </div>
              ) : passwordField.value?.length &&
                passwordStrengthResult.errors?.length ? (
                <div className="text-errorRed-mode1 font-inter flex w-full items-center justify-start gap-[5px] text-sm font-bold">
                  <ErrorIcon size="20" />
                  {passwordStrengthResult.errors[0]}
                </div>
              ) : null}

              <div className="text-grey100-mode1 font-inter w-full text-xs leading-normal font-medium">
                <span>
                  {t`Your password must be at least 12 characters long and include at least one of each:`}
                </span>
                <ul className="m-0 list-disc pl-5">
                  <li className="text-xs">{t`Uppercase Letter (A-Z)`}</li>
                  <li className="text-xs">{t`Lowercase Letter (a-z)`}</li>
                  <li className="text-xs">{t`Number (0-9)`}</li>
                  <li className="text-xs">{t`Special Character (! @ # $...)`}</li>
                </ul>
                <span>{t`Note: Avoid common words and personal information.`}</span>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between gap-[18px]">
          <div className="max-w-[260px] flex-1">
            <ButtonPrimary type="submit" data-testid="createvault-continue">
              {t`Continue`}
            </ButtonPrimary>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="font-inter flex h-[42px] max-w-[260px] flex-1 cursor-pointer items-center justify-center border-none bg-transparent px-10 py-[9px] text-sm leading-[17px] font-bold text-white hover:opacity-90"
            data-testid="createvault-cancel"
          >
            {t`Cancel`}
          </button>
        </div>
      </div>
    </ModalContent>
  )
}
