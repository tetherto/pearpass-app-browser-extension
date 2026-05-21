import './contentI18n.js'
import { t } from '@lingui/core/macro'
import {
  checkPasswordStrength,
  PASSWORD_STRENGTH
} from '@tetherto/pearpass-utils-password-check'

import {
  gppBadSvgHtml,
  gppMaybeSvgHtml,
  pearpassLogoSvgHtml,
  verifiedUserSvgHtml
} from './passwordStrengthInlineIcons'

/** @type {WeakMap<HTMLElement, { el: HTMLDivElement; cleanup: () => void }>} */
const activeByField = new WeakMap()

function getDisplayLabel(type) {
  if (type === PASSWORD_STRENGTH.SAFE) {
    return t`Strong`
  }
  if (type === PASSWORD_STRENGTH.WEAK) {
    return t`Decent`
  }
  return t`Vulnerable`
}

/**
 * All hex values for the in-field strength pill (content script cannot use UI kit
 * theme CSS). Single source for a palette refresh.
 */
const STRENGTH_COLORS = {
  /** Lock icon in the green (Strong/Decent) states */
  lockLime: '#C0D836',
  /** Pocket + status strip (Strong / Decent) */
  pocketGreen: '#15180E',
  statusGreen: '#212814',
  safeAccent: '#BEE35A',
  weakAccent: '#D7D245',
  /** Vulnerable */
  pocketDark: '#141414',
  statusDark: '#1c1c1c',
  vulnerableAccent: '#D13B3D'
}

const STRENGTH_TYPOGRAPHY = {
  fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
  labelFontSizePx: 12
}

const THEME = {
  [PASSWORD_STRENGTH.SAFE]: {
    pocketBg: STRENGTH_COLORS.pocketGreen,
    statusBg: STRENGTH_COLORS.statusGreen,
    accent: STRENGTH_COLORS.safeAccent
  },
  [PASSWORD_STRENGTH.WEAK]: {
    pocketBg: STRENGTH_COLORS.pocketGreen,
    statusBg: STRENGTH_COLORS.statusGreen,
    accent: STRENGTH_COLORS.weakAccent
  },
  [PASSWORD_STRENGTH.VULNERABLE]: {
    pocketBg: STRENGTH_COLORS.pocketDark,
    statusBg: STRENGTH_COLORS.statusDark,
    accent: STRENGTH_COLORS.vulnerableAccent
  }
}

const GAP_PILL_EYE = 8
const PILL_H = 20
const POSITION_LEFT_NUDGE = 8

const PEARPASS_LOGO_SVG_HTML = pearpassLogoSvgHtml(STRENGTH_COLORS.lockLime)

/**
 * @param {HTMLInputElement} input
 * @param {DOMRect} inputRect
 * @returns {number | null} viewport X of the **left** edge of the rightmost likely
 *  trailing control (e.g. show-password), or null if none found
 */
function findRightmostTrailingControlLeft(input, inputRect) {
  const { left: rL, right: rR, top: rT, bottom: rB, width: rW } = inputRect
  const rightZoneStart = rL + rW * 0.22
  let bestLeft = null
  let bestRight = -1

  const roots = []
  let p = input.parentElement
  for (let d = 0; d < 4 && p; d++) {
    roots.push(p)
    p = p.parentElement
  }

  for (const root of roots) {
    if (!root) continue
    const nodes = root.querySelectorAll(
      'button, [role="button"], a[role="button"]'
    )
    for (const node of nodes) {
      if (!(node instanceof HTMLElement)) continue
      if (node === input || (input.contains && input.contains(node))) continue
      if (node.querySelector && node.querySelector('input') === input) continue

      const b = node.getBoundingClientRect()
      if (b.width < 4 || b.height < 4) continue
      if (b.top > rB + 3 || b.bottom < rT - 3) continue
      if (b.left < rightZoneStart) continue
      if (b.left > rR + 32) continue
      if (b.width > 72 || b.height > 72) continue

      const al = (node.getAttribute('aria-label') || '').toLowerCase()
      const title = (node.getAttribute('title') || '').toLowerCase()
      const cls = String(node.className || '').toLowerCase()
      const textHint =
        /show|hide|reveal|visibility|password|eye|display|toggle/.test(
          `${al} ${title} ${cls}`
        )
      const smallIconInTrail =
        b.width <= 44 && b.height <= 44 && b.left > rL + rW * 0.45
      if (!textHint && !smallIconInTrail) continue

      if (b.right > bestRight) {
        bestRight = b.right
        bestLeft = b.left
      }
    }
  }

  if (bestRight < 0) return null
  if (bestLeft >= rR - 1) return null
  return bestLeft
}

/**
 * Renders a pill **inside the right area** of the page password field (fixed overlay
 * aligned to the input, with extra padding on the field). Uses
 * `checkPasswordStrength` from `@tetherto/pearpass-utils-password-check` (same as
 * `InputFieldPassword` / `PasswordGenerator` random path).
 * @param {HTMLInputElement} inputElement
 * @param {string} password
 */
