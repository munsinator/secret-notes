'use strict'

const crypto = require('node:crypto')
const { encryptNote, decryptNote } = require('../../lib/crypto')

module.exports = async function notesRoutes (fastify, opts) {
  fastify.post('/', async function createNote (request, reply) {
    const { note, key } = request.body || {}

    if (typeof note !== 'string' || note.trim().length === 0) {
      return reply.code(400).send({
        error: 'note is required'
      })
    }

    if (typeof key !== 'string' || key.length === 0) {
      return reply.code(400).send({
        error: 'key is required'
      })
    }

    const encryptedData = encryptNote(note, key)

    const noteRecord = {
      id: crypto.randomUUID(),
      ...encryptedData
    }

    await fastify.notesRepository.createNote(noteRecord)

    return reply.code(201).send({
      id: noteRecord.id
    })
  })

  fastify.get('/:id', async function getNote (request, reply) {
    const { id } = request.params
    const { key } = request.query || {}

    if (typeof key !== 'string' || key.length === 0) {
      return reply.code(400).send({
        error: 'key is required'
      })
    }

    const noteRecord = await fastify.notesRepository.getNoteById(id)

    if (!noteRecord) {
      return reply.code(404).send({
        error: 'note not found'
      })
    }

    try {
      const decryptedNote = decryptNote(
        noteRecord.encrypted_note,
        key,
        noteRecord.iv,
        noteRecord.salt,
        noteRecord.auth_tag
      )

      return reply.code(200).send({
        id,
        note: decryptedNote
      })
    } catch (error) {
      return reply.code(401).send({
        error: 'invalid key'
      })
    }
  })
}
