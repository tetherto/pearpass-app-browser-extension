import { useState } from 'react'

import { t } from '@lingui/core/macro'
import { useForm } from '@tetherto/pear-apps-lib-ui-react-hooks'
import { Validator } from '@tetherto/pear-apps-utils-validator'
import {
  AlertMessage,
  Button,
  Dialog,
  Form,
  Link,
  PasswordField,
  Text,
  ToggleSwitch
} from '@tetherto/pearpass-lib-ui-kit'
import {
  broadcastDeleteVault,
  useCreateVault,
  useUserData,
  useVault,
  useVaults,
  type Vault
} from '@tetherto/pearpass-lib-vault'

import { useModal } from '../../context/ModalContext'
import { useRouter } from '../../context/RouterContext'
import { useToast } from '../../context/ToastContext'
import { useVaultSwitch } from '../../hooks/useVaultSwitch'
import { logger } from '../../utils/logger'
import { PairedDevicesModalContent } from '../PairedDevicesModalContent'

export type DeleteVaultModalContentV2Props = {
  vaultId: string
  vaultName: string
  onClose?: () => void
}

export const DeleteVaultModalContentV2 = ({
  vaultId,
  vaultName,
  onClose
}: DeleteVaultModalContentV2Props) => {
  const { closeModal, setModal } = useModal() as {
    setModal: (content: React.ReactNode) => void
    closeModal: () => void
  }
  const { setToast } = useToast() as {
    setToast: (toast: { message: string }) => void
  }
  const { navigate } = useRouter() as unknown as {
    navigate: (page: string, data: { state: { recordType: string } }) => void
  }
  const { switchVault } = useVaultSwitch()

  const handleClose = onClose ?? closeModal

  const { data: vaultData, deleteVaultLocal, addDevice } = useVault()
  const { data: allVaults } = useVaults()
  const { createVault } = useCreateVault()
  const devices = (vaultData as { devices?: unknown[] } | undefined)?.devices
  const otherDeviceCount = Array.isArray(devices)
    ? Math.max(devices.length - 1, 0)
    : 0

  const { logIn } = useUserData()

  const [eraseFromAllDevices, setEraseFromAllDevices] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const schema = Validator.object({
    masterPassword: Validator.string().required(t`Master password is required`)
  })

  const { register, handleSubmit, setErrors, values } = useForm({
    initialValues: { masterPassword: '' },
    validate: (formValues: { masterPassword: string }) =>
      schema.validate(formValues)
  })

  const { onChange: onChangeMasterPassword, ...masterPasswordFieldProps } =
    register('masterPassword')
  const masterPasswordError = masterPasswordFieldProps.error || undefined

  const onSubmit = async (formValues: { masterPassword: string }) => {
    if (isLoading) return

    if (!formValues.masterPassword) {
      setErrors({ masterPassword: t`Master password is required` })
      return
    }

    setSubmitError(null)
    setIsLoading(true)

    try {
      try {
        await logIn({ password: formValues.masterPassword })
      } catch {
        setSubmitError(t`Invalid master password`)
        return
      }

      let broadcastFailed = false
      if (eraseFromAllDevices) {
        try {
          const { failures } = await broadcastDeleteVault(vaultId)
          if (failures?.length) broadcastFailed = true
        } catch (error) {
          broadcastFailed = true
          logger.error(
            'DeleteVaultModalContentV2',
            'broadcastDeleteVault failed:',
            error
          )
        }
      }

      try {
        await deleteVaultLocal(vaultId)
      } catch (error) {
        logger.error(
          'DeleteVaultModalContentV2',
          'deleteVaultLocal failed:',
          error
        )
        setSubmitError(t`Failed to delete vault`)
        setToast({
          message: t`Couldn't delete vault files. Please try again.`
        })
        return
      }

      if (broadcastFailed) {
        setToast({
          message: t`Couldn't reach other devices. They will sync next time they come online.`
        })
      }

      handleClose()
      setToast({
        message: t`"${vaultName}" was deleted from this device`
      })

      const nextVault = (allVaults ?? []).find((v: Vault) => v.id !== vaultId)
      if (nextVault) {
        await switchVault(nextVault)
      } else {
        try {
          await createVault({ name: t`Personal` })
          await addDevice()
          navigate('vault', { state: { recordType: 'all' } })
          setToast({
            message: t`A new "Personal" vault was created`
          })
        } catch (error) {
          logger.error(
            'DeleteVaultModalContentV2',
            'failed to create fallback Personal vault:',
            error
          )
        }
      }
    } finally {
      setIsLoading(false)
    }
  }

  const isSubmitDisabled = !values.masterPassword || isLoading

  return (
    <Dialog
      title={t`Delete ${vaultName}`}
      onClose={handleClose}
      testID="delete-vault-dialog-v2"
      closeButtonTestID="delete-vault-close-v2"
      footer={
        <div className="flex w-full justify-end gap-[var(--spacing8)]">
          <Button
            variant="secondary"
            size="small"
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            data-testid="delete-vault-discard-v2"
          >
            {t`Discard`}
          </Button>
          <Button
            variant="destructive"
            size="small"
            type="button"
            disabled={isSubmitDisabled}
            isLoading={isLoading}
            onClick={() => handleSubmit(onSubmit)()}
            data-testid="delete-vault-submit-v2"
          >
            {t`Delete`}
          </Button>
        </div>
      }
    >
      <Form onSubmit={handleSubmit(onSubmit)} testID="delete-vault-form-v2">
        <div className="flex flex-col gap-[var(--spacing16)]">
          <Text
            as="p"
            variant="label"
            data-testid="delete-vault-description-v2"
          >
            {t`Are you sure you want to delete "${vaultName}"? All items in this vault will be permanently deleted. This cannot be undone.`}
          </Text>

          <PasswordField
            label={t`Confirm With Master Password`}
            placeholder={t`Enter Master Password to Confirm Deletion`}
            {...masterPasswordFieldProps}
            onChange={(e) => {
              onChangeMasterPassword(e.target.value)
              if (submitError) setSubmitError(null)
            }}
            error={masterPasswordError}
            testID="delete-vault-password-v2"
          />

          <div className="flex w-full flex-row items-center justify-between gap-[var(--spacing12)]">
            <div className="min-w-0 flex-1">
              <Text as="span" variant="label">
                {t`Erase Vault from`}
              </Text>{' '}
              <Link
                onClick={() => setModal(<PairedDevicesModalContent />)}
                data-testid="delete-vault-eraseall-link-v2"
              >
                {t`${otherDeviceCount} other devices`}
              </Link>{' '}
              <Text as="span" variant="label">
                {t`with access`}
              </Text>
            </div>
            <ToggleSwitch
              checked={eraseFromAllDevices}
              onChange={setEraseFromAllDevices}
              aria-label={t`Erase vault from all devices`}
              data-testid="delete-vault-eraseall-toggle-v2"
            />
          </div>

          {eraseFromAllDevices ? (
            <AlertMessage
              variant="warning"
              size="small"
              title=""
              description={t`The removal will take effect on all other devices the next time they access this vault.`}
              testID="delete-vault-eraseall-alert-v2"
            />
          ) : null}

          {submitError ? (
            <AlertMessage
              variant="error"
              size="small"
              title=""
              description={submitError}
              testID="delete-vault-error-alert-v2"
            />
          ) : null}
        </div>
      </Form>
    </Dialog>
  )
}
