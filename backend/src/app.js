'use strict'

const Fastify = require('fastify')
const { createMemoryNoteRepository } = require('./lib/memoryNoteRepository')
const notesRoutes = require('./routes/notes')

function createApp () {
  const fastify = Fastify({
    logger: true
  })

  const notesRepository = createMemoryNoteRepository()

  fastify.decorate('notesRepository', notesRepository)

  fastify.get('/', async function rootRoute () {
    return { hello: 'world' }
  })

  fastify.register(notesRoutes, { prefix: '/notes' })

  fastify.addHook('onClose', async function closeRepository () {
    await notesRepository.close()
  })

  return fastify
}

module.exports = {
  createApp
}
