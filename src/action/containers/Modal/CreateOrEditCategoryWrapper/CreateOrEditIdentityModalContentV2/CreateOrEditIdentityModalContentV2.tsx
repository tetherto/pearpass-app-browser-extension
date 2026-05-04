import { t } from '@lingui/core/macro'
import { useForm } from '@tetherto/pear-apps-lib-ui-react-hooks'
import { Validator } from '@tetherto/pear-apps-utils-validator'
import {
  Button,
  DateField,
  Dialog,
  Form,
  InputField,
  MultiSlotInput,
  PasswordField,
  Text,
  useTheme
} from '@tetherto/pearpass-lib-ui-kit'
import { Add, TrashOutlined } from '@tetherto/pearpass-lib-ui-kit/icons'
import {
  RECORD_TYPES,
  useCreateRecord,
  useRecords
} from '@tetherto/pearpass-lib-vault'

import { FolderDropdownV2 } from '../../../FolderDropdownV2'
import { useGlobalLoading } from '../../../../../shared/context/LoadingContext'
import { useModal } from '../../../../../shared/context/ModalContext'
import { useToast } from '../../../../../shared/context/ToastContext'

type CustomField = { type: string; name?: string; note?: string }

export type CreateOrEditIdentityModalContentV2Props = {
  initialRecord?: {
    id?: string
    folder?: string
    isFavorite?: boolean
    type?: string
    data?: Record<string, unknown> & {
      customFields?: CustomField[]
      attachments?: { id: string; name: string }[]
    }
  }
  selectedFolder?: string
  isFavorite?: boolean
}

