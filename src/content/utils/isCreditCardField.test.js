import { isCreditCardField } from './isCreditCardField'

describe('isCreditCardField', () => {
  let inputElement

  beforeEach(() => {
    inputElement = document.createElement('input')
  })

  it('should return true for an input with autocomplete "cc-number"', () => {
    inputElement.setAttribute('autocomplete', 'cc-number')
    expect(isCreditCardField(inputElement)).toBe(true)
  })

  it('should return true for an input with autocomplete "cc-name"', () => {
    inputElement.setAttribute('autocomplete', 'cc-name')
    expect(isCreditCardField(inputElement)).toBe(true)
  })

  it('should return true for an input with autocomplete "cc-exp"', () => {
    inputElement.setAttribute('autocomplete', 'cc-exp')
    expect(isCreditCardField(inputElement)).toBe(true)
  })

  it('should return true for an input with autocomplete "cc-csc"', () => {
    inputElement.setAttribute('autocomplete', 'cc-csc')
    expect(isCreditCardField(inputElement)).toBe(true)
  })

  it('should return true for an input with name containing "cardnumber"', () => {
    inputElement.name = 'cardnumber'
    expect(isCreditCardField(inputElement)).toBe(true)
  })

  it('should return true for an input with id containing "cardholder"', () => {
    inputElement.id = 'cardholderName'
    expect(isCreditCardField(inputElement)).toBe(true)
  })

  it('should return true for an input with placeholder "Name on card"', () => {
    inputElement.placeholder = 'Name on card'
    expect(isCreditCardField(inputElement)).toBe(true)
  })

  it('should return true for an input with placeholder "CVV"', () => {
    inputElement.placeholder = 'CVV'
    expect(isCreditCardField(inputElement)).toBe(true)
  })

  it('should return true for an input with name containing "security code"', () => {
    inputElement.name = 'security code'
    expect(isCreditCardField(inputElement)).toBe(true)
  })

  it('should return true for an input with placeholder containing "expiration"', () => {
    inputElement.placeholder = 'Expiration date'
    expect(isCreditCardField(inputElement)).toBe(true)
  })

  it('should return false for an unrelated input', () => {
    inputElement.name = 'unrelatedField'
    inputElement.id = 'randomId'
    inputElement.placeholder = 'Random Placeholder'
    expect(isCreditCardField(inputElement)).toBe(false)
  })

  it('should return false for an input with no identifying attributes', () => {
    expect(isCreditCardField(inputElement)).toBe(false)
  })
})
