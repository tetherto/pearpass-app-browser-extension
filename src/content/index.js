import { RECORD_TYPES } from 'pearpass-lib-vault'

import { IFRAME_TYPES } from './constants/iframe'
import { LOGO_PADDING, LOGO_SIZE } from './constants/styles'
import { createIframe } from './utils/createIframe'
import { findLoginForms } from './utils/findLoginForms'
import { findSelectOptionValue } from './utils/findSelectOptionValue'
import { getField } from './utils/getField'
import { isIdentityField } from './utils/isIdentityField'
import { isPasswordField } from './utils/isPasswordField'
import { isUsernameField } from './utils/isUsernameField'
import { triggerInputEvents } from './utils/triggerInputEvents'
import { CONTENT_MESSAGE_TYPES } from '../shared/constants/nativeMessaging'
import {
  getAutofillEnabled,
  onAutofillEnabledChanged
} from '../shared/utils/autofillSetting'
import { logger } from '../shared/utils/logger'

const activeIframes = new Set()

let isAutoFillEnabled = true

getAutofillEnabled().then((isEnabled) => {
  isAutoFillEnabled = isEnabled
})

onAutofillEnabledChanged((isEnabled) => {
  isAutoFillEnabled = isEnabled
})

// Listeners

window.addEventListener('scroll', removeIframesOnScrollOrResize)
window.addEventListener('resize', removeIframesOnScrollOrResize)

window.addEventListener('focusin', (event) => {
  if (isAutoFillEnabled) {
    toggleLogoOnFocus(event)
    handlePasswordSuggestionPopup(event)
    handlePasswordSuggestionOutsideClick(event)
  }
})

window.addEventListener('click', (event) => {
  if (isAutoFillEnabled) {
    hideLogoOnOutsideClick(event)
    hideAutofillOnOutsideClick(event)
    handlePasswordSuggestionOutsideClick(event)
  }
  detectSubmitClick(event)
})

window.addEventListener('message', (event) => {
  if (event.source === window) {
    handleWindowEvent(event)
    return
  }

  handleIframeEvent(event)
})

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === CONTENT_MESSAGE_TYPES.SAVED_PASSKEY) {
    window.postMessage(
      {
        type: msg.type,
        requestId: msg.requestId,
        recordId: msg.recordId,
        credential: msg.credential
      },
      '*'
    )
  }

  if (msg.type === CONTENT_MESSAGE_TYPES.CREATE_THIRD_PARTY_KEY) {
    window.postMessage(
      {
        type: msg.type,
        requestId: msg.requestId
      },
      '*'
    )
  }

  if (msg.type === CONTENT_MESSAGE_TYPES.GOT_PASSKEY) {
    window.postMessage(
      {
        type: msg.type,
        requestId: msg.requestId,
        credential: msg.credential
      },
      '*'
    )
  }

  if (msg.type === CONTENT_MESSAGE_TYPES.GET_THIRD_PARTY_KEY) {
    window.postMessage(
      {
        type: msg.type,
        requestId: msg.requestId
      },
      '*'
    )
  }

  if (msg.type === CONTENT_MESSAGE_TYPES.AUTOFILL_FROM_ACTION) {
    if (!isAutoFillEnabled) {
      return
    }
    const { recordType, data: recordData } = msg

    switch (recordType) {
      case RECORD_TYPES.LOGIN:
        handleAutofillLogin({
          username: recordData.username,
          password: recordData.password
        })
        break
      case RECORD_TYPES.IDENTITY:
        handleAutofillIdentity({
          name: recordData.name,
          email: recordData.email,
          phoneNumber: recordData.phoneNumber,
          address: recordData.address,
          zip: recordData.zip,
          city: recordData.city,
          region: recordData.region,
          country: recordData.country
        })
        break
    }
  }
})

// Password generator
function handlePasswordSuggestionPopup(event) {
  const element = event.target

  if (!isPasswordField(element)) {
    return
  }

  const rect = element.getBoundingClientRect()

  showIframe(IFRAME_TYPES.passwordSuggestion, {
    element: element,
    data: {
      url: window.location.href,
      recordType: getRecordTypeByField(element)
    },
    styles: {
      top: `${rect.top + rect.height + 5}px`,
      left: `${rect.left + rect.width / 2}px`,
      width: '300px',
      height: '55px',
      borderRadius: '12px'
    }
  })
}

