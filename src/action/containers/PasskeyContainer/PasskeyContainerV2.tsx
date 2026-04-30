import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react'

import {
  useRecords,
  useUserData,
  useVault,
  useVaults,
  type Vault
} from '@tetherto/pearpass-lib-vault'

import { PasskeyPopupHeader } from '../PasskeyPopupHeader'
import { VaultSwitcherDropdown } from '../VaultSwitcherDropdown'
import { useGlobalLoading } from '../../../shared/context/LoadingContext'
import { useModal } from '../../../shared/context/ModalContext'
import { useRouter } from '../../../shared/context/RouterContext'
import { VaultPasswordFormModalContent } from '../../../shared/containers/VaultPasswordFormModalContent'
import { logger } from '../../../shared/utils/logger'
import { shouldRequireVerification } from '../../../shared/utils/passkeyVerificationPreference'

type PasskeyContainerV2Props = {
  title: string
  onClose: () => void
  onVaultChange?: () => void
  children: ReactNode
}

export const PasskeyContainerV2 = ({
  title,
  onClose,
  onVaultChange,
  children
}: PasskeyContainerV2Props) => {
  const {
    refetch: refetchVault,
    data: vaultData,
    isVaultProtected
  } = useVault()
  const { state: routerState, navigate, currentPage } = useRouter()
  const { setModal, closeModal } = useModal()

  const {
    serializedPublicKey = null,
    requestId = null,
    requestOrigin = null,
    tabId = null
  } = routerState ?? {}

  const { data: vaultsData, refetch: refetchVaults } = useVaults()
  const { refetch: refetchRecords } = useRecords()
  const { refetch: refetchUserData } = useUserData()

  const hasInitialized = useRef(false)
  const [isVaultChanging, setIsVaultChanging] = useState(false)

  const vaults = useMemo<Vault[]>(() => vaultsData ?? [], [vaultsData])

  const handleVaultSelect = async (vault: Vault) => {
    try {
      const isProtected = await isVaultProtected(vault.id)

      if (isProtected) {
        setModal(
          <VaultPasswordFormModalContent
            vault={vault}
            onSubmit={async (password: string) => {
              try {
                setIsVaultChanging(true)
                await refetchVault(vault.id, { password })
                closeModal()
                await Promise.all([refetchUserData(), refetchVaults()])
                onVaultChange?.()
              } catch (error) {
                logger.error('Failed to switch to protected vault:', error)
              } finally {
                setIsVaultChanging(false)
              }
            }}
          />
        )
        return
      }

      setIsVaultChanging(true)
      await refetchVault(vault.id)
      await Promise.all([refetchUserData(), refetchVaults()])
      onVaultChange?.()
    } catch (error) {
      logger.error('Failed to switch vault:', error)
    } finally {
      setIsVaultChanging(false)
    }
  }

  useGlobalLoading({ isLoading: isVaultChanging })

  useEffect(() => {
    if (hasInitialized.current) return

    let cancelled = false

    const refreshData = async () => {
      const currentUserData = await refetchUserData()
      let publicKey
      try {
        publicKey = JSON.parse(serializedPublicKey ?? '')
      } catch {
        // not parseable, proceed without publicKey
      }

      if (cancelled) return

      const requiresVerification = shouldRequireVerification(publicKey)

      const needsAuth =
        !currentUserData?.isLoggedIn ||
        !currentUserData?.isVaultOpen ||
        (requiresVerification && !routerState?.isVerified)

      if (needsAuth) {
        const passkeyParams = {
          page: currentPage,
          serializedPublicKey,
          requestId,
          requestOrigin,
          tabId,
          inPasskeyFlow: true,
          isVerified: true
        }

        const stateToUse =
          requiresVerification && !routerState?.isVerified
            ? 'masterPassword'
            : !currentUserData?.isLoggedIn
              ? 'masterPassword'
              : 'vaults'

        navigate('welcome', {
          params: { state: stateToUse },
          state: passkeyParams
        })
        return
      }

      if (!cancelled) {
        await Promise.all([refetchVault(), refetchRecords(), refetchVaults()])
        hasInitialized.current = true
      }
    }

    refreshData()

    return () => {
      cancelled = true
    }
  }, [
    serializedPublicKey,
    requestId,
    requestOrigin,
    tabId,
    routerState?.isVerified,
    currentPage
  ])

  return (
    <div className="bg-background flex w-full flex-col">
      <PasskeyPopupHeader title={title} onClose={onClose} />

      <div className="border-border-primary bg-surface-primary flex flex-1 flex-col gap-[24px] overflow-hidden rounded-[var(--radius16)] border p-[12px]">
        <VaultSwitcherDropdown
          vaults={vaults}
          activeVault={vaultData ?? null}
          onSelect={handleVaultSelect}
          disabled={isVaultChanging}
        />

        <div className="flex flex-1 flex-col overflow-auto">{children}</div>
      </div>
    </div>
  )
}
