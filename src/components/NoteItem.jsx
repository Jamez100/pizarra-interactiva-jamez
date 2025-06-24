// src/components/NoteItem.jsx

import React, { useState } from 'react';

/**
 * NoteItem muestra una nota individual, con opciones de editar y eliminar
 * solo si el usuario actual es el autor.
 *
 * Props:
 * - note: objeto con { id, authorId, authorEmail, content, timestamp }
 * - currentUser: objeto Firebase User (tiene uid y email)
 * - onDelete: función que se llama cuando se pulsa Eliminar
 * - onEdit: función que recibe (noteId, newContent) para actualizar la nota
 */
export default function NoteItem({ note, currentUser, onDelete, onEdit }) {
  // Estado para saber si estamos en modo edición
  const [isEditing, setIsEditing] = useState(false);
  // Estado para el texto editable
  const [editContent, setEditContent] = useState(note.content);
  // Estado para errores locales
  const [error, setError] = useState(null);

  // Handler para guardar la edición
  const handleSave = async () => {
    setError(null);
    if (!editContent.trim()) {
      setError('El contenido no puede quedar vacío');
      return;
    }
    try {
      // Llamamos al onEdit pasando id y nuevo contenido
      await onEdit(note.id, editContent);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      setError('Error al actualizar la nota');
    }
  };

  // Handler para cancelar edición
  const handleCancel = () => {
    setIsEditing(false);
    setEditContent(note.content);
    setError(null);
  };

  // Formatear la fecha a legible
  const formattedDate = new Date(note.timestamp).toLocaleString();

  return (
    <div className="note-item">
      {isEditing ? (
        <>
          <textarea
            value={editContent}
            onChange={e => setEditContent(e.target.value)}
            rows={3}
          />
          {error && <p className="error">{error}</p>}
          <button onClick={handleSave}>Guardar</button>
          <button onClick={handleCancel}>Cancelar</button>
        </>
      ) : (
        <>
          <p className="note-content">{note.content}</p>
          <small className="note-meta">
            {note.authorEmail} – {formattedDate}
          </small>
        </>
      )}

      {/* Solo el autor puede ver los botones de editar/eliminar */}
      {note.authorId === currentUser.uid && !isEditing && (
        <div className="note-actions">
          <button onClick={() => setIsEditing(true)}>Editar</button>
          <button onClick={() => onDelete(note.id)}>Eliminar</button>
        </div>
      )}
    </div>
  );
}
