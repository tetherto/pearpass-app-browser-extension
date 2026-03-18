import React, { useState } from 'react'

import { t } from '@lingui/core/macro'
import {
  checkPassphraseStrength,
  checkPasswordStrength,
  PASSWORD_STRENGTH
} from '@tetherto/pearpass-utils-password-check'

import { EyeClosedIcon } from '../../../shared/icons/EyeClosedIcon'
import { EyeIcon } from '../../../shared/icons/EyeIcon'
import { KeyIcon } from '../../../shared/icons/KeyIcon'
import { OkayIcon } from '../../../shared/icons/OkayIcon'
import { YellowErrorIcon } from '../../../shared/icons/YellowErrorIcon'
import { ErrorIcon } from '../../icons/ErrorIcon'
import { ButtonRoundIcon } from '../ButtonRoundIcon'
import { HighlightString } from '../HighlightString'
import { InputField } from '../InputField'

const PASSWORD_STRENGTH_ICONS = {
  error: ErrorIcon,
  warning: YellowErrorIcon,
  success: OkayIcon
}

const getTextColor = (strength) => {
  switch (strength) {
    case PASSWORD_STRENGTH.SAFE:
      return 'text-primary400-mode1'
    case PASSWORD_STRENGTH.VULNERABLE:
      return 'text-errorred-mode1'
    case PASSWORD_STRENGTH.WEAK:
      return 'text-erroryellow-mode1'
    default:
      return 'text-white'
  }
}

/**
 * @param {{
 *  value: string,
 *  onChange: (value: string) => void,
 *  icon?: React.ReactNode,
 *  label?: string,
 *  error?: string,
 *  passType?: 'password' | 'passphrase',
 *  additionalItems?: React.ReactNode,
 *  belowInputContent?: React.ReactNode,
 *  placeholder?: string,
 *  hasStrongness?: boolean,
 *  onClick?: () => void,
 *  variant?: 'default' | 'outline'
 * }} props
 */
export const InputFieldPassword = ({
  value,
  onChange,
  icon,
  label = 'Password',
  error,
  passType = 'password',
  additionalItems,
  belowInputContent,
  placeholder,
  readonly,
  hasStrongness = false,
  onClick,
  variant = 'default'
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)

  const handleChange = (val) => {
    onChange?.(val)
  }

  const getPasswordStrongness = () => {
    if (!value?.length) {
      return null
    }

    const { strengthType, strengthText, type, success } =
      passType === 'password'
        ? checkPasswordStrength(value)
        : checkPassphraseStrength(value)

    if (!success) {
      return null
    }

    const Icon = PASSWORD_STRENGTH_ICONS[strengthType]
    return (
      <div
        className={`font-inter flex items-center gap-[5px] text-[8px] font-medium ${getTextColor(type)}`}
      >
        <Icon />
        {t(strengthText)}
      </div>
    )
  }

  return (
    <InputField
      label={label}
      icon={icon || KeyIcon}
      belowInputContent={belowInputContent}
      readonly={readonly}
      value={value}
      overlay={isPasswordVisible ? <HighlightString text={value} /> : null}
      onChange={handleChange}
      onClick={onClick}
      placeholder={placeholder}
      error={error}
      variant={variant}
      additionalItems={
        <>
          {hasStrongness && getPasswordStrongness()}

          <ButtonRoundIcon
            startIcon={isPasswordVisible ? EyeClosedIcon : EyeIcon}
            onClick={(e) => {
              e.stopPropagation()
              setIsPasswordVisible(!isPasswordVisible)
            }}
          />

          {additionalItems}
        </>
      }
      type={isPasswordVisible ? 'text' : 'password'}
    />
  )
}
