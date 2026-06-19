'use strict'

const Fastify = require('fastify')
const appPlugin = require('../app')

async function buildApp () {
  const app = Fastify()

  await app.register(appPlugin)
  await app.ready()

  return app
}

module.exports = {
  buildApp
}
