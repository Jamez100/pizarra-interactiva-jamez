import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Edit, Trash2, Home, User, Settings, Bell, BarChart2, PlusCircle, Search, Menu, X as CloseIcon } from 'lucide-react';
import { createRoom, subscribeToRooms, deleteRoom, editRoom } from '../services/database';
import { logout } from '../services/auth';

export default function Rooms({ user }) {
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [newRoomName, setNewRoomName] = useState('');
  const [error, setError] = useState(null);
  const [creatingRoom, setCreatingRoom] = useState(false);
  const [editingRoomId, setEditingRoomId] = useState(null);
  const [editedRoomName, setEditedRoomName] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Pagination
  const itemsPerPage = 12;
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  useEffect(() => { const unsub = subscribeToRooms(arr => setRooms(arr)); return () => unsub(); }, []);
  useEffect(() => {
    const term = searchTerm.toLowerCase().trim();
    const list = term ? rooms.filter(r => r.name.toLowerCase().includes(term)) : rooms;
    setFilteredRooms(list);
    setCurrentPage(1);
  }, [rooms, searchTerm]);

  const totalPages = Math.ceil(filteredRooms.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const paginated = filteredRooms.slice(startIdx, startIdx + itemsPerPage);

  const handleCreate = async e => { e.preventDefault(); setError(null);
    if (!newRoomName.trim()) return setError('El nombre de sala no puede estar vacío.');
    setCreatingRoom(true);
    try {
      const id = await createRoom(newRoomName.trim(), user.uid, user.email);
      setNewRoomName('');
      navigate(`/rooms/${id}`, { state: { roomName: newRoomName.trim() } });
    } catch {
      setError('Error al crear la sala.');
    } finally { setCreatingRoom(false); }
  };

  const handleDelete = async () => {
    try { await deleteRoom(roomToDelete.id); }
    catch { setError('Error al eliminar la sala.'); }
    finally { setRoomToDelete(null); setShowConfirmModal(false); }
  };
  const startEdit = room => { setEditingRoomId(room.id); setEditedRoomName(room.name); setError(null); };
  const saveEdit = async id => {
    if (!editedRoomName.trim()) return setError('El nombre de sala no puede estar vacío.');
    try { await editRoom(id, editedRoomName.trim()); }
    catch { setError('Error al actualizar la sala.'); }
    finally { setEditingRoomId(null); setEditedRoomName(''); }
  };
  const cancelEdit = () => { setEditingRoomId(null); setEditedRoomName(''); setError(null); };
  const doLogout = async () => { try { await logout(); } catch { setError('Error al cerrar sesión.'); } };

  return (
    <div className="flex bg-gray-900 text-white h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed inset-y-0 left-0 w-64 bg-gray-800 border-r border-gray-700 transition-transform duration-300 z-40 flex flex-col`}>        
        <div className="flex items-center justify-between p-6">
          <h2 className="text-xl sm:text-2xl font-bold text-orange-400">Pizarra</h2>
          <button className="lg:hidden" onClick={() => setSidebarOpen(false)}><CloseIcon /></button>
        </div>
        <nav className="flex-1 overflow-y-auto px-4 space-y-2">
          {[
            { to: '/dashboard', icon: <Home />, label: 'Dashboard' },
            { to: '/profile', icon: <User />, label: 'Perfil' },
            { to: '/notifications', icon: <Bell />, label: 'Notificaciones' },
            { to: '/stats', icon: <BarChart2 />, label: 'Estadísticas' },
            { to: '/settings', icon: <Settings />, label: 'Configuración' }
          ].map(item => (
            <Link key={item.to} to={item.to} className="flex items-center px-3 py-2 hover:bg-gray-700 rounded transition">
              {item.icon}<span className="ml-2 text-sm sm:text-base">{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-700">
          <button onClick={doLogout} className="w-full py-2 bg-gradient-to-r from-orange-600 to-orange-500 rounded text-sm sm:text-base hover:from-orange-500">Cerrar Sesión</button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col lg:pl-64 overflow-auto">
        {/* Mobile Header */}
        <header className="flex items-center justify-between bg-gray-800 px-4 py-3 lg:hidden">
          <button onClick={() => setSidebarOpen(true)}><Menu /></button>
          <h1 className="text-lg sm:text-xl font-semibold text-orange-400">Salas Disponibles</h1>
          <button onClick={doLogout} className="px-2 py-1 bg-gradient-to-r from-orange-600 to-orange-500 rounded text-xs sm:text-sm">Logout</button>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-auto">
          {/* Controls Container */}
          <div className="bg-gray-800 border-b border-gray-700 py-4 px-4 md:px-8">
            <div className="w-full">
              {error && <div className="mb-4 text-red-400 text-sm md:text-base">{error}</div>}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <Metric icon={<BarChart2 />} label="Total de Salas" value={rooms.length} />
                <Metric icon={<PlusCircle />} label="Sala Más Reciente" value={rooms.length ? rooms[rooms.length-1].name : '—'} truncate />
                <Metric icon={<Bell />} label="Notificaciones" value="-" link={{ to: '/notifications', label: 'Ir a Notificaciones' }} />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="relative flex-1 min-w-0">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder="Buscar sala..."
                    className="w-full pl-10 pr-4 py-2 bg-gray-700 rounded text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                </div>
                <form onSubmit={handleCreate} className="flex-shrink-0 flex items-center gap-2">
                  <input
                    type="text"
                    value={newRoomName}
                    onChange={e => setNewRoomName(e.target.value)}
                    placeholder="Nueva sala"
                    className="px-4 py-2 bg-gray-700 rounded text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-orange-400"
                    disabled={creatingRoom}
                  />
                  <button
                    type="submit"
                    disabled={creatingRoom}
                    className="flex items-center px-4 py-2 bg-orange-500 rounded text-sm sm:text-base hover:bg-orange-400 disabled:opacity-50"
                  >
                    {creatingRoom ? <Spinner /> : <PlusCircle className="mr-1" />} Crear Sala
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Rooms Grid */}
          <div className="flex-1 overflow-auto p-4 md:px-8">
            <div className="w-full">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {paginated.length === 0
                  ? <div className="col-span-full text-center text-gray-500 py-20">No hay salas disponibles.</div>
                  : paginated.map(room => (
                    <RoomCard
                      key={room.id}
                      room={room}
                      user={user}
                      editingRoomId={editingRoomId}
                      editedRoomName={editedRoomName}
                      startEdit={() => startEdit(room)}
                      saveEdit={() => saveEdit(room.id)}
                      cancelEdit={cancelEdit}
                      deleteRoom={() => { setRoomToDelete(room); setShowConfirmModal(true); }}
                      navigate={navigate}
                      setEditedName={setEditedRoomName}
                    />
                  ))}
              </div>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-gray-800 py-4 px-4 md:px-8">
              <div className="container mx-auto max-w-screen-xl flex justify-center space-x-2">
                <button
                  onClick={() => setCurrentPage(p => p - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-gray-700 rounded disabled:opacity-50 text-sm sm:text-base"
                >Anterior</button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-3 py-1 rounded text-sm sm:text-base ${currentPage === i + 1 ? 'bg-orange-500' : 'bg-gray-700'}`}
                  >{i + 1}</button>
                ))}
                <button
                  onClick={() => setCurrentPage(p => p + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 bg-gray-700 rounded disabled:opacity-50 text-sm sm:text-base"
                >Siguiente</button>
              </div>
            </div>
          )}
        </main>
      </div>  

      {/* Confirm Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded shadow max-w-xs w-full mx-4">
            <h3 className="text-base sm:text-lg font-semibold mb-4">Confirmar eliminación</h3>
            <p className="mb-6 text-sm sm:text-base">¿Deseas eliminar «{roomToDelete?.name}»? Esta acción no se puede deshacer.</p>
            <div className="flex justify-end space-x-2">
              <button onClick={handleDelete} className="px-4 py-2 bg-red-600 rounded hover:bg-red-500 text-sm sm:text-base">Eliminar</button>
              <button onClick={() => setShowConfirmModal(false)} className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-500 text-sm sm:text-base">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Metric({ icon, label, value, truncate, link }) {
  return (
    <div className="bg-gray-700 p-4 rounded shadow flex flex-col">
      <div className="flex items-center text-sm sm:text-base">{icon}<span className="ml-2 font-semibold">{label}</span></div>
      <div className={`mt-2 font-bold ${truncate ? 'truncate text-xl sm:text-2xl' : 'text-xl sm:text-2xl'}`}>{value}</div>
      {link && <Link to={link.to} className="mt-2 text-xs sm:text-sm text-orange-400 hover:underline">{link.label}</Link>}
    </div>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}

function RoomCard({ room, user, editingRoomId, editedRoomName, startEdit, saveEdit, cancelEdit, deleteRoom, navigate, setEditedName }) {
  const isEditing = editingRoomId === room.id;
  return (
    <div className="bg-gray-800 p-4 rounded shadow flex flex-col h-full">
      {isEditing ? (
        <>  
          <input
            type="text"
            value={editedRoomName}
            onChange={e => setEditedName(e.target.value)}
            className="mb-3 p-2 bg-gray-700 rounded text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
          <div className="mt-auto flex space-x-2">
            <button onClick={saveEdit} className="flex-1 py-2 bg-green-500 rounded hover:bg-green-400 text-sm sm:text-base">Guardar</button>
            <button onClick={cancelEdit} className="flex-1 py-2 bg-red-500 rounded hover:bg-red-400 text-sm sm:text-base">Cancelar</button>
          </div>
        </>
      ) : (
        <>  
          <Link
            to={`/rooms/${room.id}`}
            state={{ roomName: room.name }}
            className="font-semibold text-base sm:text-lg text-orange-300 hover:underline truncate mb-2 block"
          >
            {room.name}
          </Link>
          <p className="text-gray-400 flex-1 text-sm sm:text-base mb-4">Descripción breve o estado...</p>
          <div className="mt-auto flex items-center justify-between">
            <button
              onClick={() => navigate(`/rooms/${room.id}`, { state: { roomName: room.name } })}
              className="flex-1 py-1 sm:py-2 bg-cyan-600 rounded hover:bg-cyan-500 text-sm sm:text-base"
            >
              Entrar
            </button>
            {user.uid === room.creatorId && (
              <div className="flex space-x-2 ml-2">
                <button onClick={() => startEdit(room)} className="p-2 bg-blue-600 rounded hover:bg-blue-500">
                  <Edit size={18} />
                </button>
                <button onClick={() => deleteRoom()} className="p-2 bg-red-600 rounded hover:bg-red-500">
                  <Trash2 size={18} />
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
