import { useEffect, useMemo, useRef } from 'react'

import { Trans } from '@lingui/react/macro'
import { useVault } from '@tetherto/pearpass-lib-vault'
import { generatePassword } from '@tetherto/pearpass-utils-password-generator'

import { ButtonRoundIcon } from '../../../shared/components/ButtonRoundIcon'
import { HighlightString } from '../../../shared/components/HighlightString'
import { PopupCard } from '../../../shared/components/PopupCard'
import { useRouter } from '../../../shared/context/RouterContext'
import { KeyIcon } from '../../../shared/icons/KeyIcon'
import { PasswordIcon } from '../../../shared/icons/PasswordIcon'
import { useFilteredRecords } from '../../hooks/useFilteredRecords'
import { closeIframe } from '../../iframeApi/closeIframe'
import { setIframeStyles } from '../../iframeApi/setIframeStyles'

export const PasswordSuggestion = () => {
  const popupRef = useRef(null)

  const { state: routerState, navigate } = useRouter()

  const { refetch: refetchVault } = useVault()

  const { filteredRecords, isInitialized, isLoading } = useFilteredRecords()

  const password = useMemo(() => generatePassword(24), [])

  const isReady = isInitialized && !isLoading
  const hasMatchingRecords = !!filteredRecords?.length
  const shouldShowSuggestion = isReady && !hasMatchingRecords

  const onPasswordInsert = (value) => {
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

  const onGeneratePassword = () => {
    navigate('passwordGenerator', {
      state: routerState
    })
  }

  useEffect(() => {
    refetchVault()
  }, [])

  useEffect(() => {
    if (isReady && hasMatchingRecords) {
      closeIframe({
        iframeId: routerState?.iframeId,
        iframeType: routerState?.iframeType
      })
    }
  }, [isReady, hasMatchingRecords])

  useEffect(() => {
    if (!shouldShowSuggestion) return

    setIframeStyles({
      iframeId: routerState?.iframeId,
      iframeType: routerState?.iframeType,
      style: {
        width: `${popupRef.current?.offsetWidth}px`,
        height: `${popupRef.current?.offsetHeight}px`,
        borderRadius: '12px'
      }
    })
  }, [shouldShowSuggestion])

  if (!shouldShowSuggestion) {
    return null
  }

  return (
    <PopupCard
      className="flex min-h-[55px] w-[420px] cursor-pointer items-center justify-between gap-2 p-2"
      ref={popupRef}
      onClick={() => onPasswordInsert(password)}
    >
      <KeyIcon size="24" />

      <div className="flex flex-1 flex-col gap-1.5">
        <div className="text-white-mode1 text-[12px]">
          <Trans>Use suggested password or generate one</Trans>
        </div>
        <HighlightString className="text-[16px]" text={password} />
      </div>

      <ButtonRoundIcon
        startIcon={PasswordIcon}
        rounded="md"
        onClick={(e) => {
          e.stopPropagation()
          onGeneratePassword()
        }}
      />
    </PopupCard>
  )
}
