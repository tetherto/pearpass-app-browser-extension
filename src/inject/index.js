import { PASSKEY_SUPPORT_ENABLED } from '../../packages/pearpass-lib-constants/src/constants/flags'
import { arrayBufferToBase64Url } from '../shared/utils/arrayBufferToBase64Url'
import { base64UrlToArrayBuffer } from '../shared/utils/base64UrlToArrayBuffer'
import { logger } from '../shared/utils/logger'
;(() => {
  if (!PASSKEY_SUPPORT_ENABLED) {
    return
  }

  const { credentials: nativeCreds } = navigator
  const nativeCreate = nativeCreds.create.bind(nativeCreds)
  const nativeGet = nativeCreds.get.bind(nativeCreds)

  const generateRequestId = () => `${Date.now()}-${Math.random()}`

  const awaitMessage = (filterFn) =>
    new Promise((resolve) => {
      const handler = (event) => {
        if (event.source !== window) return

        const { data } = event
        if (filterFn(data)) {
          window.removeEventListener('message', handler)
          resolve(data)
        }
      }
      window.addEventListener('message', handler)
    })

  const createCred = async (options) => {
    const requestId = generateRequestId()
    const publicKey = {
      ...options.publicKey,
      challenge: arrayBufferToBase64Url(options.publicKey.challenge),
      user: {
        ...options.publicKey.user,
        id: arrayBufferToBase64Url(options.publicKey.user.id)
      }
    }

    window.postMessage(
      {
        source: 'pearpass',
        type: 'createPasskey',
        requestId,
        tabId: options.tabId,
        publicKey,
        requestOrigin: window.location.origin
      },
      '*'
    )

    const responsePromise = awaitMessage(
      (data) =>
        (data?.type === 'savedPasskey' ||
          data?.type === 'createThirdPartyKey') &&
        data?.requestId === requestId
    )

    const { recordId, credential, type } = await responsePromise

    if (type === 'createThirdPartyKey') {
      return await nativeCreate(options)
    } else if (!recordId || !credential) {
      logger.error('Could not create pass key')
      return null
    } else {
      return createPublicKeyCredentialFromJson(credential)
    }
  }

  const getCred = async function get(options) {
    const requestId = generateRequestId()
    const publicKey = {
      ...options.publicKey,
      challenge: arrayBufferToBase64Url(options.publicKey.challenge)
    }

    window.postMessage(
      {
        source: 'pearpass',
        type: 'getPasskey',
        requestId,
        tabId: options.tabId,
        publicKey,
        requestOrigin: window.location.origin
      },
      '*'
    )

    const responsePromise = awaitMessage(
      (data) =>
        (data?.type === 'gotPasskey' || data?.type === 'getThirdPartyKey') &&
        data?.requestId === requestId
    )

    const { credential = null, type } = await responsePromise

    if (type === 'getThirdPartyKey') {
      return await nativeGet(options)
    } else if (!credential) {
      logger.error('Could not get pass key')
      return null
    } else {
      return createPublicKeyCredentialFromJson(credential)
    }
  }

  /**
   * Construct a `PublicKeyCredential` instance from its JSON representation.
   *
   * @param {Object} credentialJson
   * @param {string} credentialJson.id Credential identifier (Base64URL).
   * @param {string} credentialJson.rawId Raw credential ID (Base64URL).
   * @param {Object} credentialJson.response
   * @param {string} credentialJson.response.clientDataJSON Client data JSON (Base64URL).
   * @param {string} [credentialJson.response.attestationObject] Attestation object (Base64URL), if present.
   * @param {string} credentialJson.response.authenticatorData Authenticator data (Base64URL).
   * @param {string} [credentialJson.response.signature] Signature (Base64URL), if present.
   * @param {string} [credentialJson.response.userHandle] User handle (Base64URL), if present.
   * @param {string} credentialJson.response.publicKey COSE public key (Base64URL).
   * @param {number} credentialJson.response.publicKeyAlgorithm COSE algorithm identifier.
   * @param {string[]} [credentialJson.response.transports] Array of authenticator transports.
   * @param {Object} [credentialJson.clientExtensionResults]
   * @param {Object} [credentialJson.clientExtensionResults.credProps] Credential properties extension result.
   * @returns {PublicKeyCredential} A fully-formed `PublicKeyCredential` with decoded fields and native prototypes.
   */
  const createPublicKeyCredentialFromJson = (credentialJson) => {
    const credential = {
      id: credentialJson.id,
      rawId: base64UrlToArrayBuffer(credentialJson.rawId),
      type: 'public-key',
      authenticatorAttachment: 'platform',
      response: {
        clientDataJSON: base64UrlToArrayBuffer(
          credentialJson.response.clientDataJSON
        ),
        attestationObject: credentialJson.response.attestationObject
          ? base64UrlToArrayBuffer(credentialJson.response.attestationObject)
          : null,
        authenticatorData: base64UrlToArrayBuffer(
          credentialJson.response.authenticatorData
        ),
        signature: credentialJson.response.signature
          ? base64UrlToArrayBuffer(credentialJson.response.signature)
          : null,
        userHandle: credentialJson.response.userHandle
          ? base64UrlToArrayBuffer(credentialJson.response.userHandle)
          : null,

        getAuthenticatorData() {
          return this.authenticatorData
        },

        getPublicKey() {
          return base64UrlToArrayBuffer(credentialJson.response.publicKey)
        },

        getPublicKeyAlgorithm() {
          return credentialJson.response.publicKeyAlgorithm
        },

        getTransports() {
          return credentialJson.response.transports
        }
      },
      toJSON: () => credentialJson,
      getClientExtensionResults: () => ({
        credProps: credentialJson.clientExtensionResults.credProps
      })
    }

    // Manually set prototypes to make custom PublicKeyCredential indistinguishable from the native class.
    if (credentialJson.response.attestationObject) {
      // For registration
      Object.setPrototypeOf(
        credential.response,
        AuthenticatorAttestationResponse.prototype
      )
    } else {
      // For authentication
      Object.setPrototypeOf(
        credential.response,
        AuthenticatorAssertionResponse.prototype
      )
    }
    Object.setPrototypeOf(credential, PublicKeyCredential.prototype)

    return credential
  }

  Object.defineProperty(window.navigator, 'credentials', {
    configurable: false,
    enumerable: true,
    writable: false,
    value: {
      ...nativeCreds,
      create: createCred,
      get: getCred
    }
  })
})()
