import { useEffect, useMemo, useRef, useState } from 'react'

import { t } from '@lingui/core/macro'
import {
  useRecords,
  useUserData,
  useVault,
  useVaults
} from 'pearpass-lib-vault'

import { InputSearch } from '../../../shared/components/InputSearch'
import { RecordItem } from '../../../shared/components/RecordItem'
import { Vault } from '../../../shared/components/Vault'
import { useGlobalLoading } from '../../../shared/context/LoadingContext'
import { useRouter } from '../../../shared/context/RouterContext'
import { ArrowDownIcon } from '../../../shared/icons/ArrowDownIcon'
import { HardwareKey } from '../../../shared/icons/HardwareKey'
import { LockCircleIcon } from '../../../shared/icons/LockCircleIcon'
import { UserIcon } from '../../../shared/icons/UserIcon'
import { isSameOrSubdomain } from '../../../shared/utils/isSameOrSubdomain'
import { logger } from '../../../shared/utils/logger'
import { normalizeUrl } from '../../../shared/utils/normalizeUrl'
import { shouldRequireVerification } from '../../../shared/utils/passkeyVerificationPreference'

/**
 * Reusable passkey selection UI component
 * @param {{
 *   title: string,
 *   description: string,
 *   emptyMessage: string,
 *   records: object[],
 *   selectedRecord: object | null,
 *   onRecordSelect: (record: object) => void,
 *   onHardwareKeyClick: () => void,
 *   onVaultChange?: () => void,
 *   children: React.ReactNode // Footer buttons
 * }} props
 */
export const PasskeyContainer = ({
  title,
  description,
  emptyMessage,
  records,
  selectedRecord,
  onRecordSelect,
  onHardwareKeyClick,
  onVaultChange,
  children
}) => {
  const { refetch: refetchVault, data: vaultData } = useVault()
  const { state: routerState, navigate, currentPage } = useRouter()

  const {
    serializedPublicKey = null,
    requestId = null,
    requestOrigin = null,
    tabId = null
  } = routerState ?? {}

  const { data: vaultsData, refetch: refetchVaults } = useVaults()
  const { refetch: refetchRecords } = useRecords()
  const { refetch: refetchUserData } = useUserData()

  const [searchQuery, setSearchQuery] = useState('')
  const [isVaultDropdownOpen, setIsVaultDropdownOpen] = useState(false)
  const [isVaultChanging, setIsVaultChanging] = useState(false)
  const dropdownRef = useRef(null)
  const hasInitialized = useRef(false)

  const availableVaults = useMemo(
    () => (vaultsData || []).filter((vault) => vault.id !== vaultData?.id),
    [vaultsData, vaultData?.id]
  )

  const handleVaultSelect = async (vault) => {
    setIsVaultChanging(true)
    try {
      await refetchVault(vault.id)
      await Promise.all([refetchUserData(), refetchVaults()])
      setIsVaultDropdownOpen(false)
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
        publicKey = JSON.parse(serializedPublicKey)
      } catch (e) {
        logger.error('Failed to parse public key', e)
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

        const targetState = !currentUserData?.isLoggedIn
          ? 'masterPassword'
          : 'vaults'

        const stateToUse =
          requiresVerification && !routerState?.isVerified
            ? 'masterPassword'
            : targetState

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

  useEffect(() => {
    if (!isVaultDropdownOpen) return

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsVaultDropdownOpen(false)
      }
    }

    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        setIsVaultDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscapeKey)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscapeKey)
    }
  }, [isVaultDropdownOpen])

  const publicKeyData = useMemo(() => {
    if (!serializedPublicKey) return null
    try {
      return JSON.parse(serializedPublicKey)
    } catch {
      return null
    }
  }, [serializedPublicKey])

  const filteredRecords = useMemo(() => {
    if (!records || !publicKeyData) return []

    const rpId = publicKeyData.rp?.id || publicKeyData.rpId
    const normalizedRpId = rpId ? normalizeUrl(rpId, true) : null

    let filtered = records.filter((record) => {
      const websites = record.data?.websites || []
      if (!normalizedRpId) return true

      return websites.some((site) => {
        const normalizedSite = normalizeUrl(site, true)
        return (
          isSameOrSubdomain(normalizedSite, normalizedRpId) ||
          isSameOrSubdomain(normalizedRpId, normalizedSite)
        )
      })
    })

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (record) =>
          String(record.data?.title ?? '')
            .toLowerCase()
            .includes(query) ||
          String(record.data?.username ?? '')
            .toLowerCase()
            .includes(query)
      )
    }

    return filtered
  }, [records, publicKeyData, searchQuery])

  return (
    <div className="bg-grey500-mode1 flex h-full w-full flex-col p-[20px]">
      <div className="flex flex-1 flex-col gap-[15px] overflow-auto">
        <h1 className="font-inter text-[24px] leading-[normal] font-bold text-white">
          {title}
        </h1>

        <InputSearch
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t`Search...`}
        />

        <div ref={dropdownRef} className="relative inline-block">
          <button
            onClick={() => setIsVaultDropdownOpen(!isVaultDropdownOpen)}
            disabled={isVaultChanging}
            className="bg-grey400-mode1 flex items-center gap-[7px] rounded-[10px] px-[10px] py-[9px] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ArrowDownIcon size="12" />
            <LockCircleIcon size="24" />
            <span className="font-inter text-[14px] font-normal text-white">
              {vaultData?.name || t`Personal`}
            </span>
          </button>

          {isVaultDropdownOpen && availableVaults.length > 0 && (
            <div className="bg-grey500-mode1 absolute top-full right-0 left-0 z-10 mt-1 flex flex-col gap-2 rounded-[10px] p-2">
              {availableVaults.map((vault) => (
                <Vault
                  key={vault.id}
                  vault={vault}
                  onClick={() => handleVaultSelect(vault)}
                />
              ))}
            </div>
          )}
        </div>

        <p className="font-inter text-[16px] leading-[normal] text-white">
          {description}
        </p>

        <div className="flex flex-1 flex-col gap-[10px]">
          {filteredRecords.length > 0 ? (
            filteredRecords.map((record) => {
              const isSelected = selectedRecord?.id === record.id
              const websiteDomain = record.data?.websites?.[0]

              return (
                <div
                  key={record.id}
                  onClick={() => onRecordSelect(record)}
                  className={`cursor-pointer rounded-[10px] p-[10px] ${
                    isSelected
                      ? 'bg-grey300-mode1'
                      : 'bg-grey500-mode1 hover:bg-grey300-mode1'
                  }`}
                >
                  <RecordItem
                    websiteDomain={websiteDomain}
                    title={record.data?.title}
                    isFavorite={record.isFavorite}
                    type={record.type}
                    folder={record.data?.username}
                  />
                </div>
              )
            })
          ) : (
            <div className="bg-grey400-mode1 flex items-center justify-center gap-[10px] self-stretch rounded-[10px] px-[15px] py-[10px]">
              <div className="flex">
                <UserIcon width="24" color="#E6AA68" />
              </div>
              <span className="font-inter text-[16px] leading-[normal] font-normal text-white">
                {emptyMessage}
              </span>
            </div>
          )}
        </div>

        <button
          onClick={onHardwareKeyClick}
          className="flex items-center gap-[8px] self-start px-[12px] py-[5px]"
        >
          <HardwareKey width="18" height="18" color="#BADE5B" />
          <span className="font-inter text-primary400-mode1 text-[14px] font-normal">
            {t`Use device or hardware key`}
          </span>
        </button>
      </div>

      {children}
    </div>
  )
}
