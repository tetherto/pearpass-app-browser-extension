import { Trans } from '@lingui/react/macro'

import { ButtonPrimary } from '../../../shared/components/ButtonPrimary'
import { useAllowHttpEnabled } from '../../../shared/hooks/useAllowHttpEnabled'

export const NonSecureWarning = () => {
  const [, setAllowHttpEnabled] = useAllowHttpEnabled()

  const handleEnableExtension = () => {
    setAllowHttpEnabled(true)
  }

  return (
    <div className="bg-grey500-mode1 fixed inset-0 z-[9999] flex h-full w-full flex-col items-center gap-5 overflow-hidden p-9 pt-[52px]">
      <img src="/assets/images/logoLock.png" className="h-[50px] w-[190px]" />

      <div className="z-10 flex w-full flex-col items-center gap-[20px]">
        <div className="text-white-mode1 flex flex-col items-center gap-3 text-center">
          <h1 className="text-[20px] font-bold">
            <Trans>Extension disabled on HTTP websites</Trans>
          </h1>

          <p className="text-[16px] font-light">
            <Trans>
              For your security, the extension is disabled on non-secure (HTTP)
              websites by default. If you'd like to move forward, turn on HTTP
              access for PearPass
            </Trans>
          </p>
        </div>

        <ButtonPrimary onClick={handleEnableExtension}>
          <Trans>Enable browser extension</Trans>
        </ButtonPrimary>
      </div>

      <div className="bg-primary400-mode1 absolute bottom-0 left-1/2 z-[1] h-1/16 w-[100%] translate-x-[-50%] translate-y-[95%] rounded-2xl opacity-70 blur-[50px]" />
    </div>
  )
}
