import { isPasswordChangeReminderDisabled } from './isPasswordChangeReminderDisabled'
import { LOCAL_STORAGE_KEYS } from '../constants/storage'

const KEY = LOCAL_STORAGE_KEYS.PASSWORD_CHANGE_REMINDER_ENABLED

describe('isPasswordChangeReminderDisabled', () => {
  afterEach(() => {
    localStorage.clear()
  })

  it('returns true when the key is set to "false"', () => {
    localStorage.setItem(KEY, 'false')
    expect(isPasswordChangeReminderDisabled()).toBe(true)
  })

  it('returns false when the key is set to "true"', () => {
    localStorage.setItem(KEY, 'true')
    expect(isPasswordChangeReminderDisabled()).toBe(false)
  })

  it('returns false when the key is not set', () => {
    expect(isPasswordChangeReminderDisabled()).toBe(false)
  })

  it('returns false when the key has an arbitrary value', () => {
    localStorage.setItem(KEY, 'disabled')
    expect(isPasswordChangeReminderDisabled()).toBe(false)
  })
})
