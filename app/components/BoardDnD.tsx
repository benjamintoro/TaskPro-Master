'use client'

import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { updateTaskStatus, deleteTask, cyclePriority, updateTaskContent } from '../actions';
import { useState, useEffect, useRef, useMemo } from 'react';

type Task = {
  id: number;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate: Date | null;
};

type BoardProps = {
  id: number;
  title: string;
  tasks: Task[];
};

const COLUMNS = [
  { id: 'PENDING', title: 'Pendiente', color: 'border-yellow-500', text: 'text-yellow-500' },
  { id: 'IN_PROGRESS', title: 'En Progreso', color: 'border-blue-500', text: 'text-blue-500' },
  { id: 'DONE', title: 'Terminado', color: 'border-green-500', text: 'text-green-500' }
];

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'HIGH': return 'bg-red-500 shadow-red-500/50';
    case 'MEDIUM': return 'bg-orange-500 shadow-orange-500/50';
    default: return 'bg-gray-600';
  }
};

const isOverdue = (date: Date | null, status: string) => {
  if (!date || status === 'DONE') return false;
  return new Date(date) < new Date(new Date().setHours(0, 0, 0, 0));
};

export default function BoardDnD({ board }: { board: BoardProps }) {
  const [tasks, setTasks] = useState(board.tasks);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPriority, setFilterPriority] = useState("ALL"); 
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => { setTasks(board.tasks); }, [board.tasks]);
  useEffect(() => {
    const animation = requestAnimationFrame(() => setEnabled(true));
    return () => { cancelAnimationFrame(animation); setEnabled(false); };
  }, []);

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPriority = filterPriority === "ALL" || task.priority === filterPriority;
      return matchesSearch && matchesPriority;
    });
  }, [tasks, searchQuery, filterPriority]);

  if (!enabled) return null;

  const onDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination || (source.droppableId === destination.droppableId)) return;
    if (searchQuery !== "" || filterPriority !== "ALL") { alert("Limpia los filtros antes de mover tareas."); return; }

    const newStatus = destination.droppableId;
    const taskId = parseInt(draggableId);
    setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));

    const formData = new FormData();
    formData.append('taskId', taskId.toString());
    formData.append('status', newStatus);
    formData.append('boardId', board.id.toString());
    await updateTaskStatus(formData);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 bg-gray-800 p-4 rounded-xl border border-gray-700 shadow-lg">
        <div className="flex-1">
          <input type="text" placeholder="🔍 Buscar tarea..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-gray-900 border border-gray-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-blue-500" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Prioridad:</span>
          <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} className="bg-gray-900 border border-gray-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-blue-500">
            <option value="ALL">Todas</option>
            <option value="HIGH">Alta 🔴</option>
            <option value="MEDIUM">Media 🟠</option>
            <option value="LOW">Baja ⚫</option>
          </select>
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {COLUMNS.map((col) => (
            <div key={col.id} className="space-y-3">
              <h3 className={`font-bold uppercase text-sm tracking-wider ${col.text} flex justify-between`}>
                {col.title}
                <span className="bg-gray-800 text-gray-400 px-2 rounded text-xs py-0.5">{filteredTasks.filter(t => t.status === col.id).length}</span>
              </h3>
              <Droppable droppableId={col.id}>
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className={`bg-gray-800/50 p-4 rounded-xl min-h-[200px] transition-colors ${(searchQuery !== "" || filterPriority !== "ALL") ? "opacity-90 border-2 border-dashed border-gray-700" : ""}`}>
                    {filteredTasks.filter(t => t.status === col.id).map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id.toString()} index={index} isDragDisabled={searchQuery !== "" || filterPriority !== "ALL"}>
                        {(provided, snapshot) => (
                          <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className={`bg-gray-800 p-4 rounded-lg border-l-4 ${col.color} mb-3 shadow-lg hover:bg-gray-750 transition group relative ${snapshot.isDragging ? "opacity-50" : ""}`} onDoubleClick={() => setEditingId(task.id)}>
                            {editingId === task.id ? (
                              <form action={async (formData) => { await updateTaskContent(formData); setEditingId(null); }} className="flex flex-col gap-2">
                                <input type="hidden" name="taskId" value={task.id} />
                                <input type="hidden" name="boardId" value={board.id} />
                                <input type="text" name="title" defaultValue={task.title} className="bg-gray-900 border border-gray-600 text-white px-2 py-1 rounded text-sm w-full font-bold" autoFocus />
                                <textarea name="description" defaultValue={task.description || ""} placeholder="Descripción..." className="bg-gray-900 border border-gray-600 text-gray-300 px-2 py-1 rounded text-xs resize-none h-16 w-full" />
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] text-gray-500">Vence:</span>
                                  <input type="date" name="dueDate" defaultValue={task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''} className="bg-gray-900 border border-gray-600 text-white text-xs px-2 py-1 rounded w-full" />
                                </div>
                                <div className="flex justify-end gap-2 mt-1">
                                  <button type="button" onClick={() => setEditingId(null)} className="text-xs text-gray-400 hover:text-white">Cancelar</button>
                                  <button type="submit" className="text-xs bg-blue-600 px-3 py-1 rounded hover:bg-blue-500">Guardar</button>
                                </div>
                              </form>
                            ) : (
                              <>
                                <div className="flex justify-between items-start mb-2">
                                  <div className="w-full">
                                    <span className={`font-medium block ${task.status === 'DONE' ? 'line-through text-gray-500' : 'text-gray-100'}`}>{task.title}</span>
                                    {task.description && <p className="text-xs text-gray-400 mt-1 line-clamp-2">{task.description}</p>}
                                    {task.dueDate && <div className={`mt-2 text-[10px] flex items-center gap-1 font-mono ${isOverdue(task.dueDate, task.status) ? 'text-red-400 font-bold' : 'text-gray-500'}`}><span>📅 {new Date(task.dueDate).toLocaleDateString()}</span>{isOverdue(task.dueDate, task.status) && <span>(Vencida)</span>}</div>}
                                  </div>
                                  <form action={deleteTask} className="ml-2">
                                    <input type="hidden" name="taskId" value={task.id} />
                                    <input type="hidden" name="boardId" value={board.id} />
                                    <button className="text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition p-1">✕</button>
                                  </form>
                                </div>
                                <div className="flex justify-between items-end mt-2">
                                  <span className="text-[10px] text-gray-600 select-none">Doble click para editar</span>
                                  <form action={cyclePriority}>
                                    <input type="hidden" name="taskId" value={task.id} />
                                    <input type="hidden" name="boardId" value={board.id} />
                                    <input type="hidden" name="currentPriority" value={task.priority} />
                                    <button className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white shadow-sm transition-all hover:scale-105 ${getPriorityColor(task.priority)}`}>{task.priority === 'LOW' ? 'BAJA' : task.priority === 'MEDIUM' ? 'MEDIA' : 'ALTA'}</button>
                                  </form>
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}