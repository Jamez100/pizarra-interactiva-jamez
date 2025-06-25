// src/services/database.js

import { database } from '../firebaseConfig'; // Asume que 'database' es tu instancia de Realtime Database
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
 * Funciones básicas de notas en /notes (mantener por si se usan en otro lugar, pero no son para rooms)
 * NOTA: Para el chat en salas, se usarán las funciones addNoteToRoom, deleteRoomNote, editRoomNote.
 */
export const addNote = async (content, user) => {
  const notesRef = ref(database, 'notes');
  const newNoteRef = push(notesRef);
  await set(newNoteRef, {
    authorId: String(user.uid),
    authorEmail: String(user.email),
    content: String(content),
    timestamp: Date.now()
  });
};

export const subscribeToNotes = (callback) => {
  const notesRef = ref(database, 'notes');
  return onValue(notesRef, snap => {
    const data = snap.val() || {};
    const arr = Object.entries(data).map(([id, nRaw]) => {
      const n = nRaw || {}; // Asegura que n siempre sea un objeto
      return { id, ...n, content: String(n.content || '') };
    });
    callback(arr);
  });
};

export const deleteNote = async (noteId) => {
  await remove(ref(database, `notes/${noteId}`));
};

export const editNote = async (noteId, newContent) => {
  await update(ref(database, `notes/${noteId}`), { content: String(newContent) });
};


/* ————————— Funciones para Múltiples Salas (Corregidas y Completas) ————————— */

/**
 * Crea una nueva sala en /rooms y devuelve su ID
 * Ahora guarda el creatorId y creatorEmail para control de acceso.
 */
export const createRoom = async (name, creatorId, creatorEmail) => {
  const roomsRef = ref(database, 'rooms');
  const newRoomRef = push(roomsRef);
  await set(newRoomRef, {
    name: String(name),
    createdAt: Date.now(),
    creatorId: String(creatorId),
    creatorEmail: String(creatorEmail)
  });
  return newRoomRef.key;
};

/**
 * Escucha todas las salas y devuelve un array {id, name, createdAt, creatorId, creatorEmail}
 */
export const subscribeToRooms = (callback) => {
  const roomsRef = ref(database, 'rooms');
  return onValue(roomsRef, snap => {
    const data = snap.val() || {};
    const arr = Object.entries(data).map(([id, rRaw]) => {
      const r = rRaw || {}; // Asegura que r siempre sea un objeto
      return {
        id,
        ...r,
        name: String(r.name || ''),
        creatorId: String(r.creatorId || ''),
        creatorEmail: String(r.creatorEmail || '')
      };
    });
    callback(arr);
  });
};

/**
 * Función para eliminar una sala por su ID (para Firebase Realtime Database)
 * Exportada para ser usada en Rooms.jsx
 */
export const deleteRoom = async (roomId) => {
  const roomPath = `rooms/${roomId}`;
  await remove(ref(database, roomPath));
};

/**
 * Función para editar el nombre de una sala (para Firebase Realtime Database)
 * Exportada para ser usada en Rooms.jsx
 */
export const editRoom = async (roomId, newName) => {
  const roomPath = `rooms/${roomId}`;
  await update(ref(database, roomPath), { name: String(newName) });
};

/**
 * Agrega una nota a la sala indicada en /rooms/{roomId}/notes
 * Incluye xPos e yPos para la posición inicial.
 */
export const addNoteToRoom = async (roomId, content, user, xPos = 0, yPos = 0) => {
  const newNote = push(ref(database, `rooms/${roomId}/notes`));
  await set(newNote, {
    authorId: String(user.uid),
    authorEmail: String(user.email),
    text: String(content),
    timestamp: Date.now(),
    xPos: Number(xPos),
    yPos: Number(yPos)
  });
};

/**
 * Suscribe a las notas de una sala y notifica sólo nuevos hijos
 */
export const subscribeToRoomNotesWithNotify = (roomId, setCallback, notifyFn) => {
  const notesRef = ref(database, `rooms/${roomId}/notes`);

  // 1) Suscripción inicial y para actualizaciones completas (onValue)
  const unsubscribeOnValue = onValue(notesRef, snap => {
    const data = snap.val() || {};
    const arr = Object.entries(data).map(([id, nRaw]) => {
      const n = nRaw || {}; // Asegura que nRaw sea un objeto, incluso si el valor de la nota es null en DB
      return {
        id,
        ...n,
        text: String(n.text || n.content || ''),
        authorId: String(n.authorId || ''),
        authorEmail: String(n.authorEmail || ''),
        xPos: Number(n.xPos || 0),
        yPos: Number(n.yPos || 0)
      };
    }).sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0)); // Asegura que timestamp sea un número para ordenar
    setCallback(arr);
  });

  // 2) Suscripción para notificaciones de NUEVAS notas (onChildAdded)
  const unsubscribeOnChildAdded = onChildAdded(notesRef, snap => {
    const snapVal = snap.val() || {}; // Asegura que snap.val() sea un objeto
    const note = {
      id: snap.key,
      ...snapVal,
      text: String(snapVal.text || snapVal.content || ''),
      authorId: String(snapVal.authorId || ''),
      authorEmail: String(snapVal.authorEmail || ''),
      xPos: Number(snapVal.xPos || 0),
      yPos: Number(snapVal.yPos || 0)
    };
    if (auth.currentUser && note.authorId !== auth.currentUser.uid) {
      notifyFn(note);
    }
  });

  // Retorna una función para desuscribirse de AMBOS listeners
  return () => {
    unsubscribeOnValue();
    unsubscribeOnChildAdded();
  };
};

/**
 * Función para eliminar una nota ESPECÍFICA DE UNA SALA
 */
export const deleteRoomNote = async (roomId, noteId) => {
  const notePath = `rooms/${roomId}/notes/${noteId}`;
  await remove(ref(database, notePath));
};

/**
 * Función para editar una nota ESPECÍFICA DE UNA SALA
 */
export const editRoomNote = async (roomId, noteId, newContent) => {
  const notePath = `rooms/${roomId}/notes/${noteId}`;
  const noteRef = ref(database, notePath);
  await update(noteRef, { text: String(newContent) });
};

/**
 * Suscribe a los detalles de una sala específica por su ID.
 */
export const subscribeToRoomById = (roomId, callback) => {
  const roomRef = ref(database, `rooms/${roomId}`);
  return onValue(roomRef, snap => {
    const data = snap.val() || {}; // Asegura que data sea un objeto
    if (data) {
      callback({
        id: roomId,
        ...data,
        name: String(data.name || ''),
        creatorId: String(data.creatorId || ''),
        creatorEmail: String(data.creatorEmail || '')
      });
    } else {
      callback(null);
    }
  });
};

/** — Persistir columnas — */
export const updateRoomColumns = async (roomId, columns) =>
  update(ref(database, `rooms/${roomId}`), { columns });

/**
 * Función para actualizar la posición (xPos, yPos) de una nota específica en una sala.
 */
export const updateRoomNotePosition = async (roomId, noteId, xPos, yPos) => {
  const notePath = `rooms/${roomId}/notes/${noteId}`;
  const noteRef = ref(database, notePath);
  await update(noteRef, {
    xPos: Number(xPos),
    yPos: Number(yPos)
  });
};