export const CreateOrEditIdentityModalContentV2 = ({
  initialRecord,
  selectedFolder,
  isFavorite
}: CreateOrEditIdentityModalContentV2Props) => {
  const { closeModal } = useModal()
  const { setToast } = useToast()
  const { theme } = useTheme()

  const isEdit = !!initialRecord?.id

  const { createRecord, isLoading: isCreateLoading } = useCreateRecord({
    onCompleted: () => {
      void closeModal()
      setToast({ message: t`Record created successfully`, icon: null })
    }
  })

  const { updateRecords, isLoading: isUpdateLoading } = useRecords({
    onCompleted: () => {
      void closeModal()
      setToast({ message: t`Record updated successfully`, icon: null })
    }
  })

  const onError = (error: { message: string }) => {
    setToast({ message: error.message, icon: null })
  }

  const isLoading = isCreateLoading || isUpdateLoading

  useGlobalLoading({ isLoading })

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
        note: Validator.string()
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

  const data = initialRecord?.data ?? {}

  const { register, handleSubmit, registerArray, setValue, values } = useForm({
    initialValues: {
      title: (data.title as string) ?? '',
      fullName: (data.fullName as string) ?? '',
      email: (data.email as string) ?? '',
      phoneNumber: (data.phoneNumber as string) ?? '',
      address: (data.address as string) ?? '',
      zip: (data.zip as string) ?? '',
      city: (data.city as string) ?? '',
      region: (data.region as string) ?? '',
      country: (data.country as string) ?? '',
      note: (data.note as string) ?? '',
      customFields: data.customFields?.length
        ? data.customFields
        : [{ type: 'note', note: '' }],
      folder: selectedFolder ?? initialRecord?.folder ?? '',
      passportFullName: (data.passportFullName as string) ?? '',
      passportNumber: (data.passportNumber as string) ?? '',
      passportIssuingCountry: (data.passportIssuingCountry as string) ?? '',
      passportDateOfIssue: (data.passportDateOfIssue as string) ?? '',
      passportExpiryDate: (data.passportExpiryDate as string) ?? '',
      passportNationality: (data.passportNationality as string) ?? '',
      passportDob: (data.passportDob as string) ?? '',
      passportGender: (data.passportGender as string) ?? '',
      idCardNumber: (data.idCardNumber as string) ?? '',
      idCardDateOfIssue: (data.idCardDateOfIssue as string) ?? '',
      idCardExpiryDate: (data.idCardExpiryDate as string) ?? '',
      idCardIssuingCountry: (data.idCardIssuingCountry as string) ?? '',
      drivingLicenseNumber: (data.drivingLicenseNumber as string) ?? '',
      drivingLicenseDateOfIssue:
        (data.drivingLicenseDateOfIssue as string) ?? '',
      drivingLicenseExpiryDate: (data.drivingLicenseExpiryDate as string) ?? '',
      drivingLicenseIssuingCountry:
        (data.drivingLicenseIssuingCountry as string) ?? ''
    },
    validate: (formValues: Record<string, unknown>) =>
      schema.validate(formValues)
  })

  const {
    value: customFieldsList,
    addItem: addCustomField,
    registerItem: registerCustomFieldItem,
    removeItem: removeCustomFieldItem
  } = registerArray('customFields')

  const titleField = register('title')
  const fullNameField = register('fullName')
  const emailField = register('email')
  const phoneNumberField = register('phoneNumber')
  const addressField = register('address')
  const zipField = register('zip')
  const cityField = register('city')
  const regionField = register('region')
  const countryField = register('country')
  const noteField = register('note')
  const passportFullNameField = register('passportFullName')
  const passportNumberField = register('passportNumber')
  const passportIssuingCountryField = register('passportIssuingCountry')
  const passportNationalityField = register('passportNationality')
  const passportGenderField = register('passportGender')
  const idCardNumberField = register('idCardNumber')
  const idCardIssuingCountryField = register('idCardIssuingCountry')
  const drivingLicenseNumberField = register('drivingLicenseNumber')
  const drivingLicenseIssuingCountryField = register(
    'drivingLicenseIssuingCountry'
  )

  const onSubmit = (formValues: Record<string, unknown>) => {
    const submitData = {
      type: RECORD_TYPES.IDENTITY,
      folder: formValues.folder,
      isFavorite: initialRecord?.isFavorite ?? isFavorite,
      data: {
        ...(initialRecord?.data ?? {}),
        title: formValues.title,
        fullName: formValues.fullName,
        email: formValues.email,
        phoneNumber: formValues.phoneNumber,
        address: formValues.address,
        zip: formValues.zip,
        city: formValues.city,
        region: formValues.region,
        country: formValues.country,
        note: formValues.note,
        customFields: ((formValues.customFields as CustomField[]) ?? []).filter(
          (f) => f.note?.trim().length
        ),
        passportFullName: formValues.passportFullName,
        passportNumber: formValues.passportNumber,
        passportIssuingCountry: formValues.passportIssuingCountry,
        passportDateOfIssue: formValues.passportDateOfIssue,
        passportExpiryDate: formValues.passportExpiryDate,
        passportNationality: formValues.passportNationality,
        passportDob: formValues.passportDob,
        passportGender: formValues.passportGender,
        idCardNumber: formValues.idCardNumber,
        idCardDateOfIssue: formValues.idCardDateOfIssue,
        idCardExpiryDate: formValues.idCardExpiryDate,
        idCardIssuingCountry: formValues.idCardIssuingCountry,
        drivingLicenseNumber: formValues.drivingLicenseNumber,
        drivingLicenseDateOfIssue: formValues.drivingLicenseDateOfIssue,
        drivingLicenseExpiryDate: formValues.drivingLicenseExpiryDate,
        drivingLicenseIssuingCountry: formValues.drivingLicenseIssuingCountry,
        attachments: initialRecord?.data?.attachments ?? []
      }
    }

    if (isEdit && initialRecord) {
      updateRecords([{ ...initialRecord, ...submitData }], onError)
    } else {
      createRecord(submitData, onError)
    }
  }

  return (
    <Dialog
      title={isEdit ? t`Edit Identity Item` : t`New Identity Item`}
      onClose={closeModal}
      testID="createoredit-identity-dialog-v2"
      closeButtonTestID="createoredit-identity-close-v2"
      footer={
        <div className="flex w-full justify-end gap-[var(--spacing8)]">
          <Button
            variant="secondary"
            size="small"
            type="button"
            onClick={closeModal}
            data-testid="createoredit-identity-v2-discard"
          >
            {t`Discard`}
          </Button>
          <Button
            variant="primary"
            size="small"
            type="button"
            disabled={
              isLoading || (!isEdit && !(values?.title as string)?.trim())
            }
            isLoading={isLoading}
            onClick={() => handleSubmit(onSubmit)()}
            data-testid="createoredit-identity-v2-save"
          >
            {isEdit ? t`Save` : t`Add Item`}
          </Button>
        </div>
      }
    >
      <Form
        testID="createoredit-identity-v2-form"
        aria-label={isEdit ? t`Edit identity form` : t`New identity form`}
      >
        <div className="flex flex-col gap-[var(--spacing16)]">
          <InputField
            label={t`Title`}
            placeholder={t`Enter Title`}
            value={titleField.value as string}
            onChange={(e) => titleField.onChange(e.target.value)}
            error={titleField.error || undefined}
            testID="createoredit-identity-v2-title"
          />

          <Text variant="caption" color={theme.colors.colorTextSecondary}>
            {t`Personal Information`}
          </Text>

          <MultiSlotInput testID="createoredit-identity-v2-personal-slot">
            <InputField
              label={t`Fullname`}
              placeholder={t`Enter Name`}
              value={fullNameField.value as string}
              onChange={(e) => fullNameField.onChange(e.target.value)}
              error={fullNameField.error || undefined}
              testID="createoredit-identity-v2-fullname"
            />
            <InputField
              label={t`Email`}
              placeholder={t`Enter Email Address`}
              value={emailField.value as string}
              onChange={(e) => emailField.onChange(e.target.value)}
              error={emailField.error || undefined}
              testID="createoredit-identity-v2-email"
            />
            <InputField
              label={t`Phone Number`}
              placeholder={t`Enter Phone Number`}
              value={phoneNumberField.value as string}
              onChange={(e) => phoneNumberField.onChange(e.target.value)}
              error={phoneNumberField.error || undefined}
              testID="createoredit-identity-v2-phone"
            />
          </MultiSlotInput>

          <Text variant="caption" color={theme.colors.colorTextSecondary}>
            {t`Address Details`}
          </Text>

          <MultiSlotInput testID="createoredit-identity-v2-address-slot">
            <InputField
              label={t`Street Address`}
              placeholder={t`Enter Street Name With Number`}
              value={addressField.value as string}
              onChange={(e) => addressField.onChange(e.target.value)}
              error={addressField.error || undefined}
              testID="createoredit-identity-v2-address"
            />
            <InputField
              label={t`Country`}
              placeholder={t`Enter Country`}
              value={countryField.value as string}
              onChange={(e) => countryField.onChange(e.target.value)}
              error={countryField.error || undefined}
              testID="createoredit-identity-v2-country"
            />
            <InputField
              label={t`City`}
              placeholder={t`Enter City`}
              value={cityField.value as string}
              onChange={(e) => cityField.onChange(e.target.value)}
              error={cityField.error || undefined}
              testID="createoredit-identity-v2-city"
            />
            <InputField
              label={t`Region / State / Province`}
              placeholder={t`Enter Region, State or Province`}
              value={regionField.value as string}
              onChange={(e) => regionField.onChange(e.target.value)}
              error={regionField.error || undefined}
              testID="createoredit-identity-v2-region"
            />
            <InputField
              label={t`ZIP / Postal code`}
              placeholder={t`Enter ZIP, or Postal Code`}
              value={zipField.value as string}
              onChange={(e) => zipField.onChange(e.target.value)}
              error={zipField.error || undefined}
              testID="createoredit-identity-v2-zip"
            />
          </MultiSlotInput>

          <Text variant="caption" color={theme.colors.colorTextSecondary}>
            {t`Passport Details`}
          </Text>

          <MultiSlotInput testID="createoredit-identity-v2-passport-slot">
            <InputField
              label={t`Fullname`}
              placeholder={t`Enter Name as Shown on Passport`}
              value={passportFullNameField.value as string}
              onChange={(e) => passportFullNameField.onChange(e.target.value)}
              error={passportFullNameField.error || undefined}
              testID="createoredit-identity-v2-passport-fullname"
            />
            <InputField
              label={t`Passport Number`}
              placeholder={t`Enter Passport Number`}
              value={passportNumberField.value as string}
              onChange={(e) => passportNumberField.onChange(e.target.value)}
              error={passportNumberField.error || undefined}
              testID="createoredit-identity-v2-passport-number"
            />
            <InputField
              label={t`Issuing Country`}
              placeholder={t`Enter Issuing Country`}
              value={passportIssuingCountryField.value as string}
              onChange={(e) =>
                passportIssuingCountryField.onChange(e.target.value)
              }
              error={passportIssuingCountryField.error || undefined}
              testID="createoredit-identity-v2-passport-issuingcountry"
            />
            <DateField
              label={t`Date of Birth`}
              placeholder={t`Enter DD/MM/YYYY`}
              value={values.passportDob as string}
              onChange={(e) => setValue('passportDob', e.target.value)}
              testID="createoredit-identity-v2-passport-dob"
            />
            <DateField
              label={t`Date of Issue`}
              placeholder={t`Enter DD/MM/YYYY`}
              value={values.passportDateOfIssue as string}
              onChange={(e) => setValue('passportDateOfIssue', e.target.value)}
              testID="createoredit-identity-v2-passport-dateofissue"
            />
            <DateField
              label={t`Expiry Date`}
              placeholder={t`Enter DD/MM/YYYY`}
              value={values.passportExpiryDate as string}
              onChange={(e) => setValue('passportExpiryDate', e.target.value)}
              testID="createoredit-identity-v2-passport-expirydate"
            />
            <InputField
              label={t`Nationality`}
              placeholder={t`Enter Nationality`}
              value={passportNationalityField.value as string}
              onChange={(e) =>
                passportNationalityField.onChange(e.target.value)
              }
              error={passportNationalityField.error || undefined}
              testID="createoredit-identity-v2-passport-nationality"
            />
            <InputField
              label={t`Gender`}
              placeholder={t`Enter Gender`}
              value={passportGenderField.value as string}
              onChange={(e) => passportGenderField.onChange(e.target.value)}
              error={passportGenderField.error || undefined}
              testID="createoredit-identity-v2-passport-gender"
            />
          </MultiSlotInput>

          <Text variant="caption" color={theme.colors.colorTextSecondary}>
            {t`Identity Card Details`}
          </Text>

          <MultiSlotInput testID="createoredit-identity-v2-idcard-slot">
            <InputField
              label={t`ID Number`}
              placeholder={t`Enter Your ID Number`}
              value={idCardNumberField.value as string}
              onChange={(e) => idCardNumberField.onChange(e.target.value)}
              error={idCardNumberField.error || undefined}
              testID="createoredit-identity-v2-idcard-number"
            />
            <DateField
              label={t`Date of Issue`}
              placeholder={t`Enter DD/MM/YYYY`}
              value={values.idCardDateOfIssue as string}
              onChange={(e) => setValue('idCardDateOfIssue', e.target.value)}
              testID="createoredit-identity-v2-idcard-dateofissue"
            />
            <DateField
              label={t`Expiry Date`}
              placeholder={t`Enter DD/MM/YYYY`}
              value={values.idCardExpiryDate as string}
              onChange={(e) => setValue('idCardExpiryDate', e.target.value)}
              testID="createoredit-identity-v2-idcard-expirydate"
            />
            <InputField
              label={t`Issuing Country`}
              placeholder={t`Enter Issuing Country`}
              value={idCardIssuingCountryField.value as string}
              onChange={(e) =>
                idCardIssuingCountryField.onChange(e.target.value)
              }
              error={idCardIssuingCountryField.error || undefined}
              testID="createoredit-identity-v2-idcard-issuingcountry"
            />
          </MultiSlotInput>

          <Text variant="caption" color={theme.colors.colorTextSecondary}>
            {t`Driving License Details`}
          </Text>

          <MultiSlotInput testID="createoredit-identity-v2-drivinglicense-slot">
            <InputField
              label={t`ID Number`}
              placeholder={t`Enter Your ID Number`}
              value={drivingLicenseNumberField.value as string}
              onChange={(e) =>
                drivingLicenseNumberField.onChange(e.target.value)
              }
              error={drivingLicenseNumberField.error || undefined}
              testID="createoredit-identity-v2-drivinglicense-number"
            />
            <DateField
              label={t`Date of Issue`}
              placeholder={t`Enter DD/MM/YYYY`}
              value={values.drivingLicenseDateOfIssue as string}
              onChange={(e) =>
                setValue('drivingLicenseDateOfIssue', e.target.value)
              }
              testID="createoredit-identity-v2-drivinglicense-dateofissue"
            />
            <DateField
              label={t`Expiry Date`}
              placeholder={t`Enter DD/MM/YYYY`}
              value={values.drivingLicenseExpiryDate as string}
              onChange={(e) =>
                setValue('drivingLicenseExpiryDate', e.target.value)
              }
              testID="createoredit-identity-v2-drivinglicense-expirydate"
            />
            <InputField
              label={t`Issuing Country`}
              placeholder={t`Enter Issuing Country`}
              value={drivingLicenseIssuingCountryField.value as string}
              onChange={(e) =>
                drivingLicenseIssuingCountryField.onChange(e.target.value)
              }
              error={drivingLicenseIssuingCountryField.error || undefined}
              testID="createoredit-identity-v2-drivinglicense-issuingcountry"
            />
          </MultiSlotInput>

          <Text variant="caption" color={theme.colors.colorTextSecondary}>
            {t`Additional`}
          </Text>

          <FolderDropdownV2
            selectedFolder={values?.folder as string | undefined}
            onFolderSelect={(name) =>
              setValue('folder', name === values.folder ? '' : name)
            }
            testIDPrefix="createoredit-identity-v2-folder"
          />

          <InputField
            label={t`Comment`}
            placeholder={t`Enter Comment`}
            value={noteField.value as string}
            onChange={(e) => noteField.onChange(e.target.value)}
            error={noteField.error || undefined}
            testID="createoredit-identity-v2-comment"
          />

          <MultiSlotInput
            testID="createoredit-identity-v2-customfields-slot"
            actions={
              <Button
                variant="tertiaryAccent"
                size="small"
                type="button"
                iconBefore={<Add width={16} height={16} />}
                onClick={() => addCustomField({ type: 'note', note: '' })}
                data-testid="createoredit-identity-v2-add-comment"
              >
                {t`Add Another Message`}
              </Button>
            }
          >
            {(customFieldsList as Array<{ id: string }>).map((field, index) => {
              const fieldReg = registerCustomFieldItem('note', index)
              const canRemove =
                (customFieldsList as Array<{ id: string }>).length > 1
              return (
                <PasswordField
                  key={field.id}
                  label={t`Hidden Message`}
                  placeholder={t`Enter Hidden Message`}
                  value={fieldReg.value as string}
                  onChange={(e) => fieldReg.onChange(e.target.value)}
                  error={fieldReg.error || undefined}
                  testID={`createoredit-identity-v2-customfield-${index}`}
                  rightSlot={
                    canRemove ? (
                      <Button
                        variant="tertiary"
                        size="small"
                        type="button"
                        aria-label={t`Remove`}
                        iconBefore={
                          <TrashOutlined
                            width={16}
                            height={16}
                            color={theme.colors.colorTextPrimary}
                          />
                        }
                        onClick={() => removeCustomFieldItem(index)}
                        data-testid={`createoredit-identity-v2-remove-customfield-${index}`}
                      />
                    ) : undefined
                  }
                />
              )
            })}
          </MultiSlotInput>
        </div>
      </Form>
    </Dialog>
  )
}
