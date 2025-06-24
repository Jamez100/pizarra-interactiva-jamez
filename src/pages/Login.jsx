// src/pages/Login.jsx

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
// Función de login que creamos en services/auth.js
import { login } from '../services/auth';

export default function Login() {
  // Estados locales para controlar los inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  // Hook de React Router para redirigir
  const navigate = useNavigate();

  // Función que se llama al enviar el formulario
  const handleSubmit = async (e) => {
    e.preventDefault();         // Evita recargar la página
    setError(null);             // Reset de errores

    try {
      await login(email, password);
      // Si todo va bien, redirige al tablero
      navigate('/');
    } catch (err) {
      // Firebase devuelve mensajes en inglés; aquí los traducimos o mostramos
      setError('Usuario o contraseña incorrectos');
      console.error(err);
    }
  };

  return (
    <div className="auth-container">
      <h2>Iniciar Sesión</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Correo electrónico:
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </label>

        <label>
          Contraseña:
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </label>

        {error && <p className="error">{error}</p>}

        <button type="submit">Entrar</button>
      </form>

      <p>
        ¿No tienes cuenta? <Link to="/register">Regístrate aquí</Link>
      </p>
    </div>
  );
}