function handlePasswordSuggestionOutsideClick(event) {
  const element = event.target

  const passwordSuggestionIframeData = getIframeData(
    IFRAME_TYPES.passwordSuggestion
  )

  if (
    !passwordSuggestionIframeData ||
    element.isSameNode(passwordSuggestionIframeData?.iframe) ||
    element.isSameNode(passwordSuggestionIframeData?.element)
  ) {
    return
  }

  removeIframe(passwordSuggestionIframeData)
}

function handleInsertPassword({ password, iframeData }) {
  if (iframeData.element) {
    iframeData.element.value = password
    triggerInputEvents(iframeData.element, ['input', 'change', 'blur'])
  }

  removeIframe(iframeData)

  const logoIframeData = getIframeData(IFRAME_TYPES.logo)

  if (logoIframeData) {
    removeIframe(logoIframeData)
  }
}

// AutoFill
function showAutofillPopup({ positions, recordType }) {
  if (!isAutoFillEnabled) {
    return
  }
  const { top, left } = positions

  showIframe(IFRAME_TYPES.autofill, {
    data: {
      url: window.location.href,
      recordType: recordType
    },
    styles: {
      top: `${top}px`,
      left: `${left}px`,
      width: '300px',
      height: '200px',
      borderRadius: '12px'
    }
  })
}

function handleAutofillLogin({ username, password }) {
  if (!isAutoFillEnabled) {
    return
  }
  const { element: usernameField } = getField(['username', 'email'])
  const { element: passwordField } = getField(['password'])

  if (usernameField) {
    usernameField.value = username
    triggerInputEvents(usernameField, ['input', 'change', 'blur'])
  }

  if (passwordField) {
    passwordField.value = password
    triggerInputEvents(passwordField, ['input', 'change', 'blur'])
  }
}

const handleAutoFillLoginFromPopup = ({ username, password, iframeData }) => {
  handleAutofillLogin({ username, password })

  removeIframe(iframeData)

  const logoIframeData = getIframeData(IFRAME_TYPES.logo)

  if (logoIframeData) {
    removeIframe(logoIframeData)
  }
}

function handleAutofillIdentity({
  name,
  email,
  phoneNumber,
  address,
  zip,
  city,
  region,
  country
}) {
  if (!isAutoFillEnabled) {
    return
  }
  const { element: nameField } = getField(['name', 'full name', 'first name'])
  const { element: emailField } = getField(['email'])
  const { element: phoneField } = getField(['phone', 'tel', 'mobile'])
  const { element: addressField } = getField(['address'])
  const { element: zipField } = getField(['zip', 'postal-code'])
  const { element: cityField, type: cityFieldType } = getField(['city'])
  const { element: regionField, type: regionFieldType } = getField([
    'region',
    'state'
  ])
  const { element: countryField, type: countryFieldType } = getField([
    'country'
  ])

  if (nameField) {
    nameField.value = name
  }

  if (emailField) {
    emailField.value = email
  }

  if (phoneField) {
    phoneField.value = phoneNumber
  }

  if (addressField) {
    addressField.value = address
  }

  if (zipField) {
    zipField.value = zip
  }

  if (cityField) {
    if (cityFieldType === 'select') {
      cityField.value = findSelectOptionValue(cityField, city)
      return
    }

    cityField.value = city
  }

  if (regionField) {
    if (regionFieldType === 'select') {
      regionField.value = findSelectOptionValue(regionField, region)
      return
    }

    regionField.value = region
  }

  if (countryField) {
    if (countryFieldType === 'select') {
      countryField.value = findSelectOptionValue(countryField, country)
      return
    }
    countryField.value = country
  }
}

const handleAutoFillIdentityFromPopup = ({
  name,
  email,
  phoneNumber,
  address,
  zip,
  city,
  region,
  country,
  iframeData
}) => {
  handleAutofillIdentity({
    name,
    email,
    phoneNumber,
    address,
    zip,
    city,
    region,
    country
  })

  removeIframe(iframeData)
}

