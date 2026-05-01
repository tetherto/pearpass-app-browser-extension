import { type CSSProperties, useEffect, useMemo, useRef, useState } from 'react'

import { t } from '@lingui/core/macro'
import { Text, useTheme } from '@tetherto/pearpass-lib-ui-kit'
import { Pressable } from '@tetherto/pearpass-lib-ui-kit/components/Pressable'
import {
  LockFilled,
  UnfoldMoreOutlined
} from '@tetherto/pearpass-lib-ui-kit/icons'
import type { Vault } from '@tetherto/pearpass-lib-vault'

type VaultSwitcherDropdownProps = {
  vaults: Vault[]
  activeVault: Vault | null
  onSelect: (vault: Vault) => void
  disabled?: boolean
}

const pressableStyle: CSSProperties = { width: '100%' }

const rowStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--spacing12)',
  padding: 'var(--spacing12)',
  width: '100%',
  boxSizing: 'border-box'
}

const labelStyle: CSSProperties = {
  flex: 1,
  minWidth: 0,
  textAlign: 'left'
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

  const otherVaults = useMemo(
    () => vaults.filter((v) => v.id !== activeVault?.id),
    [vaults, activeVault?.id]
  )

  const handleToggle = () => {
    if (!disabled) setIsOpen((open) => !open)
  }

  const handleSelect = (vault: Vault) => {
    setIsOpen(false)
    if (vault.id !== activeVault?.id) onSelect(vault)
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

  const textColor = disabled
    ? theme.colors.colorTextDisabled
    : theme.colors.colorTextPrimary

  return (
    <div
      ref={wrapperRef}
      className="border-border-primary w-full overflow-hidden rounded-[var(--radius8)] border"
      data-testid="vault-switcher-dropdown"
    >
      <Pressable
        onClick={handleToggle}
        disabled={disabled}
        data-testid="vault-switcher-trigger"
        style={pressableStyle}
      >
        <div style={rowStyle}>
          <LockFilled width={20} height={20} color={iconColor} />
          <div style={labelStyle}>
            <Text variant="body" as="span" color={textColor}>
              {activeVault?.name ?? t`Personal`}
            </Text>
          </div>
          <UnfoldMoreOutlined width={20} height={20} color={iconColor} />
        </div>
      </Pressable>

      {isOpen &&
        otherVaults.map((vault) => (
          <Pressable
            key={vault.id}
            onClick={() => handleSelect(vault)}
            data-testid={`vault-switcher-option-${vault.id}`}
            style={pressableStyle}
          >
            <div style={rowStyle}>
              <LockFilled
                width={20}
                height={20}
                color={theme.colors.colorTextPrimary}
              />
              <div style={labelStyle}>
                <Text
                  variant="body"
                  as="span"
                  color={theme.colors.colorTextPrimary}
                >
                  {vault.name}
                </Text>
              </div>
            </div>
          </Pressable>
        ))}
    </div>
  )
}
