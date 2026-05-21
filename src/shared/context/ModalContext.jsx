import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState
} from 'react'

import { generateUniqueId } from '@tetherto/pear-apps-utils-generate-unique-id'

import { BASE_TRANSITION_DURATION } from '../constants/transitions'
import { Overlay } from '../containers/Overlay'

const ModalContext = createContext()

const getDefaultModalParams = () => ({
  hasOverlay: false,
  overlayType: 'default',
  closeable: true,
  fullScreen: false
})

const createModalConfig = (content, params = {}) => ({
  content,
  id: generateUniqueId(),
  isOpen: true,
  params: { ...getDefaultModalParams(), ...params }
})

const getTopModal = (modalStack) => modalStack[modalStack.length - 1]

export const ModalProvider = ({ children }) => {
  const [modalStack, setModalStack] = useState([])

  const isOpen = !!modalStack.length

  const setModal = useCallback((content, params) => {
    setModalStack((prev) => [...prev, createModalConfig(content, params)])
  }, [])

  const closeModal = useCallback(
    () =>
      new Promise((resolve) => {
        setModalStack((prev) => {
          const newStack = [...prev]
          const topModal = getTopModal(newStack)
          if (topModal?.isOpen) {
            topModal.isOpen = false
          }
          return newStack
        })

        setTimeout(() => {
          setModalStack((prev) => prev.slice(0, -1))
          resolve()
        }, BASE_TRANSITION_DURATION)
      }),
    []
  )

  const closeAllModals = useCallback(() => setModalStack([]), [])

  useEffect(() => {
    const handleKeydown = (event) => {
      if (event.key === 'Escape' && isOpen) {
        const topModal = getTopModal(modalStack)
        if (topModal?.params?.closeable !== false) {
          void closeModal()
        }
      }
    }

    window.addEventListener('keydown', handleKeydown)
    return () => window.removeEventListener('keydown', handleKeydown)
  }, [isOpen, modalStack])

  return (
    <ModalContext.Provider
      value={{ isOpen, setModal, closeModal, closeAllModals }}
    >
      {children}

      {modalStack?.map(({ content, id, isOpen, params }) => (
        <div
          key={id}
          className={`fixed top-0 left-0 z-[999] flex h-full w-screen items-center justify-center`}
        >
          {params.hasOverlay && (
            <Overlay
              onClick={params.closeable !== false ? closeModal : undefined}
              type={params.overlayType}
              isOpen={isOpen}
            />
          )}

          {isOpen && (
            <div
              className={`relative z-[10000] ${params.fullScreen ? 'h-full w-full' : ''}`}
            >
              {content}
            </div>
          )}
        </div>
      ))}
    </ModalContext.Provider>
  )
}

/**
 * @returns {{
 *   isOpen: boolean,
 *   setModal: (
 *     content: import('react').ReactNode,
 *     params?: {
 *       hasOverlay?: boolean,
 *       overlayType?: string,
 *       closeable?: boolean,
 *       fullScreen?: boolean,
 *     }
 *   ) => void,
 *   closeModal: () => Promise<void>,
 *   closeAllModals: () => void
 * }}
 */
export const useModal = () => useContext(ModalContext)
