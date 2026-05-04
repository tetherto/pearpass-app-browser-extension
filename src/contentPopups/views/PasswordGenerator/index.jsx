import { useEffect, useRef } from 'react'

import { t } from '@lingui/core/macro'
import { useRecords, useVault } from '@tetherto/pearpass-lib-vault'

import { PopupCard } from '../../../shared/components/PopupCard'
import { PasswordGeneratorModalContent } from '../../../shared/containers/PasswordGeneratorModalContent'
import { useRouter } from '../../../shared/context/RouterContext'
import { closeIframe } from '../../iframeApi/closeIframe'
import { setIframeStyles } from '../../iframeApi/setIframeStyles'

export const PasswordGenerator = () => {
  const popupRef = useRef(null)

  const { state: routerState } = useRouter()

  const { refetch: refetchVault } = useVault()
  const { data: recordsData } = useRecords({
    variables: {
      filters: {
        type: routerState.recordType
      }
    }
  })

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

  useEffect(() => {
    setIframeStyles({
      iframeId: routerState?.iframeId,
      iframeType: routerState?.iframeType,
      style: {
        width: `${popupRef.current?.offsetWidth}px`,
        height: `${popupRef.current?.offsetHeight}px`,
        borderRadius: '12px'
      }
    })

    refetchVault()
  }, [recordsData?.length])

  return (
    <PopupCard className="min-h-[350px] w-[448px] p-0" ref={popupRef}>
      <PasswordGeneratorModalContent
        actionLabel={t`Insert password`}
        onActionClick={onPasswordInsert}
        onClose={() =>
          closeIframe({
            iframeId: routerState?.iframeId,
            iframeType: routerState?.iframeType
          })
        }
      />
    </PopupCard>
  )
}
