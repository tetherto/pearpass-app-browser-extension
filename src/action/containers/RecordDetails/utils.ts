type FieldRegistration = {
  name: string
  value: unknown
  onChange?: unknown
  error?: string
}

export const toReadOnlyFieldProps = (field: FieldRegistration) => ({
  name: field.name,
  value: (field.value as string | undefined) ?? ''
})
