import { useState } from 'react';
import { Card } from '../components/Card';
import '../styles/LandingPage.css';

type CreateNoteResponse = {
  id: string;
};

type ReadNoteResponse = {
  id: string;
  note: string;
};

type ErrorResponse = {
  error: string;
};

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export function LandingPage() {
  const [createNoteText, setCreateNoteText] = useState('');
  const [createKey, setCreateKey] = useState('');
  const [createdNoteId, setCreatedNoteId] = useState('');

  const [readNoteId, setReadNoteId] = useState('');
  const [readKey, setReadKey] = useState('');
  const [decryptedNote, setDecryptedNote] = useState('');

  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function createNote() {
    setMessage('');
    setCreatedNoteId('');
    setDecryptedNote('');

    if (!createNoteText.trim()) {
      setMessage('Write a note before creating it.');
      return;
    }

    if (!createKey) {
      setMessage('Enter an encryption key.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          note: createNoteText,
          key: createKey,
        }),
      });

      const data = (await response.json()) as CreateNoteResponse | ErrorResponse;

      if (!response.ok) {
        setMessage('error' in data ? data.error : 'Could not create note.');
        return;
      }

      if ('id' in data) {
        setCreatedNoteId(data.id);
        setReadNoteId(data.id);
        setCreateNoteText('');
        setCreateKey('');
        setMessage('Note created securely. Save the ID and key.');
      }
    } catch {
      setMessage('Could not connect to the backend.');
    } finally {
      setIsLoading(false);
    }
  }

  async function readNote() {
    setMessage('');
    setDecryptedNote('');

    if (!readNoteId.trim()) {
      setMessage('Enter a note ID.');
      return;
    }

    if (!readKey) {
      setMessage('Enter the decryption key.');
      return;
    }

    setIsLoading(true);

    try {
      const encodedKey = encodeURIComponent(readKey);

      const response = await fetch(
        `${API_BASE_URL}/notes/${readNoteId.trim()}?key=${encodedKey}`
      );

      const data = (await response.json()) as ReadNoteResponse | ErrorResponse;

      if (!response.ok) {
        setMessage('error' in data ? data.error : 'Could not read note.');
        return;
      }

      if ('note' in data) {
        setDecryptedNote(data.note);
        setMessage('Note decrypted successfully.');
      }
    } catch {
      setMessage('Could not connect to the backend.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="landing-page">
      <section className="hero">
        <h1>Secret Notes</h1>
        <p>
          Create encrypted notes and only decrypt them again with the correct key.
        </p>
      </section>

      <section className="cards">
        <Card title="Create Secret Note">
          <div className="form">
            <label htmlFor="create-note">Note</label>
            <textarea
              id="create-note"
              value={createNoteText}
              onChange={(event) => setCreateNoteText(event.target.value)}
              placeholder="Write your secret note..."
              rows={7}
            />

            <label htmlFor="create-key">Encryption key</label>
            <input
              id="create-key"
              type="password"
              value={createKey}
              onChange={(event) => setCreateKey(event.target.value)}
              placeholder="Choose a key/passphrase"
            />

            <button onClick={createNote} disabled={isLoading}>
              {isLoading ? 'Working...' : 'Create note'}
            </button>

            {createdNoteId && (
              <div className="result-box">
                <strong>Note ID:</strong>
                <code>{createdNoteId}</code>
                <p>Save this ID. You need it to read the note later.</p>
              </div>
            )}
          </div>
        </Card>

        <Card title="Read Secret Note">
          <div className="form">
            <label htmlFor="read-id">Note ID</label>
            <input
              id="read-id"
              type="text"
              value={readNoteId}
              onChange={(event) => setReadNoteId(event.target.value)}
              placeholder="Paste note ID"
            />

            <label htmlFor="read-key">Decryption key</label>
            <input
              id="read-key"
              type="password"
              value={readKey}
              onChange={(event) => setReadKey(event.target.value)}
              placeholder="Enter the correct key"
            />

            <button onClick={readNote} disabled={isLoading}>
              {isLoading ? 'Working...' : 'Read note'}
            </button>

            {decryptedNote && (
              <div className="decrypted-note">
                <strong>Decrypted note:</strong>
                <p>{decryptedNote}</p>
              </div>
            )}
          </div>
        </Card>
      </section>

      {message && <p className="message">{message}</p>}
    </main>
  );
}