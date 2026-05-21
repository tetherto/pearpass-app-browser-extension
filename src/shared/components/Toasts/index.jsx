import React from 'react'

import { useTheme } from '@tetherto/pearpass-lib-ui-kit'

/**
 * @param {{
 *  toasts: Array.<{
 *    message: string
 *    icon: import('react').ReactNode
 *  }>
 * }} props
 */
export const Toasts = ({ toasts }) => {
  const { theme } = useTheme()

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
            {Icon && <Icon color={theme.colors.colorOnPrimary} />}
            {toast.message}
          </div>
        )
      })}
    </div>
  )
}
