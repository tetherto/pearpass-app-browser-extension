import { t } from '@lingui/core/macro'
import { useForm } from '@tetherto/pear-apps-lib-ui-react-hooks'
import { Validator } from '@tetherto/pear-apps-utils-validator'
import { DATE_FORMAT } from '@tetherto/pearpass-lib-constants'
import {
  RECORD_TYPES,
  useCreateRecord,
  useRecords
} from '@tetherto/pearpass-lib-vault'

import { FormGroup } from '../../../shared/components/FormGroup'
import { InputField } from '../../../shared/components/InputField'
import { useGlobalLoading } from '../../../shared/context/LoadingContext'
import { CalendarIcon } from '../../../shared/icons/CalendarIcon'
import { CommonFileIcon } from '../../../shared/icons/CommonFileIcon'
import { EmailIcon } from '../../../shared/icons/EmailIcon'
import { GenderIcon } from '../../../shared/icons/GenderIcon'
import { GroupIcon } from '../../../shared/icons/GroupIcon'
import { NationalityIcon } from '../../../shared/icons/NationalityIcon'
import { PhoneIcon } from '../../../shared/icons/PhoneIcon'
import { UserIcon } from '../../../shared/icons/UserIcon'
import { CreateCustomField } from '../CreateCustomField'
import { CustomFields } from '../CustomFields'
import { FormCategoryHeader } from '../FormCategoryHeader'

