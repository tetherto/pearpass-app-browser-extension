import { useEffect, useRef } from 'react'

import { Trans } from '@lingui/react/macro'
import { useVault } from 'pearpass-lib-vault'

import { PopupCard } from '../../../shared/components/PopupCard'
import { RecordItem } from '../../../shared/components/RecordItem'
import { useRouter } from '../../../shared/context/RouterContext'
import { useFilteredRecords } from '../../hooks/useFilteredRecords'

export const Autofill = () => {
  const popupRef = useRef(null)

  const { state: routerState } = useRouter()

  const { refetch: refetchVault } = useVault()

  const { filteredRecords } = useFilteredRecords()

  const handleAutofillLogin = (record) => {
    const targetOrigin = document.referrer
      ? new URL(document.referrer).origin
      : '*'

    window.parent.postMessage(
      {
        type: 'autofillLogin',
        data: {
          iframeId: routerState?.iframeId,
          iframeType: routerState?.iframeType,
          username: record?.data?.username,
          password: record?.data?.password
        }
      },
      targetOrigin
    )
  }

  const handleAutofillIdentity = (record) => {
    window.parent.postMessage(
      {
        type: 'autofillIdentity',
        data: {
          iframeId: routerState?.iframeId,
          iframeType: routerState?.iframeType,
          name: record?.data?.fullName,
          email: record?.data?.email,
          phoneNumber: record?.data?.phoneNumber,
          address: record?.data?.address,
          zip: record?.data?.zip,
          city: record?.data?.city,
          region: record?.data?.region,
          country: record?.data?.country
        }
      },
      '*'
    )
  }

  const handleAutoFill = (record) => {
    if (routerState.recordType === 'identity') {
      handleAutofillIdentity(record)
    }

    if (routerState.recordType === 'login') {
      handleAutofillLogin(record)
    }
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

    refetchVault()
  }, [filteredRecords?.length])

  return (
    <PopupCard
      className="flex max-h-[500px] min-h-[125px] w-[200px] flex-col p-2"
      ref={popupRef}
    >
      <div className="text-white-mode1 p-2 pb-4 text-[12px]">
        <Trans>Make access as...</Trans>
      </div>

      <div className="flex flex-1 flex-col gap-2 overflow-auto">
        {filteredRecords?.map((record) => {
          const websiteDomain =
            record.type === 'login' ? record?.data?.websites?.[0] : null

          return (
            <div
              key={record.id}
              className="bg-grey500-mode1 cursor-pointer rounded-[10px] p-2 hover:bg-[rgba(134,170,172,0.2)]"
              onClick={() => handleAutoFill(record)}
            >
              <RecordItem
                websiteDomain={websiteDomain}
                title={record.data?.title}
                isFavorite={record.isFavorite}
                type={record.type}
                folder={record.folder}
              />
            </div>
          )
        })}
      </div>
    </PopupCard>
  )
}
