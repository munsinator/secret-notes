'use strict'

const { buildApp } = require('./helper')

describe('notes API', () => {
  let app

  afterEach(async () => {
    if (app) {
      await app.close()
    }
  })

  test('POST /notes creates a note and returns an id', async () => {
    app = await buildApp()

    const response = await app.inject({
      method: 'POST',
      url: '/notes',
      payload: {
        note: 'secret text',
        key: 'mypassword'
      }
    })

    const body = JSON.parse(response.payload)

    expect(response.statusCode).toBe(201)
    expect(body.id).toBeDefined()
  })

  test('POST /notes does not return plaintext or key', async () => {
    app = await buildApp()

    const response = await app.inject({
      method: 'POST',
      url: '/notes',
      payload: {
        note: 'do not expose this plaintext',
        key: 'mypassword'
      }
    })

    const body = JSON.parse(response.payload)

    expect(response.statusCode).toBe(201)
    expect(body.note).toBeUndefined()
    expect(body.key).toBeUndefined()
    expect(response.payload).not.toContain('do not expose this plaintext')
    expect(response.payload).not.toContain('mypassword')
  })

  test('POST /notes rejects missing note', async () => {
    app = await buildApp()

    const response = await app.inject({
      method: 'POST',
      url: '/notes',
      payload: {
        key: 'mypassword'
      }
    })

    expect(response.statusCode).toBe(400)
    expect(JSON.parse(response.payload)).toEqual({
      error: 'note is required'
    })
  })

  test('POST /notes rejects empty note', async () => {
    app = await buildApp()

    const response = await app.inject({
      method: 'POST',
      url: '/notes',
      payload: {
        note: '',
        key: 'mypassword'
      }
    })

    expect(response.statusCode).toBe(400)
    expect(JSON.parse(response.payload)).toEqual({
      error: 'note is required'
    })
  })

  test('POST /notes rejects missing key', async () => {
    app = await buildApp()

    const response = await app.inject({
      method: 'POST',
      url: '/notes',
      payload: {
        note: 'secret text'
      }
    })

    expect(response.statusCode).toBe(400)
    expect(JSON.parse(response.payload)).toEqual({
      error: 'key is required'
    })
  })

  test('GET /notes/:id returns decrypted note with correct key', async () => {
    app = await buildApp()

    const createResponse = await app.inject({
      method: 'POST',
      url: '/notes',
      payload: {
        note: 'secret text',
        key: 'mypassword'
      }
    })

    const { id } = JSON.parse(createResponse.payload)

    const getResponse = await app.inject({
      method: 'GET',
      url: `/notes/${id}?key=mypassword`
    })

    expect(getResponse.statusCode).toBe(200)
    expect(JSON.parse(getResponse.payload)).toEqual({
      id,
      note: 'secret text'
    })
  })

  test('GET /notes/:id rejects wrong key', async () => {
    app = await buildApp()

    const createResponse = await app.inject({
      method: 'POST',
      url: '/notes',
      payload: {
        note: 'secret text',
        key: 'mypassword'
      }
    })

    const { id } = JSON.parse(createResponse.payload)

    const getResponse = await app.inject({
      method: 'GET',
      url: `/notes/${id}?key=wrongpassword`
    })

    expect(getResponse.statusCode).toBe(401)
    expect(JSON.parse(getResponse.payload)).toEqual({
      error: 'invalid key'
    })
  })

  test('GET /notes/:id rejects missing key', async () => {
    app = await buildApp()

    const response = await app.inject({
      method: 'GET',
      url: '/notes/some-id'
    })

    expect(response.statusCode).toBe(400)
    expect(JSON.parse(response.payload)).toEqual({
      error: 'key is required'
    })
  })

  test('GET /notes/:id returns 404 for unknown note', async () => {
    app = await buildApp()

    const response = await app.inject({
      method: 'GET',
      url: '/notes/unknown-id?key=mypassword'
    })

    expect(response.statusCode).toBe(404)
    expect(JSON.parse(response.payload)).toEqual({
      error: 'note not found'
    })
  })

  test('GET /health returns ok', async () => {
    app = await buildApp()

    const response = await app.inject({
      method: 'GET',
      url: '/health'
    })

    expect(response.statusCode).toBe(200)
    expect(JSON.parse(response.payload)).toEqual({
      status: 'ok'
    })
  })
})
