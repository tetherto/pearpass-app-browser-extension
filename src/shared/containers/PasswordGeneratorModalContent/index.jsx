import { useMemo, useState } from 'react'

import { t } from '@lingui/core/macro'
import {
  generatePassphrase,
  generatePassword
} from '@tetherto/pearpass-utils-password-generator'

import { PassphraseChecker } from './PassphraseChecker'
import { PassphraseGenerator } from './PassphraseGenerator'
import { PasswordChecker } from './PasswordChecker'
import { PasswordGenerator } from './PasswordGenerator'
import { ButtonLittle } from '../../components/ButtonLittle'
import { ModalHeader } from '../../components/ModalHeader'
import { RadioSelect } from '../../components/RadioSelect'

/**
 * @param {{
 *  actionLabel: string
 *  onActionClick: (pass: string) => void
 *  onClose: () => void
 * }} props
 */
export const PasswordGeneratorModalContent = ({
  actionLabel,
  onActionClick,
  onClose
}) => {
  const [selectedOption, setSelectedOption] = useState('password')
  const [selectedRules, setSelectedRules] = useState({
    password: {
      specialCharacters: true,
      characters: 8
    },
    passphrase: {
      capitalLetters: true,
      symbols: true,
      numbers: true,
      words: 8
    }
  })

  const pass = useMemo(() => {
    if (selectedOption === 'passphrase') {
      return generatePassphrase(
        selectedRules.passphrase.capitalLetters,
        selectedRules.passphrase.symbols,
        selectedRules.passphrase.numbers,
        selectedRules.passphrase.words
      )
    }
    return generatePassword(selectedRules.password.characters, {
      includeSpecialChars: selectedRules.password.specialCharacters,
      lowerCase: true,
      upperCase: true,
      numbers: true
    })
  }, [selectedOption, selectedRules])

  const radioOptions = [
    { label: t`Password`, value: 'password' },
    { label: t`Passphrase`, value: 'passphrase' }
  ]

  const handleRuleChange = (optionName, value) => {
    setSelectedRules((prev) => ({
      ...prev,
      [optionName]: value
    }))
  }

  const handleActionClick = () => {
    onActionClick(selectedOption === 'passphrase' ? pass.join('-') : pass)
  }

  return (
    <div className="bg-grey500-mode1 h-full w-full overflow-y-auto p-5">
      <ModalHeader onClose={onClose}>
        <div className="flex justify-end">
          <ButtonLittle onClick={handleActionClick}>{actionLabel}</ButtonLittle>
        </div>
      </ModalHeader>

      {selectedOption === 'passphrase' ? (
        <PassphraseChecker pass={pass} rules={selectedRules.passphrase} />
      ) : (
        <PasswordChecker pass={pass} rules={selectedRules.password} />
      )}

      <div className="mt-8">
        <RadioSelect
          title={t`Type`}
          options={radioOptions}
          selectedOption={selectedOption}
          onChange={setSelectedOption}
        />
      </div>

      {selectedOption === 'passphrase' ? (
        <PassphraseGenerator
          onRuleChange={handleRuleChange}
          rules={selectedRules.passphrase}
        />
      ) : (
        <PasswordGenerator
          onRuleChange={handleRuleChange}
          rules={selectedRules.password}
        />
      )}
    </div>
  )
}
