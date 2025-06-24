// src/pages/Board.jsx

import React, { useState, useEffect } from 'react';
// Funciones del servicio de base de datos
import {
  subscribeToNotes,
  addNote,
  deleteNote,
  editNote
} from '../services/database';
// Componente para renderizar cada nota
import NoteItem from '../components/NoteItem';
// Servicio de auth para cerrar sesión
import { logout } from '../services/auth';

export default function Board({ user }) {
  // Estado para el listado de notas
  const [notes, setNotes] = useState([]);
  // Estado para el contenido de la nueva nota
  const [newContent, setNewContent] = useState('');
  // Estado para mostrar mensajes de error
  const [error, setError] = useState(null);

  useEffect(() => {
    // 1. Nos suscribimos a cambios en /notes
    const unsubscribe = subscribeToNotes((notesArray) => {
      // Actualizamos el estado con el array que recibimos
      setNotes(notesArray);
    });

    // 2. Cleanup: cuando el componente se desmonte, anulamos la suscripción
    return () => unsubscribe();
  }, []);

  // Maneja el envío del formulario para añadir nota
  const handleAdd = async (e) => {
    e.preventDefault();
    setError(null);

    if (!newContent.trim()) {
      setError('El contenido no puede estar vacío');
      return;
    }

    try {
      // Llama a la función que escribe en Firebase
      await addNote(newContent, user);
      setNewContent(''); // Limpia el campo
    } catch (err) {
      console.error(err);
      setError('Error al añadir la nota');
    }
  };

  // Maneja el logout
  const handleLogout = async () => {
    try {
      await logout();
      // Al cerrar sesión, App.js redirigirá a /login
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="board-container">
      {/* Navbar simple */}
      <header>
        <h2>Pizarra Colaborativa</h2>
        <div>
          <span>{user.email}</span>
          <button onClick={handleLogout}>Cerrar Sesión</button>
        </div>
      </header>

      {/* Formulario para añadir nueva nota */}
      <form onSubmit={handleAdd} className="add-note-form">
        <textarea
          placeholder="Escribe tu nota aquí..."
          value={newContent}
          onChange={e => setNewContent(e.target.value)}
          rows={3}
        />
        <button type="submit">Añadir Nota</button>
      </form>

      {error && <p className="error">{error}</p>}

      {/* Lista de notas */}
      <section className="notes-list">
        {notes.length === 0 ? (
          <p>No hay notas todavía.</p>
        ) : (
          // Recorrer el array de notas y renderizar NoteItem
          notes
            // Orden opcional: las más recientes al final
            .sort((a, b) => a.timestamp - b.timestamp)
            .map(note => (
              <NoteItem
                key={note.id}
                note={note}
                currentUser={user}
                onDelete={() => deleteNote(note.id)}
                onEdit={(newText) => editNote(note.id, newText)}
              />
            ))
        )}
      </section>
    </div>
);
}
