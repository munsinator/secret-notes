'use strict'

const { Pool } = require('pg')

function createPgNoteRepository ({ connectionString }) {
  if (!connectionString) {
    throw new Error('DATABASE_URL is required')
  }

  const pool = new Pool({
    connectionString
  })

  async function init () {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notes (
        id TEXT PRIMARY KEY,
        encrypted_note TEXT NOT NULL,
        iv TEXT NOT NULL,
        salt TEXT NOT NULL,
        auth_tag TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `)
  }

  async function createNote (noteRecord) {
    await pool.query(
      `
      INSERT INTO notes (id, encrypted_note, iv, salt, auth_tag)
      VALUES ($1, $2, $3, $4, $5)
      `,
      [
        noteRecord.id,
        noteRecord.encrypted_note,
        noteRecord.iv,
        noteRecord.salt,
        noteRecord.auth_tag
      ]
    )

    return noteRecord.id
  }

  async function getNoteById (id) {
    const result = await pool.query(
      `
      SELECT id, encrypted_note, iv, salt, auth_tag, created_at
      FROM notes
      WHERE id = $1
      `,
      [id]
    )

    return result.rows[0] || null
  }

  async function close () {
    await pool.end()
  }

  return {
    init,
    createNote,
    getNoteById,
    close
  }
}

module.exports = {
  createPgNoteRepository
}
