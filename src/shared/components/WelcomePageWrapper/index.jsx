import React from 'react'

/**
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children
 */
export const WelcomePageWrapper = ({ children }) => (
  <div className="bg-grey500-mode1 relative flex h-full w-full flex-col items-center gap-5 overflow-hidden p-9 pt-[52px]">
    <img src="/assets/images/logoLock.png" className="h-[50px] w-[190px]" />
    <div className="z-10 flex h-full w-full flex-1 flex-col gap-[20px]">
      {children}
    </div>
    <div className="bg-primary400-mode1 absolute bottom-0 left-1/2 z-[1] h-1/16 w-[100%] translate-x-[-50%] translate-y-[95%] rounded-2xl opacity-70 blur-[50px]" />
  </div>
)
