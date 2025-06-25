// src/pages/Login.jsx

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../services/auth';
import bannerImage from '../assets/banner2.jpg';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (email.trim() === '') {
      setError('Por favor, introduce tu correo electrónico.');
      return;
    }
    if (password.trim() === '') {
      setError('Por favor, introduce tu contraseña.');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      navigate('/rooms', { replace: true });
    } catch (err) {
      setError('Usuario o contraseña incorrectos');
      console.error('Error en login:', err);
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
            Bienvenido a Pizarra Interactiva
          </h1>
          <img
            src={bannerImage}
            alt="Imagen bienvenida"
            className="mx-auto mt-6 rounded-lg shadow-lg max-w-full h-auto"
          />
          <p className="text-lg mb-3 mt-4">
            Conéctate en tiempo real con tus compañeros. Crea salas, añade notas y mantente sincronizado.
          </p>
          <p className="text-lg mb-3">
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="underline text-orange-700 hover:text-orange-900">
              Regístrate aquí
            </Link>
          </p>
        </div>
      </div>

      {/* Sección derecha: formulario con animación, centrado */}
      <div className="w-full md:w-1/2 bg-gray-900 flex items-center justify-center relative overflow-hidden">
        {/* Estilos CSS para la animación de borde */}
        <style>
          {`
            @keyframes rotateBorder {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            /* Contenedor que gira el borde */
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
            /* Caja interior */
            .inner-box {
              position: absolute;
              inset: 5px;
              padding: 20px;
              border-radius: 8px;
              z-index: 2;
              display: flex;
              flex-direction: column;
            }
            /* Tamaño fijo del wrapper animado */
            .box1 {
              position: relative;
              width: 400px;
              height: 500px;
              overflow: hidden;
            }
          `}
        </style>

        {/* Wrapper del borde animado, centrado */}
        <div className="animated-border box1 flex items-center justify-center">
          {/* inner-box contendrá el formulario, centrado dentro de box1 */}
          <div className="inner-box bg-gray-800 text-center">
            <h2 className="text-3xl font-bold text-orange-700 mb-6">Iniciar Sesión</h2>

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

              <div className="flex items-center justify-between text-sm">
                <label className="text-gray-200 flex items-center">
                  <input type="checkbox" className="mr-2 accent-orange-600" />
                  Recordarme
                </label>
                <Link to="/forgot-password" className="text-orange-700 hover:underline">
                  Olvidé mi contraseña
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-orange-700 text-white hover:bg-orange-800 font-bold py-3 rounded focus:outline-none focus:ring-2 focus:ring-orange-700 ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Ingresando...' : 'Iniciar Sesión'}
              </button>
            </form>

            <div className="mt-4 text-gray-400">
              <p>O puedes ingresar con:</p>
              <div className="flex justify-center space-x-4 mt-3">
                {/* Botones de login social ilustrativos */}
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
          </div>
        </div>

      </div>
    </div>
  );
}
