import type { ChangeEvent } from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { t } from '@lingui/core/macro'
import { useForm } from '@tetherto/pear-apps-lib-ui-react-hooks'
import { Validator } from '@tetherto/pear-apps-utils-validator'
import {
  useCreateVault,
  useVault,
  type Vault
} from '@tetherto/pearpass-lib-vault'
import {
  AlertMessage,
  Button,
  Dialog,
  Form,
  InputField
} from '@tetherto/pearpass-lib-ui-kit'

import { useLoadingContext } from '../../context/LoadingContext'
import { useRouter } from '../../context/RouterContext'
import { setLastOpenedVaultId } from '../../utils/lastOpenedVaultStorage'
import { logger } from '../../utils/logger'

export type CreateOrEditVaultModalContentProps = {
  onClose: () => void
  onSuccess?: () => void
  vault?: Vault
}

const nameSchema = Validator.object({
  name: Validator.string().required(t`Name is required`)
})

export const CreateOrEditVaultModalContent = ({
  onClose,
  onSuccess,
  vault
}: CreateOrEditVaultModalContentProps) => {
  const { navigate } = useRouter()
  const { isLoading, setIsLoading } = useLoadingContext()
  const { createVault, isLoading: isCreateVaultLoading } = useCreateVault()
  const { addDevice, updateUnprotectedVault } = useVault()

  const isRename = Boolean(vault?.id)

  const [submitError, setSubmitError] = useState<string | null>(null)

  const { register, handleSubmit, setValue, setErrors } = useForm({
    initialValues: {
      name: vault?.name ?? ''
    },
    validate: (values: Record<string, string>) => {
      const normalized = { ...values, name: String(values.name ?? '') }
      return nameSchema.validate(normalized) as Record<string, string>
    }
  })

  const nameField = register('name')

  useEffect(() => {
    setValue('name', vault?.name ?? '')
  }, [vault?.id, vault?.name])

  const title = isRename ? t`Rename Vault` : t`Create New Vault`

  const canSubmit = useMemo(() => {
    if (isLoading || isCreateVaultLoading) {
      return false
    }

    if (!String(nameField.value ?? '').trim().length) {
      return false
    }

    return true
  }, [isCreateVaultLoading, isLoading, nameField.value])

  const onNameChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setSubmitError(null)
      setValue('name', e.currentTarget.value)
      setErrors((prev: Record<string, string | null | undefined>) => ({
        ...prev,
        name: null
      }))
    },
    [setErrors, setValue]
  )

  const submit = async (values: Record<string, string>) => {
    if (isLoading || isCreateVaultLoading) {
      return
    }

    const trimmed = String(values.name ?? '').trim()

    if (isRename && vault) {
      try {
        setIsLoading(true)
        setSubmitError(null)

        await updateUnprotectedVault(vault.id, { name: trimmed })

        onSuccess?.()
        onClose()
      } catch (error) {
        logger.error(
          'CreateOrEditVaultModalContent',
          'Error renaming vault:',
          error
        )
        setSubmitError(t`Could not rename the vault. Try again.`)
      } finally {
        setIsLoading(false)
      }

      return
    }

    try {
      setIsLoading(true)
      setSubmitError(null)

      const createdVault = (await createVault({
        name: trimmed
      })) as Vault | undefined

      chrome.runtime.sendMessage(
        { type: 'GET_PLATFORM_INFO' },
        async (platform: { os: string; arch: string }) => {
          try {
            await addDevice(`${platform.os} ${platform.arch}`)
            setLastOpenedVaultId(createdVault?.id)
            onSuccess?.()
            navigate('vault', {
              params: {},
              state: { recordType: 'all' }
            } as {
              params: Record<string, unknown>
              state: { recordType: string; folder?: string }
            })
          } catch (error) {
            logger.error(
              'CreateOrEditVaultModalContent',
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
      logger.error(
        'CreateOrEditVaultModalContent',
        'Error creating vault:',
        error
      )
      setSubmitError(t`Could not create the vault. Try again.`)
    }
  }

  const runSubmit = handleSubmit(submit)

  return (
    <Dialog
      title={title}
      onClose={onClose}
      testID="create-or-edit-vault-dialog"
      closeButtonTestID="create-or-edit-vault-close"
      footer={
        <div className="flex w-full justify-end gap-[var(--spacing8)]">
          <Button
            variant="secondary"
            size="small"
            onClick={onClose}
            data-testid="create-or-edit-vault-discard"
          >
            {t`Discard`}
          </Button>
          <Button
            variant="primary"
            size="small"
            disabled={!canSubmit}
            isLoading={isLoading || isCreateVaultLoading}
            onClick={() => {
              void runSubmit()
            }}
            data-testid="create-or-edit-vault-save"
          >
            {t`Save`}
          </Button>
        </div>
      }
    >
      <Form
        testID="create-or-edit-vault-form"
        aria-label={isRename ? t`Rename vault form` : t`Create vault form`}
      >
        <div className="flex flex-col gap-[var(--spacing16)]">
          {submitError ? (
            <AlertMessage
              variant="error"
              size="small"
              title={t`Something went wrong`}
              description={submitError}
              testID="create-or-edit-vault-alert"
            />
          ) : null}

          <InputField
            label={t`Vault Name`}
            placeholder={t`Enter Name`}
            value={String(nameField.value ?? '')}
            onChange={onNameChange}
            error={nameField.error}
            testID="create-or-edit-vault-name"
          />
        </div>
      </Form>
    </Dialog>
  )
}
