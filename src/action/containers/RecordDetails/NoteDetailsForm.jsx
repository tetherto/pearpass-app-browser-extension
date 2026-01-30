import { useEffect, useMemo } from 'react'

import { t } from '@lingui/core/macro'
import { useForm } from 'pear-apps-lib-ui-react-hooks'

import { CopyButton } from '../../../shared/components/CopyButton'
import { FormGroup } from '../../../shared/components/FormGroup'
import { TextArea } from '../../../shared/components/TextArea'
import { CustomFields } from '../CustomFields'

/**
 *
 * @param {Object} props
 * @param {Object} props.initialRecord
 * @param {Object} [props.initialRecord.data]
 * @param {string} [props.initialRecord.data.note]
 * @param {Array} [props.initialRecord.data.customFields]
 * @param {string} [props.initialRecord.folder]
 *
 */
export const NoteDetailsForm = ({ initialRecord }) => {
  const initialValues = useMemo(
    () => ({
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

  return (
    <div className="flex w-full flex-col gap-4 overflow-auto">
      <FormGroup>
        {!!values?.note?.length && (
          <TextArea
            readonly
            additionalItems={<CopyButton value={values.note} />}
            {...register('note')}
            placeholder={t`Write a note...`}
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
