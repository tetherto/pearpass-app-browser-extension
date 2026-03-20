import React from 'react'

interface StepIndicatorBarProps {
  currentStep: number
  totalSteps: number
}

export const StepIndicatorBar = ({
  currentStep,
  totalSteps
}: StepIndicatorBarProps) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'flex-start',
      padding: 0,
      gap: '6px',
      width: '100%',
      maxWidth: '100%',
      height: '2px'
    }}
  >
    {Array.from({ length: totalSteps }, (_, i) => {
      const step = i + 1
      const isActive = step <= currentStep

      return (
        <div
          key={step}
          style={{
            flexGrow: 1,
            height: '2px',
            background: '#FFFFFF',
            opacity: isActive ? 1 : 0.2,
            borderRadius: '100px'
          }}
        />
      )
    })}
  </div>
)
