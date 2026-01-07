
import React, { useState } from 'react';
import type { BucketItem } from '../types';
import { translations } from '../translations';
import type { Language } from '../translations';
import { Plus, Check, Trash2, AlertCircle } from 'lucide-react';

interface Props {
  list: BucketItem[];
  onUpdate: (list: BucketItem[]) => void;
  lang: Language;
}

const LifeList: React.FC<Props> = ({ list, onUpdate, lang }) => {
  const [newItem, setNewItem] = useState('');
  const t = translations[lang];

  const addItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.trim()) return;
    const item: BucketItem = {
      id: crypto.randomUUID(),
      text: newItem,
      completed: false,
      priority: 'medium'
    };
    onUpdate([item, ...list]);
    setNewItem('');
  };

  const toggleItem = (id: string) => {
    onUpdate(list.map(item => item.id === id ? { ...item, completed: !item.completed } : item));
  };

  const removeItem = (id: string) => {
    onUpdate(list.filter(item => item.id !== id));
  };

  return (
    <div className="space-y-6">
      <form onSubmit={addItem} className="relative">
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder={t.placeholderBucket}
          className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-6 focus:outline-none focus:border-red-600 transition-all text-sm placeholder:text-gray-700"
        />
        <button type="submit" className="absolute right-3 top-2.5 p-2 bg-red-600 rounded-lg hover:bg-red-700 transition-colors">
          <Plus size={20} className="text-white" />
        </button>
      </form>

      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {list.length === 0 ? (
          <div className="text-center py-10 text-gray-600 italic text-sm">
            {t.emptyBucket}
          </div>
        ) : (
          list.map(item => (
            <div 
              key={item.id}
              className={`flex items-center gap-4 p-4 rounded-xl border group transition-all ${
                item.completed ? 'bg-zinc-900/20 border-white/5 opacity-50' : 'bg-white/5 border-white/10'
              }`}
            >
              <button 
                onClick={() => toggleItem(item.id)}
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                  item.completed ? 'bg-green-600 border-green-600' : 'border-white/20 group-hover:border-red-500'
                }`}
              >
                {item.completed && <Check size={14} className="text-white" />}
              </button>
              
              <span className={`flex-1 text-sm ${item.completed ? 'line-through text-gray-600' : 'text-gray-200'}`}>
                {item.text}
              </span>

              <button 
                onClick={() => removeItem(item.id)}
                className="opacity-0 group-hover:opacity-100 p-2 text-gray-500 hover:text-red-500 transition-all"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>
      
      {list.some(i => !i.completed) && (
        <div className="flex items-center gap-2 text-[10px] text-red-400 font-bold uppercase tracking-widest mt-4">
          <AlertCircle size={12} /> {t.bucketWarning}
        </div>
      )}
    </div>
  );
};

export default LifeList;

