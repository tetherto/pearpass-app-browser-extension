import React, { createContext, useCallback, useContext, useState } from 'react'

import { PASSKEY_PAGES } from '../constants/passkey'

const RouterContext = createContext()

/**
 * Parses initial route and parameters from URL hash
 * @returns {{page: string, params: Object, state: Object}}
 */
const getInitialRouteFromUrl = () => {
  // Default values
  let currentPage = 'welcome'
  const params = { state: 'masterPassword' }
  let state = {
    recordType: 'all',
    folder: undefined
  }

  // Parse URL hash if present
  const hash = window.location.hash
  if (hash) {
    // Extract page from hash
    const match = hash.match(/^#\/([^?]+)/)
    if (match) {
      currentPage = match[1]
    }

    // Extract query parameters
    const queryMatch = hash.match(/\?(.+)$/)
    if (queryMatch) {
      const urlParams = new URLSearchParams(queryMatch[1])

      // For passkey pages, extract all parameters into state
      if (PASSKEY_PAGES.includes(currentPage)) {
        state = {
          ...state,
          serializedPublicKey: urlParams.get('serializedPublicKey'),
          requestId: urlParams.get('requestId'),
          requestOrigin: urlParams.get('requestOrigin'),
          tabId: urlParams.get('tabId'),
          page: urlParams.get('page')
        }
      }
    }
  }

  return { currentPage, params, state }
}

/**
 * @typedef RouterProviderProps
 * @property {import('react').ReactNode} children React node to be rendered inside
 */

/**
 * @param {RouterProviderProps} props
 */
export const RouterProvider = ({ children }) => {
  const [state, setState] = useState(() => getInitialRouteFromUrl())

  const navigate = useCallback(
    (
      page,
      {
        params = {},
        state = {
          recordType: 'all',
          folder: undefined
        }
      } = {}
    ) => {
      setState({ currentPage: page, params, state })
    },
    []
  )

  return (
    <RouterContext.Provider value={{ ...state, navigate }}>
      {children}
    </RouterContext.Provider>
  )
}

/**
 * @returns {{
 *   currentPage: string,
 *   params: Object.<string, any>,
 *   state: Object.<string, any>,
 *   navigate: (currentPage: string, { params: Object.<string, any>, state: Object.<string, any> }) => void
 * }}
 */
export const useRouter = () => useContext(RouterContext)
