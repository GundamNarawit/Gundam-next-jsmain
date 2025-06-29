'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Note = {
  id: number;
  message: string;
  x: number;
  y: number;
  expiresAt: number;
};

const ADMIN_TOKEN = '123123123';

export default function AdminPanel() {
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState<Note | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token !== ADMIN_TOKEN) {
      router.replace('/admin/login');
      return;
    }
    fetchNotes();
  }, [router]);

  async function fetchNotes() {
    setLoading(true);
    const res = await fetch('/api/notes');
    const data = await res.json();
    setNotes(data);
    setLoading(false);
  }

  async function deleteNote(id: number) {
    if (!confirm('Are you sure you want to delete this note?')) return;

    await fetch('/api/notes', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, adminToken: ADMIN_TOKEN }),
    });
    fetchNotes();
  }

  async function saveEdit() {
    if (!edit) return;

    await fetch('/api/notes', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...edit, adminToken: ADMIN_TOKEN }),
    });
    setEdit(null);
    fetchNotes();
  }

  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-4xl font-extrabold mb-8 text-center text-indigo-700">
        Admin Panel
      </h1>

      {loading ? (
        <p className="text-center text-gray-600">Loading...</p>
      ) : (
        <>
          {edit ? (
            <section className="mb-6 bg-white p-6 rounded-lg shadow-md">
              <textarea
                rows={4}
                className="w-full border border-indigo-300 p-3 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                value={edit.message}
                onChange={(e) => setEdit({ ...edit, message: e.target.value })}
              />
              <div className="flex flex-wrap gap-4 mb-4">
                <input
                  type="number"
                  value={edit.x}
                  onChange={(e) =>
                    setEdit({ ...edit, x: Number(e.target.value) })
                  }
                  className="border border-indigo-300 p-2 rounded-md w-24 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="X"
                />
                <input
                  type="number"
                  value={edit.y}
                  onChange={(e) =>
                    setEdit({ ...edit, y: Number(e.target.value) })
                  }
                  className="border border-indigo-300 p-2 rounded-md w-24 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Y"
                />
                <input
                  type="datetime-local"
                  value={new Date(edit.expiresAt).toISOString().slice(0, 16)}
                  onChange={(e) =>
                    setEdit({
                      ...edit,
                      expiresAt: new Date(e.target.value).getTime(),
                    })
                  }
                  className="border border-indigo-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={saveEdit}
                  className="bg-indigo-600 text-white px-5 py-2 rounded-lg shadow hover:bg-indigo-700 transition"
                >
                  Save
                </button>
                <button
                  onClick={() => setEdit(null)}
                  className="bg-gray-300 text-gray-700 px-5 py-2 rounded-lg shadow hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
              </div>
            </section>
          ) : null}

          {notes.length === 0 ? (
            <p className="text-center text-gray-600">No notes available.</p>
          ) : (
            <div className="space-y-4">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="bg-white rounded-lg p-4 shadow-md flex flex-col md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="whitespace-pre-wrap mb-2">{note.message}</p>
                    <small className="text-gray-500 block mb-1">
                      Position: ({note.x}, {note.y})
                    </small>
                    <small className="text-gray-500 block">
                      Expires:{' '}
                      {new Date(note.expiresAt).toLocaleString(undefined, {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}
                    </small>
                  </div>
                  <div className="mt-3 md:mt-0 flex gap-3">
                    <button
                      className="text-indigo-600 hover:underline"
                      onClick={() => setEdit(note)}
                    >
                      Edit
                    </button>
                    <button
                      className="text-red-600 hover:underline"
                      onClick={() => deleteNote(note.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </main>
  );
}
