import React from 'react'

import { useTimerAnimation } from 'pearpass-lib-vault'

import { getTimerColor } from '../../constants/otp'

interface TimerBarProps {
  timeRemaining: number | null
  period: number
  animated?: boolean
}

export const TimerBar = ({
  timeRemaining,
  period,
  animated = true
}: TimerBarProps) => {
  const { noTransition, expiring, targetTime } = useTimerAnimation(
    timeRemaining,
    period,
    animated
  )

  const progress =
    timeRemaining !== null && period ? (targetTime / period) * 100 : 0

  const color = getTimerColor(expiring)

  return (
    <div className="flex w-full items-center gap-2 px-2.5 pt-1 pb-1.5">
      <div className="bg-grey100-mode1/20 h-1.5 flex-1 overflow-hidden rounded-[20px]">
        <div
          style={{
            height: '100%',
            borderRadius: 10,
            background: color,
            width: `${progress}%`,
            transition: noTransition ? 'none' : 'width 1s linear'
          }}
        />
      </div>
      <span
        className="min-w-[22px] text-right text-xs font-medium"
        style={{ color }}
      >
        {timeRemaining}s
      </span>
    </div>
  )
}
