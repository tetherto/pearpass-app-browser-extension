/**
 *
 * @param {HTMLInputElement} element
 * @returns {boolean}
 */
export const isCreditCardField = (element) => {
  const creditCardFieldPatterns = [
    /cc-(number|name|exp|csc)/i,
    /card.?(number|no)\b/i,
    /cardnumber/i,
    /card.?holder/i,
    /name.?on.?card/i,
    /(security|card).?code/i,
    /\b(cvv|cvc|csc)\b/i,
    /expir/i
  ]

  const labelText = element.labels
    ? Array.from(element.labels)
        .map((label) => label.textContent)
        .join(' ')
    : ''

  const attributes = [
    element.getAttribute('autocomplete') || '',
    element.name || '',
    element.id || '',
    element.placeholder || '',
    labelText
  ]

  return creditCardFieldPatterns.some((pattern) =>
    attributes.some((attr) => pattern.test(attr))
  )
}
