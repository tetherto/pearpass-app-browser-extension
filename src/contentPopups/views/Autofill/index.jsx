import { useEffect, useMemo, useRef, useState } from 'react'

import { RECORD_TYPES, useVault } from 'pearpass-lib-vault'

import { PopupCard } from '../../../shared/components/PopupCard'
import { RecordItem } from '../../../shared/components/RecordItem'
import { useRouter } from '../../../shared/context/RouterContext'
import { UserIcon } from '../../../shared/icons/UserIcon'
import { UserKeyIcon } from '../../../shared/icons/UserKeyIcon'
import { MESSAGE_TYPES } from '../../../shared/services/messageBridge'
import { logger } from '../../../shared/utils/logger'
import { useFilteredRecords } from '../../hooks/useFilteredRecords'

export const Autofill = () => {
  const popupRef = useRef(null)
  const authTimeoutRef = useRef(null)
  const { state: routerState } = useRouter()

  const { refetch: refetchVault } = useVault()

  const { filteredRecords } = useFilteredRecords()

  const [passkeyRequest, setPasskeyRequest] = useState(null)
  const [currentTabId, setCurrentTabId] = useState(null)
  const [isAuthenticating, setIsAuthenticating] = useState(false)

  useEffect(() => {
    chrome.runtime.sendMessage(
      { type: MESSAGE_TYPES.GET_CONDITIONAL_PASSKEY_REQUEST },
      (response) => {
        if (chrome.runtime.lastError) {
          logger.error(
            'Failed to get passkey request:',
            chrome.runtime.lastError
          )
          return
        }
        if (response?.request) {
          setPasskeyRequest(response.request)
          setCurrentTabId(response.tabId)
        }
      }
    )

    refetchVault()

    return () => {
      if (authTimeoutRef.current) {
        clearTimeout(authTimeoutRef.current)
      }
    }
  }, [])

  const passkeyRecords = useMemo(() => {
    if (!passkeyRequest || !filteredRecords) return []

    return filteredRecords.filter((record) => {
      if (record.type !== RECORD_TYPES.LOGIN || !record.data?.credential)
        return false

      const origin = passkeyRequest.requestOrigin
      if (
        origin &&
        record.data?.websites?.some(
          (site) => site.includes(origin) || origin.includes(site)
        )
      ) {
        return true
      }
      return false
    })
  }, [filteredRecords, passkeyRequest])

  const regularLogins = useMemo(
    () =>
      (filteredRecords || []).filter(
        (r) => !(r.type === RECORD_TYPES.LOGIN && r.data?.credential)
      ),
    [filteredRecords]
  )

  useEffect(() => {
    if (!popupRef.current) return

    requestAnimationFrame(() => {
      if (!popupRef.current) return

      window.parent.postMessage(
        {
          type: 'setStyles',
          data: {
            iframeId: routerState?.iframeId,
            iframeType: routerState?.iframeType,
            style: {
              width: `${popupRef.current.offsetWidth}px`,
              height: `${popupRef.current.offsetHeight}px`,
              borderRadius: '12px'
            }
          }
        },
        '*'
      )
    })
  }, [
    routerState?.iframeId,
    routerState?.iframeType,
    passkeyRecords.length,
    regularLogins.length
  ])

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

  const handleAutofillPasskey = (record) => {
    setIsAuthenticating(true)
    const startTime = Date.now()
    const MIN_LOADING_TIME = 600

    chrome.runtime.sendMessage(
      {
        type: MESSAGE_TYPES.AUTHENTICATE_WITH_PASSKEY,
        credential: record.data.credential,
        tabId: currentTabId
      },
      () => {
        if (chrome.runtime.lastError) {
          logger.error('Failed to authenticate:', chrome.runtime.lastError)
          setIsAuthenticating(false)
          return
        }

        const elapsed = Date.now() - startTime
        const delay = Math.max(0, MIN_LOADING_TIME - elapsed)

        // Store timeout ID for cleanup
        authTimeoutRef.current = setTimeout(() => {
          window.parent.postMessage(
            {
              type: 'close',
              data: {
                iframeId: routerState?.iframeId,
                iframeType: routerState?.iframeType
              }
            },
            '*'
          )
        }, delay)
      }
    )
  }

  const handleAutoFill = (record) => {
    const isPasskey =
      record.type === RECORD_TYPES.LOGIN && record.data?.credential

    if (isPasskey) {
      handleAutofillPasskey(record)
      return
    }

    if (routerState.recordType === RECORD_TYPES.IDENTITY) {
      handleAutofillIdentity(record)
    } else if (routerState.recordType === RECORD_TYPES.LOGIN) {
      handleAutofillLogin(record)
    }
  }

  const renderRecordList = (records) =>
    records.map((record) => {
      const websiteDomain = record?.data?.websites?.[0]

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
            folder={record.data?.username}
          />
        </div>
      )
    })

  return (
    <PopupCard
      className="flex max-h-[195px] min-h-[140px] w-[280px] flex-col p-2"
      ref={popupRef}
    >
      {isAuthenticating ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3">
          <div className="border-primary400-mode1 h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div>
          <span className="text-white-mode1 text-sm font-medium">
            Authenticating...
          </span>
        </div>
      ) : (
        <div className="flex flex-col gap-2 overflow-x-hidden overflow-y-auto">
          {passkeyRecords.length === 0 && regularLogins.length === 0 ? (
            <div className="flex">
              <span className="text-white-mode1 text-sm">No records found</span>
            </div>
          ) : (
            <>
              <span className="text-white-mode1 text-sm">
                Make the access with...
              </span>

              <div className="flex flex-col gap-2">
                <div className="flex flex-col">
                  {passkeyRecords.length > 0 && (
                    <>
                      <div className="text-white-mode1 mb-[5px] flex items-center gap-2 text-sm">
                        <UserKeyIcon size="24" />
                        <span>Passkey</span>
                      </div>
                      {renderRecordList(passkeyRecords)}
                    </>
                  )}
                </div>

                <div className="flex flex-col">
                  {regularLogins.length > 0 && (
                    <>
                      <div className="text-white-mode1 mb-[5px] flex items-center gap-2 text-sm">
                        <UserIcon size="24" />
                        <span>Password</span>
                      </div>
                      {renderRecordList(regularLogins)}
                    </>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </PopupCard>
  )
}
