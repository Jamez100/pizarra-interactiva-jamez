// src/pages/Rooms.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

import {
  createRoom,
  subscribeToRooms
} from '../services/database';

export default function Rooms({ user }) {
  const [rooms, setRooms] = useState([]);
  const [newRoomName, setNewRoomName] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Nos suscribimos a la lista de salas
    const unsub = subscribeToRooms((roomsArray) => {
      setRooms(roomsArray);
    });
    return () => unsub();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError(null);
    if (!newRoomName.trim()) {
      setError('El nombre de sala no puede estar vacío');
      return;
    }
    try {
      const id = await createRoom(newRoomName.trim());
      setNewRoomName('');
      // Redirige automáticamente a la sala creada
      navigate(`/rooms/${id}`);
    } catch (err) {
      console.error(err);
      setError('Error al crear sala');
    }
  };

  return (
    <div className="rooms-container">
      <header>
        <h2>Salas Disponibles</h2>
        <Link to="/" onClick={() => {/* opcional: logout aquí */}}>Volver</Link>
      </header>

      <form onSubmit={handleCreate} className="create-room-form">
        <input
          placeholder="Nombre de nueva sala"
          value={newRoomName}
          onChange={e => setNewRoomName(e.target.value)}
        />
        <button type="submit">Crear Sala</button>
      </form>
      {error && <p className="error">{error}</p>}

      <ul className="rooms-list">
        {rooms.map(r => (
          <li key={r.id}>
            <Link to={`/rooms/${r.id}`}>{r.name}</Link>
          </li>
        ))}
        {rooms.length === 0 && <li>No hay salas aún.</li>}
      </ul>
    </div>
  );
}
