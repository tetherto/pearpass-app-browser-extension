import { useEffect } from 'react'

import { useVault } from '@tetherto/pearpass-lib-vault'

import { useRouter } from '../../../shared/context/RouterContext'
import { LogoLock } from '../../../shared/svgs/logoLock'
import { useFilteredRecords } from '../../hooks/useFilteredRecords'
import { closeIframe } from '../../iframeApi/closeIframe'
import { setIframeStyles } from '../../iframeApi/setIframeStyles'

export const Logo = () => {
  const { state: routerState } = useRouter()

  const { refetch: refetchVault } = useVault()

  const { filteredRecords, isInitialized, isLoading } = useFilteredRecords()

  const count = filteredRecords?.length || 0
  const isReady = isInitialized && !isLoading
  const shouldShowLogo = isReady && count > 0

  const handleClick = () => {
    window.parent.postMessage(
      {
        type: 'showAutofillPopup',
        data: {
          iframeId: routerState?.iframeId,
          iframeType: routerState?.iframeType
        }
      },
      '*'
    )
  }

  useEffect(() => {
    refetchVault()
  }, [])

  useEffect(() => {
    if (isReady && !count) {
      closeIframe({
        iframeId: routerState?.iframeId,
        iframeType: routerState?.iframeType
      })
    }
  }, [isReady, count])

  useEffect(() => {
    if (!shouldShowLogo) return

    setIframeStyles({
      iframeId: routerState?.iframeId,
      iframeType: routerState?.iframeType,
      style: {
        width: '30px',
        height: '30px',
        borderRadius: '50%'
      }
    })
  }, [shouldShowLogo])

  if (!shouldShowLogo) {
    return null
  }

  return (
    <div
      className="bg-grey500-mode1 flex h-[30px] w-[30px] cursor-pointer items-center justify-center rounded-[10px]"
      onClick={handleClick}
    >
      <div className="relative">
        <LogoLock width="100%" height="100%" />

        {!!count && (
          <div className="bg-black-mode1 font-inter text-white-mode1 absolute bottom-[1px] left-[50%] flex h-[10px] w-[10px] -translate-x-[50%] items-center justify-center rounded-full text-[8px] font-bold">
            {count}
          </div>
        )}
      </div>
    </div>
  )
}
