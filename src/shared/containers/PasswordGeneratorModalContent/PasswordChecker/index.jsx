import { t } from '@lingui/core/macro'
import { checkPasswordStrength } from '@tetherto/pearpass-utils-password-check'

import { HighlightString } from '../../../components/HighlightString'
import { NoticeText } from '../../../components/NoticeText'

/**
 * @param {{
 *  pass: string
 *  rules: {
 *    specialCharacters: boolean,
 *    characters: number
 *  }
 * }} props
 */
export const PasswordChecker = ({ pass, rules }) => {
  const { strengthType, strengthText } = checkPasswordStrength(pass, {
    includeSpecialChars: rules.specialCharacters,
    length: rules.characters,
    upperCase: false,
    numbers: true
  })

  return (
    <div className="font-inter text-white-mode1 flex min-h-[20px] flex-col items-center gap-2 text-center text-sm font-normal">
      <HighlightString text={pass} />
      <NoticeText text={t(strengthText)} type={strengthType} />
    </div>
  )
}
