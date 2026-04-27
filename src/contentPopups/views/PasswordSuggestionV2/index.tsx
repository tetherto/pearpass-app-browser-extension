import { useEffect, useRef, useState } from 'react'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { useLingui } from '@lingui/react'
import { useVault } from '@tetherto/pearpass-lib-vault'
import { generatePassword } from '@tetherto/pearpass-utils-password-generator'
import { Text, useTheme } from '@tetherto/pearpass-lib-ui-kit'
import { Key, SyncLock } from '@tetherto/pearpass-lib-ui-kit/icons'

import { useRouter } from '../../../shared/context/RouterContext'
import { useFilteredRecords } from '../../hooks/useFilteredRecords'
import { closeIframe } from '../../iframeApi/closeIframe'

export const PasswordSuggestionV2 = () => {
  const popupRef = useRef<HTMLDivElement>(null)
  const { state: routerState, navigate } = useRouter()
  const { i18n } = useLingui()
  const { theme } = useTheme()
  const { refetch: refetchVault } = useVault()
  const { filteredRecords, isInitialized, isLoading } = useFilteredRecords()

  const [password] = useState(() => generatePassword(24))

  const onPasswordInsert = (value: string) => {
    window.parent.postMessage(
      {
        type: 'insertPassword',
        data: {
          iframeId: routerState?.iframeId,
          iframeType: routerState?.iframeType,
          password: value
        }
      },
      '*'
    )
  }

  useEffect(() => {
    window.parent.postMessage(
      {
        type: 'setStyles',
        data: {
          iframeId: routerState?.iframeId,
          iframeType: routerState?.iframeType,
          style: {
            width: `${popupRef.current?.offsetWidth}px`,
            height: `${popupRef.current?.offsetHeight}px`,
            borderRadius: '12px'
          }
        }
      },
      '*'
    )

    if (filteredRecords?.length && !isLoading && isInitialized) {
      closeIframe({
        iframeId: routerState?.iframeId,
        iframeType: routerState?.iframeType
      })
    }

    refetchVault()
  }, [filteredRecords?.length])

  const onGeneratePassword = () => {
    navigate('passwordGenerator', {
      state: routerState
    } as {
      currentPage: string
      params: Record<string, unknown>
      state: Record<string, unknown>
    })
  }
  return (
    <div
      ref={popupRef}
      className="border-border-primary bg-surface-primary flex w-[300px] flex-col overflow-hidden rounded-[8px] border"
    >
      <div
        className="border-border-primary border-b px-[var(--spacing12)] py-[var(--spacing8)]"
        data-testid="passwordsuggestionv2-title-wrap"
      >
        <Text
          data-testid="passwordsuggestionv2-title"
          variant="labelEmphasized"
        >
          <Trans>Password recommendation</Trans>
        </Text>
      </div>

      <div className="flex flex-row items-center gap-[var(--spacing12)] p-[var(--spacing12)]">
        <div
          className="flex min-w-0 flex-1 cursor-pointer flex-row items-center gap-[var(--spacing12)] rounded-[8px] outline-none"
          data-testid="passwordsuggestionv2-fill"
          onClick={() => onPasswordInsert(password)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              onPasswordInsert(password)
            }
          }}
          role="button"
          tabIndex={0}
        >
          <div
            className="bg-primary/20 text-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px]"
            aria-hidden
          >
            <span className="inline-flex h-4 w-4">
              <Key width={16} height={16} />
            </span>
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-[var(--spacing4)] text-left">
            <Text
              color={theme.colors.colorTextPrimary}
              variant="labelEmphasized"
            >
              <Trans>Fill password</Trans>
            </Text>
            <div
              className="text-text-secondary w-full max-w-full min-w-0 truncate text-sm"
              title={password}
            >
              <Text color={theme.colors.colorTextSecondary} variant="label">
                {password}
              </Text>
            </div>
          </div>
        </div>

        <div
          className="flex shrink-0 cursor-pointer items-center gap-[var(--spacing12)]"
          data-testid="passwordsuggestionv2-refresh"
          aria-label={i18n._(t`Open password generator`)}
          role="button"
          tabIndex={0}
          onClick={(e) => {
            e.stopPropagation()
            onGeneratePassword()
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              e.stopPropagation()
              onGeneratePassword()
            }
          }}
        >
          <span className="inline-flex" aria-hidden>
            <SyncLock
              color={theme.colors.colorTextPrimary}
              width={16}
              height={16}
            />
          </span>
        </div>
      </div>
    </div>
  )
}
