'use strict'

const crypto = require('node:crypto')

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 12
const SALT_LENGTH = 16
const KEY_LENGTH = 32

function validateTextInput (value, fieldName) {
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(`${fieldName} must be a non-empty string`)
  }
}

function deriveKey (password, salt) {
  return crypto.scryptSync(password, salt, KEY_LENGTH)
}

function encryptNote (note, key) {
  validateTextInput(note, 'note')
  validateTextInput(key, 'key')

  const iv = crypto.randomBytes(IV_LENGTH)
  const salt = crypto.randomBytes(SALT_LENGTH)
  const derivedKey = deriveKey(key, salt)

  const cipher = crypto.createCipheriv(ALGORITHM, derivedKey, iv)

  const encrypted = Buffer.concat([
    cipher.update(note, 'utf8'),
    cipher.final()
  ])

  const authTag = cipher.getAuthTag()

  return {
    encrypted_note: encrypted.toString('base64'),
    iv: iv.toString('base64'),
    salt: salt.toString('base64'),
    auth_tag: authTag.toString('base64')
  }
}

function decryptNote (encryptedNote, key, iv, salt, authTag) {
  validateTextInput(encryptedNote, 'encryptedNote')
  validateTextInput(key, 'key')
  validateTextInput(iv, 'iv')
  validateTextInput(salt, 'salt')
  validateTextInput(authTag, 'authTag')

  const derivedKey = deriveKey(key, Buffer.from(salt, 'base64'))

  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    derivedKey,
    Buffer.from(iv, 'base64')
  )

  decipher.setAuthTag(Buffer.from(authTag, 'base64'))

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedNote, 'base64')),
    decipher.final()
  ])

  return decrypted.toString('utf8')
}

module.exports = {
  encryptNote,
  decryptNote
}
