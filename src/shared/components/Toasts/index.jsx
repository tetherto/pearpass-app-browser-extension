import React from 'react'

import { colors } from '@tetherto/pearpass-lib-ui-theme-provider'

/**
 * @param {{
 *  toasts: Array.<{
 *    message: string
 *    icon: import('react').ReactNode
 *  }>
 * }} props
 */
export const Toasts = ({ toasts }) => {
  if (!toasts?.length) {
    return null
  }

  return (
    <div className="fixed bottom-[12px] left-1/2 z-[1500] flex -translate-x-1/2 transform flex-col gap-[10px]">
      {toasts?.map((toast, index) => {
        const Icon = toast.icon

        return (
          <div
            key={index}
            className="font-inter flex items-center justify-center gap-1.5 rounded-lg bg-white p-2.5 text-sm leading-normal font-normal text-black shadow-lg"
          >
            {Icon && <Icon color={colors.black.mode1} />}
            {toast.message}
          </div>
        )
      })}
    </div>
  )
}
