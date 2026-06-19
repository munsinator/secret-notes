'use strict'

const fp = require('fastify-plugin')
const cors = require('@fastify/cors')

module.exports = fp(async function corsPlugin (fastify, opts) {
  await fastify.register(cors, {
    origin: true,
    methods: ['GET', 'POST', 'OPTIONS']
  })
})
