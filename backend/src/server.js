'use strict'

const Fastify = require('fastify')
const { createMemoryNoteRepository } = require('./repository/memoryNoteRepository')
const notesRoutes = require('./routes/notes')

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

async function start () {
  try {
    await notesRepository.init()
    await fastify.listen({
      port: Number(process.env.PORT) || 5000,
      host: process.env.HOST || '0.0.0.0'
    })
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()
