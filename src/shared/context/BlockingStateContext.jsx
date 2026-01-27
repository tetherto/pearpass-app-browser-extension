import React, { createContext, useContext } from 'react'

const BlockingStateContext = createContext({
  isChecking: true,
  blockingState: null
})

export const BlockingStateProvider = ({ children, value }) => (
  <BlockingStateContext.Provider value={value}>
    {children}
  </BlockingStateContext.Provider>
)

export const useBlockingStateContext = () => {
  const context = useContext(BlockingStateContext)
  if (!context) {
    throw new Error(
      'useBlockingStateContext must be used within BlockingStateProvider'
    )
  }
  return context
}
