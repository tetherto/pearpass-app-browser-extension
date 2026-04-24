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
import { isV2 } from '../utils/designVersion'

const ModalContext = createContext()

// V1 modals rely on this context's <Overlay/> for their backdrop. V2 modals
// use the kit Dialog, which ships its own backdrop + focus trap, so we skip
// our overlay in V2 mode to avoid stacking two layers. Callers can still
// override via explicit setModal(content, { hasOverlay: true }).
const getDefaultModalParams = () => ({
  hasOverlay: !isV2(),
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
          className={`fixed top-0 left-0 ${isV2 ? 'z-[10000]' : 'z-[500]'} flex h-full w-screen items-center justify-center`}
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
              className={`relative ${isV2 ? 'z-[10000]' : 'z-[1000]'} ${params.fullScreen ? 'h-full w-full' : ''}`}
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
