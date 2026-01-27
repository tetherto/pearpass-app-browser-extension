import { App } from '../../action/app/App'
import { useBlockingState } from '../../action/app/hooks/useBlockingState'
import { BlockingStateProvider } from '../context/BlockingStateContext'

export const AppWithBlockingState = () => {
  const { isChecking, blockingState } = useBlockingState()

  return (
    <BlockingStateProvider value={{ isChecking, blockingState }}>
      <App />
    </BlockingStateProvider>
  )
}
