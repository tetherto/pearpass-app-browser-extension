import { useEffect, useState } from 'react'

import { useUserData, useVault, useVaults } from 'pearpass-lib-vault'

import { NAVIGATION_ROUTES } from '../../../shared/constants/navigation'
import { useBlockingStateContext } from '../../../shared/context/BlockingStateContext'
import { useRouter } from '../../../shared/context/RouterContext'
import { logger } from '../../../shared/utils/logger'

export const useRedirect = () => {
  const { navigate, currentPage } = useRouter()
  const { isChecking: isBlockingStateChecking, blockingState } =
    useBlockingStateContext()

  const [isRedirecting, setIsRedirecting] = useState(true)

  const { refetch: refetchUser } = useUserData()

  const { refetch: refetchVault } = useVault()

  const { refetch: refetchMasterVault } = useVaults()

  const navigateToWelcome = (state = NAVIGATION_ROUTES.MASTER_PASSWORD) => {
    navigate('welcome', { params: { state } })
  }

  const handleRedirect = async () => {
    try {
      // Wait for blocking state check to complete
      if (isBlockingStateChecking) {
        return
      }

      // If there's a blocking state, don't proceed
      // useBlockingState handles showing the appropriate modal
      if (blockingState) {
        setIsRedirecting(false)
        return
      }

      setIsRedirecting(true)

      // If we're already on a passkey page (parsed from URL), don't redirect
      if (currentPage === 'getPasskey' || currentPage === 'createPasskey') {
        setIsRedirecting(false)
        return
      }

      const userData = await refetchUser()

      if (!userData) {
        navigateToWelcome()
        setIsRedirecting(false)
        return
      }

      if (userData?.masterPasswordStatus?.isLocked) {
        navigateToWelcome(NAVIGATION_ROUTES.SCREEN_LOCKED)
        setIsRedirecting(false)
        return
      }

      // User is fully logged in with vault open
      if (
        userData.hasPasswordSet &&
        userData.isLoggedIn &&
        userData.isVaultOpen
      ) {
        await refetchMasterVault()
        await refetchVault()

        navigate('vault', { state: { recordType: 'all' } })
        setIsRedirecting(false)
        return
      }

      // User is logged in but vault is not open
      if (userData.hasPasswordSet && userData.isLoggedIn) {
        await refetchMasterVault()
        navigateToWelcome(NAVIGATION_ROUTES.VAULTS)
        setIsRedirecting(false)
        return
      }

      // User needs to set master password
      navigateToWelcome()

      setIsRedirecting(false)
    } catch (error) {
      logger.error('Redirect flow error:', error)
      navigateToWelcome()
      setIsRedirecting(false)
    }
  }

  useEffect(() => {
    void handleRedirect()
  }, [isBlockingStateChecking, blockingState])

  return {
    isLoading: isRedirecting
  }
}
