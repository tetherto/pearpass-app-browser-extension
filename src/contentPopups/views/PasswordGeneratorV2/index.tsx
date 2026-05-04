import { useEffect, useLayoutEffect, useRef, useState } from 'react'

import { Trans } from '@lingui/react/macro'
import { Button, Text, useTheme } from '@tetherto/pearpass-lib-ui-kit'
import { useRecords, useVault } from '@tetherto/pearpass-lib-vault'

import { useRouter } from '../../../shared/context/RouterContext'
import { PasswordGeneratorV2 as PasswordGeneratorV2Body } from '../../../shared/containers/PasswordGeneratorV2'
import { closeIframe } from '../../iframeApi/closeIframe'
import { setIframeStyles } from '../../iframeApi/setIframeStyles'

export const PasswordGeneratorV2 = () => {
  const popupRef = useRef<HTMLDivElement>(null)
  const { state: routerState } = useRouter()
  const { theme } = useTheme()
  const { refetch: refetchVault } = useVault()
  const { data: recordsData } = useRecords({
    variables: {
      filters: {
        type: routerState?.recordType
      }
    }
  })

  const [generated, setGenerated] = useState('')

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

  const onDiscard = () => {
    closeIframe({
      iframeId: routerState?.iframeId,
      iframeType: routerState?.iframeType
    })
  }

  useLayoutEffect(() => {
    const el = popupRef.current
    setIframeStyles({
      iframeId: routerState?.iframeId,
      iframeType: routerState?.iframeType,
      style: {
        width: `${el?.offsetWidth ?? 440}px`,
        height: `${el?.offsetHeight ?? 280}px`,
        borderRadius: '12px'
      }
    })
  }, [generated, routerState?.iframeId, routerState?.iframeType])

  useEffect(() => {
    void refetchVault()
  }, [recordsData?.length])

  return (
    <div
      className="border-border-primary bg-surface-primary flex w-[440px] flex-col overflow-hidden rounded-[12px] border"
      ref={popupRef}
    >
      <div className="border-border-primary flex shrink-0 items-center border-b px-[var(--spacing16)] py-[var(--spacing12)]">
        <Text color={theme.colors.colorTextPrimary} variant="label">
          <Trans>New Password Item</Trans>
        </Text>
      </div>
      <div className="max-h-[191px] min-h-0 flex-1 overflow-y-auto p-[var(--spacing16)]">
        <PasswordGeneratorV2Body onGeneratedChange={setGenerated} />
      </div>

      <div className="border-border-primary flex shrink-0 justify-end gap-[var(--spacing8)] border-t px-[var(--spacing16)] py-[var(--spacing12)]">
        <Button
          onClick={onDiscard}
          size="small"
          type="button"
          variant="secondary"
          data-testid="generatepassword-button-discard-v2"
        >
          <Trans>Discard</Trans>
        </Button>
        <Button
          onClick={() => {
            onPasswordInsert(generated)
          }}
          size="small"
          type="button"
          variant="primary"
          data-testid="generatepassword-button-primary-v2"
        >
          <Trans>Use Password</Trans>
        </Button>
      </div>
    </div>
  )
}
