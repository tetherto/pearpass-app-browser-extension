import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  useCallback
} from 'react'

import { createPortal } from 'react-dom'

const MenuContext = createContext(null)

const GAP = 8

const ANCHOR = {
  TOP: 'top',
  BOTTOM: 'bottom',
  LEFT: 'left',
  RIGHT: 'right'
}

const ALIGN = {
  START: 'start',
  CENTER: 'center',
  END: 'end'
}

/**
 * @param {DOMRect} triggerRect
 * @param {{width: number, height: number}} menuRect
 * @param {typeof ANCHOR[keyof typeof ANCHOR]} anchor
 * @param {typeof ALIGN[keyof typeof ALIGN]} align
 * @returns {{top: number, left: number}}
 */
const calculatePosition = (triggerRect, menuRect, anchor, align) => {
  const { innerWidth: viewportWidth, innerHeight: viewportHeight } = window

  let top = 0
  let left = 0

  // Vertical positioning based on anchor
  if (anchor === ANCHOR.TOP) {
    top = triggerRect.top - menuRect.height - GAP
  } else if (anchor === ANCHOR.BOTTOM) {
    top = triggerRect.bottom + GAP
  } else if (anchor === ANCHOR.LEFT || anchor === ANCHOR.RIGHT) {
    top = triggerRect.top + (triggerRect.height - menuRect.height) / 2
  }

  // Horizontal positioning based on anchor and align
  if (anchor === ANCHOR.LEFT) {
    left = triggerRect.left - menuRect.width - GAP
  } else if (anchor === ANCHOR.RIGHT) {
    left = triggerRect.right + GAP
  } else if (align === ALIGN.START) {
    left = triggerRect.left
  } else if (align === ALIGN.END) {
    left = triggerRect.right - menuRect.width
  } else if (align === ALIGN.CENTER) {
    left = triggerRect.left + (triggerRect.width - menuRect.width) / 2
  }

  // Adjust if going off-screen vertically
  if (top < GAP) {
    // Flip to bottom if was top
    if (anchor === ANCHOR.TOP) {
      top = triggerRect.bottom + GAP
    } else {
      top = GAP
    }
  } else if (top + menuRect.height > viewportHeight - GAP) {
    // Flip to top if was bottom
    if (anchor === ANCHOR.BOTTOM) {
      const flippedTop = triggerRect.top - menuRect.height - GAP
      if (flippedTop >= GAP) {
        top = flippedTop
      } else {
        top = viewportHeight - menuRect.height - GAP
      }
    } else {
      top = viewportHeight - menuRect.height - GAP
    }
  }

  // Adjust if going off-screen horizontally
  if (left < GAP) {
    // Flip to right if was left
    if (anchor === ANCHOR.LEFT) {
      left = triggerRect.right + GAP
    } else {
      left = GAP
    }
  } else if (left + menuRect.width > viewportWidth - GAP) {
    // Flip to left if was right
    if (anchor === ANCHOR.RIGHT) {
      const flippedLeft = triggerRect.left - menuRect.width - GAP
      if (flippedLeft >= GAP) {
        left = flippedLeft
      } else {
        left = viewportWidth - menuRect.width - GAP
      }
    } else {
      left = viewportWidth - menuRect.width - GAP
    }
  }

  return { top, left }
}

/**
 * @typedef {Object} MenuProps
 * @property {React.ReactNode} children
 * @property {boolean} [open]
 * @property {(open: boolean) => void} [onOpenChange]
 * @property {typeof ANCHOR[keyof typeof ANCHOR]} [anchor='bottom']
 * @property {typeof ALIGN[keyof typeof ALIGN]} [align='start']
 * @property {boolean} [openOnHover=false]
 */

/**
 * @param {MenuProps} props
 */
export const Menu = ({
  children,
  open: controlledOpen,
  onOpenChange,
  anchor = ANCHOR.BOTTOM,
  align = ALIGN.START,
  openOnHover = false
}) => {
  const [internalOpen, setInternalOpen] = useState(false)
  const triggerRef = useRef(null)
  const menuRef = useRef(null)

  const isControlled = controlledOpen !== undefined
  const isOpen = isControlled ? controlledOpen : internalOpen

  const setIsOpen = useCallback(
    (value) => {
      if (!isControlled) {
        setInternalOpen(value)
      }
      onOpenChange?.(value)
    },
    [isControlled, onOpenChange]
  )

  const toggle = useCallback(() => {
    setIsOpen(!isOpen)
  }, [isOpen, setIsOpen])

  const close = useCallback(() => {
    setIsOpen(false)
  }, [setIsOpen])

  // Handle click outside
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (event) => {
      if (
        triggerRef.current?.contains(event.target) ||
        menuRef.current?.contains(event.target)
      ) {
        return
      }
      close()
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        close()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, close])

  // Close on scroll/resize
  useEffect(() => {
    if (!isOpen) return

    const handleScrollOrResize = () => close()

    window.addEventListener('scroll', handleScrollOrResize, true)
    window.addEventListener('resize', handleScrollOrResize)

    return () => {
      window.removeEventListener('scroll', handleScrollOrResize, true)
      window.removeEventListener('resize', handleScrollOrResize)
    }
  }, [isOpen, close])

  return (
    <MenuContext.Provider
      value={{
        isOpen,
        toggle,
        close,
        setIsOpen,
        triggerRef,
        menuRef,
        anchor,
        align,
        openOnHover
      }}
    >
      {children}
    </MenuContext.Provider>
  )
}

