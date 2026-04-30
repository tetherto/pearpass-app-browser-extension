import { rawTokens, useTheme } from '@tetherto/pearpass-lib-ui-kit'

import { useRedirect } from './hooks/useRedirect'
import { useWindowResize } from './hooks/useWindowResize'
import { Loading } from './Loading'
import { Routes } from './Routes'
import { FadeInWrapper } from '../../shared/components/FadeInWrapper'
import { WelcomePageWrapper } from '../../shared/components/WelcomePageWrapper'
import { useBlockingStateContext } from '../../shared/context/BlockingStateContext'
import { useGlobalLoading } from '../../shared/context/LoadingContext'
import { isV2 } from '../../shared/utils/designVersion'
import { AppHeaderContainer } from '../containers/AppHeaderContainer'

export const App = () => {
  const { isChecking: isBlockingStateChecking } = useBlockingStateContext()
  const { isLoading: isRedirectLoading } = useRedirect()
  const { theme } = useTheme()
  const windowSize = useWindowResize()

  const isLoading = isBlockingStateChecking || isRedirectLoading

  useGlobalLoading({ isLoading })

  const containerClassName = isV2()
    ? 'bg-background flex flex-col'
    : 'bg-black-mode1 flex items-center'

  const containerStyle = {
    height: `${windowSize.height}px`,
    width: `${windowSize.width}px`,
    ...(isV2()
      ? {
          padding: '4px',
          border: `1px solid ${theme.colors.colorBorderTertiary}`,
          borderRadius: `${rawTokens.radius8}px`,
          boxSizing: 'border-box'
        }
      : {})
  }

  return (
    <div className={containerClassName} style={containerStyle}>
      {isLoading ? (
        isV2() ? (
          <Loading />
        ) : (
          <FadeInWrapper>
            <WelcomePageWrapper />
          </FadeInWrapper>
        )
      ) : isV2() ? (
        <>
          <AppHeaderContainer />
          <div className="flex min-h-0 flex-1 flex-col">
            <Routes />
          </div>
        </>
      ) : (
        <Routes />
      )}
    </div>
  )
}
