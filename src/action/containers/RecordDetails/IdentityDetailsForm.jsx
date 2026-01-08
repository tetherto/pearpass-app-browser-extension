import { useEffect, useMemo } from 'react'

import { t } from '@lingui/core/macro'
import { useForm } from 'pear-apps-lib-ui-react-hooks'
import { DATE_FORMAT } from 'pearpass-lib-constants'

import { FormGroup } from '../../../shared/components/FormGroup'
import { InputField } from '../../../shared/components/InputField'
import { useToast } from '../../../shared/context/ToastContext'
import { useCopyToClipboard } from '../../../shared/hooks/useCopyToClipboard'
import { CalendarIcon } from '../../../shared/icons/CalendarIcon'
import { CommonFileIcon } from '../../../shared/icons/CommonFileIcon'
import { CopyIcon } from '../../../shared/icons/CopyIcon'
import { EmailIcon } from '../../../shared/icons/EmailIcon'
import { GenderIcon } from '../../../shared/icons/GenderIcon'
import { GroupIcon } from '../../../shared/icons/GroupIcon'
import { NationalityIcon } from '../../../shared/icons/NationalityIcon'
import { PhoneIcon } from '../../../shared/icons/PhoneIcon'
import { UserIcon } from '../../../shared/icons/UserIcon'
import { CustomFields } from '../CustomFields'

/**
 * @param {Object} props
 * @param {Object} props.initialRecord
 * @param {Object} props.initialRecord.data
 * @param {string} [props.initialRecord.data.fullName]
 * @param {string} [props.initialRecord.data.email]
 * @param {string} [props.initialRecord.data.phoneNumber]
 * @param {string} [props.initialRecord.data.address]
 * @param {string} [props.initialRecord.data.zip]
 * @param {string} [props.initialRecord.data.city]
 * @param {string} [props.initialRecord.data.region]
 * @param {string} [props.initialRecord.data.country]
 * @param {string} [props.initialRecord.data.note]
 * @param {Array} [props.initialRecord.data.customFields]
 * @param {string} [props.initialRecord.folder]
 */
