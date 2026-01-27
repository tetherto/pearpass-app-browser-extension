import { useRedirect } from './hooks/useRedirect'
import { useWindowResize } from './hooks/useWindowResize'
import { Routes } from './Routes'
import { FadeInWrapper } from '../../shared/components/FadeInWrapper'
import { WelcomePageWrapper } from '../../shared/components/WelcomePageWrapper'
import { useBlockingStateContext } from '../../shared/context/BlockingStateContext'
import { useGlobalLoading } from '../../shared/context/LoadingContext'

export const App = () => {
  const { isChecking: isBlockingStateChecking } = useBlockingStateContext()
  const { isLoading: isRedirectLoading } = useRedirect()
  const windowSize = useWindowResize()

  const isLoading = isBlockingStateChecking || isRedirectLoading

  useGlobalLoading({ isLoading })

  return (
    <div
      className="bg-black-mode1 flex items-center"
      style={{
        height: `${windowSize.height}px`,
        width: `${windowSize.width}px`
      }}
    >
      {isLoading ? (
        <FadeInWrapper>
          <WelcomePageWrapper />
        </FadeInWrapper>
      ) : (
        <Routes />
      )}
    </div>
  )
}
