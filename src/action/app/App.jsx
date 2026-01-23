import { useDesktopConnectionErrors } from './hooks/useDesktopConnectionErrors'
import { usePairingRequired } from './hooks/usePairingRequired'
import { useRedirect } from './hooks/useRedirect'
import { useWindowResize } from './hooks/useWindowResize'
import { Routes } from './Routes'
import { FadeInWrapper } from '../../shared/components/FadeInWrapper'
import { WelcomePageWrapper } from '../../shared/components/WelcomePageWrapper'
import { useGlobalLoading } from '../../shared/context/LoadingContext'

export const App = () => {
  const { isLoading: isRedirectLoading } = useRedirect()
  const windowSize = useWindowResize()

  useGlobalLoading({
    isLoading: isRedirectLoading
  })

  usePairingRequired()
  useDesktopConnectionErrors()

  return (
    <div
      className="bg-black-mode1 flex items-center"
      style={{
        height: `${windowSize.height}px`,
        width: `${windowSize.width}px`
      }}
    >
      {isRedirectLoading ? (
        <FadeInWrapper>
          <WelcomePageWrapper />
        </FadeInWrapper>
      ) : (
        <Routes />
      )}
    </div>
  )
}
