import { useEffect, useMemo } from 'react'

import { t } from '@lingui/core/macro'
import { useForm } from 'pear-apps-lib-ui-react-hooks'

import { FormGroup } from '../../../shared/components/FormGroup'
import { InputField } from '../../../shared/components/InputField'
import { PassPhrase } from '../../../shared/containers/PassPhrase'
import { useToast } from '../../../shared/context/ToastContext'
import { useCopyToClipboard } from '../../../shared/hooks/useCopyToClipboard'
import { CommonFileIcon } from '../../../shared/icons/CommonFileIcon'
import { CopyIcon } from '../../../shared/icons/CopyIcon'
import { CustomFields } from '../CustomFields'

/**
 * @param {{
 *   initialRecord?: {
 *     data: {
 *       passPhrase: string,
 *       note?: string,
 *       customFields?: Array<{note: string}>
 *     },
 *     folder?: string
 *   }
 * }} props
 */

export const PassPhraseDetailsForm = ({ initialRecord }) => {
  const { setToast } = useToast()

  const { copyToClipboard } = useCopyToClipboard({
    onCopy: () => {
      setToast({
        message: t`Copied to clipboard`,
        icon: CopyIcon
      })
    }
  })

  const initialValues = useMemo(
    () => ({
      passPhrase: initialRecord?.data?.passPhrase ?? '',
      note: initialRecord?.data?.note ?? '',
      customFields: initialRecord?.data?.customFields ?? [],
      folder: initialRecord?.folder
    }),
    [initialRecord]
  )

  const { register, registerArray, setValues, values } = useForm({
    initialValues: initialValues
  })

  const { value: list, registerItem } = registerArray('customFields')

  useEffect(() => {
    setValues(initialValues)
  }, [initialValues, setValues])

  const handleCopy = (value) => {
    if (!value?.length) {
      return
    }

    copyToClipboard(value)
  }

  return (
    <div className="flex w-full flex-col gap-4 overflow-auto">
      <FormGroup>
        {!!values?.passPhrase?.length && (
          <PassPhrase
            isCreateOrEdit={false}
            onChange={(value) => setValues('passPhrase', value)}
            value={values.passPhrase}
            {...register('passPhrase')}
          />
        )}
      </FormGroup>
      <FormGroup>
        {!!values?.note?.length && (
          <InputField
            label={t`Note`}
            placeholder={t`Add note`}
            variant="outline"
            icon={CommonFileIcon}
            onClick={handleCopy}
            readonly
            {...register('note')}
          />
        )}
      </FormGroup>

      <CustomFields
        areInputsDisabled
        customFields={list}
        register={registerItem}
      />
    </div>
  )
}