export const IdentityDetailsForm = ({ initialRecord }) => {
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
      folder: initialRecord?.folder,
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

  const hasFullName = !!values?.fullName?.length
  const hasEmail = !!values?.email?.length
  const hasPhoneNumber = !!values?.phoneNumber?.length
  const hasAddress = !!values?.address?.length
  const hasZip = !!values?.zip?.length
  const hasCity = !!values?.city?.length
  const hasRegion = !!values?.region?.length
  const hasCountry = !!values?.country?.length
  const hasNote = !!values?.note?.length
  const hasCustomFields = !!list.length
  const hasPassportFullName = !!values?.passportFullName?.length
  const hasPassportNumber = !!values?.passportNumber?.length
  const hasPassportIssuingCountry = !!values?.passportIssuingCountry?.length
  const hasPassportDateOfIssue = !!values?.passportDateOfIssue?.length
  const hasPassportExpiryDate = !!values?.passportExpiryDate?.length
  const hasPassportNationality = !!values?.passportNationality?.length
  const hasPassportDob = !!values?.passportDob?.length
  const hasPassportGender = !!values?.passportGender?.length
  const hasIdCardNumber = !!values?.idCardNumber?.length
  const hasIdCardDateOfIssue = !!values?.idCardDateOfIssue?.length
  const hasIdCardExpiryDate = !!values?.idCardExpiryDate?.length
  const hasIdCardIssuingCountry = !!values?.idCardIssuingCountry?.length
  const hasDrivingLicenseNumber = !!values?.drivingLicenseNumber?.length
  const hasDrivingLicenseDateOfIssue =
    !!values?.drivingLicenseDateOfIssue?.length
  const hasDrivingLicenseExpiryDate = !!values?.drivingLicenseExpiryDate?.length
  const hasDrivingLicenseIssuingCountry =
    !!values?.drivingLicenseIssuingCountry?.length

  const hasPassport =
    hasPassportFullName ||
    hasPassportNumber ||
    hasPassportIssuingCountry ||
    hasPassportDateOfIssue ||
    hasPassportExpiryDate ||
    hasPassportNationality ||
    hasPassportDob ||
    hasPassportGender

  const hasIdCard =
    hasIdCardNumber ||
    hasIdCardDateOfIssue ||
    hasIdCardExpiryDate ||
    hasIdCardIssuingCountry

  const hasDrivingLicense =
    hasDrivingLicenseNumber ||
    hasDrivingLicenseDateOfIssue ||
    hasDrivingLicenseExpiryDate ||
    hasDrivingLicenseIssuingCountry

  return (
    <div className="flex w-full flex-col gap-4 overflow-auto">
      {(hasFullName || hasEmail || hasPhoneNumber) && (
        <FormGroup title={t`Personal information`} isCollapse>
          {hasFullName && (
            <InputField
              label={t`Full name`}
              placeholder={t`Full name`}
              variant="outline"
              icon={UserIcon}
              onClick={handleCopy}
              readonly
              {...register('fullName')}
            />
          )}

          {hasEmail && (
            <InputField
              label={t`Email`}
              placeholder={t`Insert email`}
              variant="outline"
              icon={EmailIcon}
              onClick={handleCopy}
              readonly
              {...register('email')}
            />
          )}

          {hasPhoneNumber && (
            <InputField
              label={t`Phone number`}
              placeholder={t`Phone number`}
              variant="outline"
              icon={PhoneIcon}
              onClick={handleCopy}
              readonly
              {...register('phoneNumber')}
            />
          )}
        </FormGroup>
      )}

      {(hasAddress || hasZip || hasCity || hasRegion || hasCountry) && (
        <FormGroup title={t`Detail of address`} isCollapse>
          {hasAddress && (
            <InputField
              label={t`Address`}
              placeholder={t`Address`}
              variant="outline"
              onClick={handleCopy}
              readonly
              {...register('address')}
            />
          )}
          {hasZip && (
            <InputField
              label={t`ZIP`}
              placeholder={t`Insert zip`}
              variant="outline"
              onClick={handleCopy}
              readonly
              {...register('zip')}
            />
          )}
          {hasCity && (
            <InputField
              label={t`City`}
              placeholder={t`City`}
              variant="outline"
              onClick={handleCopy}
              readonly
              {...register('city')}
            />
          )}
          {hasRegion && (
            <InputField
              label={t`Region`}
              placeholder={t`Region`}
              variant="outline"
              onClick={handleCopy}
              readonly
              {...register('region')}
            />
          )}
          {hasCountry && (
            <InputField
              label={t`Country`}
              placeholder={t`Country`}
              variant="outline"
              onClick={handleCopy}
              readonly
              {...register('country')}
            />
          )}
        </FormGroup>
      )}

      {hasPassport && (
        <FormGroup title={t`Passport`} isCollapse>
          {hasPassportFullName && (
            <InputField
              label={t`Full name`}
              placeholder={t`John Smith`}
              variant="outline"
              icon={UserIcon}
              onClick={handleCopy}
              readonly
              {...register('passportFullName')}
            />
          )}
          {hasPassportNumber && (
            <InputField
              label={t`Passport number`}
              placeholder={t`Insert numbers`}
              variant="outline"
              icon={GroupIcon}
              onClick={handleCopy}
              readonly
              {...register('passportNumber')}
            />
          )}
          {hasPassportIssuingCountry && (
            <InputField
              label={t`Issuing country`}
              placeholder={t`Insert country`}
              variant="outline"
              icon={NationalityIcon}
              onClick={handleCopy}
              readonly
              {...register('passportIssuingCountry')}
            />
          )}
          {hasPassportDateOfIssue && (
            <InputField
              label={t`Date of issue`}
              placeholder={t`Insert date of issue`}
              variant="outline"
              icon={CalendarIcon}
              onClick={handleCopy}
              readonly
              {...register('passportDateOfIssue')}
            />
          )}
          {hasPassportExpiryDate && (
            <InputField
              label={t`Expiry date`}
              placeholder={DATE_FORMAT}
              variant="outline"
              icon={CalendarIcon}
              onClick={handleCopy}
              readonly
              {...register('passportExpiryDate')}
            />
          )}
          {hasPassportNationality && (
            <InputField
              label={t`Nationality`}
              placeholder={t`Insert your nationality`}
              variant="outline"
              icon={NationalityIcon}
              onClick={handleCopy}
              readonly
              {...register('passportNationality')}
            />
          )}
          {hasPassportDob && (
            <InputField
              label={t`Date of birth`}
              placeholder={DATE_FORMAT}
              variant="outline"
              icon={CalendarIcon}
              onClick={handleCopy}
              readonly
              {...register('passportDob')}
            />
          )}
          {hasPassportGender && (
            <InputField
              label={t`Gender`}
              placeholder={t`M/F`}
              variant="outline"
              icon={GenderIcon}
              onClick={handleCopy}
              readonly
              {...register('passportGender')}
            />
          )}
        </FormGroup>
      )}

      {hasIdCard && (
        <FormGroup title={t`Identity card`} isCollapse>
          {hasIdCardNumber && (
            <InputField
              label={t`ID number`}
              placeholder={'123456789'}
              variant="outline"
              icon={GroupIcon}
              onClick={handleCopy}
              readonly
              {...register('idCardNumber')}
            />
          )}
          {hasIdCardDateOfIssue && (
            <InputField
              label={t`Creation date`}
              placeholder={DATE_FORMAT}
              variant="outline"
              icon={CalendarIcon}
              onClick={handleCopy}
              readonly
              {...register('idCardDateOfIssue')}
            />
          )}
          {hasIdCardExpiryDate && (
            <InputField
              label={t`Expiry date`}
              placeholder={DATE_FORMAT}
              variant="outline"
              icon={CalendarIcon}
              onClick={handleCopy}
              readonly
              {...register('idCardExpiryDate')}
            />
          )}
          {hasIdCardIssuingCountry && (
            <InputField
              label={t`Issuing country`}
              placeholder={t`Insert country`}
              variant="outline"
              icon={NationalityIcon}
              onClick={handleCopy}
              readonly
              {...register('idCardIssuingCountry')}
            />
          )}
        </FormGroup>
      )}

      {hasDrivingLicense && (
        <FormGroup title={t`Driving license`} isCollapse>
          {hasDrivingLicenseNumber && (
            <InputField
              label={t`ID number`}
              placeholder={`123456789`}
              variant="outline"
              icon={GroupIcon}
              onClick={handleCopy}
              readonly
              {...register('drivingLicenseNumber')}
            />
          )}
          {hasDrivingLicenseDateOfIssue && (
            <InputField
              label={t`Creation date`}
              placeholder={DATE_FORMAT}
              variant="outline"
              icon={CalendarIcon}
              onClick={handleCopy}
              readonly
              {...register('drivingLicenseDateOfIssue')}
            />
          )}
          {hasDrivingLicenseExpiryDate && (
            <InputField
              label={t`Expiry date`}
              placeholder={DATE_FORMAT}
              variant="outline"
              icon={CalendarIcon}
              onClick={handleCopy}
              readonly
              {...register('drivingLicenseExpiryDate')}
            />
          )}
          {hasDrivingLicenseIssuingCountry && (
            <InputField
              label={t`Issuing country`}
              placeholder={t`Insert country`}
              variant="outline"
              icon={NationalityIcon}
              onClick={handleCopy}
              readonly
              {...register('drivingLicenseIssuingCountry')}
            />
          )}
        </FormGroup>
      )}

      <FormGroup>
        {hasNote && (
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

      {hasCustomFields && (
        <CustomFields
          areInputsDisabled
          customFields={list}
          register={registerItem}
        />
      )}
    </div>
  )
}