export function showPasswordStrengthNearField(inputElement, password) {
  if (!inputElement || !password?.length) {
    return
  }

  const existing = activeByField.get(inputElement)
  if (existing) {
    existing.cleanup()
  }

  const result = checkPasswordStrength(password)
  const { type, strengthType } = result
  if (!strengthType || !type) {
    return
  }

  const label = getDisplayLabel(type)
  const colors = THEME[type] || THEME[PASSWORD_STRENGTH.VULNERABLE]
  const c = colors.accent
  const lockSvg = PEARPASS_LOGO_SVG_HTML
  let statusIconSvg
  if (type === PASSWORD_STRENGTH.SAFE) {
    statusIconSvg = verifiedUserSvgHtml(c)
  } else if (type === PASSWORD_STRENGTH.WEAK) {
    statusIconSvg = gppMaybeSvgHtml(c)
  } else {
    statusIconSvg = gppBadSvgHtml(c)
  }
  const labelFontSizePx = STRENGTH_TYPOGRAPHY.labelFontSizePx

  const el = document.createElement('div')
  el.setAttribute('data-pearpass-password-strength', '1')
  el.setAttribute('role', 'status')
  el.setAttribute('aria-live', 'polite')
  el.innerHTML = [
    '<div style="display:flex;align-items:center;border-radius: 100px;justify-content:center;flex-shrink:0;padding:4px 2px 4px 5px;background:',
    colors.pocketBg,
    '">',
    lockSvg,
    '</div><div style="display:flex;border-radius: 100px;align-items:center;flex:1;flex-shrink:0;min-width:0;align-self:stretch;background:',
    colors.statusBg,
    ';padding:4px 7px 4px 4px;color:',
    c,
    '">',
    statusIconSvg,
    '<span style="margin-left:4px;white-space:nowrap;font-size:',
    labelFontSizePx,
    'px;font-weight:400;letter-spacing:0.01em">',
    escapeHtml(label),
    '</span></div>'
  ].join('')

  el.style.cssText = [
    'position: fixed',
    'z-index: 2147483646',
    'box-sizing: border-box',
    'display: inline-flex',
    'flex-direction: row',
    'align-items: stretch',
    'height: ' + PILL_H + 'px',
    'min-height: ' + PILL_H + 'px',
    'border-radius: 100px',
    'overflow: hidden',
    'background: ' + colors.pocketBg,
    'font-family: ' + STRENGTH_TYPOGRAPHY.fontFamily,
    'pointer-events: none',
    'line-height: 1'
  ].join(';')

  const initialComputedPadding = getComputedStyle(inputElement).paddingRight
  const basePadding = parseFloat(initialComputedPadding) || 0
  const inlinePaddingBefore = inputElement.style.paddingRight

  const position = () => {
    if (!inputElement.isConnected) {
      cleanup()
      return
    }
    const rect = inputElement.getBoundingClientRect()
    const h = PILL_H
    const top = rect.top + (rect.height - h) / 2
    const w = el.offsetWidth || 120
    const rightInset = 8
    const defaultLeft = rect.right - w - rightInset
    const eyeLeft = findRightmostTrailingControlLeft(inputElement, rect)
    let left = defaultLeft
    if (typeof eyeLeft === 'number') {
      const capped = eyeLeft - GAP_PILL_EYE - w
      left = Math.min(defaultLeft, capped)
    }
    const leftPx = Math.max(0, left + POSITION_LEFT_NUDGE)
    el.style.top = `${Math.max(0, top)}px`
    el.style.left = `${leftPx}px`
    const minPadRight = Math.max(
      basePadding,
      Math.ceil(rect.right - leftPx + 4)
    )
    inputElement.style.paddingRight = `${minPadRight}px`
  }

  const onScroll = () => position()
  const onResize = () => position()
  const onUserInput = () => cleanup()

  function cleanup() {
    window.removeEventListener('scroll', onScroll, true)
    window.removeEventListener('resize', onResize)
    inputElement.removeEventListener('input', onUserInput)
    if (inlinePaddingBefore) {
      inputElement.style.paddingRight = inlinePaddingBefore
    } else {
      inputElement.style.removeProperty('padding-right')
    }
    if (el.parentNode) {
      el.parentNode.removeChild(el)
    }
    if (activeByField.get(inputElement)?.el === el) {
      activeByField.delete(inputElement)
    }
  }

  document.body.appendChild(el)
  requestAnimationFrame(() => {
    position()
    requestAnimationFrame(() => {
      position()
    })
  })

  window.addEventListener('scroll', onScroll, true)
  window.addEventListener('resize', onResize)
  inputElement.addEventListener('input', onUserInput)

  activeByField.set(inputElement, { el, cleanup })
}

/**
 * @param {string} s
 */
function escapeHtml(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
