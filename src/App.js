// src/App.js

import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Login from './pages/Login';
import Register from './pages/Register';
import Rooms from './pages/Rooms';
import Board from './pages/Board';

import { onAuthChange } from './services/auth';

import { ToastContainer } from 'react-toastify'; // 'toast' eliminado de la importación
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const [user, setUser] = useState(null);
  const [checkingStatus, setCheckingStatus] = useState(true);

  // --- useEffect para la Autenticación ---
  useEffect(() => {
    const unsub = onAuthChange(u => {
      setUser(u);
      setCheckingStatus(false);
    });
    return () => unsub();
  }, []);

  // --- Función Global para Alertas Personalizadas (Reemplazo de window.alert) ---
  window.alertCustom = function(message) {
      const existingAlert = document.getElementById('custom-alert-message');
      if (existingAlert) existingAlert.remove();

      const alertDiv = document.createElement('div');
      alertDiv.id = 'custom-alert-message';
      alertDiv.className = 'fixed bottom-4 right-4 bg-blue-600 text-white p-3 rounded-lg shadow-lg z-50 animate-fade-in-down';
      alertDiv.textContent = message;
      document.body.appendChild(alertDiv);
      setTimeout(() => {
          alertDiv.remove();
      }, 3000);
  };

  if (checkingStatus) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-900 text-white text-xl">
        <p>Cargando aplicación...</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      {/* Elemento para el fondo animado - Debe estar fuera de Routes para ser global */}
      <div id="animated-background" className="fixed inset-0 z-0 bg-gray-900"></div>

      {/* El contenido de tu aplicación con las rutas */}
      {/* Asegúrate de que tus componentes de página (Login, Register, etc.) tengan z-index mayor que el fondo */}
      <div className="relative z-10 w-full h-full flex items-center justify-center">
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
      </div>

      <ToastContainer position="top-right" autoClose={3000} />
    </BrowserRouter>
  );
}

export default App;