function hideAutofillOnOutsideClick(event) {
  const element = event.target

  const autofillIframeData = getIframeData(IFRAME_TYPES.autofill)

  if (!autofillIframeData || element.isSameNode(autofillIframeData?.iframe)) {
    return
  }

  removeIframe(autofillIframeData)
}

// Login detection

function onSubmit({ username, password }) {
  if (!username && !password) {
    return
  }

  const data = { url: window.location.href, username, password }

  chrome.runtime.sendMessage({
    type: IFRAME_TYPES.login,
    data: data
  })

  if (username && password) {
    showIframe(IFRAME_TYPES.login, {
      data,
      styles: {
        top: '20px',
        right: '20px'
      }
    })
  }
}

function initFormListener(form) {
  form.addEventListener('submit', async () => {
    const username = form.querySelector(
      'input[type="text"], input[type="email"]'
    )?.value

    const password = form.querySelector('input[type="password"]')?.value

    onSubmit({ username, password })
  })
}

function detectSubmitClick(event) {
  const btn = event.target.closest(
    'button, input[type="button"], input[type="submit"]'
  )

  if (!btn) {
    return
  }

  const label = (
    btn.innerText ||
    btn.getAttribute('aria-label') ||
    ''
  ).toLowerCase()

  if (/(next|sign in|login|submit)/.test(label)) {
    setTimeout(() => {
      const { element: userNameField } = getField(['username', 'email'])
      const { element: passwordField } = getField(['password'])

      const username = userNameField?.value
      const password = passwordField?.value

      onSubmit({ username, password })
    }, 10)
  }
}

const observer = new MutationObserver(() => {
  findLoginForms().forEach(initFormListener)
})

observer.observe(document, { childList: true, subtree: true })

chrome.runtime
  .sendMessage({
    type: 'getPendingLogin'
  })
  .then((msg) => {
    if (
      msg.type === 'pendingLogin' &&
      msg.data?.username &&
      msg.data?.password
    ) {
      showIframe(IFRAME_TYPES.login, {
        data: msg.data,
        styles: {
          top: '20px',
          right: '20px'
        }
      })
      return
    }
  })
  .catch((err) => {
    logger.error('Error getting pending login:', err)
  })

// Display Pearpass logo

function showLogoForField(field) {
  if (!isAutoFillEnabled) {
    return
  }
  const rect = field.getBoundingClientRect()

  const iframe = showIframe(IFRAME_TYPES.logo, {
    element: field,
    data: {
      url: window.location.href,
      recordType: getRecordTypeByField(field)
    },
    styles: {
      top: `${rect.top + (rect.height - LOGO_SIZE) / 2}px`,
      left: `${rect.left + rect.width - LOGO_SIZE - LOGO_PADDING}px`,
      width: `${LOGO_SIZE}px`,
      height: `${LOGO_SIZE}px`,
      borderRadius: '50%'
    }
  })

  return iframe
}

function hideLogoOnOutsideClick(event) {
  const element = event.target

  const logoIframeData = getIframeData(IFRAME_TYPES.logo)

  if (
    !logoIframeData ||
    element.isSameNode(logoIframeData?.element) ||
    element.isSameNode(logoIframeData?.iframe)
  ) {
    return
  }

  removeIframe(logoIframeData)
}

function getRecordTypeByField(field) {
  if (isUsernameField(field) || isPasswordField(field)) {
    return 'login'
  }

  if (isIdentityField(field)) {
    return 'identity'
  }

  return null
}

function isAcceptedField(field) {
  return (
    isUsernameField(field) || isPasswordField(field) || isIdentityField(field)
  )
}

function toggleLogoOnFocus(event) {
  const element = event.target

  const logoIframeData = getIframeData(IFRAME_TYPES.logo)

  if (logoIframeData) {
    removeIframe(logoIframeData)
  }

  if (!(element instanceof HTMLInputElement)) {
    return
  }

  if (isAcceptedField(element)) {
    showLogoForField(element)
  }
}

