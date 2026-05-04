import { useEffect, useMemo } from 'react'

import { t } from '@lingui/core/macro'
import { useForm } from '@tetherto/pear-apps-lib-ui-react-hooks'
import { DATE_FORMAT } from '@tetherto/pearpass-lib-constants'
import {
  InputField,
  MultiSlotInput,
  PasswordField,
  Text
} from '@tetherto/pearpass-lib-ui-kit'

import { useCopyToClipboard } from '../../../shared/hooks/useCopyToClipboard'
import { toReadOnlyFieldProps } from './utils'

type CustomField = {
  type: string
  name?: string
  note?: string
}

type IdentityRecord = {
  id?: string
  folder?: string
  data?: {
    title?: string
    fullName?: string
    email?: string
    phoneNumber?: string
    address?: string
    zip?: string
    city?: string
    region?: string
    country?: string
    note?: string
    customFields?: CustomField[]
    passportFullName?: string
    passportNumber?: string
    passportIssuingCountry?: string
    passportDateOfIssue?: string
    passportExpiryDate?: string
    passportNationality?: string
    passportDob?: string
    passportGender?: string
    idCardNumber?: string
    idCardDateOfIssue?: string
    idCardExpiryDate?: string
    idCardIssuingCountry?: string
    drivingLicenseNumber?: string
    drivingLicenseDateOfIssue?: string
    drivingLicenseExpiryDate?: string
    drivingLicenseIssuingCountry?: string
  }
}

interface Props {
  initialRecord?: IdentityRecord
  selectedFolder?: string
}

type FormValues = {
  fullName: string
  email: string
  phoneNumber: string
  address: string
  zip: string
  city: string
  region: string
  country: string
  note: string
  customFields: CustomField[]
  folder?: string
  passportFullName: string
  passportNumber: string
  passportIssuingCountry: string
  passportDateOfIssue: string
  passportExpiryDate: string
  passportNationality: string
  passportDob: string
  passportGender: string
  idCardNumber: string
  idCardDateOfIssue: string
  idCardExpiryDate: string
  idCardIssuingCountry: string
  drivingLicenseNumber: string
  drivingLicenseDateOfIssue: string
  drivingLicenseExpiryDate: string
  drivingLicenseIssuingCountry: string
}

