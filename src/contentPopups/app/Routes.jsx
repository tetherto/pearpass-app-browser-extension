import { useEffect, useState } from 'react'

import { useRouter } from '../../shared/context/RouterContext'
import {
  getAutofillEnabled,
  onAutofillEnabledChanged
} from '../../shared/utils/autofillSetting'
import { Autofill } from '../views/Autofill'
import { LoginDetect } from '../views/LoginDetect'
import { Logo } from '../views/Logo'
import { PasswordGenerator } from '../views/PasswordGenerator'
import { PasswordSuggestion } from '../views/PasswordSuggestion'

export const Routes = () => {
  const { currentPage } = useRouter()
  const [isAutofillEnabled, setIsAutoFillEnabled] = useState(true)

  useEffect(() => {
    getAutofillEnabled().then((isEnabled) => setIsAutoFillEnabled(isEnabled))
    const unsubscribe = onAutofillEnabledChanged((isEnabled) => {
      setIsAutoFillEnabled(isEnabled)
    })
    return unsubscribe
  }, [])

  switch (currentPage) {
    case 'logo':
      if (!isAutofillEnabled) return null
      return <Logo />
    case 'loginDetect':
      return <LoginDetect />
    case 'autofill':
      if (!isAutofillEnabled) return null
      return <Autofill />
    case 'passwordSuggestion':
      return <PasswordSuggestion />
    case 'passwordGenerator':
      return <PasswordGenerator />
    default:
      return null
  }
}