export const CreateOrEditIdentity = ({
  initialRecord,
  selectedFolder,
  onSave,
  onClose
}) => {
  const schema = Validator.object({
    title: Validator.string().required(t`Title is required`),
    fullName: Validator.string(),
    email: Validator.string().email(t`Invalid email format`),
    phoneNumber: Validator.string(),
    address: Validator.string(),
    zip: Validator.string(),
    city: Validator.string(),
    region: Validator.string(),
    country: Validator.string(),
    note: Validator.string(),
    customFields: Validator.array().items(
      Validator.object({
        note: Validator.string().required(t`Comment is required`)
      })
    ),
    folder: Validator.string(),
    passportFullName: Validator.string(),
    passportNumber: Validator.string(),
    passportIssuingCountry: Validator.string(),
    passportDateOfIssue: Validator.string(),
    passportExpiryDate: Validator.string(),
    passportNationality: Validator.string(),
    passportDob: Validator.string(),
    passportGender: Validator.string(),
    idCardNumber: Validator.string(),
    idCardDateOfIssue: Validator.string(),
    idCardExpiryDate: Validator.string(),
    idCardIssuingCountry: Validator.string(),
    drivingLicenseNumber: Validator.string(),
    drivingLicenseDateOfIssue: Validator.string(),
    drivingLicenseExpiryDate: Validator.string(),
    drivingLicenseIssuingCountry: Validator.string()
  })

  const { createRecord, isLoading: isCreateLoading } = useCreateRecord({
    onCompleted: onSave
  })

  const { updateRecords, isLoading: isUpdateLoading } = useRecords({
    onCompleted: onSave,
    variables: undefined
  })

  const isLoading = isCreateLoading || isUpdateLoading

  useGlobalLoading({ isLoading })

  const { register, handleSubmit, registerArray, setValue, values } = useForm({
    initialValues: {
      title: initialRecord?.data?.title ?? '',
      fullName: initialRecord?.data?.fullName ?? '',
      email: initialRecord?.data?.email ?? '',
      phoneNumber: initialRecord?.data?.phoneNumber ?? '',
      address: initialRecord?.data?.address ?? '',
      zip: initialRecord?.data?.zip ?? '',
      city: initialRecord?.data?.city ?? '',
      region: initialRecord?.data?.region ?? '',
      country: initialRecord?.data?.country ?? '',
      note: initialRecord?.data?.note ?? '',
      customFields: initialRecord?.data?.customFields || [],
      folder: selectedFolder ?? initialRecord?.folder,
      passportFullName: initialRecord?.data?.passportFullName ?? '',
      passportNumber: initialRecord?.data?.passportNumber ?? '',
      passportIssuingCountry: initialRecord?.data?.passportIssuingCountry ?? '',
      passportDateOfIssue: initialRecord?.data?.passportDateOfIssue ?? '',
      passportExpiryDate: initialRecord?.data?.passportExpiryDate ?? '',
      passportNationality: initialRecord?.data?.passportNationality ?? '',
      passportDob: initialRecord?.data?.passportDob ?? '',
      passportGender: initialRecord?.data?.passportGender ?? '',
      idCardNumber: initialRecord?.data?.idCardNumber ?? '',
      idCardDateOfIssue: initialRecord?.data?.idCardDateOfIssue ?? '',
      idCardExpiryDate: initialRecord?.data?.idCardExpiryDate ?? '',
      idCardIssuingCountry: initialRecord?.data?.idCardIssuingCountry ?? '',
      drivingLicenseNumber: initialRecord?.data?.drivingLicenseNumber ?? '',
      drivingLicenseDateOfIssue:
        initialRecord?.data?.drivingLicenseDateOfIssue ?? '',
      drivingLicenseExpiryDate:
        initialRecord?.data?.drivingLicenseExpiryDate ?? '',
      drivingLicenseIssuingCountry:
        initialRecord?.data?.drivingLicenseIssuingCountry ?? ''
    },
    validate: (values) => schema.validate(values)
  })
  const {
    value: list,
    addItem,
    registerItem,
    removeItem
  } = registerArray('customFields')

  const onSubmit = (values) => {
    const data = {
      type: RECORD_TYPES.IDENTITY,
      folder: values.folder,
      isFavorite: initialRecord?.isFavorite,
      data: {
        ...(initialRecord?.data ? initialRecord.data : {}),
        title: values.title,
        fullName: values.fullName,
        email: values.email,
        phoneNumber: values.phoneNumber,
        address: values.address,
        zip: values.zip,
        city: values.city,
        region: values.region,
        country: values.country,
        note: values.note,
        customFields: values.customFields,
        // Passport fields
        passportFullName: values.passportFullName,
        passportNumber: values.passportNumber,
        passportIssuingCountry: values.passportIssuingCountry,
        passportDateOfIssue: values.passportDateOfIssue,
        passportExpiryDate: values.passportExpiryDate,
        passportNationality: values.passportNationality,
        passportDob: values.passportDob,
        passportGender: values.passportGender,
        passportPicture: initialRecord?.data?.passportPicture ?? [],
        // Identity card fields
        idCardNumber: values.idCardNumber,
        idCardDateOfIssue: values.idCardDateOfIssue,
        idCardExpiryDate: values.idCardExpiryDate,
        idCardIssuingCountry: values.idCardIssuingCountry,
        idCardPicture: initialRecord?.data?.idCardPicture ?? [],
        // Driving license fields
        drivingLicenseNumber: values.drivingLicenseNumber,
        drivingLicenseDateOfIssue: values.drivingLicenseDateOfIssue,
        drivingLicenseExpiryDate: values.drivingLicenseExpiryDate,
        drivingLicenseIssuingCountry: values.drivingLicenseIssuingCountry,
        drivingLicensePicture: initialRecord?.data?.drivingLicensePicture ?? [],
        attachments: initialRecord?.data?.attachments ?? []
      }
    }

    if (initialRecord && Object.keys(initialRecord).length > 0) {
      updateRecords([
        {
          ...initialRecord,
          ...data
        }
      ])
    } else {
      createRecord(data)
    }
  }

  return (
    <>
      <FormCategoryHeader
        onSave={handleSubmit(onSubmit)}
        onClose={onClose}
        onFolderChange={(folder) => setValue('folder', folder?.name)}
        initialRecord={initialRecord}
        selectedFolder={values?.folder}
        selectedCategoryType={RECORD_TYPES.IDENTITY}
        isSaveDisabled={isLoading}
      />

      <div className="flex w-full flex-col gap-4 overflow-auto">
        <FormGroup>
          <InputField
            label={t`Title`}
            placeholder={t`Insert title`}
            variant="outline"
            {...register('title')}
          />
        </FormGroup>

        <FormGroup title={t`Personal information`} isCollapse>
          <InputField
            label={t`Full name`}
            placeholder={t`Full name`}
            variant="outline"
            icon={UserIcon}
            {...register('fullName')}
          />
          <InputField
            label={t`Email`}
            placeholder={t`Insert email`}
            variant="outline"
            icon={EmailIcon}
            {...register('email')}
          />
          <InputField
            label={t`Phone number`}
            placeholder={t`Phone number`}
            variant="outline"
            icon={PhoneIcon}
            {...register('phoneNumber')}
          />
        </FormGroup>

        <FormGroup title={t`Detail of address`} isCollapse>
          <InputField
            label={t`Address`}
            placeholder={t`Address`}
            variant="outline"
            {...register('address')}
          />

          <InputField
            label={t`ZIP`}
            placeholder={t`Insert zip`}
            variant="outline"
            {...register('zip')}
          />

          <InputField
            label={t`City`}
            placeholder={t`City`}
            variant="outline"
            {...register('city')}
          />

          <InputField
            label={t`Region`}
            placeholder={t`Region`}
            variant="outline"
            {...register('region')}
          />

          <InputField
            label={t`Country`}
            placeholder={t`Country`}
            variant="outline"
            {...register('country')}
          />
        </FormGroup>

        <FormGroup defaultOpenState={false} title={t`Passport`} isCollapse>
          <InputField
            label={t`Full name`}
            placeholder={t`John Smith`}
            variant="outline"
            icon={UserIcon}
            {...register('passportFullName')}
          />
          <InputField
            label={t`Passport number`}
            placeholder={t`Insert numbers`}
            variant="outline"
            icon={GroupIcon}
            {...register('passportNumber')}
          />
          <InputField
            label={t`Issuing country`}
            placeholder={t`Insert country`}
            variant="outline"
            icon={NationalityIcon}
            {...register('passportIssuingCountry')}
          />
          <InputField
            label={t`Date of issue`}
            placeholder={t`Insert date of issue`}
            variant="outline"
            icon={CalendarIcon}
            {...register('passportDateOfIssue')}
          />
          <InputField
            label={t`Expiry date`}
            placeholder={DATE_FORMAT}
            variant="outline"
            icon={CalendarIcon}
            {...register('passportExpiryDate')}
          />
          <InputField
            label={t`Nationality`}
            placeholder={t`Insert your nationality`}
            variant="outline"
            icon={NationalityIcon}
            {...register('passportNationality')}
          />
          <InputField
            label={t`Date of birth`}
            placeholder={DATE_FORMAT}
            variant="outline"
            icon={CalendarIcon}
            {...register('passportDob')}
          />
          <InputField
            label={t`Gender`}
            placeholder={t`M/F`}
            variant="outline"
            icon={GenderIcon}
            {...register('passportGender')}
          />
        </FormGroup>

        <FormGroup defaultOpenState={false} title={t`Identity card`} isCollapse>
          <InputField
            label={t`ID number`}
            placeholder={'123456789'}
            variant="outline"
            icon={GroupIcon}
            {...register('idCardNumber')}
          />
          <InputField
            label={t`Creation date`}
            placeholder={DATE_FORMAT}
            variant="outline"
            icon={CalendarIcon}
            {...register('idCardDateOfIssue')}
          />
          <InputField
            label={t`Expiry date`}
            placeholder={DATE_FORMAT}
            variant="outline"
            icon={CalendarIcon}
            {...register('idCardExpiryDate')}
          />
          <InputField
            label={t`Issuing country`}
            placeholder={t`Insert country`}
            variant="outline"
            icon={NationalityIcon}
            {...register('idCardIssuingCountry')}
          />
        </FormGroup>

        <FormGroup
          defaultOpenState={false}
          title={t`Driving license`}
          isCollapse
        >
          <InputField
            label={t`ID number`}
            placeholder={`123456789`}
            variant="outline"
            icon={GroupIcon}
            {...register('drivingLicenseNumber')}
          />
          <InputField
            label={t`Creation date`}
            placeholder={DATE_FORMAT}
            variant="outline"
            icon={CalendarIcon}
            {...register('drivingLicenseDateOfIssue')}
          />
          <InputField
            label={t`Expiry date`}
            placeholder={DATE_FORMAT}
            variant="outline"
            icon={CalendarIcon}
            {...register('drivingLicenseExpiryDate')}
          />
          <InputField
            label={t`Issuing country`}
            placeholder={t`Insert country`}
            variant="outline"
            icon={NationalityIcon}
            {...register('drivingLicenseIssuingCountry')}
          />
        </FormGroup>

        <FormGroup>
          <InputField
            label={t`Comment`}
            placeholder={t`Add comment`}
            variant="outline"
            icon={CommonFileIcon}
            {...register('note')}
          />
        </FormGroup>

        <CustomFields
          customFields={list}
          register={registerItem}
          removeItem={removeItem}
        />

        <FormGroup>
          <CreateCustomField
            onCreateCustom={(type) => addItem({ type, name: type })}
          />
        </FormGroup>
      </div>
    </>
  )
}
