import { useEffect, useRef, useState } from 'react'

import { t } from '@lingui/core/macro'
import type { Vault } from '@tetherto/pearpass-lib-vault'
import { Pressable } from '@tetherto/pearpass-lib-ui-kit/components/Pressable'
import { Text, useTheme } from '@tetherto/pearpass-lib-ui-kit'
import { ExpandMore, LockFilled } from '@tetherto/pearpass-lib-ui-kit/icons'

type VaultSwitcherDropdownProps = {
  vaults: Vault[]
  activeVault: Vault | null
  onSelect: (vault: Vault) => void
  disabled?: boolean
}

export const VaultSwitcherDropdown = ({
  vaults,
  activeVault,
  onSelect,
  disabled = false
}: VaultSwitcherDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const { theme } = useTheme()

  const otherVaults = vaults.filter((v) => v.id !== activeVault?.id)

  const handleTriggerClick = () => {
    if (!disabled) {
      setIsOpen((prev) => !prev)
    }
  }

  const handleSelect = (vault: Vault) => {
    setIsOpen(false)
    onSelect(vault)
  }

  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  const iconColor = disabled
    ? theme.colors.colorTextDisabled
    : theme.colors.colorTextPrimary

  return (
    <div
      ref={wrapperRef}
      className="relative w-full"
      data-testid="vault-switcher-dropdown"
    >
      <Pressable
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          width: '100%'
        }}
        onClick={handleTriggerClick}
        disabled={disabled}
        data-testid="vault-switcher-trigger"
      >
        <LockFilled width={20} height={20} color={iconColor} />
        <Text
          variant="body"
          as="span"
          color={
            disabled
              ? theme.colors.colorTextDisabled
              : theme.colors.colorTextPrimary
          }
          className="flex-1 text-left"
        >
          {activeVault?.name ?? t`Personal`}
        </Text>
        <ExpandMore
          width={20}
          height={20}
          color={iconColor}
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 150ms ease'
          }}
        />
      </Pressable>

      {isOpen && otherVaults.length > 0 && (
        <div
          className="border-border-primary bg-surface-secondary absolute top-full z-10 mt-1 w-full overflow-hidden rounded-[var(--radius8)] border"
          data-testid="vault-switcher-list"
        >
          {otherVaults.map((vault) => (
            <Pressable
              key={vault.id}
              onClick={() => handleSelect(vault)}
              data-testid={`vault-switcher-option-${vault.id}`}
              className="hover:bg-surface-hover flex w-full items-center gap-[10px] px-[12px] py-[10px]"
            >
              <LockFilled
                width={20}
                height={20}
                color={theme.colors.colorTextPrimary}
              />
              <Text
                variant="body"
                as="span"
                color={theme.colors.colorTextPrimary}
              >
                {vault.name}
              </Text>
            </Pressable>
          ))}
        </div>
      )}
    </div>
  )
}
