import React from 'react'

/**
 * RadioOption component for single radio button option
 * @param {Object} props
 * @param {string} props.label - The label text to display
 * @param {string} [props.description] - Optional description text
 * @param {boolean} props.isSelected - Whether this option is selected
 * @param {(value: string) => void} props.onChange - Callback when selected
 * @param {string} props.value - The value of this option
 * @param {string} props.name - The name attribute for the radio input group
 */
export const RadioOption = ({
  label,
  description,
  isSelected,
  onChange,
  value,
  name
}) => (
  <label className="flex cursor-pointer items-center gap-[8px]">
    <input
      type="radio"
      name={name}
      value={value}
      checked={isSelected}
      onChange={() => onChange(value)}
      className="peer pointer-events-none sr-only fixed opacity-0"
    />

    <div
      className={`relative mt-0.5 h-5 w-5 flex-shrink-0 rounded-full border-2 transition-all ${
        isSelected ? 'border-primary400-mode1' : 'border-white/40'
      } peer-focus-visible:ring-primary400-mode1 peer-focus-visible:ring-2`}
    >
      <span
        className={`bg-primary400-mode1 absolute top-1/2 left-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full transition-transform ${
          isSelected ? 'scale-100' : 'scale-0'
        }`}
      />
    </div>

    <div className="flex flex-col">
      <span className="font-inter text-[14px] leading-normal text-white">
        {label}
      </span>
      {description && (
        <span className="font-inter text-grey100-mode1 text-[12px] leading-normal font-normal">
          {description}
        </span>
      )}
    </div>
  </label>
)
