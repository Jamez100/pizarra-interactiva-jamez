// src/components/NoteItem.jsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Edit, Trash2, Check, X } from 'lucide-react';

export default function NoteItem({ note, currentUser, onDelete, onEdit, onUpdatePosition }) {
  // --- DECLARACIÓN DE TODOS LOS HOOKS SIEMPRE AL INICIO Y NO CONDICIONALMENTE ---

  const [isEditing, setIsEditing] = useState(false);

  // Inicialización ultra-defensiva de editedContent, usando optional chaining.
  const [editedContent, setEditedContent] = useState(String(note?.text || note?.content || ''));
  const [error, setError] = useState(null);

  // Dragging states
  const [isDragging, setIsDragging] = useState(false);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [currentX, setCurrentX] = useState(Number(note?.xPos) || 0);
  const [currentY, setCurrentY] = useState(Number(note?.yPos) || 0);

  const noteRef = useRef(null);

  // --- FIN DE LA DECLARACIÓN DE HOOKS ---

  // Verificar si el usuario actual es el autor de la nota
  const isAuthor = currentUser && currentUser.uid === note.authorId;

  // Actualizar estados de posición internos si las props de la nota cambian
  useEffect(() => {
    if (!isDragging) {
      setCurrentX(Number(note.xPos) || 0);
      setCurrentY(Number(note.yPos) || 0);
    }
  }, [note.xPos, note.yPos, isDragging]);

  // Handle mouse down to start dragging (CUALQUIER USUARIO AUTENTICADO PUEDE ARRASTRAR)
  const handleMouseDown = (e) => {
    // Si se está editando o no hay usuario logueado, no iniciar el arrastre.
    if (!currentUser || isEditing) return;

    // Prevenir la selección de texto nativa del navegador al iniciar el arrastre
    e.preventDefault();

    setIsDragging(true);
    const rect = noteRef.current.getBoundingClientRect();
    setOffsetX(e.clientX - rect.left);
    setOffsetY(e.clientY - rect.top);

    noteRef.current.style.zIndex = 1000; // Elevar la nota al frente al arrastrar
  };

  // Handle mouse move to update position (memoized with useCallback)
  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;

    const parent = noteRef.current.parentElement;
    if (!parent) return;

    const parentRect = parent.getBoundingClientRect();
    const parentScrollLeft = parent.scrollLeft;
    const parentScrollTop = parent.scrollTop;
    const noteWidth = noteRef.current.offsetWidth;
    const noteHeight = noteRef.current.offsetHeight;

    let newX = (e.clientX - parentRect.left) + parentScrollLeft - offsetX;
    let newY = (e.clientY - parentRect.top) + parentScrollTop - offsetY;

    newX = Math.max(0, Math.min(newX, parent.scrollWidth - noteWidth));
    newY = Math.max(0, Math.min(newY, parent.scrollHeight - noteHeight));

    setCurrentX(newX);
    setCurrentY(newY);
  }, [isDragging, offsetX, offsetY]);

  // Handle mouse up to stop dragging and save position (memoized with useCallback)
  const handleMouseUp = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);

    noteRef.current.style.zIndex = ''; // Restablecer z-index

    if (onUpdatePosition) {
      onUpdatePosition(note.id, currentX, currentY);
    }
  }, [isDragging, onUpdatePosition, note.id, currentX, currentY]);

  // Attach global mousemove and mouseup listeners when dragging starts
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);


  // Handle touch events for mobile dragging (CUALQUIER USUARIO AUTENTICADO PUEDE ARRASTRAR)
  const handleTouchStart = (e) => {
    if (!currentUser || isEditing) return;

    e.preventDefault(); // Prevenir el scroll y el zoom al iniciar el arrastre táctil

    setIsDragging(true);
    const rect = noteRef.current.getBoundingClientRect();
    setOffsetX(e.touches[0].clientX - rect.left);
    setOffsetY(e.touches[0].clientY - rect.top);
    noteRef.current.style.zIndex = 1000;
  };

  const handleTouchMove = useCallback((e) => {
    if (!isDragging) return;
    e.preventDefault(); // Prevenir el scroll de la página mientras se arrastra

    const parent = noteRef.current.parentElement;
    if (!parent) return;

    const parentRect = parent.getBoundingClientRect();
    const parentScrollLeft = parent.scrollLeft;
    const parentScrollTop = parent.scrollTop;

    let newX = (e.touches[0].clientX - parentRect.left) + parentScrollLeft - offsetX;
    let newY = (e.touches[0].clientY - parentRect.top) + parentScrollTop - offsetY;

    const noteWidth = noteRef.current.offsetWidth;
    const noteHeight = noteRef.current.offsetHeight;
    newX = Math.max(0, Math.min(newX, parent.scrollWidth - noteWidth));
    newY = Math.max(0, Math.min(newY, parent.scrollHeight - noteHeight));

    setCurrentX(newX);
    setCurrentY(newY);
  }, [isDragging, offsetX, offsetY]);

  const handleTouchEnd = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    noteRef.current.style.zIndex = '';
    if (onUpdatePosition) {
      onUpdatePosition(note.id, currentX, currentY);
    }
  }, [isDragging, onUpdatePosition, note.id, currentX, currentY]);

  // Attach global touchmove and touchend listeners when dragging starts
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
    } else {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    }
    return () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, handleTouchMove, handleTouchEnd]);


  const handleSave = async () => {
    setError(null);
    if (!editedContent.trim()) {
      setError('El contenido no puede quedar vacío.');
      return;
    }
    try {
      await onEdit(note.id, editedContent);
      setIsEditing(false);
    } catch (err) {
      console.error('Error al actualizar la nota:', err);
      setError('Error al actualizar la nota.');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedContent(String(note?.text || note?.content || ''));
    setError(null);
  };

  // Formatear la fecha a legible
  const formattedTimestamp = note?.timestamp ? new Date(note.timestamp).toLocaleString([], {
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
    day: 'numeric',
  }) : 'Fecha Desconocida';

  return (
    <div
      ref={noteRef}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      // 'select-none' aplicado siempre para evitar la selección de texto en la nota.
      // El cursor cambia a 'cursor-grabbing' solo cuando se está arrastrando.
      className={`absolute p-4 rounded-xl shadow-lg max-w-[280px] min-h-[120px] break-words flex flex-col justify-between select-none 
        ${isAuthor
          ? 'bg-blue-300 border-blue-500 text-gray-800'
          : 'bg-green-300 border-green-500 text-gray-800'
        }
        ${isDragging ? 'cursor-grabbing' : 'cursor-grab'} 
        ${isEditing ? 'border-2 border-red-500' : 'border-2'}
        transition-all duration-100 ease-out`}
      style={{ left: currentX, top: currentY }}
    >
      {/* Información del autor y timestamp */}
      <div className="flex justify-between items-center mb-1">
        <span className={`font-semibold text-sm ${isAuthor ? 'text-blue-700' : 'text-green-700'}`}>
          {isAuthor ? 'Tú' : note?.authorEmail ? note.authorEmail.split('@')[0] : 'Desconocido'}
        </span>
        <span className="text-xs text-gray-600 ml-2">{formattedTimestamp}</span>
      </div>

      {isEditing ? (
        <>
          <textarea
            value={editedContent}
            onChange={e => setEditedContent(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border-2 border-blue-500 placeholder-gray-500 text-gray-900 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-base shadow-sm transition-all duration-300 ease-in-out resize-y"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSave();
              }
            }}
          />
          {error && (
            <div className="bg-red-100 border-2 border-red-500 text-red-700 px-2 py-1 rounded-lg relative text-xs font-medium mt-2 animate-fade-in-down" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          <div className="flex justify-end space-x-2 mt-3">
            <button onClick={handleSave} title="Guardar"
              className="p-2 rounded-full text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200 shadow-md">
              <Check size={20} />
            </button>
            <button onClick={handleCancel} title="Cancelar"
              className="p-2 rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-200 shadow-md">
              <X size={20} />
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="text-gray-800 text-base whitespace-pre-wrap flex-grow">{editedContent || 'Contenido vacío'}</p>
          {isAuthor && (
            <div className="flex justify-end space-x-2 mt-2">
              <button onClick={() => setIsEditing(true)} title="Editar Mensaje"
                className="p-2 rounded-full text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200 shadow-md">
                <Edit size={18} />
              </button>
              <button onClick={() => onDelete(note.id)} title="Eliminar Mensaje"
                className="p-2 rounded-full text-white bg-red-600 hover:bg-red-700 transition-colors duration-200 shadow-md">
                <Trash2 size={18} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
