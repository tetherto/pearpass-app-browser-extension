import React, { useRef, useEffect } from 'react'

import { colors } from '@tetherto/pearpass-lib-ui-theme-provider'

/**
 * @param {{
 *  value: number,
 *  onChange: (value: number) => void,
 *  min?: number,
 *  max?: number,
 *  step?: number
 * }} props
 */
export const Slider = ({ value, onChange, min = 0, max = 100, step = 1 }) => {
  const ref = useRef()

  const handleChange = (e) => {
    onChange?.(parseFloat(e.target.value))
  }

  useEffect(() => {
    if (ref.current) {
      const percentage = ((value - min) / (max - min)) * 100
      ref.current.style.background = `linear-gradient(to right, ${colors.primary400.mode1} ${percentage}%, ${colors.grey100.mode1} ${percentage}%)`
    }
  }, [value, min, max])

  return (
    <input
      type="range"
      ref={ref}
      value={value}
      onChange={handleChange}
      min={min}
      max={max}
      step={step}
      className="custom-slider h-2 w-full cursor-pointer appearance-none rounded-lg outline-none"
      style={{
        WebkitAppearance: 'none',
        background: `linear-gradient(to right, ${colors.primary400.mode1}  0%, {colors.grey100.mode1} 0%)`
      }}
    />
  )
}
