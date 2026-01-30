import { useState } from 'react'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { colors } from 'pearpass-lib-ui-theme-provider'

import { AboutContent } from './AboutContent'
import { AppearanceContent } from './AppearanceContent'
import { AutoFillContent } from './AutoFillContent'
import { SecurityContent } from './SecurityContent'
import { ButtonRoundIcon } from '../../../shared/components/ButtonRoundIcon'
import { useRouter } from '../../../shared/context/RouterContext'
import { AboutIcon } from '../../../shared/icons/AboutIcon'
import { AppearanceIcon } from '../../../shared/icons/AppearanceIcon'
import { AutoFillIcon } from '../../../shared/icons/AutoFillIcon'
import { BackIcon } from '../../../shared/icons/BackIcon'
import { SecurityIcon } from '../../../shared/icons/SecurityIcon'

const NAV_ITEMS = [
  { key: 'security', label: 'Security', icon: SecurityIcon },
  { key: 'autofill', label: 'AutoFill', icon: AutoFillIcon },
  { key: 'appearance', label: 'Appearance', icon: AppearanceIcon },
  { key: 'about', label: 'About', icon: AboutIcon }
]

const renderActiveContent = (activeTab) => {
  switch (activeTab) {
    case 'security':
      return <SecurityContent />
    case 'autofill':
      return <AutoFillContent />
    case 'appearance':
      return <AppearanceContent />
    case 'about':
      return <AboutContent />
    default:
      return null
  }
}

export const Settings = () => {
  const { navigate } = useRouter()
  const [activeTab, setActiveTab] = useState(null)

  const handleGoBack = () => {
    if (activeTab) {
      setActiveTab(null)
    } else {
      navigate('vault')
    }
  }

  const getTitle = () => {
    if (!activeTab) return <Trans>Settings</Trans>
    const item = NAV_ITEMS.find((i) => i.key === activeTab)
    return item ? t(item.label) : <Trans>Settings</Trans>
  }

  return (
    <div className="bg-grey500-mode1 flex h-full w-full flex-col gap-1.5 px-5 pt-7 pb-2">
      <div className="flex w-full flex-none items-center justify-start gap-2.5 text-[18px] font-bold text-white">
        <ButtonRoundIcon
          onClick={handleGoBack}
          variant="secondary"
          startIcon={BackIcon}
        />
        {getTitle()}
      </div>

      <div className="flex w-full flex-1 flex-col gap-6 overflow-auto pt-2">
        {activeTab === null ? (
          <div className="flex flex-col gap-2.5">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.key}
                className="bg-grey400-mode1 hover:bg-grey300-mode1 flex w-full items-center gap-2.5 rounded-[10px] px-3 py-2.5 text-left transition-colors"
                onClick={() => setActiveTab(item.key)}
              >
                <item.icon size="20" color={colors.white.mode1} />
                <span className="text-[14px] font-bold text-white">
                  {t(item.label)}
                </span>
              </button>
            ))}
          </div>
        ) : (
          renderActiveContent(activeTab)
        )}
      </div>
    </div>
  )
}
