'use strict'

function createMemoryNoteRepository () {
  const notes = new Map()

  async function init () {
    return undefined
  }

  async function createNote (noteRecord) {
    notes.set(noteRecord.id, noteRecord)
    return noteRecord.id
  }

  async function getNoteById (id) {
    return notes.get(id) || null
  }

  async function close () {
    notes.clear()
  }

  return {
    init,
    createNote,
    getNoteById,
    close,
    _notes: notes
  }
}

module.exports = {
  createMemoryNoteRepository
}
