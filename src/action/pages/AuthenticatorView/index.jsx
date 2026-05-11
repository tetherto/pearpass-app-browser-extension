import React, { useMemo } from 'react'

import { t } from '@lingui/core/macro'
import {
  RECORD_TYPES,
  useRecords,
  useVault,
  useVaults,
  useUserData,
  isExpiring,
  groupOtpRecords
} from '@tetherto/pearpass-lib-vault'

import { TimerCircle } from '../../../shared/components/TimerCircle'
import { useAppHeaderContext } from '../../../shared/context/AppHeaderContext'
import { useRouter } from '../../../shared/context/RouterContext'
import { PlusIcon } from '../../../shared/icons/PlusIcon'
import { AuthenticatorIllustration } from '../../../shared/svgs/authenticatorIllustration'
import { getTimerColor } from '../../../shared/utils/otp'
import { Record } from '../../containers/Record'
import { SyncData } from '../../containers/SyncData'
import { useCreateOrEditRecord } from '../../hooks/useCreateOrEditRecord'

export const AuthenticatorView = () => {
  const { navigate } = useRouter()
  const { searchValue } = useAppHeaderContext()
  const { handleCreateOrEditRecord } = useCreateOrEditRecord()

  const { refetch: refetchVault } = useVault()
  const { refetch: refetchMasterVault } = useVaults()
  const { refetch: refetchUserData } = useUserData()

  const { data: records } = useRecords({
    shouldSkip: true,
    variables: {
      filters: {
        hasOtp: true,
        searchPattern: searchValue
      },
      sort: { key: 'updatedAt', direction: 'desc' }
    }
  })

  const otpRecords = useMemo(
    () => (records || []).filter((r) => r.otpPublic),
    [records]
  )

  const handleRecordClick = (record) => {
    navigate('recordDetails', {
      params: { recordId: record.id, source: 'authenticator' }
    })
  }

  const handleAddCode = () => {
    handleCreateOrEditRecord({
      recordType: RECORD_TYPES.OTP,
      mode: 'authenticator',
      onSaved: () =>
        Promise.all([refetchUserData(), refetchMasterVault(), refetchVault()])
    })
  }

  const { totpGroups, hotpRecords } = useMemo(
    () => groupOtpRecords(otpRecords),
    [otpRecords]
  )

  return (
    <div className="flex h-full w-full flex-col">
      <div className="bg-grey400-mode1 flex w-full flex-1 flex-col gap-3 overflow-auto px-6 pt-7">
        <div className="flex-1 overflow-auto">
          {otpRecords.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-5 px-4">
              <AuthenticatorIllustration width="100%" height="140" />

              <div className="flex flex-col items-center gap-2 text-center">
                <span className="text-white-mode1 text-xl font-semibold">
                  {t`No codes saved`}
                </span>
                <span className="text-grey100-mode1 text-sm leading-[18px]">
                  {t`Save your first authenticator code or import your codes from another authenticator app.`}
                </span>
              </div>

              <button
                type="button"
                onClick={handleAddCode}
                data-testid="authenticator-empty-add-code"
                className="bg-primary400-mode1 text-black-mode1 flex w-full items-center justify-center gap-1 rounded-lg py-2.5 text-sm font-medium"
              >
                <PlusIcon size="16" color="#050B06" />
                {t`Add Code`}
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-0.5 pb-16">
              {totpGroups.map(
                ({ period, records: groupRecords }, groupIndex) => {
                  const timeRemaining =
                    groupRecords[0]?.otpPublic?.timeRemaining ?? null
                  const expiring = isExpiring(timeRemaining)

                  return (
                    <div key={period}>
                      {groupIndex > 0 && (
                        <div className="bg-grey100-mode1/20 mx-2.5 mt-2 h-px" />
                      )}
                      <div className="flex items-center gap-2 px-2.5 pt-3 pb-1.5">
                        <TimerCircle
                          timeRemaining={timeRemaining}
                          period={period}
                        />
                        <span className="text-white-mode1 text-sm font-medium">
                          {t`Codes expiring in`}{' '}
                        </span>
                        <span
                          className="text-sm font-semibold"
                          style={{ color: getTimerColor(expiring) }}
                        >
                          {timeRemaining !== null
                            ? `${timeRemaining}s`
                            : `${period}s`}
                        </span>
                      </div>
                      {groupRecords.map((record) => (
                        <Record
                          key={record.id}
                          record={record}
                          otpCode={record.otpPublic?.currentCode ?? null}
                          onClick={() => handleRecordClick(record)}
                          onSelect={() => {}}
                        />
                      ))}
                    </div>
                  )
                }
              )}
              {hotpRecords.length > 0 && (
                <div>
                  {totpGroups.length > 0 && (
                    <div className="bg-grey100-mode1/20 mx-2.5 mt-2 h-px" />
                  )}
                  <div className="flex items-center gap-2 px-2.5 pt-3 pb-1.5">
                    <span className="text-white-mode1 text-sm font-medium">
                      {t`Counter-based`}
                    </span>
                  </div>
                  {hotpRecords.map((record) => (
                    <Record
                      key={record.id}
                      record={record}
                      otpCode={record.otpPublic?.currentCode ?? null}
                      onClick={() => handleRecordClick(record)}
                      onSelect={() => {}}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <SyncData />
    </div>
  )
}
