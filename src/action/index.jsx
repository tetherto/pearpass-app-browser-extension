import { StrictMode } from 'react'

import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'
import { ThemeProvider as UIKitProvider } from '@tetherto/pearpass-lib-ui-kit'
import { VaultProvider } from '@tetherto/pearpass-lib-vault'
import { createRoot } from 'react-dom/client'

import { AutoLockProvider } from '../hooks/useAutoLockPreferences'
import { messages } from '../locales/en/messages.mjs'
import { createClient } from '../shared/client'
import { AppWithBlockingState } from '../shared/containers/AppWithBlockingState'
import { AppHeaderContextProvider } from '../shared/context/AppHeaderContext'
import { LoadingProvider } from '../shared/context/LoadingContext'
import { ModalProvider } from '../shared/context/ModalContext'
import { RouterProvider } from '../shared/context/RouterContext'
import { ToastProvider } from '../shared/context/ToastContext'
import { getLocaleFromStorage } from '../shared/utils/localeStorage'
import { logger } from '../shared/utils/logger'
import '../index.css'
import '../strict.css'

i18n.load('en', messages)
i18n.activate('en')

getLocaleFromStorage()
  .then((stored) => {
    if (stored && stored !== i18n.locale) i18n.activate(stored)
  })
  .catch((error) => {
    logger.error('Failed to load persisted locale:', error)
  })

createClient()
  .then(() => {
    logger.log('Pearpass Vault client initialized')
  })
  .catch((error) => {
    logger.error('Failed to initialize Pearpass Vault client:', error)
  })

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <UIKitProvider>
      <ToastProvider>
        <LoadingProvider>
          <VaultProvider>
            <I18nProvider i18n={i18n}>
              <RouterProvider>
                <AutoLockProvider>
                  <ModalProvider>
                    <AppHeaderContextProvider>
                      <AppWithBlockingState />
                    </AppHeaderContextProvider>
                  </ModalProvider>
                </AutoLockProvider>
              </RouterProvider>
            </I18nProvider>
          </VaultProvider>
        </LoadingProvider>
      </ToastProvider>
    </UIKitProvider>
  </StrictMode>
)
