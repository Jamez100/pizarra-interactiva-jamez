// src/App.js

import React, { useState, useEffect } from 'react';
// Importaciones de React Router
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Páginas
import Login from './pages/Login';
import Register from './pages/Register';
import Board from './pages/Board';

// Servicio de autenticación
import { onAuthChange } from './services/auth';

function App() {
  // Estado para guardar el usuario actual; null = no autenticado
  const [user, setUser] = useState(null);
  // Estado de carga para esperar la inicialización de Firebase Auth
  const [checkingStatus, setCheckingStatus] = useState(true);

  useEffect(() => {
    // Nos suscribimos a cambios de auth
    const unsubscribe = onAuthChange((user) => {
      setUser(user);
      setCheckingStatus(false);
    });
    // Cleanup al desmontar
    return () => unsubscribe();
  }, []);

  // Mientras verifica el estado, podemos mostrar un mensaje
  if (checkingStatus) {
    return <p>Cargando aplicación...</p>;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas: si ya hay user, redirige al tablero */}
        <Route
          path="/login"
          element={!user ? <Login /> : <Navigate to="/" replace />}
        />
        <Route
          path="/register"
          element={!user ? <Register /> : <Navigate to="/" replace />}
        />

        {/* Ruta privada: tablero; si no está autenticado, va a login */}
        <Route
          path="/"
          element={user ? <Board user={user} /> : <Navigate to="/login" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
