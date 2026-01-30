import { StrictMode } from 'react'

import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'
import { VaultProvider } from 'pearpass-lib-vault'
import { createRoot } from 'react-dom/client'

import { messages } from '../locales/en/messages.mjs'
import { createClient } from '../shared/client'
import { AppWithBlockingState } from '../shared/containers/AppWithBlockingState'
import { LoadingProvider } from '../shared/context/LoadingContext'
import { ModalProvider } from '../shared/context/ModalContext'
import { RouterProvider } from '../shared/context/RouterContext'
import { ToastProvider } from '../shared/context/ToastContext'
import { logger } from '../shared/utils/logger'
import '../index.css'

i18n.load('en', messages)
i18n.activate('en')

createClient()
  .then(() => {
    logger.log('Pearpass Vault client initialized')
  })
  .catch((error) => {
    logger.error('Failed to initialize Pearpass Vault client:', error)
  })

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ToastProvider>
      <LoadingProvider>
        <VaultProvider>
          <I18nProvider i18n={i18n}>
            <RouterProvider>
              <ModalProvider>
                <AppWithBlockingState />
              </ModalProvider>
            </RouterProvider>
          </I18nProvider>
        </VaultProvider>
      </LoadingProvider>
    </ToastProvider>
  </StrictMode>
)