export const IdentityDetailsFormV2 = ({
  initialRecord,
  selectedFolder
}: Props) => {
  const { copyToClipboard } = useCopyToClipboard()

  const initialValues = useMemo<FormValues>(
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
      customFields: initialRecord?.data?.customFields ?? [],
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
    }),
    [initialRecord, selectedFolder]
  )

  const { register, setValues, values } = useForm({ initialValues })

  useEffect(() => {
    setValues(initialValues)
  }, [initialValues, setValues])

  const v = values as FormValues

  const hasPersonalInformation =
    !!v.fullName?.length || !!v.email?.length || !!v.phoneNumber?.length

  const hasAddress =
    !!v.address?.length ||
    !!v.zip?.length ||
    !!v.city?.length ||
    !!v.region?.length ||
    !!v.country?.length

  const hasPassport =
    !!v.passportFullName?.length ||
    !!v.passportNumber?.length ||
    !!v.passportIssuingCountry?.length ||
    !!v.passportDateOfIssue?.length ||
    !!v.passportExpiryDate?.length ||
    !!v.passportNationality?.length ||
    !!v.passportDob?.length ||
    !!v.passportGender?.length

  const hasIdCard =
    !!v.idCardNumber?.length ||
    !!v.idCardDateOfIssue?.length ||
    !!v.idCardExpiryDate?.length ||
    !!v.idCardIssuingCountry?.length

  const hasDrivingLicense =
    !!v.drivingLicenseNumber?.length ||
    !!v.drivingLicenseDateOfIssue?.length ||
    !!v.drivingLicenseExpiryDate?.length ||
    !!v.drivingLicenseIssuingCountry?.length

  const hasNote = !!v.note?.length
  const hasCustomFields = !!v.customFields?.length

  return (
    <div className="flex w-full flex-col gap-[var(--spacing8)]">
      {hasPersonalInformation && (
        <div className="flex flex-col gap-[var(--spacing12)]">
          <Text variant="caption">{t`Personal Information`}</Text>

          <MultiSlotInput testID="personal-information-multi-slot-input">
            {!!v.fullName?.length && (
              <InputField
                label={t`Full Name`}
                placeholder={t`John Smith`}
                readOnly
                copyable
                onCopy={copyToClipboard}
                isGrouped
                testID="personal-information-multi-slot-input-slot-0"
                {...toReadOnlyFieldProps(register('fullName'))}
              />
            )}

            {!!v.email?.length && (
              <InputField
                label={t`Email`}
                placeholder={t`Insert email`}
                readOnly
                copyable
                onCopy={copyToClipboard}
                isGrouped
                testID="personal-information-multi-slot-input-slot-1"
                {...toReadOnlyFieldProps(register('email'))}
              />
            )}

            {!!v.phoneNumber?.length && (
              <InputField
                label={t`Phone Number`}
                placeholder={t`Insert phone number`}
                readOnly
                copyable
                onCopy={copyToClipboard}
                isGrouped
                testID="personal-information-multi-slot-input-slot-2"
                {...toReadOnlyFieldProps(register('phoneNumber'))}
              />
            )}
          </MultiSlotInput>
        </div>
      )}

      {hasAddress && (
        <div className="flex flex-col gap-[var(--spacing12)]">
          <Text variant="caption">{t`Address`}</Text>

          <MultiSlotInput testID="address-multi-slot-input">
            {!!v.address?.length && (
              <InputField
                label={t`Address`}
                placeholder={t`Insert address`}
                readOnly
                copyable
                onCopy={copyToClipboard}
                isGrouped
                testID="address-multi-slot-input-slot-0"
                {...toReadOnlyFieldProps(register('address'))}
              />
            )}

            {!!v.zip?.length && (
              <InputField
                label={t`ZIP`}
                placeholder={t`Insert ZIP`}
                readOnly
                copyable
                onCopy={copyToClipboard}
                isGrouped
                testID="address-multi-slot-input-slot-1"
                {...toReadOnlyFieldProps(register('zip'))}
              />
            )}

            {!!v.city?.length && (
              <InputField
                label={t`City`}
                placeholder={t`Insert city`}
                readOnly
                copyable
                onCopy={copyToClipboard}
                isGrouped
                testID="address-multi-slot-input-slot-2"
                {...toReadOnlyFieldProps(register('city'))}
              />
            )}

            {!!v.region?.length && (
              <InputField
                label={t`Region`}
                placeholder={t`Insert region`}
                readOnly
                copyable
                onCopy={copyToClipboard}
                isGrouped
                testID="address-multi-slot-input-slot-3"
                {...toReadOnlyFieldProps(register('region'))}
              />
            )}

            {!!v.country?.length && (
              <InputField
                label={t`Country`}
                placeholder={t`Insert country`}
                readOnly
                copyable
                onCopy={copyToClipboard}
                isGrouped
                testID="address-multi-slot-input-slot-4"
                {...toReadOnlyFieldProps(register('country'))}
              />
            )}
          </MultiSlotInput>
        </div>
      )}

      {hasPassport && (
        <div className="flex flex-col gap-[var(--spacing12)]">
          <Text variant="caption">{t`Passport`}</Text>

          <MultiSlotInput testID="passport-multi-slot-input">
            {!!v.passportFullName?.length && (
              <InputField
                label={t`Full Name`}
                placeholder={t`John Smith`}
                readOnly
                copyable
                onCopy={copyToClipboard}
                isGrouped
                testID="passport-multi-slot-input-slot-0"
                {...toReadOnlyFieldProps(register('passportFullName'))}
              />
            )}

            {!!v.passportNumber?.length && (
              <InputField
                label={t`Passport Number`}
                placeholder={t`Insert numbers`}
                readOnly
                copyable
                onCopy={copyToClipboard}
                isGrouped
                testID="passport-multi-slot-input-slot-1"
                {...toReadOnlyFieldProps(register('passportNumber'))}
              />
            )}

            {!!v.passportIssuingCountry?.length && (
              <InputField
                label={t`Issuing Country`}
                placeholder={t`Insert country`}
                readOnly
                copyable
                onCopy={copyToClipboard}
                isGrouped
                testID="passport-multi-slot-input-slot-2"
                {...toReadOnlyFieldProps(register('passportIssuingCountry'))}
              />
            )}

            {!!v.passportDateOfIssue?.length && (
              <InputField
                label={t`Date of Issue`}
                placeholder={DATE_FORMAT}
                readOnly
                copyable
                onCopy={copyToClipboard}
                isGrouped
                testID="passport-multi-slot-input-slot-3"
                {...toReadOnlyFieldProps(register('passportDateOfIssue'))}
              />
            )}

            {!!v.passportExpiryDate?.length && (
              <InputField
                label={t`Expiry Date`}
                placeholder={DATE_FORMAT}
                readOnly
                copyable
                onCopy={copyToClipboard}
                isGrouped
                testID="passport-multi-slot-input-slot-4"
                {...toReadOnlyFieldProps(register('passportExpiryDate'))}
              />
            )}

            {!!v.passportNationality?.length && (
              <InputField
                label={t`Nationality`}
                placeholder={t`Insert your nationality`}
                readOnly
                copyable
                onCopy={copyToClipboard}
                isGrouped
                testID="passport-multi-slot-input-slot-5"
                {...toReadOnlyFieldProps(register('passportNationality'))}
              />
            )}

            {!!v.passportDob?.length && (
              <InputField
                label={t`Date of Birth`}
                placeholder={DATE_FORMAT}
                readOnly
                copyable
                onCopy={copyToClipboard}
                isGrouped
                testID="passport-multi-slot-input-slot-6"
                {...toReadOnlyFieldProps(register('passportDob'))}
              />
            )}

            {!!v.passportGender?.length && (
              <InputField
                label={t`Gender`}
                placeholder={t`M/F`}
                readOnly
                copyable
                onCopy={copyToClipboard}
                isGrouped
                testID="passport-multi-slot-input-slot-7"
                {...toReadOnlyFieldProps(register('passportGender'))}
              />
            )}
          </MultiSlotInput>
        </div>
      )}

      {hasIdCard && (
        <div className="flex flex-col gap-[var(--spacing12)]">
          <Text variant="caption">{t`Identity Card`}</Text>

          <MultiSlotInput testID="identity-card-multi-slot-input">
            {!!v.idCardNumber?.length && (
              <InputField
                label={t`ID Number`}
                placeholder={t`123456789`}
                readOnly
                copyable
                onCopy={copyToClipboard}
                isGrouped
                testID="identity-card-multi-slot-input-slot-0"
                {...toReadOnlyFieldProps(register('idCardNumber'))}
              />
            )}

            {!!v.idCardDateOfIssue?.length && (
              <InputField
                label={t`Creation Date`}
                placeholder={DATE_FORMAT}
                readOnly
                copyable
                onCopy={copyToClipboard}
                isGrouped
                testID="identity-card-multi-slot-input-slot-1"
                {...toReadOnlyFieldProps(register('idCardDateOfIssue'))}
              />
            )}

            {!!v.idCardExpiryDate?.length && (
              <InputField
                label={t`Expiry Date`}
                placeholder={DATE_FORMAT}
                readOnly
                copyable
                onCopy={copyToClipboard}
                isGrouped
                testID="identity-card-multi-slot-input-slot-2"
                {...toReadOnlyFieldProps(register('idCardExpiryDate'))}
              />
            )}

            {!!v.idCardIssuingCountry?.length && (
              <InputField
                label={t`Issuing Country`}
                placeholder={t`Insert country`}
                readOnly
                copyable
                onCopy={copyToClipboard}
                isGrouped
                testID="identity-card-multi-slot-input-slot-3"
                {...toReadOnlyFieldProps(register('idCardIssuingCountry'))}
              />
            )}
          </MultiSlotInput>
        </div>
      )}

      {hasDrivingLicense && (
        <div className="flex flex-col gap-[var(--spacing12)]">
          <Text variant="caption">{t`Driving License`}</Text>

          <MultiSlotInput testID="driving-license-multi-slot-input">
            {!!v.drivingLicenseNumber?.length && (
              <InputField
                label={t`ID Number`}
                placeholder={t`123456789`}
                readOnly
                copyable
                onCopy={copyToClipboard}
                isGrouped
                testID="driving-license-multi-slot-input-slot-0"
                {...toReadOnlyFieldProps(register('drivingLicenseNumber'))}
              />
            )}

            {!!v.drivingLicenseDateOfIssue?.length && (
              <InputField
                label={t`Creation Date`}
                placeholder={DATE_FORMAT}
                readOnly
                copyable
                onCopy={copyToClipboard}
                isGrouped
                testID="driving-license-multi-slot-input-slot-1"
                {...toReadOnlyFieldProps(register('drivingLicenseDateOfIssue'))}
              />
            )}

            {!!v.drivingLicenseExpiryDate?.length && (
              <InputField
                label={t`Expiry Date`}
                placeholder={DATE_FORMAT}
                readOnly
                copyable
                onCopy={copyToClipboard}
                isGrouped
                testID="driving-license-multi-slot-input-slot-2"
                {...toReadOnlyFieldProps(register('drivingLicenseExpiryDate'))}
              />
            )}

            {!!v.drivingLicenseIssuingCountry?.length && (
              <InputField
                label={t`Issuing Country`}
                placeholder={t`Insert country`}
                readOnly
                copyable
                onCopy={copyToClipboard}
                isGrouped
                testID="driving-license-multi-slot-input-slot-3"
                {...toReadOnlyFieldProps(
                  register('drivingLicenseIssuingCountry')
                )}
              />
            )}
          </MultiSlotInput>
        </div>
      )}

      {(hasNote || hasCustomFields) && (
        <div className="flex flex-col gap-[var(--spacing12)]">
          <Text variant="caption">{t`Additional`}</Text>

          {hasNote && (
            <MultiSlotInput testID="comments-multi-slot-input">
              <InputField
                label={t`Comment`}
                value={v.note}
                placeholder={t`Enter Comment`}
                readOnly
                copyable
                onCopy={copyToClipboard}
                isGrouped
                testID="comments-multi-slot-input-slot-0"
              />
            </MultiSlotInput>
          )}

          {hasCustomFields && (
            <MultiSlotInput testID="hidden-messages-multi-slot-input">
              {(v.customFields as CustomField[]).map((field, index) => (
                <PasswordField
                  key={`${field.type}-${index}`}
                  label={t`Hidden Message`}
                  value={field.note ?? ''}
                  placeholder={t`Enter Hidden Message`}
                  readOnly
                  copyable
                  onCopy={copyToClipboard}
                  isGrouped
                  testID={`hidden-messages-multi-slot-input-slot-${index}`}
                />
              ))}
            </MultiSlotInput>
          )}
        </div>
      )}
    </div>
  )
}
