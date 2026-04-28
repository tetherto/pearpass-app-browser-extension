import { useRedirect } from './hooks/useRedirect'
import { useWindowResize } from './hooks/useWindowResize'
import { Loading } from './Loading'
import { Routes } from './Routes'
import { FadeInWrapper } from '../../shared/components/FadeInWrapper'
import { WelcomePageWrapper } from '../../shared/components/WelcomePageWrapper'
import { useBlockingStateContext } from '../../shared/context/BlockingStateContext'
import { useGlobalLoading } from '../../shared/context/LoadingContext'
import { isV2 } from '../../shared/utils/designVersion'

export const App = () => {
  const { isChecking: isBlockingStateChecking } = useBlockingStateContext()
  const { isLoading: isRedirectLoading } = useRedirect()
  const windowSize = useWindowResize()

  const isLoading = isBlockingStateChecking || isRedirectLoading

  useGlobalLoading({ isLoading })

  const getLoadingComponent = () =>
    isV2() ? (
      <Loading />
    ) : (
      <FadeInWrapper>
        <WelcomePageWrapper />
      </FadeInWrapper>
    )

  return (
    <div
      className="bg-black-mode1 flex items-center"
      style={{
        height: `${windowSize.height}px`,
        width: `${windowSize.width}px`
      }}
    >
      {isLoading ? getLoadingComponent() : <Routes />}
    </div>
  )
}
