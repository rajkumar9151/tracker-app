import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function AddGoalModal({ isOpen, onClose, onAdd, onUpdate, onDelete, categories, editingGoal }) {
  const todayStr = new Date().toISOString().split('T')[0];
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: todayStr,
    category: categories[0]?.id || '',
    recurrence: 'none',
    recurrenceConfig: '1' // Default day of week (Monday) or day of month (1st)
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  React.useEffect(() => {
    if (editingGoal) {
      setFormData({
        title: editingGoal.title || '',
        description: editingGoal.description || '',
        startDate: editingGoal.startDate || todayStr,
        category: editingGoal.category || (categories[0]?.id || ''),
        recurrence: editingGoal.recurrence || 'none',
        recurrenceConfig: editingGoal.recurrenceConfig || '1'
      });
    } else {
      setFormData({
        title: '',
        description: '',
        startDate: todayStr,
        category: categories[0]?.id || '',
        recurrence: 'none',
        recurrenceConfig: '1'
      });
    }
  }, [editingGoal, categories, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const isEditing = !!editingGoal;
      const url = '/api/annual-planner';
      const method = isEditing ? 'PUT' : 'POST';
      const body = isEditing ? { id: editingGoal.id, ...formData } : formData;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      
      if (data.success) {
        if (isEditing) {
          if (onUpdate) onUpdate(data.goal);
        } else {
          if (onAdd) onAdd(data.goal);
        }
        onClose();
      }
    } catch (err) {
      console.error('Error saving goal:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!editingGoal || !window.confirm('Are you sure you want to delete this goal?')) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/annual-planner?id=${editingGoal.id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        if (onDelete) onDelete(editingGoal.id);
        onClose();
      }
    } catch (err) {
      console.error('Error deleting goal:', err);
    } finally {
      setIsDeleting(false);
    }
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
          className="bg-white rounded-2xl shadow-xl w-full max-w-md relative z-10 overflow-hidden border border-slate-100"
        >
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              {editingGoal ? 'Edit Goal' : 'Add New Goal'}
            </h2>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Goal Title</label>
              <input 
                required 
                type="text" 
                value={formData.title} 
                onChange={e => setFormData({...formData, title: e.target.value})} 
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors placeholder:text-slate-400"
                placeholder="e.g., Q4 Strategy Kickoff"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Recurrence</label>
                <select 
                  value={formData.recurrence}
                  onChange={e => setFormData({...formData, recurrence: e.target.value})}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0247c7]/20 focus:border-[#0247c7] transition-all text-slate-900 appearance-none font-semibold"
                >
                  <option value="none">One-time</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              
              {formData.recurrence === 'none' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Date</label>
                  <input 
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={e => setFormData({...formData, startDate: e.target.value})}
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0247c7]/20 focus:border-[#0247c7] transition-all text-slate-900"
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Category</label>
                <select 
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0247c7]/20 focus:border-[#0247c7] transition-all text-slate-900 appearance-none font-semibold"
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
              </div>

              {formData.recurrence === 'weekly' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Day of Week</label>
                  <select 
                    value={formData.recurrenceConfig}
                    onChange={e => setFormData({...formData, recurrenceConfig: e.target.value})}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0247c7]/20 focus:border-[#0247c7] transition-all text-slate-900 appearance-none font-semibold"
                  >
                    <option value="1">Monday</option>
                    <option value="2">Tuesday</option>
                    <option value="3">Wednesday</option>
                    <option value="4">Thursday</option>
                    <option value="5">Friday</option>
                    <option value="6">Saturday</option>
                    <option value="0">Sunday</option>
                  </select>
                </div>
              )}

              {formData.recurrence === 'monthly' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Day of Month</label>
                  <select 
                    value={formData.recurrenceConfig}
                    onChange={e => setFormData({...formData, recurrenceConfig: e.target.value})}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0247c7]/20 focus:border-[#0247c7] transition-all text-slate-900 appearance-none font-semibold"
                  >
                    {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Description</label>
              <textarea 
                required
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                placeholder="What exactly are we trying to achieve?"
                rows={3}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0247c7]/20 focus:border-[#0247c7] transition-all text-slate-900 resize-none custom-scrollbar"
              />
            </div>

            <div className="pt-2 flex gap-3">
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit" 
                disabled={isSubmitting || isDeleting}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0247c7] hover:bg-blue-800 disabled:bg-blue-400 text-white rounded-lg text-sm font-bold shadow-[0_4px_14px_0_rgba(2,71,199,0.39)] hover:shadow-[0_6px_20px_rgba(2,71,199,0.23)] transition-all"
              >
                {isSubmitting ? 'Saving...' : (editingGoal ? 'Save Changes' : 'Save Goal')}
              </motion.button>
              
              {editingGoal && (
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button" 
                  onClick={handleDelete}
                  disabled={isSubmitting || isDeleting}
                  className="px-4 py-2.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 rounded-lg text-sm font-bold transition-all"
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </motion.button>
              )}
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
