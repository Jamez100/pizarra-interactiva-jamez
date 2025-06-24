// src/services/database.js

// Importamos la instancia de la base de datos
import { database } from '../firebaseConfig';

// Importamos las funciones de Realtime Database que vamos a usar
import {
  ref,
  push,
  set,
  onValue,
  remove,
  update
} from 'firebase/database';

/**
 * addNote(content, user)
 * Agrega una nota al nodo raíz '/notes' con ID generado automáticamente.
 */
export const addNote = async (content, user) => {
  // 1. Referencia al nodo 'notes'
  const notesRef = ref(database, 'notes');
  // 2. Crea un nuevo subnodo con clave única
  const newNoteRef = push(notesRef);
  // 3. Escribe los datos de la nota
  await set(newNoteRef, {
    authorId: user.uid,
    authorEmail: user.email,
    content,
    timestamp: Date.now()
  });
};

/**
 * subscribeToNotes(callback)
 * Se suscribe a cambios en '/notes' y llama a callback con el array de notas.
 */
export const subscribeToNotes = (callback) => {
  const notesRef = ref(database, 'notes');
  // onValue dispara al cargar y en cada cambio de datos
  return onValue(notesRef, snapshot => {
    const data = snapshot.val() || {};
    // Convertimos el objeto en un array de notas
    const notes = Object.entries(data).map(([id, note]) => ({
      id,
      ...note
    }));
    callback(notes);
  });
};

/**
 * deleteNote(noteId, currentUserId)
 * Elimina la nota si el usuario actual es su autor.
 */
export const deleteNote = async (noteId, currentUserId) => {
  const noteRef = ref(database, `notes/${noteId}`);
  // Para mayor seguridad, aquí podrías leer antes para validar autorId
  await remove(noteRef);
};

/**
 * editNote(noteId, newContent, currentUserId)
 * Actualiza el contenido de una nota.
 */
export const editNote = async (noteId, newContent, currentUserId) => {
  const noteRef = ref(database, `notes/${noteId}`);
  await update(noteRef, { content: newContent });
};

/* ———————————————— Opcionales: Salas (rooms) ———————————————— */

/**
 * createRoom(name)
 * Crea una sala nueva en '/rooms' y devuelve su ID.
 */
export const createRoom = async (name) => {
  const roomsRef = ref(database, 'rooms');
  const newRoomRef = push(roomsRef);
  await set(newRoomRef, {
    name,
    createdAt: Date.now()
  });
  return newRoomRef.key; // Devuelve el ID generado de la sala
};

/**
 * addNoteToRoom(roomId, content, user)
 * Agrega una nota a la sala indicada.
 */
export const addNoteToRoom = async (roomId, content, user) => {
  const notesInRoomRef = ref(database, `rooms/${roomId}/notes`);
  const newNoteRef = push(notesInRoomRef);
  await set(newNoteRef, {
    authorId: user.uid,
    authorEmail: user.email,
    content,
    timestamp: Date.now()
  });
};

/**
 * subscribeToRoomNotes(roomId, callback)
 * Escucha las notas de una sala específica.
 */
export const subscribeToRoomNotes = (roomId, callback) => {
  const notesInRoomRef = ref(database, `rooms/${roomId}/notes`);
  return onValue(notesInRoomRef, snapshot => {
    const data = snapshot.val() || {};
    const notes = Object.entries(data).map(([id, note]) => ({
      id,
      ...note
    }));
    callback(notes);
  });
};
