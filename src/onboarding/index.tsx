import React, { useState } from 'react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider as UIKitProvider } from '@tetherto/pearpass-lib-ui-kit'
import { StepIndicatorBar } from './StepIndicatorBar'
import { Step1Dialog } from './Step1Dialog'
import { Step2Dialog } from './Step2Dialog'
import { Step3Dialog } from './Step3Dialog'
import { ONBOARDING_DIALOG_WIDTH } from './constants'
import '../index.css'
import '../strict.css'

const OnboardingPage = () => {
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 3

  const goNext = () => setCurrentStep((s) => Math.min(s + 1, totalSteps))

  return (
    <div className="bg-grey500-mode1 h-screen w-full">
      <div
        className="relative flex h-full w-full flex-col items-center gap-5 overflow-y-auto p-9 pt-[52px]"
        style={{ scrollbarWidth: 'auto', msOverflowStyle: 'auto' }}
      >
        <img
          src="/assets/images/logoLock.png"
          className="h-[50px] w-[190px]"
          alt="Pearpass"
        />

        <div
          className="flex flex-col gap-5"
          style={{ width: ONBOARDING_DIALOG_WIDTH }}
        >
          <StepIndicatorBar currentStep={currentStep} totalSteps={totalSteps} />

          {currentStep === 1 && <Step1Dialog onNext={goNext} />}
          {currentStep === 2 && <Step2Dialog onNext={goNext} />}
          {currentStep === 3 && <Step3Dialog />}
        </div>

        <div className="bg-primary400-mode1 absolute bottom-0 left-1/2 z-[1] h-1/16 w-[100%] translate-x-[-50%] translate-y-[95%] rounded-2xl opacity-70 blur-[50px]" />
      </div>
    </div>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <UIKitProvider>
      <OnboardingPage />
    </UIKitProvider>
  </StrictMode>
)
