import { useEffect } from 'react'

import { setPearpassVaultClient, useUserData } from 'pearpass-lib-vault'

import { Routes } from './Routes'
import { useRouter } from '../../shared/context/RouterContext'
import { logger } from '../../shared/utils/logger'
import { PearpassVaultClient } from '../../vaultClient'
import { closeIframe } from '../iframeApi/closeIframe'
import { doesPayloadUrlMatchOrigin } from '../utils/messageValidation'

// const isProduction =
//   (typeof Pear !== 'undefined' && !!Pear.config?.key) ||
//   (typeof process !== 'undefined' &&
//     process.env &&
//     process.env.NODE_ENV === 'production')

export const App = () => {
  const { navigate } = useRouter()

  const { data: userData, refetch: refetchUserData } = useUserData()

  const search = window.location.search
  const iframeId = new URLSearchParams(search).get('id')
  const iframeType = new URLSearchParams(search).get('type')

  useEffect(() => {
    function onMessage(e) {
      const msg = e.data
      logger.log('Message received:', msg?.type, e)

      if (!doesPayloadUrlMatchOrigin(msg, e.origin)) {
        return
      }

      const combinedData = {
        ...msg.data,
        iframeId,
        iframeType
      }

      if (msg?.type === 'login') {
        navigate('loginDetect', { state: combinedData })
      }

      if (msg?.type === 'logo') {
        navigate('logo', { state: combinedData })
      }

      if (msg?.type === 'autofill') {
        navigate('autofill', { state: combinedData })
      }

      if (msg?.type === 'passwordSuggestion') {
        navigate('passwordSuggestion', { state: combinedData })
      }
    }

    window.addEventListener('message', onMessage)

    window.parent.postMessage(
      {
        type: 'ready',
        data: {
          iframeId,
          iframeType
        }
      },
      '*'
    )

    return () => window.removeEventListener('message', onMessage)
  }, [])

  useEffect(() => {
    const fetchUser = async () => {
      // const client = new PearpassVaultClient({
      //   debugMode: MODE === 'development' && !isProduction
      // })
      const client = new PearpassVaultClient({
        debugMode: false
      })
      setPearpassVaultClient(client)

      const res = await refetchUserData()

      if (!res.isLoggedIn) {
        closeIframe({
          iframeId,
          iframeType
        })
      }
    }

    fetchUser()
  }, [])

  if (!userData.isLoggedIn) {
    return null
  }

  return (
    <div className="bg-black-mode1 h-full w-full overflow-hidden">
      <Routes />
    </div>
  )
}
