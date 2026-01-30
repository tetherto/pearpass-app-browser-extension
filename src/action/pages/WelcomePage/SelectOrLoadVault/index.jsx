import React, { useMemo } from 'react'

import { Trans } from '@lingui/react/macro'
import { useVault, useVaults } from 'pearpass-lib-vault'

import { ButtonPrimary } from '../../../../shared/components/ButtonPrimary'
import { ButtonSecondary } from '../../../../shared/components/ButtonSecondary'
import { CardWelcome } from '../../../../shared/components/CardWelcome'
import { Vault } from '../../../../shared/components/Vault'
import { useLoadingContext } from '../../../../shared/context/LoadingContext'
import { useRouter } from '../../../../shared/context/RouterContext'
import { logger } from '../../../../shared/utils/logger'
import { sortByName } from '../../../../shared/utils/sortByName'
import { useVaultOpenedRedirect } from '../../../app/hooks/useVaultOpenedRedirect'

export const SelectOrLoadVault = () => {
  const { isLoading, setIsLoading } = useLoadingContext()
  const { currentPage, navigate } = useRouter()
  const navigateAfterVaultOpened = useVaultOpenedRedirect()

  const { data } = useVaults()

  const { isVaultProtected, refetch } = useVault()

  const handleLoadVault = () => {
    navigate(currentPage, { params: { state: 'loadVault' } })
  }

  const handleSelectVault = async (vaultId) => {
    try {
      setIsLoading(true)

      const isProtected = await isVaultProtected(vaultId)

      if (isProtected) {
        setIsLoading(false)

        navigate(currentPage, {
          params: { state: 'vaultPassword', vaultId: vaultId }
        })

        return
      }

      await refetch(vaultId)

      setIsLoading(false)

      navigateAfterVaultOpened()
    } catch (error) {
      setIsLoading(false)
      logger.error('Error selecting vault:', error)
    }
  }

  const handleCreateNewVault = () => {
    navigate(currentPage, { params: { state: 'newVaultCredentials' } })
  }

  const sortedVaults = useMemo(() => sortByName(data), [data])

  return (
    <CardWelcome>
      <h1 className="text-white-mode1 w-full flex-none text-center text-[20px]">
        <Trans>Open an existing vault or create a new one.</Trans>
      </h1>

      <div className="flex max-h-40 w-full flex-1 flex-col gap-[10px] overflow-auto">
        {sortedVaults.map((vault) => (
          <Vault
            key={vault.id}
            onClick={() => handleSelectVault(vault.id)}
            vault={vault}
          />
        ))}
      </div>

      <div className="flex flex-none gap-[10px]">
        <ButtonPrimary onClick={handleCreateNewVault} disabled={isLoading}>
          <Trans>Create a new vault</Trans>
        </ButtonPrimary>

        <ButtonSecondary onClick={handleLoadVault} disabled={isLoading}>
          <Trans>Import existing vault</Trans>
        </ButtonSecondary>
      </div>
    </CardWelcome>
  )
}
