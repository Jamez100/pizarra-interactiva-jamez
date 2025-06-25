// src/pages/Board.jsx

import React, { useState, useEffect } from 'react';
import { useParams, Link }      from 'react-router-dom';
import { toast }                from 'react-toastify';

import {
  subscribeToRoomNotesWithNotify,
  addNoteToRoom
} from '../services/database';
import { logout }               from '../services/auth';
import NoteItem                 from '../components/NoteItem';

export default function Board({ user }) {
  const { roomId }                = useParams();
  const [notes, setNotes]         = useState([]);
  const [newContent, setNewContent] = useState('');
  const [error, setError]         = useState(null);

  // 1) Escucha notas con notificaciones de nuevos hijos
  useEffect(() => {
    const unsub = subscribeToRoomNotesWithNotify(
      roomId,
      arr => setNotes(arr),
      note => toast.info(`Nueva nota de ${note.authorEmail}: "${note.content}"`)
    );
    return () => unsub();
  }, [roomId]);

  // 2) Detectar offline/online
  useEffect(() => {
    const off = () => toast.warn('Estás desconectado; se sincronizará al reconectar.');
    const on  = () => toast.success('Reconectado; sincronizando notas…');
    window.addEventListener('offline', off);
    window.addEventListener('online', on);
    return () => {
      window.removeEventListener('offline', off);
      window.removeEventListener('online', on);
    };
  }, []);

  const handleAdd = async e => {
    e.preventDefault();
    setError(null);
    if (!newContent.trim()) {
      setError('El contenido no puede estar vacío');
      return;
    }
    try {
      await addNoteToRoom(roomId, newContent, user);
      setNewContent('');
    } catch (err) {
      console.error(err);
      setError('Error al añadir la nota');
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="board-container">
      <header>
        <h2>Pizarra: {roomId}</h2>
        <div>
          <Link to="/rooms">← Salas</Link>
          <span>{user.email}</span>
          <button onClick={handleLogout}>Cerrar Sesión</button>
        </div>
      </header>

      <form onSubmit={handleAdd}>
        <textarea
          placeholder="Escribe tu nota..."
          value={newContent}
          onChange={e => setNewContent(e.target.value)}
          rows={3}
        />
        <button type="submit">Añadir Nota</button>
      </form>
      {error && <p className="error">{error}</p>}

      <section className="notes-list">
        {notes.length === 0
          ? <p>No hay notas en esta sala.</p>
          : notes.sort((a,b) => a.timestamp - b.timestamp)
                 .map(n => (
          <NoteItem
            key={n.id}
            note={n}
            currentUser={user}
            onDelete={() => /* puedes usar deleteNote si lo mantienes */ null}
            onEdit={() => /* idem */ null}
          />
        ))}
      </section>
    </div>
  );
}
