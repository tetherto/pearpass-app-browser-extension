import React from 'react'

import { t } from '@lingui/core/macro'
import { PASSPHRASE_TYPE_OPTIONS } from '@tetherto/pearpass-lib-constants'

import { RadioSelect } from '../../components/RadioSelect'
import { SwitchWithLabel } from '../../components/SwitchWithLabel'

/**
 * @param {{
 *   selectedType: number,
 *   setSelectedType: (value: number) => void,
 *   withRandomWord: boolean,
 *   setWithRandomWord: (value: boolean) => void,
 *   isDisabled: boolean
 * }} props
 */
export const PassPhraseSettings = ({
  selectedType,
  setSelectedType,
  withRandomWord,
  setWithRandomWord,
  isDisabled
}) => (
  <div className="bg-grey350-mode1 flex flex-col gap-[15px] rounded-[10px] p-[10px] text-xs">
    <RadioSelect
      title={t`Type`}
      options={PASSPHRASE_TYPE_OPTIONS.map((option) => ({
        label: t`${option.value} words`,
        value: option.value
      }))}
      selectedOption={selectedType}
      onChange={(value) => setSelectedType(value)}
      optionFontWeight="font-normal"
      titleFontStyle="font-medium"
      disabled={isDisabled}
    />

    <div className="flex flex-row items-center justify-between">
      <div className="text-white-mode1 text-xs font-normal">
        {t`+1 random word`}
      </div>

      <div className="mr-[5px] scale-[1.2]">
        <SwitchWithLabel
          isOn={withRandomWord}
          onChange={(value) => setWithRandomWord(value)}
          disabled={isDisabled}
        />
      </div>
    </div>
  </div>
)
