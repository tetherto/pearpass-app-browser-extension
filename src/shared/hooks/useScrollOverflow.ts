import { RefObject, useLayoutEffect, useState } from 'react'

const SUBPIXEL_TOLERANCE = 0.5

const measureOverflow = (element: HTMLElement): boolean => {
  // Use last child's rect, not scrollHeight: absolutely positioned descendants
  // (e.g. favorite badges) inflate scrollHeight and produce false positives.
  const last = element.lastElementChild
  if (!last) return false
  const elementRect = element.getBoundingClientRect()
  const lastRect = last.getBoundingClientRect()
  const lastBottomInContent =
    lastRect.bottom - elementRect.top + element.scrollTop
  return lastBottomInContent - element.clientHeight > SUBPIXEL_TOLERANCE
}

export const useScrollOverflow = (
  ref: RefObject<HTMLElement | null>,
  deps: ReadonlyArray<unknown> = []
): boolean => {
  const [hasOverflow, setHasOverflow] = useState(false)

  useLayoutEffect(() => {
    const element = ref.current
    if (!element) {
      setHasOverflow(false)
      return
    }

    const check = () => setHasOverflow(measureOverflow(element))

    check()

    const ro = new ResizeObserver(check)
    ro.observe(element)
    // Also observe children: container is clamped at maxHeight, so its own
    // box doesn't resize when children reflow (e.g. favicon load).
    const observeChildren = () => {
      for (const child of Array.from(element.children)) {
        ro.observe(child)
      }
    }
    observeChildren()

    const mo = new MutationObserver(() => {
      observeChildren()
      check()
    })
    mo.observe(element, { childList: true })

    return () => {
      ro.disconnect()
      mo.disconnect()
    }
  }, deps)

  return hasOverflow
}
