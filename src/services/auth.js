// src/services/auth.js

// Importamos la instancia de auth desde nuestra configuración de Firebase
import { auth } from '../firebaseConfig';

// Importamos las funciones que usaremos de la librería de autenticación de Firebase
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';

/**
 * register(email, password)
 * Registra un nuevo usuario con correo y contraseña.
 * Devuelve la promesa de Firebase, para manejarla con async/await o .then/.catch.
 */
export const register = async (email, password) => {
  return await createUserWithEmailAndPassword(auth, email, password);
};

/**
 * login(email, password)
 * Inicia sesión con correo y contraseña.
 */
export const login = async (email, password) => {
  return await signInWithEmailAndPassword(auth, email, password);
};

/**
 * logout()
 * Cierra la sesión del usuario actual.
 */
export const logout = async () => {
  return await signOut(auth);
};

/**
 * onAuthChange(callback)
 * Permite suscribirse a cambios en el estado de autenticación:
 *   - callback recibe `user` si hay sesión,
 *   - o `null` si no hay usuario.
 * Devuelve la función de anulación para cleanup en useEffect.
 */
export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, (user) => callback(user));
};
