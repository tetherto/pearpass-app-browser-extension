import { useMemo } from 'react'

import { useRecords } from '@tetherto/pearpass-lib-vault'

import { useRouter } from '../../shared/context/RouterContext'

export const useFilteredRecords = () => {
  const { state: routerState } = useRouter()

  const {
    data: recordsData,
    isInitialized,
    isLoading
  } = useRecords({
    variables: {
      filters: {
        type: routerState.recordType
      }
    }
  })

  const filteredRecords = useMemo(() => {
    if (routerState.recordType === 'login' && routerState?.url) {
      try {
        const currentUrl = new URL(routerState.url)
        const currentOrigin = currentUrl.origin

        return recordsData?.filter((record) =>
          record?.data?.websites?.some((website) => {
            if (!website) return false

            try {
              const recordUrl = new URL(website)
              // Exact match (origin + path)
              if (recordUrl.href === currentUrl.href) {
                return true
              }

              // Match base domain (origin only)
              if (recordUrl.origin === currentOrigin) {
                return true
              }

              //match subdomain variations
              const recordHost = recordUrl.hostname.replace(/^www\./, '')
              const currentHost = currentUrl.hostname.replace(/^www\./, '')
              return recordHost === currentHost
            } catch {
              return false
            }
          })
        )
      } catch {
        return []
      }
    }

    return recordsData
  }, [recordsData, routerState?.url, routerState?.recordType])

  return {
    filteredRecords,
    isInitialized,
    isLoading
  }
}
