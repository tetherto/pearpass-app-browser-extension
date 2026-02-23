import React from 'react'

/**
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {boolean} [props.stretch=true]
 */
export const CardWelcome = ({ children, stretch = true }) => (
  <div
    className={`${stretch && 'w-full'} bg-grey400-mode1 border-grey400-mode1 flex max-h-[75vh] min-h-0 flex-col items-center gap-[20px] overflow-hidden rounded-[20px] px-[15px] py-[9px] shadow-[5px_5px_10px_0_rgba(0,0,0,0.25)]`}
  >
    {children}
  </div>
)
