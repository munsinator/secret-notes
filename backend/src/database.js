'use strict'

const fp = require('fastify-plugin')
const { createPgNoteRepository } = require('../lib/noteRepository')
const { createMemoryNoteRepository } = require('../lib/memoryNoteRepository')

module.exports = fp(async function databasePlugin (fastify, opts) {
  const useMemoryDatabase =
    process.env.NODE_ENV === 'test' ||
    process.env.USE_MEMORY_DB === 'true'

  const repository = useMemoryDatabase
    ? createMemoryNoteRepository()
    : createPgNoteRepository({
        connectionString:
          process.env.DATABASE_URL ||
          'postgres://secretuser:secretpass@localhost:5432/secretnotes'
      })

  await repository.init()

  fastify.decorate('notesRepository', repository)

  fastify.addHook('onClose', async () => {
    await repository.close()
  })
})
