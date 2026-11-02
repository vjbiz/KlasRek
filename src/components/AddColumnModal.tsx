import React, { useState } from 'react';
import { X, Plus, Layers } from 'lucide-react';

interface AddColumnModalProps {
  isOpen: boolean;
  category: 'speaking' | 'quizzes' | 'participation' | 'notebook' | null;
  onClose: () => void;
  onAdd: (name: string, maxScore: number) => void;
}

export const AddColumnModal: React.FC<AddColumnModalProps> = ({
  isOpen,
  category,
  onClose,
  onAdd,
}) => {
  const [name, setName] = useState('');
  const [maxScore, setMaxScore] = useState(10);

  if (!isOpen || !category) return null;

  const categoryLabels = {
    speaking: { title: 'Speaking Score Column', placeholder: 'e.g. Speaking 5 / Roleplay' },
    quizzes: { title: 'Quiz Score Column', placeholder: 'e.g. Quiz 5 / Mid-review' },
    participation: { title: 'Participation Score Column', placeholder: 'e.g. Activity 3' },
    notebook: { title: 'Notebook Score Column', placeholder: 'e.g. Chapter 3 Notes' },
  };

  const info = categoryLabels[category];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd(name.trim(), maxScore || 10);
    setName('');
    setMaxScore(10);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        <div className="px-5 py-3.5 bg-indigo-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4" />
            <h3 className="text-sm font-bold">Add {info.title}</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-indigo-200 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
              Column Title / Assessment Name *
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder={info.placeholder}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
            />
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
              Maximum Raw Points (Max Score)
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={maxScore}
              onChange={(e) => setMaxScore(Number(e.target.value))}
              className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 font-bold text-center"
            />
            <p className="text-[10px] text-slate-500 mt-1">
              The app automatically recalculates the category equivalent score (e.g. 15 max) based on total points.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 border rounded-lg text-slate-600 dark:text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Column</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
