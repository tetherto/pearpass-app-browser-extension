import { t } from '@lingui/core/macro'

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
import { AddDevice } from '../pages/AddDevice'
import { CreatePasskey } from '../pages/CreatePasskey'
import { NonSecureWarning } from '../pages/NonSecureWarning'
import { RecordDetails } from '../pages/RecordDetails'
import { RecordList } from '../pages/RecordList'
import { SelectPasskey } from '../pages/SelectPasskey'
import { Settings } from '../pages/Settings'
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
            <RecordList />
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
            <Settings />
          </FadeInWrapper>
        )
      case 'getPasskey':
        return (
          <FadeInWrapper key="getPasskey">
            <SelectPasskey />
          </FadeInWrapper>
        )
      case 'createPasskey':
        return (
          <FadeInWrapper key="createPasskey">
            <CreatePasskey />
          </FadeInWrapper>
        )
      default:
        return <div className="text-white-mode1">{t`Not found`}</div>
    }
  }

  return (
    <>
      {renderPage()}

      {!isSecure && !isAllowHttpEnabled && (
        <FadeInWrapper key="nonSecureWarning">
          <NonSecureWarning />
        </FadeInWrapper>
      )}
    </>
  )
}
