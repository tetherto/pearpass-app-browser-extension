import { t } from '@lingui/core/macro'

import { ButtonRoundIcon } from '../../../shared/components/ButtonRoundIcon'
import { CopyButton } from '../../../shared/components/CopyButton'
import { FormGroup } from '../../../shared/components/FormGroup'
import { InputField } from '../../../shared/components/InputField'
import { CommonFileIcon } from '../../../shared/icons/CommonFileIcon'
import { DeleteIcon } from '../../../shared/icons/DeleteIcon'

/**
 * @param {{
 * register: (name: string, index: number) => {
 *   name: string;
 *   value: string;
 *   error?: string;
 *   onChange: (e: unknown) => void;
 * },
 * customFields?: {
 *   id: string,
 *   type: 'note',
 *   props: Record<string, unknown>
 * }[],
 * onClick?: () => void,
 * areInputsDisabled: boolean,
 * removeItem?: (index: number) => void
 * }} props
 */
export const CustomFields = ({
  customFields,
  register,
  areInputsDisabled,
  removeItem,
  onClick
}) => (
  <>
    {customFields?.map((customField, index) => {
      if (customField.type === 'note') {
        return (
          <FormGroup key={customField.id}>
            <InputField
              label={t`Note`}
              placeholder={t`Add note`}
              variant="outline"
              icon={CommonFileIcon}
              onClick={onClick}
              readonly={areInputsDisabled}
              additionalItems={
                areInputsDisabled ? (
                  <CopyButton value={register('note', index).value} />
                ) : (
                  <ButtonRoundIcon
                    variant="secondary"
                    startIcon={DeleteIcon}
                    onClick={() => removeItem?.(index)}
                  />
                )
              }
              {...register('note', index)}
            />
          </FormGroup>
        )
      }
      return null
    })}
  </>
)
