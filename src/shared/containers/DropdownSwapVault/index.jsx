import { useEffect, useState } from 'react'

import { t } from '@lingui/core/macro'
import { useVault } from 'pearpass-lib-vault'

import { useModal } from '../../context/ModalContext'
import { ArrowDownIcon } from '../../icons/ArrowDownIcon'
import { LockCircleIcon } from '../../icons/LockCircleIcon'
import { LockIcon } from '../../icons/LockIcon'
import { logger } from '../../utils/logger'
import { CreateVaultModalContent } from '../CreateVaultModalContent'
import { VaultPasswordFormModalContent } from '../VaultPasswordFormModalContent'

const TRANSITION_DURATION = 250

/**
 * @param {{
 *  vaults: { id: string, name: string }[],
 *  selectedVault: { id: string, name: string } | null,
 *  isOpen?: boolean,
 *  setIsOpen?: (isOpen: boolean) => void
 * }} props
 */
export const DropdownSwapVault = ({
  vaults,
  selectedVault,
  isOpen: isOpenProp,
  setIsOpen: setIsOpenProp
}) => {
  const [isOpenInternal, setIsOpenInternal] = useState(false)

  const isOpen = isOpenProp ?? isOpenInternal
  const setIsOpen = setIsOpenProp ?? setIsOpenInternal

  const { closeModal, setModal } = useModal()

  const { isVaultProtected, refetch: refetchVault } = useVault()

  const [protectedVaultById, setProtectedVaultById] = useState({})

  useEffect(() => {
    if (!isOpen || !vaults?.length) {
      return
    }

    let isCancelled = false

    const loadProtected = async () => {
      const results = await Promise.all(
        vaults.map(async (vault) => {
          try {
            const isProtected = await isVaultProtected(vault.id)
            return [vault.id, !!isProtected]
          } catch {
            return [vault.id, false]
          }
        })
      )

      if (isCancelled) {
        return
      }

      setProtectedVaultById(Object.fromEntries(results))
    }

    loadProtected()

    return () => {
      isCancelled = true
    }
  }, [isOpen, isVaultProtected, vaults])

  const handleVaultUnlock = async ({ vault, password }) => {
    if (!vault.id) {
      return
    }

    try {
      await refetchVault(vault.id, { password })
      closeModal()
    } catch (error) {
      logger.error('DropdownSwapVault', error)

      throw error
    }
  }

  const onVaultSelect = async (vault) => {
    const cached = protectedVaultById[vault.id]
    const isProtected = cached ?? (await isVaultProtected(vault.id))

    if (cached === undefined) {
      setProtectedVaultById((prev) => ({ ...prev, [vault.id]: isProtected }))
    }

    if (isProtected) {
      setModal(
        <VaultPasswordFormModalContent
          onSubmit={async (password) => handleVaultUnlock({ vault, password })}
          vault={vault}
        />
      )
    } else {
      await refetchVault(vault.id)
    }

    setIsOpen(false)
  }

  const handleCreateNewVault = () => {
    setIsOpen(false)

    setModal(
      <CreateVaultModalContent onClose={closeModal} onSuccess={closeModal} />
    )
  }

  if (!selectedVault?.id) {
    return null
  }

  return (
    <div className="bg-black-mode1 w-full rounded-[10px]">
      <button
        type="button"
        data-testid="dropdownswapvault-container"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex w-full cursor-pointer items-center justify-between rounded-[10px] px-[10px] py-[9px] transition-colors select-none duration-[${TRANSITION_DURATION}ms] ${
          isOpen
            ? 'border-primary400-mode1 border'
            : 'border border-transparent'
        }`}
        style={{ minHeight: '42px' }}
      >
        <div className="flex min-w-0 items-center gap-2">
          <LockCircleIcon size="24" color="var(--color-primary400-mode1)" />
          <span className="font-inter truncate text-sm font-bold text-white">
            {selectedVault?.name}
          </span>
        </div>

        <div
          className="flex items-center transition-transform"
          style={{
            transitionDuration: `${TRANSITION_DURATION}ms`,
            transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)'
          }}
        >
          <ArrowDownIcon size="20" color="var(--color-primary400-mode1)" />
        </div>
      </button>

      <div
        className="flex w-full flex-col gap-[10px] overflow-x-hidden transition-all"
        style={{
          transitionDuration: `${TRANSITION_DURATION}ms`,
          padding: isOpen ? '10px' : '0 10px',
          maxHeight: isOpen ? '130px' : '0',
          opacity: isOpen ? 1 : 0,
          overflowY: isOpen ? 'auto' : 'hidden',
          pointerEvents: isOpen ? 'auto' : 'none'
        }}
      >
        {vaults?.map((vault, index) => (
          <button
            type="button"
            data-testid={`dropdownswapvault-option-${vault.id}`}
            key={vault.id}
            onClick={() => onVaultSelect(vault)}
            className="bg-grey500-mode1 hover:border-primary400-mode1 font-inter flex w-full cursor-pointer items-center justify-between rounded-[10px] border border-transparent px-[10px] py-[9px] text-sm font-bold text-white transition-all"
            style={{
              minHeight: '42px',
              transitionDuration: `${TRANSITION_DURATION}ms`,
              opacity: isOpen ? 1 : 0,
              transform: isOpen ? 'translateY(0)' : 'translateY(-6px)',
              transitionDelay: isOpen ? `${index * 30}ms` : '0ms'
            }}
          >
            <span className="min-w-0 flex-1 truncate text-left">
              {vault.name}
            </span>
            {protectedVaultById[vault.id] ? (
              <LockIcon size="25" color="white" />
            ) : null}
          </button>
        ))}

        <button
          type="button"
          data-testid="dropdownswapvault-create"
          onClick={handleCreateNewVault}
          className="bg-grey500-mode1 hover:border-primary400-mode1 text-primary400-mode1 font-inter flex w-full cursor-pointer items-center justify-start rounded-[10px] border border-transparent px-[10px] py-[9px] text-sm font-bold transition-all"
          style={{
            minHeight: '42px',
            transitionDuration: `${TRANSITION_DURATION}ms`,
            opacity: isOpen ? 1 : 0,
            transform: isOpen ? 'translateY(0)' : 'translateY(-6px)',
            transitionDelay: isOpen ? `${(vaults?.length ?? 0) * 30}ms` : '0ms'
          }}
        >
          {t`Create New Vault`}
        </button>
      </div>
    </div>
  )
}
