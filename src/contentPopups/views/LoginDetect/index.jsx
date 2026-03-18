import React, { useEffect, useMemo, useRef } from 'react'

import { t } from '@lingui/core/macro'
import { useForm } from '@tetherto/pear-apps-lib-ui-react-hooks'
import { Validator } from '@tetherto/pear-apps-utils-validator'
import {
  RECORD_TYPES,
  useCreateRecord,
  useRecords,
  useVault
} from '@tetherto/pearpass-lib-vault'

import { FormGroup } from '../../../shared/components/FormGroup'
import { InputField } from '../../../shared/components/InputField'
import { InputFieldPassword } from '../../../shared/components/InputFieldPassword'
import { PopupCard } from '../../../shared/components/PopupCard'
import { useRouter } from '../../../shared/context/RouterContext'
import { KeyIcon } from '../../../shared/icons/KeyIcon'
import { UserIcon } from '../../../shared/icons/UserIcon'
import { extractNameFromDomain } from '../../../shared/utils/extractNameFromDomain'
import { CardButtons } from '../../containers/CardButtons'
import { closeIframe } from '../../iframeApi/closeIframe'

export const LoginDetect = () => {
  const { state: routerState } = useRouter()

  const popupRef = useRef(null)

  const recordTitle = extractNameFromDomain(routerState?.url)

  const schema = Validator.object({
    title: Validator.string().required(t`Title is required`),
    username: Validator.string(),
    password: Validator.string(),
    websites: Validator.array().items(
      Validator.object({
        website: Validator.string().website('Wrong format of website')
      })
    )
  })

  const { createRecord, isLoading: isCreateLoading } = useCreateRecord({
    onCompleted: () =>
      closeIframe({
        iframeId: routerState?.iframeId,
        iframeType: routerState?.iframeType
      })
  })

  const { refetch: refetchVault } = useVault()

  const {
    updateRecords,
    data: recordsData,
    isLoading: isUpdateLoading
  } = useRecords({
    onCompleted: () =>
      closeIframe({
        iframeId: routerState?.iframeId,
        iframeType: routerState?.iframeType
      })
  })

  const existingRecord = useMemo(
    () =>
      recordsData?.find(
        (record) =>
          record.data.title === recordTitle &&
          record.data.username === routerState?.username
      ),
    [recordsData, recordTitle]
  )

  const { register, handleSubmit } = useForm({
    initialValues: {
      title: recordTitle,
      username: routerState?.username ?? '',
      password: routerState?.password ?? ''
    },
    validate: (values) => schema.validate(values)
  })

  const onSubmit = (values) => {
    const newRecord = {
      type: RECORD_TYPES.LOGIN,
      data: {
        title: values.title,
        username: values.username,
        password: values.password,
        websites: routerState?.url ? [routerState?.url] : []
      }
    }

    if (existingRecord) {
      updateRecords([{ ...existingRecord, ...newRecord }])
    } else {
      createRecord(newRecord)
    }
  }

  useEffect(() => {
    window.parent.postMessage(
      {
        type: 'setStyles',
        data: {
          iframeId: routerState?.iframeId,
          iframeType: routerState?.iframeType,
          style: {
            width: `${popupRef.current?.offsetWidth}px`,
            height: `${popupRef.current?.offsetHeight}px`,
            borderRadius: '12px'
          }
        }
      },
      '*'
    )

    refetchVault()
  }, [!!existingRecord])

  return (
    <PopupCard
      className="flex w-[460px] flex-col gap-4 overflow-auto"
      ref={popupRef}
    >
      <FormGroup>
        <InputField
          label={t`Title`}
          placeholder={t`Insert title`}
          variant="outline"
          {...register('title')}
        />
      </FormGroup>

      <FormGroup>
        {!existingRecord && (
          <InputField
            label={t`Email or username`}
            placeholder={t`Email or username`}
            variant="outline"
            icon={UserIcon}
            {...register('username')}
          />
        )}

        <InputFieldPassword
          label={t`Password`}
          placeholder={t`Password`}
          variant="outline"
          icon={KeyIcon}
          hasStrongness
          {...register('password')}
        />
      </FormGroup>

      <CardButtons
        confirmLabel={!!existingRecord ? t`Edit` : t`Save`}
        cancelLabel={t`Not now`}
        onConfirm={handleSubmit(onSubmit)}
        onCancel={() =>
          closeIframe({
            iframeId: routerState?.iframeId,
            iframeType: routerState?.iframeType
          })
        }
        isConfirmDisabled={isCreateLoading || isUpdateLoading}
        isCancelDisabled={isCreateLoading || isUpdateLoading}
      />
    </PopupCard>
  )
}
