import { useState } from 'react'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { formatDate } from '@tetherto/pear-apps-utils-date'
import { useUserData, useVault, useVaults } from '@tetherto/pearpass-lib-vault'

import { ButtonLittle } from '../../../shared/components/ButtonLittle'
import { LoadingOverlay } from '../../../shared/components/LoadingOverlay'
import { SyncIcon } from '../../../shared/icons/SyncIcon'
import { logger } from '../../../shared/utils/logger'

export const SyncData = () => {
  const [lastSyncDate, setLastSyncDate] = useState(getFormattedDate())
  const [isSyncing, setIsSyncing] = useState(false)

  const { isLoading: isUserDataLoading, refetch: refetchUserData } =
    useUserData()

  const { isLoading: isVaultLoading, refetch: refetchVault } = useVault()

  const { isLoading: isVaultsLoading, refetch: refetchMasterVault } =
    useVaults()

  const isLoading =
    isUserDataLoading || isVaultLoading || isVaultsLoading || isSyncing

  const handleSyncData = async () => {
    if (isLoading) {
      return
    }

    setIsSyncing(true)

    try {
      await refetchUserData()
      await refetchMasterVault()
      await refetchVault()

      setLastSyncDate(getFormattedDate())
    } catch (error) {
      logger.error('Sync failed', error)
      // Error will be handled by the wrapper automatically
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <>
      <div className="bg-grey500-mode1 border-grey300-mode1 flex w-full flex-none items-center justify-between border-t p-2.5">
        <ButtonLittle
          onClick={handleSyncData}
          startIcon={SyncIcon}
          disabled={isLoading}
        >
          {isSyncing ? t`Syncing...` : t`Sync data with desktop app`}
        </ButtonLittle>

        <span className="text-white-mode1 text-xs">
          <Trans>Last sync on {lastSyncDate}</Trans>
        </span>
      </div>
      {isSyncing && <LoadingOverlay />}
    </>
  )
}

const getFormattedDate = () => formatDate(new Date(), 'dd-mm-yyyy', '/')
