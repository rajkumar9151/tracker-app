import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Plus, Target, Briefcase, DollarSign, Heart, Star, Activity, Home, Plane, Car, Book, Coffee, ShoppingBag, Circle, User, Users, Globe, Zap, Shield, Key } from 'lucide-react';

const ICON_MAP = {
  Target, Briefcase, DollarSign, Heart, Star, Activity, Home, Plane, Car, Book, Coffee, ShoppingBag, Circle, User, Users, Globe, Zap, Shield, Key
};

const COLORS = [
  '#ef4444', // Red
  '#f97316', // Orange
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#14b8a6', // Teal
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
  '#6366f1', // Indigo
  '#8b5cf6', // Violet
  '#d946ef', // Fuchsia
  '#ec4899', // Pink
  '#64748b', // Slate
];

export default function ManageCategoriesModal({ isOpen, onClose, categories, onCategoryAdded, onCategoryDeleted, onCategoryUpdated }) {
  const [newLabel, setNewLabel] = useState('');
  const [newColor, setNewColor] = useState(COLORS[6]); // Default to blue
  const [newIcon, setNewIcon] = useState('Circle');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingLabel, setEditingLabel] = useState('');

  if (!isOpen) return null;

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newLabel.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/annual-planner/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add',
          payload: { label: newLabel.trim(), color: newColor, icon: newIcon }
        })
      });
      const data = await res.json();
      if (data.success) {
        onCategoryAdded(data.category);
        setNewLabel('');
      }
    } catch (err) {
      console.error('Error adding category:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch('/api/annual-planner/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete',
          payload: id
        })
      });
      const data = await res.json();
      if (data.success) {
        onCategoryDeleted(id);
      }
    } catch (err) {
      console.error('Error deleting category:', err);
    }
  };

  const handleUpdate = async (id, newLabelValue) => {
    if (!newLabelValue.trim()) return setEditingId(null);
    try {
      const res = await fetch('/api/annual-planner/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update',
          payload: { id, label: newLabelValue.trim() }
        })
      });
      const data = await res.json();
      if (data.success) {
        if (onCategoryUpdated) onCategoryUpdated(data.category);
      }
    } catch (err) {
      console.error('Error updating category:', err);
    } finally {
      setEditingId(null);
    }
  };

  const startEditing = (cat) => {
    setEditingId(cat.id);
    setEditingLabel(cat.label);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
          onClick={onClose} 
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        ></motion.div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-2xl shadow-xl w-full max-w-md relative z-10 overflow-hidden border border-slate-100 flex flex-col max-h-[80vh]"
        >
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Manage Categories</h2>
              <p className="text-xs font-medium text-slate-500">Add or remove strategy pillars.</p>
            </div>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-3 mb-8">
              {categories.map(cat => {
                const IconComponent = ICON_MAP[cat.icon || 'Circle'] || Circle;
                return (
                  <div key={cat.id} className="flex items-center justify-between px-4 py-3 bg-white border border-slate-200 rounded-lg shadow-sm group">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${cat.color}20`, color: cat.color }}>
                        <IconComponent className="w-3.5 h-3.5" />
                      </div>
                    {editingId === cat.id ? (
                      <input
                        autoFocus
                        type="text"
                        value={editingLabel}
                        onChange={(e) => setEditingLabel(e.target.value)}
                        onBlur={() => handleUpdate(cat.id, editingLabel)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleUpdate(cat.id, editingLabel);
                          if (e.key === 'Escape') setEditingId(null);
                        }}
                        className="w-full text-sm font-semibold text-slate-900 bg-transparent border-b border-blue-500 focus:outline-none"
                      />
                    ) : (
                      <span 
                        onClick={() => startEditing(cat)}
                        className="text-sm font-semibold text-slate-700 cursor-text hover:bg-slate-50 px-1 py-0.5 rounded transition-colors flex-1"
                        title="Click to edit"
                      >
                        {cat.label}
                      </span>
                    )}
                  </div>
                  <button 
                    onClick={() => handleDelete(cat.id)}
                    className="text-slate-400 hover:text-red-500 transition-colors p-1 ml-2 opacity-0 group-hover:opacity-100"
                    title="Delete category"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                );
              })}
              {categories.length === 0 && (
                <div className="text-sm text-slate-500 text-center py-4">No categories created yet.</div>
              )}
            </div>

            <div className="border-t border-slate-100 pt-6">
              <h3 className="text-sm font-bold text-slate-900 mb-4 tracking-tight">Create New Category</h3>
              <form onSubmit={handleAdd} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Category Name</label>
                  <input 
                    required 
                    type="text" 
                    value={newLabel} 
                    onChange={e => setNewLabel(e.target.value)} 
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                    placeholder="e.g., Engineering"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Color Label</label>
                  <div className="grid grid-cols-6 gap-2">
                    {COLORS.map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setNewColor(color)}
                        className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-transform ${newColor === color ? 'border-slate-400 scale-110 shadow-sm' : 'border-transparent hover:scale-110'}`}
                      >
                        <span className="w-6 h-6 rounded-full" style={{ backgroundColor: color }}></span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Icon</label>
                  <div className="grid grid-cols-7 gap-2">
                    {Object.keys(ICON_MAP).map(iconName => {
                      const Icon = ICON_MAP[iconName];
                      return (
                        <button
                          key={iconName}
                          type="button"
                          onClick={() => setNewIcon(iconName)}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${newIcon === iconName ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-50 text-slate-500 hover:bg-slate-200'}`}
                          title={iconName}
                        >
                          <Icon className="w-4 h-4" />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-2">
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit" 
                    disabled={isSubmitting || !newLabel.trim()}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white rounded-lg text-sm font-bold shadow-md transition-all"
                  >
                    {isSubmitting ? 'Adding...' : <><Plus className="w-4 h-4" /> Add Category</>}
                  </motion.button>
                </div>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
