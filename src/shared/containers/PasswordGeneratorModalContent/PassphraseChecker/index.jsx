import { t } from '@lingui/core/macro'
import { checkPassphraseStrength } from '@tetherto/pearpass-utils-password-check'

import { HighlightString } from '../../../components/HighlightString'
import { NoticeText } from '../../../components/NoticeText'

/**
 * @param {{
 *  pass: Array<string>
 *  rules: {
 *   capitalLetters: boolean,
 *   symbols: boolean,
 *   numbers: boolean,
 *   words: number
 *  }
 * }} props
 */
export const PassphraseChecker = ({ pass, rules }) => {
  const { strengthType, strengthText } = checkPassphraseStrength(pass, {
    capitalLetters: rules.capitalLetters,
    numbers: rules.numbers,
    symbols: rules.symbols,
    words: rules.words
  })

  return (
    <div className="font-inter text-white-mode1 flex min-h-[20px] flex-col items-center gap-2 text-center text-sm font-normal">
      <HighlightString text={pass?.join('-')} />

      <NoticeText text={t(strengthText)} type={strengthType} />
    </div>
  )
}
