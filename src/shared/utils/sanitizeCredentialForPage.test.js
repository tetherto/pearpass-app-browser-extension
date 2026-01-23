import { sanitizeCredentialForPage } from './sanitizeCredentialForPage'

describe('sanitizeCredentialForPage', () => {
  test('should remove _privateKeyBuffer from credential', () => {
    const credential = {
      id: 'cred-123',
      publicKey: 'public-key-data',
      _privateKeyBuffer: 'SENSITIVE_PRIVATE_KEY'
    }

    const result = sanitizeCredentialForPage(credential)

    expect(result).toEqual({
      id: 'cred-123',
      publicKey: 'public-key-data'
    })
    expect(result._privateKeyBuffer).toBeUndefined()
  })

  test('should remove _userId from credential', () => {
    const credential = {
      id: 'cred-123',
      publicKey: 'public-key-data',
      _userId: 'user-456'
    }

    const result = sanitizeCredentialForPage(credential)

    expect(result).toEqual({
      id: 'cred-123',
      publicKey: 'public-key-data'
    })
    expect(result._userId).toBeUndefined()
  })

  test('should remove both _privateKeyBuffer and _userId', () => {
    const credential = {
      id: 'cred-123',
      publicKey: 'public-key-data',
      _privateKeyBuffer: 'SENSITIVE_PRIVATE_KEY',
      _userId: 'user-456',
      type: 'public-key'
    }

    const result = sanitizeCredentialForPage(credential)

    expect(result).toEqual({
      id: 'cred-123',
      publicKey: 'public-key-data',
      type: 'public-key'
    })
    expect(result._privateKeyBuffer).toBeUndefined()
    expect(result._userId).toBeUndefined()
  })

  test('should preserve all other fields', () => {
    const credential = {
      id: 'cred-123',
      rawId: 'raw-id',
      response: {
        clientDataJSON: 'client-data',
        authenticatorData: 'auth-data',
        signature: 'signature-data'
      },
      type: 'public-key',
      _privateKeyBuffer: 'SENSITIVE',
      _userId: 'user-456'
    }

    const result = sanitizeCredentialForPage(credential)

    expect(result).toEqual({
      id: 'cred-123',
      rawId: 'raw-id',
      response: {
        clientDataJSON: 'client-data',
        authenticatorData: 'auth-data',
        signature: 'signature-data'
      },
      type: 'public-key'
    })
  })

  test('should handle credential without sensitive fields', () => {
    const credential = {
      id: 'cred-123',
      publicKey: 'public-key-data',
      type: 'public-key'
    }

    const result = sanitizeCredentialForPage(credential)

    expect(result).toEqual({
      id: 'cred-123',
      publicKey: 'public-key-data',
      type: 'public-key'
    })
  })

  test('should return null when credential is null', () => {
    const result = sanitizeCredentialForPage(null)
    expect(result).toBeNull()
  })

  test('should return undefined when credential is undefined', () => {
    const result = sanitizeCredentialForPage(undefined)
    expect(result).toBeUndefined()
  })

  test('should handle empty object', () => {
    const credential = {}
    const result = sanitizeCredentialForPage(credential)
    expect(result).toEqual({})
  })

  test('should not mutate the original credential object', () => {
    const credential = {
      id: 'cred-123',
      publicKey: 'public-key-data',
      _privateKeyBuffer: 'SENSITIVE',
      _userId: 'user-456'
    }

    const original = { ...credential }
    sanitizeCredentialForPage(credential)

    expect(credential).toEqual(original)
    expect(credential._privateKeyBuffer).toBe('SENSITIVE')
    expect(credential._userId).toBe('user-456')
  })

  test('should handle nested objects correctly', () => {
    const credential = {
      id: 'cred-123',
      _privateKeyBuffer: 'SENSITIVE',
      _userId: 'user-456',
      response: {
        clientDataJSON: 'data',
        nested: {
          deep: 'value'
        }
      }
    }

    const result = sanitizeCredentialForPage(credential)

    expect(result).toEqual({
      id: 'cred-123',
      response: {
        clientDataJSON: 'data',
        nested: {
          deep: 'value'
        }
      }
    })
    expect(result.response.nested.deep).toBe('value')
  })

  test('should handle ArrayBuffer and other complex types', () => {
    const arrayBuffer = new ArrayBuffer(8)
    const credential = {
      id: 'cred-123',
      rawId: arrayBuffer,
      _privateKeyBuffer: 'SENSITIVE',
      _userId: 'user-456'
    }

    const result = sanitizeCredentialForPage(credential)

    expect(result).toEqual({
      id: 'cred-123',
      rawId: arrayBuffer
    })
    expect(result.rawId).toBe(arrayBuffer)
  })
})
