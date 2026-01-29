import { useState, useEffect } from 'react'

import { t } from '@lingui/core/macro'

import { CardSingleSetting } from '../../../../shared/components/CardSingleSetting'
import { SwitchWithLabel } from '../../../../shared/components/SwitchWithLabel'
import {
  getAutofillEnabled,
  setAutofillEnabled
} from '../../../../shared/utils/autofillSetting'

export const AutoFillContent = () => {
  const [isAutofillEnabled, setIsAutoFillEnabled] = useState(true)

  useEffect(() => {
    let alive = true
    getAutofillEnabled().then((isEnabled) => {
      if (alive) setIsAutoFillEnabled(isEnabled)
    })
    return () => {
      alive = false
    }
  }, [])

  const handleAutofillChange = async (isEnabled) => {
    const prev = isAutofillEnabled
    setIsAutoFillEnabled(isEnabled)
    try {
      await setAutofillEnabled(isEnabled)
    } catch (e) {
      setIsAutoFillEnabled(prev)
    }
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <CardSingleSetting title={t`AutoFill`}>
        <p className="font-inter text-grey100-mode1 mb-2 text-[14px] leading-normal">
          {t`Manage how PearPass fills in your credentials.`}
        </p>
        <SwitchWithLabel
          isOn={isAutofillEnabled}
          label={t`Autofill`}
          description={t`Enable the autofill in the browser extension`}
          onChange={handleAutofillChange}
        />
      </CardSingleSetting>
    </div>
  )
}
