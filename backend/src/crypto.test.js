'use strict'

const { encryptNote, decryptNote } = require('../lib/crypto')

describe('encryption logic', () => {
  test('encryptNote returns encrypted data', () => {
    const result = encryptNote('secret text', 'mypassword')

    expect(result.encrypted_note).toBeDefined()
    expect(result.iv).toBeDefined()
    expect(result.salt).toBeDefined()
    expect(result.auth_tag).toBeDefined()
  })

  test('encrypted note does not contain plaintext', () => {
    const result = encryptNote('secret text', 'mypassword')

    expect(result.encrypted_note).not.toContain('secret text')
  })

  test('decryptNote returns the original note with correct key', () => {
    const encrypted = encryptNote('secret text', 'mypassword')

    const decrypted = decryptNote(
      encrypted.encrypted_note,
      'mypassword',
      encrypted.iv,
      encrypted.salt,
      encrypted.auth_tag
    )

    expect(decrypted).toBe('secret text')
  })

  test('decryptNote throws error with wrong key', () => {
    const encrypted = encryptNote('secret text', 'mypassword')

    expect(() => {
      decryptNote(
        encrypted.encrypted_note,
        'wrongpassword',
        encrypted.iv,
        encrypted.salt,
        encrypted.auth_tag
      )
    }).toThrow()
  })

  test('encrypting same note twice gives different encrypted result', () => {
    const first = encryptNote('same note', 'samekey')
    const second = encryptNote('same note', 'samekey')

    expect(first.encrypted_note).not.toBe(second.encrypted_note)
  })

  test('encryptNote rejects empty key', () => {
    expect(() => {
      encryptNote('secret text', '')
    }).toThrow('key must be a non-empty string')
  })
})
