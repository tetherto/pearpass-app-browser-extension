import { renderHook } from '@testing-library/react'
import { RECORD_TYPES } from '@tetherto/pearpass-lib-vault'

import { useRecordMenuItems } from './useRecordMenuItems'
import { RECORD_COLOR_BY_TYPE } from '../constants/recordColorByType'
import { RECORD_ICON_BY_TYPE } from '../constants/recordIconByType'

jest.mock('@lingui/core/macro', () => {
  const t = jest.fn((text) => text)
  return { t }
})

jest.mock('@tetherto/pearpass-lib-vault', () => ({
  RECORD_TYPES: {
    LOGIN: 'login',
    IDENTITY: 'identity',
    CREDIT_CARD: 'creditCard',
    NOTE: 'note',
    CUSTOM: 'custom'
  }
}))

describe('useRecordMenuItems', () => {
  it('should return menu items with correct structure', () => {
    const { result } = renderHook(() => useRecordMenuItems())

    expect(result.current).toHaveProperty('menuItems')
    expect(result.current).toHaveProperty('popupItems')
    expect(result.current).toHaveProperty('defaultItems')
  })

  it('should have "All" as first menuItem', () => {
    const { result } = renderHook(() => useRecordMenuItems())

    expect(result.current.menuItems[0].type).toBe('all')
  })

  it('should have default items in menuItems after "All"', () => {
    const { result } = renderHook(() => useRecordMenuItems())

    expect(result.current.menuItems[1].type).toBe(RECORD_TYPES.LOGIN)
    expect(result.current.menuItems[2].type).toBe(RECORD_TYPES.IDENTITY)
    expect(result.current.menuItems[3].type).toBe(RECORD_TYPES.CREDIT_CARD)
    expect(result.current.menuItems[4].type).toBe(RECORD_TYPES.WIFI_PASSWORD)
    expect(result.current.menuItems[5].type).toBe(RECORD_TYPES.PASS_PHRASE)
    expect(result.current.menuItems[6].type).toBe(RECORD_TYPES.NOTE)
    expect(result.current.menuItems[7].type).toBe(RECORD_TYPES.CUSTOM)
  })

  it('should include icons and colors in default items', () => {
    const { result } = renderHook(() => useRecordMenuItems())

    const loginItem = result.current.defaultItems.find(
      (item) => item.type === RECORD_TYPES.LOGIN
    )
    expect(loginItem.icon).toBe(RECORD_ICON_BY_TYPE.login)
    expect(loginItem.color).toBe(RECORD_COLOR_BY_TYPE.login)
  })

  it('should include "Password" in popupItems but not in defaultItems', () => {
    const { result } = renderHook(() => useRecordMenuItems())

    const passwordInPopup = result.current.popupItems.find(
      (item) => item.type === 'password'
    )
    const passwordInDefault = result.current.defaultItems.find(
      (item) => item.type === 'password'
    )

    expect(passwordInPopup).toBeTruthy()
    expect(passwordInPopup.type).toBe('password')
    expect(passwordInDefault).toBeFalsy()
  })
})
