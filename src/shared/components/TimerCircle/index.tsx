import React from 'react'

import { useTimerAnimation } from 'pearpass-lib-vault'

import { getTimerColor } from '../../utils/otp'

const SIZE = 14
const RADIUS = 5.5
const STROKE_WIDTH = 1.5
const CENTER = SIZE / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

interface TimerCircleProps {
  timeRemaining: number | null
  period: number
  animated?: boolean
}

export const TimerCircle = ({
  timeRemaining,
  period,
  animated = true
}: TimerCircleProps) => {
  const { noTransition, expiring, targetTime } = useTimerAnimation(
    timeRemaining,
    period,
    animated
  )

  const dashOffset =
    timeRemaining !== null ? (1 - targetTime / period) * CIRCUMFERENCE : 0

  return (
    <div className="h-3.5 w-3.5 flex-shrink-0">
      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        style={{ transform: 'rotate(-90deg)' }}
      >
        <circle
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          fill="none"
          stroke="rgba(128,128,128,0.2)"
          strokeWidth={STROKE_WIDTH}
        />
        <circle
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          fill="none"
          stroke={getTimerColor(expiring)}
          strokeWidth={STROKE_WIDTH}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={dashOffset}
          style={{
            transition: noTransition ? 'none' : 'stroke-dashoffset 1s linear'
          }}
        />
      </svg>
    </div>
  )
}
