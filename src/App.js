// src/App.js

import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Login    from './pages/Login';
import Register from './pages/Register';
import Rooms    from './pages/Rooms';
import Board    from './pages/Board';

import { onAuthChange } from './services/auth';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const [user, setUser]             = useState(null);
  const [checkingStatus, setStatus] = useState(true);

  useEffect(() => {
    const unsub = onAuthChange(u => {
      setUser(u);
      setStatus(false);
    });
    return () => unsub();
  }, []);

  if (checkingStatus) return <p>Cargando aplicación...</p>;

  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta raíz condicional */}
        <Route
          path="/"
          element={user ? <Navigate to="/rooms" replace /> : <Login />}
        />

        {/* Rutas públicas */}
        <Route
          path="/login"
          element={!user ? <Login /> : <Navigate to="/rooms" replace />}
        />
        <Route
          path="/register"
          element={!user ? <Register /> : <Navigate to="/rooms" replace />}
        />

        {/* Rutas privadas */}
        <Route
          path="/rooms"
          element={user ? <Rooms user={user} /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/rooms/:roomId"
          element={user ? <Board user={user} /> : <Navigate to="/login" replace />}
        />

        {/* Wildcard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <ToastContainer position="top-right" autoClose={3000} />
    </BrowserRouter>
  );
}

export default App;
