import { createRoot } from 'react-dom/client'

import { AppWithBlockingState } from '../shared/containers/AppWithBlockingState'
import { AppWrapper } from '../shared/containers/AppWrapper'

createRoot(document.getElementById('root')).render(
  <AppWrapper>
    <AppWithBlockingState />
  </AppWrapper>
)
