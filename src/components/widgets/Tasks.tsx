import React from 'react';
import { CheckSquare, Plus, Trash2 } from 'lucide-react';

interface Task {
  id: string;
  text: string;
  completed: boolean;
}

export const Tasks = () => {
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [newTask, setNewTask] = React.useState('');

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTask.trim()) {
      setTasks([...tasks, { id: crypto.randomUUID(), text: newTask, completed: false }]);
      setNewTask('');
    }
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  return (
    <div className="h-full flex flex-col">
      <form onSubmit={addTask} className="p-3 border-b border-indigo-200 dark:border-cyan-500/20">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={(e) => e.stopPropagation()}
            placeholder="Add a task..."
            className="w-[calc(100%-84px)] bg-transparent border border-indigo-300 dark:border-cyan-500/30 rounded-lg px-3 py-1.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500 dark:focus:border-cyan-500 placeholder:text-indigo-400 dark:placeholder:text-cyan-500/30"
          />
          <button
            type="submit"
            className="shrink-0 bg-gradient-to-r from-indigo-600 to-indigo-500 dark:from-cyan-500 dark:to-cyan-400 text-white w-8 h-8 rounded-lg hover:brightness-110 transition-all flex items-center justify-center"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </form>

      <div className="flex-1 overflow-auto p-3">
        {tasks.map(task => (
          <div
            key={task.id}
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-indigo-500/5 dark:hover:bg-cyan-500/5 group"
          >
            <button
              onClick={() => toggleTask(task.id)}
              className={`w-4 h-4 border rounded-sm ${
                task.completed ? 'bg-indigo-500 dark:bg-cyan-500 border-indigo-500 dark:border-cyan-500' : 'border-indigo-300 dark:border-cyan-500/30'
              }`}
            />
            <span className={`flex-1 text-sm ${
              task.completed ? 'text-indigo-500/50 dark:text-cyan-500/50 line-through' : 'text-slate-800 dark:text-white'
            }`}>
              {task.text}
            </span>
            <button
              onClick={() => deleteTask(task.id)}
              className="text-indigo-400/30 hover:text-indigo-500 dark:text-cyan-500/30 dark:hover:text-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};