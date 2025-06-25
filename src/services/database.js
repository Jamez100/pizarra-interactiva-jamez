// src/services/database.js

import { database } from '../firebaseConfig';
import {
  ref,
  push,
  set,
  onValue,
  onChildAdded,
  remove,
  update
} from 'firebase/database';
import { auth } from '../firebaseConfig'; // Para comparar auth.currentUser

/**
 * Funciones básicas de notas en /notes
 */
export const addNote = async (content, user) => {
  const notesRef = ref(database, 'notes');
  const newNoteRef = push(notesRef);
  await set(newNoteRef, {
    authorId:    user.uid,
    authorEmail: user.email,
    content,
    timestamp:   Date.now()
  });
};

export const subscribeToNotes = (callback) => {
  const notesRef = ref(database, 'notes');
  return onValue(notesRef, snap => {
    const data = snap.val() || {};
    const arr = Object.entries(data).map(([id,n]) => ({ id, ...n }));
    callback(arr);
  });
};

export const deleteNote = async (noteId) => {
  await remove(ref(database, `notes/${noteId}`));
};

export const editNote = async (noteId, newContent) => {
  await update(ref(database, `notes/${noteId}`), { content: newContent });
};

/* ————————— Opcional: Múltiples Salas ————————— */

/**
 * Crea una nueva sala en /rooms y devuelve su ID
 */
export const createRoom = async (name) => {
  const roomsRef = ref(database, 'rooms');
  const newRoomRef = push(roomsRef);
  await set(newRoomRef, {
    name,
    createdAt: Date.now()
  });
  return newRoomRef.key;
};

/**
 * Escucha todas las salas y devuelve un array {id, name, createdAt}
 */
export const subscribeToRooms = (callback) => {
  const roomsRef = ref(database, 'rooms');
  return onValue(roomsRef, snap => {
    const data = snap.val() || {};
    const arr = Object.entries(data).map(([id,r]) => ({ id, ...r }));
    callback(arr);
  });
};

/**
 * Agrega una nota a la sala indicada en /rooms/{roomId}/notes
 */
export const addNoteToRoom = async (roomId, content, user) => {
  const refRoomNotes = ref(database, `rooms/${roomId}/notes`);
  const newNote = push(refRoomNotes);
  await set(newNote, {
    authorId:    user.uid,
    authorEmail: user.email,
    content,
    timestamp:   Date.now()
  });
};

/**
 * Suscribe a las notas de una sala y notifica sólo nuevos hijos
 */
export const subscribeToRoomNotesWithNotify = (roomId, setCallback, notifyFn) => {
  const path = roomId 
    ? `rooms/${roomId}/notes`
    : 'notes';
  const notesRef = ref(database, path);

  // 1) Estado inicial y actualizaciones completas
  onValue(notesRef, snap => {
    const data = snap.val() || {};
    const arr = Object.entries(data).map(([id,n]) => ({ id, ...n }));
    setCallback(arr);
  });

  // 2) Sólo nuevas notas
  return onChildAdded(notesRef, snap => {
    const note = { id: snap.key, ...snap.val() };
    if (note.authorId !== auth.currentUser.uid) {
      notifyFn(note);
    }
  });
};
