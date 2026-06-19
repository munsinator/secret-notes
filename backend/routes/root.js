'use strict'

module.exports = async function rootRoutes (fastify, opts) {
  fastify.get('/', async function (request, reply) {
    return {
      service: 'secret-notes-backend',
      status: 'ok'
    }
  })

  fastify.get('/health', async function (request, reply) {
    return {
      status: 'ok'
    }
  })
}
