import { useMemo, useState } from 'react'

import { t } from '@lingui/core/macro'
import { useVault, useVaults } from 'pearpass-lib-vault'

import { FormModalHeaderWrapper } from '../../../../shared/components/FormModalHeaderWrapper'
import { Vault } from '../../../../shared/components/Vault'
import { ModalContent } from '../../../../shared/containers/ModalContent'
import { useModal } from '../../../../shared/context/ModalContext'
import { logger } from '../../../../shared/utils/logger'
import { VaultPasswordForm } from '../../VaultPasswordForm'

export const SwapVaultModalContent = () => {
  const { closeModal } = useModal()
  const [vault, setVault] = useState(null)

  const { data: vaultsData } = useVaults()

  const {
    data: vaultData,
    refetch: refetchVault,
    isVaultProtected
  } = useVault()

  const vaults = useMemo(
    () => (vaultsData || []).filter((vault) => vault.id !== vaultData?.id),
    [vaultsData, vaultData?.id]
  )

  const onVaultSelect = async (vault) => {
    const isProtected = await isVaultProtected(vault.id)

    if (isProtected) {
      setVault(vault)

      return
    }

    await refetchVault(vault.id)

    await closeModal()
  }

  const submit = async (password) => {
    if (!vault) {
      return
    }

    try {
      await refetchVault(vault.id, { password })
      closeModal()
    } catch (error) {
      logger.error(error)
      throw error
    }
  }
  const titles = useMemo(() => {
    if (vault) {
      return {
        title: t`Insert Vault’s password`,
        description: t`Unlock with the ${vault.name ?? vault.id} Vault password`
      }
    }

    return {
      title: t`Swap Vault`,
      description: t`Select the Vault you want to sign in`
    }
  }, [vault])

  const handleClose = () => {
    if (vault) {
      setVault(null)
    } else {
      closeModal()
    }
  }

  return (
    <ModalContent
      onClose={handleClose}
      headerChildren={
        <FormModalHeaderWrapper>
          <div className="flex flex-col items-start gap-[10px]">
            <span className="text-white-mode1 font-inter text-xs font-normal">
              {titles.title}
            </span>
            <span className="text-grey100-mode1 font-inter text-xs font-normal">
              {titles.description}
            </span>
          </div>
        </FormModalHeaderWrapper>
      }
    >
      {vault ? (
        <VaultPasswordForm className={'items-start'} onSubmit={submit} />
      ) : (
        <div className="flex flex-col items-start gap-[20px]">
          {vaults.map((vault) => (
            <Vault vault={vault} onClick={() => onVaultSelect(vault)} />
          ))}
        </div>
      )}
    </ModalContent>
  )
}
