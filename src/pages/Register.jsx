// src/pages/Register.jsx

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
// Función de registro que creaste en services/auth.js
import { register } from '../services/auth';
// Imagen de bienvenida
import bannerImage from '../assets/banner2.jpg';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validación básica de confirmación de contraseña
    if (password !== confirm) {
      setError('Las contraseñas no coinciden');
      return;
    }
    if (email.trim() === '') {
      setError('Por favor, introduce tu correo electrónico.');
      return;
    }
    if (password.trim() === '') {
      setError('Por favor, introduce tu contraseña.');
      return;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setLoading(true);
    try {
      await register(email, password);
      // Tras registro exitoso, puedes redirigir al login o directamente a rooms
      navigate('/login', { replace: true });
    } catch (err) {
      console.error('Error al registrar usuario:', err);
      // Podrías mapear err.code de Firebase a mensajes más específicos
      setError('Error al registrar usuario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen">
      {/* Sección izquierda */}
      <div className="w-full md:w-1/2 bg-gradient-to-br from-orange-200 to-orange-400 flex items-center justify-center text-black p-10">
        <div className="text-center">
          <h1 className="text-4xl text-orange-700 font-bold mb-5">
            ¡Únete a Pizarra Interactiva!
          </h1>
          <img
            src={bannerImage}
            alt="Imagen bienvenida"
            className="mx-auto mt-6 rounded-lg shadow-lg max-w-full h-auto"
          />
          <p className="text-lg mb-3 mt-4">
            Regístrate para crear tus salas y colaborar en tiempo real con tu equipo.
          </p>
          <p className="text-lg mb-3">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="underline text-orange-700 hover:text-orange-900">
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </div>

      {/* Sección derecha: formulario con animación y centrado */}
      <div className="w-full md:w-1/2 bg-gray-900 flex items-center justify-center relative overflow-hidden">
        {/* Estilos CSS para animación de borde */}
        <style>
          {`
            @keyframes rotateBorder {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            .animated-border::before,
            .animated-border::after {
              content: '';
              position: absolute;
              top: -50%;
              left: -50%;
              width: 400px;
              height: 500px;
              background: linear-gradient(0deg, transparent, transparent, #ff7e29, #ff7e29, #ff7e29);
              z-index: 1;
              transform-origin: bottom right;
              animation: rotateBorder 7s linear infinite;
            }
            .animated-border::after {
              animation-delay: -3.5s;
            }
            .inner-box {
              position: absolute;
              inset: 5px;
              padding: 20px;
              border-radius: 8px;
              z-index: 2;
              display: flex;
              flex-direction: column;
            }
            .box1 {
              position: relative;
              width: 400px;
              height: 600px;
              overflow: hidden;
            }
          `}
        </style>

        {/* Wrapper de la animación, centrado */}
        <div className="animated-border box1 flex items-center justify-center">
          <div className="inner-box bg-gray-800 text-center overflow-auto">
            <h2 className="text-3xl font-bold text-orange-700 mb-6">Crear Cuenta</h2>

            {error && <div className="text-red-500 mb-3">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="text-left">
                <label htmlFor="email" className="block text-gray-200 font-medium mb-1">
                  Correo electrónico:
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 rounded bg-gray-700 text-gray-200 border border-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-700"
                  placeholder="tucorreo@ejemplo.com"
                  required
                />
              </div>

              <div className="text-left">
                <label htmlFor="password" className="block text-gray-200 font-medium mb-1">
                  Contraseña:
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 rounded bg-gray-700 text-gray-200 border border-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-700"
                  placeholder="Tu contraseña"
                  minLength={6}
                  required
                />
              </div>

              <div className="text-left">
                <label htmlFor="confirm" className="block text-gray-200 font-medium mb-1">
                  Repetir contraseña:
                </label>
                <input
                  type="password"
                  id="confirm"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="w-full p-3 rounded bg-gray-700 text-gray-200 border border-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-700"
                  placeholder="Repite tu contraseña"
                  minLength={6}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-orange-700 text-white hover:bg-orange-800 font-bold py-3 rounded focus:outline-none focus:ring-2 focus:ring-orange-700 ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Registrando...' : 'Registrar'}
              </button>
            </form>

            <div className="mt-4 text-gray-400">
              <p>O puedes registrarte con:</p>
              <div className="flex justify-center space-x-4 mt-3">
                {/* Botones sociales ilustrativos */}
                <button
                  className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-full focus:outline-none"
                  title="Google"
                >
                  G
                </button>
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full focus:outline-none"
                  title="Facebook"
                >
                  F
                </button>
                <button
                  className="bg-blue-400 hover:bg-blue-500 text-white p-3 rounded-full focus:outline-none"
                  title="Twitter"
                >
                  T
                </button>
                <button
                  className="bg-gray-700 hover:bg-gray-600 text-orange-400 p-3 rounded-full focus:outline-none"
                  title="GitHub"
                >
                  GH
                </button>
              </div>
            </div>

            <p className="mt-6 text-gray-400 text-sm">
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" className="underline text-orange-700 hover:text-orange-900">
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
