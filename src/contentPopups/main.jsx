import { createRoot } from 'react-dom/client'

import { App } from './app/App'
import { AppWrapper } from '../shared/containers/AppWrapper'

createRoot(document.getElementById('root')).render(
  <AppWrapper>
    <App />
  </AppWrapper>
)
