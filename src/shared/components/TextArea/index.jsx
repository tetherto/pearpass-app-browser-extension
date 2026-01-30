import React from 'react'

/**
 * @param {{
 *  value: string,
 *  onChange: (value: string) => void,
 *  placeholder: string,
 *  readonly?: boolean,
 *  onClick: (value: string) => void,
 *  variant: 'default' | 'report'
 * }} props
 */
export const TextArea = ({
  value,
  onChange,
  placeholder,
  readonly,
  onClick,
  variant,
  additionalItems
}) => {
  const handleChange = (e) => {
    if (!readonly) {
      onChange?.(e.target.value)
    }
  }

  const handleClick = () => {
    if (!readonly) {
      onClick?.(value)
    }
  }

  const wrapperClasses = `
    relative flex w-full rounded-[10px] border border-grey100-mode1 
    bg-grey400-mode1 transition-colors
    ${readonly ? 'pointer-events-none' : 'pointer-events-auto'}
    focus-within:border-primary400-mode1
  `

  const textAreaClasses = `
    w-full resize-none bg-transparent font-inter outline-none border-none
    ${
      variant === 'report'
        ? 'text-white-mode1 placeholder-grey300-mode1 h-[70px] px-[12px] py-[11px] text-[12px] font-semibold'
        : 'text-white-mode1 placeholder-grey100-mode1 h-[233px] px-[10px] py-[8px] text-[16px] font-bold'
    }
    ${additionalItems ? 'pr-10' : ''}
  `

  const commonProps = {
    value,
    onChange: handleChange,
    onClick: handleClick,
    placeholder,
    readOnly: readonly
  }

  return (
    <div className={wrapperClasses}>
      <textarea {...commonProps} className={textAreaClasses} />
      {additionalItems && (
        <div
          onMouseDown={(e) => e.stopPropagation()}
          className="pointer-events-auto absolute top-2 right-2 flex items-center justify-center p-1"
        >
          {additionalItems}
        </div>
      )}
    </div>
  )
}
