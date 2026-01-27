import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react'

import { createPortal } from 'react-dom'

import { getHorizontal } from './utils/getHorizontal'
import { getVertical } from './utils/getVertical'
import { useOutsideClick } from '../../../shared/hooks/useOutsideClick'
import { toSentenceCase } from '../../../shared/utils/toSentenceCase'

export const TRANSITION_DURATION = 250

const TRANSFORM_BY_DIRECTION = {
  top: 'translate(-100%, calc(-100% - 10px))',
  right: 'translate(10px, -50%)',
  bottom: 'translate(-50%, 10px)',
  left: 'translate(10px, -50%)',
  topRight: 'translate(0, calc(-100% - 10px))',
  topLeft: 'translate(-100%, calc(-100% - 10px))',
  bottomRight: 'translate(0, 10px)',
  bottomLeft: 'translate(-100%, 10px)'
}

/**
 * @param {{
 *  isOpen: boolean,
 *  setIsOpen: () => void,
 *  content: React.ReactNode,
 *  children: React.ReactNode,
 *  direction: 'top' | 'bottom' | 'left' | 'right' | 'topRight' | 'topLeft' | 'bottomRight' | 'bottomLeft'
 * }} props
 */
export const PopupMenu = ({
  isOpen,
  setIsOpen,
  children,
  content,
  direction = 'bottomLeft'
}) => {
  const boxRef = useRef(null)
  const [shouldRender, setShouldRender] = useState(false)

  const handleClose = useCallback(() => {
    setIsOpen(false)
  }, [setIsOpen])

  const wrapperRef = useOutsideClick({
    onOutsideClick: () => handleClose()
  })

  const handleToggle = useCallback(() => {
    setIsOpen(!isOpen)
  }, [isOpen, setIsOpen])

  const { newDirection, newPositions } = useMemo(() => {
    const {
      right = 0,
      left = 0,
      top = 0,
      bottom = 0
    } = boxRef.current?.getBoundingClientRect() || {}

    const width =
      boxRef.current?.children[0]?.getBoundingClientRect().width ?? 0
    const height =
      boxRef.current?.children[0]?.getBoundingClientRect().height ?? 0

    const screenWidth = window.innerWidth
    const screenHeight = window.innerHeight

    const positionToSet = {
      horizontal: getHorizontal(direction),
      vertical: getVertical(direction)
    }

    const rightPosition = screenWidth - right
    const leftPosition = left
    const topPosition = top
    const bottomPosition = screenHeight - bottom

    const newPositions = {
      right: rightPosition - (positionToSet.horizontal === 'right' ? width : 0),
      left: leftPosition - (positionToSet.horizontal === 'left' ? width : 0),
      top: topPosition - (positionToSet.vertical === 'top' ? height : 0),
      bottom:
        bottomPosition - (positionToSet.vertical === 'bottom' ? height : 0),
      width,
      height
    }

    if (newPositions.top < 0) positionToSet.vertical = 'bottom'
    if (newPositions.bottom < 0) positionToSet.vertical = 'top'
    if (newPositions.left < 0) positionToSet.horizontal = 'right'
    if (newPositions.right < 0) positionToSet.horizontal = 'left'

    return {
      newDirection: `${positionToSet.vertical}${positionToSet.vertical ? toSentenceCase(positionToSet.horizontal) : positionToSet.horizontal}`,
      newPositions
    }
  }, [boxRef, direction, shouldRender])

  const contentOrigin = useMemo(() => {
    if (!wrapperRef.current) {
      return { top: 0, left: 0 }
    }

    const {
      top = 0,
      bottom = 0,
      left = 0,
      right = 0,
      width = 0,
      height = 0
    } = wrapperRef.current.getBoundingClientRect() || {}

    switch (newDirection) {
      case 'top':
        return { top, left: left + width / 2 }
      case 'bottom':
        return { top: bottom, left: left + width / 2 }
      case 'left':
        return { top: top + height / 2, left }
      case 'right':
        return { top: top + height / 2, left: right }
      case 'topRight':
        return { top, left }
      case 'topLeft':
        return { top, left: right }
      case 'bottomRight':
        return { top: bottom, left }
      case 'bottomLeft':
        return { top: bottom, left: right }
      default:
        return { top: 0, left: 0 }
    }
  }, [newDirection, wrapperRef, isOpen, shouldRender])

  const getScrollableAncestors = (element) => {
    const scrollableAncestors = []
    let parent = element.parentElement
    while (parent) {
      const overflowX = window.getComputedStyle(parent).overflowX
      const overflowY = window.getComputedStyle(parent).overflowY
      if (
        ['auto', 'scroll'].includes(overflowX) ||
        ['auto', 'scroll'].includes(overflowY)
      ) {
        scrollableAncestors.push(parent)
      }
      parent = parent.parentElement
    }
    return scrollableAncestors
  }

  useEffect(() => {
    if (!wrapperRef.current) {
      return
    }

    const scrollableAncestors = getScrollableAncestors(wrapperRef.current)
    if (isOpen) {
      window.addEventListener('scroll', handleClose)
      window.addEventListener('resize', handleClose)
      scrollableAncestors.forEach((ancestor) =>
        ancestor.addEventListener('scroll', handleClose)
      )
    }

    return () => {
      window.removeEventListener('scroll', handleClose)
      window.removeEventListener('resize', handleClose)
      scrollableAncestors.forEach((ancestor) =>
        ancestor.removeEventListener('scroll', handleClose)
      )
    }
  }, [wrapperRef, isOpen, handleClose])

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true)
    } else {
      const timer = setTimeout(
        () => setShouldRender(false),
        TRANSITION_DURATION
      )
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  return (
    <div ref={wrapperRef} className="relative inline-block">
      <div onClick={handleToggle} className="cursor-pointer">
        {children}
      </div>

      {shouldRender &&
        createPortal(
          <div
            ref={boxRef}
            className={`fixed z-[1000] transition-opacity duration-[${TRANSITION_DURATION}ms] ${isOpen ? 'opacity-100' : 'opacity-0'} ${shouldRender ? 'visible' : 'invisible'} `}
            style={{
              top: `${contentOrigin.top}px`,
              left: `${contentOrigin.left}px`,
              height: `${newPositions.height}px`,
              width: `${newPositions.width}px`,
              transform: TRANSFORM_BY_DIRECTION[newDirection]
            }}
          >
            {content}
          </div>,
          document.body
        )}
    </div>
  )
}
