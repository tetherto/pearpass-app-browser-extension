import React from 'react'

/**
 * @param {{
 *  isOn: boolean,
 *  onChange: (isOn: boolean) => void
 * }} props
 */
export const Switch = ({ isOn, onChange }) => {
  const toggleSwitch = () => {
    onChange?.(!isOn)
  }

  return (
    <button
      onClick={toggleSwitch}
      className={`relative h-6 w-12 shrink-0 cursor-pointer rounded-full border border-green-100 transition-all duration-300 ease-in-out ${isOn ? 'bg-grey400-mode1' : 'bg-grey100-mode1'}`}
    >
      <div
        className={`${isOn ? 'bg-primary400-mode1' : 'bg-grey400-mode1'} absolute top-[1px] left-[1px] h-5 w-5 rounded-full shadow-md transition-transform duration-300 ease-in-out ${isOn ? 'translate-x-6' : ''}`}
      />
    </button>
  )
}
