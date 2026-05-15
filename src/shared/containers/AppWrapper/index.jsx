import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'
import { ThemeProvider as UIKitThemeProvider } from '@tetherto/pearpass-lib-ui-kit'
import {
  setPearpassVaultClient,
  VaultProvider
} from '@tetherto/pearpass-lib-vault'

import { messages } from '../../../locales/en/messages'
import { PearpassVaultClient } from '../../../vaultClient'
import { LoadingProvider } from '../../context/LoadingContext'
import { RouterProvider } from '../../context/RouterContext'
import { platformMessages } from '../../services/messageBridge'
import '../../../index.css'

// const client = new PearpassVaultClient({
//   debugMode: MODE === 'development'
// })
const client = new PearpassVaultClient({
  debugMode: false
})

;(async () => {
  const platform = await platformMessages.getPlatformInfo()
  const currentDeviceName = platform
    ? `${platform.os} ${platform.arch}`.trim()
    : undefined
  setPearpassVaultClient(client, { currentDeviceName })
})()

i18n.load('en', messages)
i18n.activate('en')

/**
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children
 */
export const AppWrapper = ({ children }) => (
  <UIKitThemeProvider>
    <LoadingProvider>
      <RouterProvider>
        <VaultProvider>
          <I18nProvider i18n={i18n}>{children}</I18nProvider>
        </VaultProvider>
      </RouterProvider>
    </LoadingProvider>
  </UIKitThemeProvider>
)