/**
 * @typedef {Object} MenuTriggerProps
 * @property {React.ReactNode} children
 * @property {string} [className]
 * @property {boolean} [stopPropagation=false]
 */

/**
 * @param {MenuTriggerProps} props
 */
export const MenuTrigger = ({
  children,
  className,
  stopPropagation = false
}) => {
  const context = useContext(MenuContext)

  if (!context) {
    throw new Error('MenuTrigger must be used within a Menu')
  }

  const { toggle, setIsOpen, triggerRef, openOnHover } = context

  const handleClick = (e) => {
    if (stopPropagation) {
      e.stopPropagation()
    }
    if (!openOnHover) {
      toggle()
    }
  }

  const handleMouseEnter = () => {
    if (openOnHover) {
      setIsOpen(true)
    }
  }

  const handleMouseLeave = () => {
    if (openOnHover) {
      setIsOpen(false)
    }
  }

  return (
    <div
      ref={triggerRef}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={className}
      style={{ cursor: 'pointer' }}
    >
      {children}
    </div>
  )
}
/**
 * @typedef {Object} MenuContentProps
 * @property {React.ReactNode} children
 * @property {string} [className]
 */

/**
 * @param {MenuContentProps} props
 */
export const MenuContent = ({ children, className }) => {
  const context = useContext(MenuContext)
  const [position, setPosition] = useState(null)

  if (!context) {
    throw new Error('MenuContent must be used within a Menu')
  }

  const { isOpen, menuRef, triggerRef, anchor, align, openOnHover, setIsOpen } =
    context

  const handleMouseEnter = () => {
    if (openOnHover) {
      setIsOpen(true)
    }
  }

  const handleMouseLeave = () => {
    if (openOnHover) {
      setIsOpen(false)
    }
  }

  // Calculate position after render
  useEffect(() => {
    if (!isOpen) {
      setPosition(null)
      return
    }

    const updatePosition = () => {
      if (!triggerRef.current || !menuRef.current) return

      const triggerRect = triggerRef.current.getBoundingClientRect()
      // Use offsetWidth/offsetHeight for accurate size measurement
      const menuRect = {
        width: menuRef.current.offsetWidth,
        height: menuRef.current.offsetHeight
      }

      const calculatedPosition = calculatePosition(
        triggerRect,
        menuRect,
        anchor,
        align
      )
      setPosition(calculatedPosition)
    }

    // Double RAF to ensure DOM is painted
    requestAnimationFrame(() => {
      requestAnimationFrame(updatePosition)
    })
  }, [isOpen, anchor, align, triggerRef, menuRef])

  if (!isOpen) return null

  const isPositioned = position !== null

  return createPortal(
    <div
      ref={menuRef}
      className={className}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        position: 'fixed',
        zIndex: 1000,
        top: isPositioned ? position.top : -9999,
        left: isPositioned ? position.left : -9999,
        opacity: isPositioned ? 1 : 0,
        visibility: isPositioned ? 'visible' : 'hidden',
        pointerEvents: isPositioned ? 'auto' : 'none'
      }}
    >
      {children}
    </div>,
    document.body
  )
}

/**
 * @typedef {Object} MenuItemProps
 * @property {React.ReactNode} children
 * @property {string} [className]
 * @property {() => void} [onClick]
 * @property {boolean} [disabled]
 * @property {boolean} [closeOnClick=true]
 */

/**
 * @param {MenuItemProps} props
 */
export const MenuItem = ({
  children,
  className,
  onClick,
  disabled = false,
  closeOnClick = true
}) => {
  const context = useContext(MenuContext)

  if (!context) {
    throw new Error('MenuItem must be used within a Menu')
  }

  const { close } = context

  const handleClick = (e) => {
    if (disabled) return

    onClick?.(e)

    if (closeOnClick) {
      close()
    }
  }

  return (
    <div
      onClick={handleClick}
      className={className}
      style={{
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1
      }}
      role="menuitem"
      aria-disabled={disabled}
    >
      {children}
    </div>
  )
}

/**
 * @param {{ className?: string }} props
 */
export const MenuSeparator = ({ className }) => (
  <div className={className} role="separator" />
)
