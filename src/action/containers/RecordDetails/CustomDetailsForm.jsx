import { useEffect, useMemo } from 'react'

import { useForm } from '@tetherto/pear-apps-lib-ui-react-hooks'

import { CustomFields } from '../CustomFields'

/**
 *
 * @param {Object} props
 * @param {Object} props.initialRecord
 * @param {Object} [props.initialRecord.data]
 * @param {Array} [props.initialRecord.data.customFields]
 * @param {string} [props.initialRecord.folder]
 *
 */
export const CustomDetailsForm = ({ initialRecord }) => {
  const initialValues = useMemo(
    () => ({
      customFields: initialRecord?.data?.customFields || [],
      folder: initialRecord?.folder
    }),
    [initialRecord]
  )

  const { registerArray, setValues } = useForm({ initialValues: initialValues })

  const { value: list, registerItem } = registerArray('customFields')

  useEffect(() => {
    setValues(initialValues)
  }, [initialValues, setValues])

  return (
    <div className="flex w-full flex-col gap-4 overflow-auto">
      <CustomFields
        areInputsDisabled={true}
        customFields={list}
        register={registerItem}
      />
    </div>
  )
}
