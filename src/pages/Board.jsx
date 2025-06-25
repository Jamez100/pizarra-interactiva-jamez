// src/pages/Board.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Home, Bell, Settings, PlusCircle, LogOut, Menu, X } from 'lucide-react';
import {
  subscribeToRoomNotesWithNotify,
  addNoteToRoom,
  deleteRoomNote,
  editRoomNote,
  subscribeToRoomById,
  updateRoomNotePosition,
} from '../services/database';
import { updateRoomColumns } from '../services/database'; // <-- import correcto
import { logout } from '../services/auth';
import NoteItem from '../components/NoteItem';

export default function Board({ user }) {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const [notes, setNotes] = useState([]);
  const [content, setContent] = useState('');
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);

  const [roomName, setRoomName] = useState('Sala');
  const [loading, setLoading] = useState(true);

  const [columns, setColumns] = useState([]);
  const [editingCols, setEditingCols] = useState(false);
  const [colInput, setColInput] = useState('');

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const boardRef = useRef(null);

  // Redirige si no está autenticado
  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  // Obtiene nombre y columnas de la sala
  useEffect(() => {
    const unsub = subscribeToRoomById(roomId, data => {
      setRoomName(data.name || 'Sala');
      setColumns(Array.isArray(data.columns) ? data.columns : ['Backlog', 'In Progress', 'Done']);
      setLoading(false);
    });
    return unsub;
  }, [roomId]);

  // Suscribe las notas
  useEffect(() => {
    const unsub = subscribeToRoomNotesWithNotify(
      roomId,
      arr => setNotes(arr),
      note => toast.info(`Nueva nota: "${note.text}"`)
    );
    return unsub;
  }, [roomId]);

  // Guarda las columnas editadas
  const saveColumns = async () => {
    const list = colInput.split(',').map(s => s.trim()).filter(Boolean);
    try {
      await updateRoomColumns(roomId, list);
      setColumns(list);
      setEditingCols(false);
      toast.success('Columnas actualizadas');
    } catch {
      toast.error('Error al guardar columnas');
    }
  };

  // Añade una nota nueva
  const handleAdd = async e => {
    e.preventDefault();
    if (!content.trim()) return setError('La nota no puede estar vacía.');
    setError(null);
    setSending(true);
    try {
      const totalWidth  = boardRef.current.scrollWidth;
      const colWidth    = totalWidth / columns.length;
      const colIdx      = Math.floor(Math.random() * columns.length);
      const x           = colIdx * colWidth + Math.random() * (colWidth - 200);
      const y           = Math.random() * (boardRef.current.clientHeight - 100) + boardRef.current.scrollTop;
      await addNoteToRoom(roomId, content, user, x, y);
      setContent('');
    } catch {
      setError('Error al añadir nota.');
    } finally {
      setSending(false);
    }
  };

  // Cierra sesión
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen text-gray-400">Cargando...</div>;
  }

  return (
    <div className="flex w-screen h-screen bg-gray-900 text-white">
      {/* Toggle sidebar móvil */}
      <button
        className="absolute top-4 left-4 md:hidden z-20"
        onClick={() => setSidebarOpen(o => !o)}
      >
        {sidebarOpen ? <X /> : <Menu />}
      </button>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 w-64 bg-gray-800 border-r border-gray-700 p-6
        transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        transition-transform duration-200
        md:relative md:translate-x-0 md:flex md:flex-col
      `}>
        <h2 className="text-2xl font-bold text-orange-400 mb-6">Pizarra</h2>
        <nav className="flex-1 overflow-y-auto space-y-2">
          {[
            { to: '/rooms', icon: <Home />, label: 'Salas' },
            { to: '#', icon: <Bell />, label: 'Notificaciones' },
            { to: '#', icon: <Settings />, label: 'Configuración' },
          ].map(item => (
            <Link
              key={item.label}
              to={item.to}
              className="flex items-center px-4 py-2 hover:bg-gray-700 rounded"
            >
              {item.icon}
              <span className="ml-3">{item.label}</span>
            </Link>
          ))}
        </nav>
        <button
          onClick={handleLogout}
          className="mt-6 flex items-center justify-center px-4 py-2 bg-red-600 hover:bg-red-500 rounded text-sm"
        >
          <LogOut className="mr-2" /> Cerrar Sesión
        </button>
      </aside>

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col overflow-hidden md:ml-0">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 bg-gray-800 border-b border-gray-700">
          <h1 className="text-xl font-semibold text-orange-400 truncate">{roomName}</h1>
          <div className="flex items-center space-x-3">
            {editingCols ? (
              <div className="flex items-center space-x-2">
                <input
                  className="px-2 py-1 text-sm bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-orange-400"
                  value={colInput}
                  onChange={e => setColInput(e.target.value)}
                  placeholder="Columnas separadas por coma"
                />
                <button onClick={saveColumns} className="px-3 py-1 bg-orange-500 hover:bg-orange-400 rounded text-sm">
                  Guardar
                </button>
                <button onClick={() => setEditingCols(false)} className="px-3 py-1 bg-gray-600 hover:bg-gray-500 rounded text-sm">
                  Cancelar
                </button>
              </div>
            ) : (
              <button
                onClick={() => { setEditingCols(true); setColInput(columns.join(',')); }}
                className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm"
              >
                Config columnas
              </button>
            )}
            <Link to="/rooms" className="text-sm text-gray-300 hover:text-white">← Salas</Link>
          </div>
        </header>

        {/* Tablero */}
        <div
          ref={boardRef}
          className="relative flex-1 overflow-auto p-4 grid gap-4"
          style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}
        >
          {columns.map(col => (
            <div key={col} className="bg-gray-800 rounded shadow p-4">
              <div className="text-sm font-medium text-gray-300 mb-2">{col}</div>
              <div className="h-px bg-gray-700 mb-2" />
            </div>
          ))}
          {notes.map(n => (
            <NoteItem
              key={n.id}
              note={n}
              currentUser={user}
              onDelete={() => deleteRoomNote(roomId, n.id)}
              onEdit={(id, t) => editRoomNote(roomId, id, t)}
              onUpdatePosition={(id, x, y) => updateRoomNotePosition(roomId, id, x, y)}
            />
          ))}
        </div>

        {/* Formulario añadir nota */}
        <form
          onSubmit={handleAdd}
          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 px-6 py-4 bg-gray-800 border-t border-gray-700"
        >
          <textarea
            className="flex-1 p-3 text-sm bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none h-24 sm:h-auto"
            placeholder="Añadir nota..."
            value={content}
            onChange={e => setContent(e.target.value)}
            disabled={sending}
          />
          <button
            type="submit"
            className="flex items-center justify-center px-4 py-2 bg-orange-500 hover:bg-orange-400 rounded text-white text-sm"
            disabled={sending}
          >
            <PlusCircle className="mr-2" /> Añadir
          </button>
        </form>
        {error && <div className="px-6 py-2 text-sm text-red-100 bg-red-700">{error}</div>}
      </div>
    </div>
  );
}
