import { CreateNewVault } from './CreateNewVault'
import { EnterMasterPassword } from './EnterMasterPassword/EnterMasterPassword'
import { LoadVault } from './LoadVault'
import { LockedScreen } from './LockedScreen/LockedScreen'
import { SelectOrLoadVault } from './SelectOrLoadVault'
import { UnlockVault } from './UnlockVault'
import { WelcomePageWrapper } from '../../../shared/components/WelcomePageWrapper'
import { NAVIGATION_ROUTES } from '../../../shared/constants/navigation'
import { useRouter } from '../../../shared/context/RouterContext'

export const WelcomePage = () => {
  const { params } = useRouter()

  if (params.state === NAVIGATION_ROUTES.MASTER_PASSWORD) {
    return <EnterMasterPassword />
  }

  if (params.state === NAVIGATION_ROUTES.SCREEN_LOCKED) {
    return <LockedScreen />
  }

  const page = renderPage(params.state)
  if (!page) {
    return <div className="bg-surface-primary h-full w-full" />
  }

  return <WelcomePageWrapper>{page}</WelcomePageWrapper>
}

const renderPage = (state) => {
  switch (state) {
    case NAVIGATION_ROUTES.VAULTS:
      return <SelectOrLoadVault />
    case NAVIGATION_ROUTES.VAULT_PASSWORD:
      return <UnlockVault />
    case NAVIGATION_ROUTES.NEW_VAULT_CREDENTIALS:
      return <CreateNewVault />
    case NAVIGATION_ROUTES.LOAD_VAULT:
      return <LoadVault />
    default:
      return null
  }
}
