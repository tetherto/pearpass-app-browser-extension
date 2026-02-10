export const PASSWORD_MATCHERS = [
  'password',
  'pass',
  'pwd',
  'psswd',
  'pw',
  'passwd'
]

/**
 * @param {string[]} keywords
 * @returns {{ element: HTMLInputElement | HTMLSelectElement | null, type: 'input' | 'select' | null }}
 */
export const getField = (keywords) => {
  const lowerKeywords = keywords.map((kw) => kw.toLowerCase())
  const attrNames = ['name', 'id', 'autocomplete', 'placeholder']

  const matches = (element) =>
    attrNames.some((attr) => {
      const value = element.getAttribute(attr)
      return (
        value && lowerKeywords.some((kw) => value.toLowerCase().includes(kw))
      )
    })

  let element = null
  for (const el of document.querySelectorAll('input, select')) {
    if (matches(el)) {
      element = el
      break
    }
  }

  if (!element) {
    element = getFieldByLabelText(keywords)
  }

  if (!element) {
    return { element: null, type: null }
  }

  const tag = element.tagName.toLowerCase()
  return {
    element,
    type: tag === 'input' ? 'input' : tag === 'select' ? 'select' : null
  }
}

/**
 * @param {string[]} keywords
 */
const getFieldByLabelText = (keywords) => {
  const labels = document.querySelectorAll('label')

  for (const label of labels) {
    const labelText = label.textContent?.toLowerCase() || ''

    for (const kw of keywords) {
      if (labelText.includes(kw.toLowerCase())) {
        const nestedField = label.querySelector('input, select')
        if (nestedField) {
          return nestedField
        }

        const forAttr = label.getAttribute('for')
        if (forAttr) {
          const referencedField = document.getElementById(forAttr)
          if (
            referencedField &&
            (referencedField.tagName === 'INPUT' ||
              referencedField.tagName === 'SELECT')
          ) {
            return referencedField
          }
        }
      }
    }
  }

  return null
}
