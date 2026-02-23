import React from 'react'

import { t } from '@lingui/core/macro'
import { useCountDown } from 'pear-apps-lib-ui-react-hooks'
import { colors } from 'pearpass-lib-ui-theme-provider'
import { useUserData } from 'pearpass-lib-vault'

import { CardWelcome } from '../../../../shared/components/CardWelcome'
import { NAVIGATION_ROUTES } from '../../../../shared/constants/navigation'
import { useRouter } from '../../../../shared/context/RouterContext'
import { LockIcon } from '../../../../shared/icons/LockIcon'
import { TimeIcon } from '../../../../shared/icons/TimeIcon'

export const LockedScreen = () => {
  const { navigate } = useRouter()
  const { masterPasswordStatus, refreshMasterPasswordStatus } = useUserData()

  const onFinish = async () => {
    const status = await refreshMasterPasswordStatus()

    if (!status?.isLocked) {
      navigate('welcome', {
        params: { state: NAVIGATION_ROUTES.MASTER_PASSWORD }
      })
    }
  }

  const timeRemaining = useCountDown({
    initialSeconds: Math.ceil(
      (masterPasswordStatus?.lockoutRemainingMs || 0) / 1000
    ),
    onFinish: () => onFinish()
  })

  return (
    <CardWelcome>
      <div className="flex w-full flex-col">
        <div className="mb-[10px] flex items-center gap-[10px]">
          <LockIcon width="32" height="32" color={colors.primary400.mode1} />
          <h2 className="text-white-mode1 font-inter m-0 text-xl leading-normal font-bold">
            {t`PearPass locked`}
          </h2>
        </div>

        <div className="text-white-mode1 font-inter flex flex-col text-sm leading-normal font-normal">
          <span>{t`Too many failed attempts.`}</span>
          <span>{t`For your security, access is temporarily locked.`}</span>
        </div>

        <div className="mt-[15px] flex w-full items-center justify-between rounded-[10px] bg-white/5 px-[10px] py-[7px]">
          <div className="text-white-mode1 font-inter flex items-center gap-2 text-sm font-normal">
            <TimeIcon width="20" height="20" color={colors.primary400.mode1} />
            {t`Try again in`}
          </div>
          <span className="text-primary400-mode1 font-inter text-xl leading-normal font-bold">
            {timeRemaining}
          </span>
        </div>
      </div>
    </CardWelcome>
  )
}
