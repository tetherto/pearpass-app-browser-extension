import { t } from '@lingui/core/macro'
import { AUTHENTICATOR_ENABLED } from '@tetherto/pearpass-lib-constants'
import { OtpRefreshProvider } from '@tetherto/pearpass-lib-vault'

import { useVaultSync } from './hooks/useVaultSync'
import { useDesktopLogout } from '../../hooks/useDesktopLogout'
import { useInactivity } from '../../hooks/useInactivity'
import { FadeInWrapper } from '../../shared/components/FadeInWrapper'
import { NAVIGATION_ROUTES } from '../../shared/constants/navigation'
import { useModal } from '../../shared/context/ModalContext'
import { useRouter } from '../../shared/context/RouterContext'
import { useToast } from '../../shared/context/ToastContext'
import { useActiveTabSecureProtocol } from '../../shared/hooks/useActiveTabSecureProtocol'
import { useAllowHttpEnabled } from '../../shared/hooks/useAllowHttpEnabled'
import { LockIcon } from '../../shared/icons/LockIcon'
import { CreateOrEditCategory } from '../../shared/pages/CreateOrEditCategory'
import { isV2 } from '../../shared/utils/designVersion'
import { AddDevice } from '../pages/AddDevice'
import { AuthenticatorView } from '../pages/AuthenticatorView'
import { CreatePasskey } from '../pages/CreatePasskey'
import { CreatePasskeyV2 } from '../pages/CreatePasskey/CreatePasskeyV2'
import { NonSecureWarning } from '../pages/NonSecureWarning'
import { PasskeyLoginCreate } from '../pages/PasskeyLoginCreate'
import { RecordDetails } from '../pages/RecordDetails'
import { RecordList } from '../pages/RecordList'
import { RecordListV2 } from '../pages/RecordListV2'
import { SelectPasskey } from '../pages/SelectPasskey'
import { SelectPasskeyV2 } from '../pages/SelectPasskey/SelectPasskeyV2'
import { Settings } from '../pages/Settings'
import { SettingsV2 } from '../pages/SettingsV2'
import { WelcomePage } from '../pages/WelcomePage'

export const Routes = () => {
  const { currentPage, navigate } = useRouter()
  const { setToast } = useToast()
  const { closeAllModals } = useModal()

  const { isSecure } = useActiveTabSecureProtocol()
  const [isAllowHttpEnabled] = useAllowHttpEnabled()

  useDesktopLogout({
    onLogout: async () => {
      setToast({
        message: t`Authentication required`,
        icon: LockIcon
      })

      closeAllModals()

      navigate('welcome', {
        params: { state: NAVIGATION_ROUTES.MASTER_PASSWORD }
      })
    }
  })

  useInactivity()

  useVaultSync()

  const renderPage = () => {
    switch (currentPage) {
      case 'welcome':
        return (
          <FadeInWrapper key="welcome">
            <WelcomePage />
          </FadeInWrapper>
        )
      case 'createOrEditCategory':
        return (
          <FadeInWrapper key="createOrEditCategory">
            <CreateOrEditCategory />
          </FadeInWrapper>
        )
      case 'vault':
        return (
          <FadeInWrapper key="vault">
            {isV2() ? <RecordListV2 /> : <RecordList />}
          </FadeInWrapper>
        )
      case 'authenticator':
        if (!AUTHENTICATOR_ENABLED) break
        return (
          <FadeInWrapper key="authenticator">
            <AuthenticatorView />
          </FadeInWrapper>
        )
      case 'recordDetails':
        return (
          <FadeInWrapper key="recordDetails">
            <RecordDetails />
          </FadeInWrapper>
        )
      case 'addDevice':
        return (
          <FadeInWrapper key="addDevice">
            <AddDevice />
          </FadeInWrapper>
        )
      case 'settings':
        return (
          <FadeInWrapper key="settings">
            {isV2() ? <SettingsV2 /> : <Settings />}
          </FadeInWrapper>
        )
      case 'getPasskey':
        return (
          <FadeInWrapper key="getPasskey">
            {isV2() ? <SelectPasskeyV2 /> : <SelectPasskey />}
          </FadeInWrapper>
        )
      case 'createPasskey':
        return (
          <FadeInWrapper key="createPasskey">
            {isV2() ? <CreatePasskeyV2 /> : <CreatePasskey />}
          </FadeInWrapper>
        )
      case 'passkeyLoginCreate':
        return (
          <FadeInWrapper key="passkeyLoginCreate">
            <PasskeyLoginCreate />
          </FadeInWrapper>
        )
      default:
        return <div className="text-white-mode1">{t`Not found`}</div>
    }
  }

  return (
    <OtpRefreshProvider>
      {renderPage()}

      {!isSecure && !isAllowHttpEnabled && (
        <FadeInWrapper key="nonSecureWarning">
          <NonSecureWarning />
        </FadeInWrapper>
      )}
    </OtpRefreshProvider>
  )
}