document.querySelectorAll('input').forEach((input) => {
  if (input.autofocus && isAcceptedField(input)) {
    showLogoForField(input)
  }
})

// Iframe management

function showIframe(iframeType, { element, data, styles }) {
  const id = Math.random().toString(36).substring(2, 15)

  const iframe = createIframe({
    styles: styles,
    options: { id: id, type: iframeType }
  })

  document.body.appendChild(iframe)

  activeIframes.add({
    id: id,
    type: iframeType,
    iframe: iframe,
    element: element,
    styles: styles,
    data: data
  })

  return iframe
}

function removeIframe(iframeData) {
  iframeData.iframe.remove()
  activeIframes.delete(iframeData)
}

function removeIframesOnScrollOrResize() {
  activeIframes.forEach((iframeData) => {
    if (iframeData.type === IFRAME_TYPES.logo) {
      removeIframe(iframeData)
    }
  })
}

function getIframeData(type) {
  return Array.from(activeIframes).find(
    (iframeData) => iframeData.type === type
  )
}

function sendDataToIframe({ iframeType, iframeData }) {
  const extensionOrigin = chrome.runtime.getURL('').slice(0, -1)

  iframeData?.iframe?.contentWindow?.postMessage(
    {
      type: iframeType,
      data: iframeData.data
    },
    extensionOrigin
  )
}

function updateIframeStyles({ msg, iframeData }) {
  Object.entries(msg?.data.style).forEach(([key, value]) => {
    iframeData.iframe.style[key] = value
  })
}

function handleWindowEvent(event) {
  const data = event.data

  if (data.source !== 'pearpass') {
    return
  }

  const type = data.type

  if (type === 'createPasskey') {
    chrome.runtime.sendMessage({
      type: 'createPasskey',
      requestId: data.requestId,
      publicKey: data.publicKey,
      requestOrigin: data.requestOrigin
    })
  }

  if (type === 'getPasskey') {
    chrome.runtime.sendMessage({
      type: 'getPasskey',
      requestId: data.requestId,
      publicKey: data.publicKey,
      requestOrigin: data.requestOrigin
    })
  }
}

const handleIframeEvent = (event) => {
  const msg = event.data
  const eventType = msg?.type
  const iframeId = msg?.data?.iframeId
  const iframeType = msg?.data?.iframeType

  const iframeData = Array.from(activeIframes).find(
    (iframeData) => iframeData.id === iframeId
  )

  const extensionOrigin = chrome.runtime.getURL('').slice(0, -1)

  if (
    !eventType ||
    event.origin !== extensionOrigin ||
    event.source !== iframeData?.iframe?.contentWindow
  ) {
    return
  }

  if (eventType === 'ready') {
    sendDataToIframe({
      iframeType: iframeType,
      iframeData: iframeData
    })
    return
  }

  if (eventType === 'setStyles') {
    updateIframeStyles({ msg, iframeData })
    return
  }

  if (eventType === 'showAutofillPopup') {
    const iframeRect = iframeData.iframe.getBoundingClientRect()

    const logoIframeData = getIframeData(IFRAME_TYPES.logo)

    showAutofillPopup({
      recordType: logoIframeData?.data?.recordType,
      positions: {
        top: iframeRect.top + iframeRect.height + 5,
        left: iframeRect.left
      }
    })
    return
  }

  if (eventType === 'autofillLogin') {
    const { username, password } = msg.data

    handleAutoFillLoginFromPopup({
      username,
      password,
      iframeData
    })
    return
  }

  if (eventType === 'autofillIdentity') {
    const { name, email, phoneNumber, address, zip, city, region, country } =
      msg.data

    handleAutoFillIdentityFromPopup({
      name,
      email,
      phoneNumber,
      address,
      zip,
      city,
      region,
      country,
      iframeData
    })
    return
  }

  if (eventType === 'insertPassword') {
    const { password } = msg.data

    handleInsertPassword({
      password,
      iframeData
    })
    return
  }

  if (eventType === 'close') {
    removeIframe(iframeData)
    return
  }
}
