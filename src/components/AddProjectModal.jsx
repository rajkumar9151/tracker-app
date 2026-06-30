import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Plus, Trash2 } from 'lucide-react';

export default function AddProjectModal({ onClose, onSave }) {
  const [projectName, setProjectName] = useState('');
  const [customColumns, setCustomColumns] = useState([]);
  const [newColumnName, setNewColumnName] = useState('');

  const handleAddColumn = () => {
    if (newColumnName.trim() && !customColumns.includes(newColumnName.trim())) {
      setCustomColumns([...customColumns, newColumnName.trim()]);
      setNewColumnName('');
    }
  };

  const handleRemoveColumn = (col) => {
    setCustomColumns(customColumns.filter(c => c !== col));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (projectName.trim()) {
      onSave(projectName.trim(), customColumns);
    }
  };

  return (
    <div className="modal-overlay">
      <motion.div 
        className="modal-content"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 className="modal-title" style={{ margin: 0 }}>Create New Project</h2>
          <button onClick={onClose} className="action-icon" style={{ background: 'transparent', border: 'none' }}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Project Name</label>
            <input 
              required 
              type="text" 
              value={projectName} 
              onChange={(e) => setProjectName(e.target.value)} 
              className="form-input" 
              placeholder="e.g., Q3 Marketing Campaign" 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Custom Fields / Form Columns (Optional)</label>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              Standard fields (Task Name, Owner, Status, Priority, Created Date) are included automatically. Add any extra fields you need.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <input 
                type="text" 
                value={newColumnName} 
                onChange={(e) => setNewColumnName(e.target.value)} 
                className="form-input" 
                placeholder="e.g., Department, Budget..." 
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddColumn())}
              />
              <button type="button" onClick={handleAddColumn} className="btn btn-secondary">
                <Plus size={16} /> Add
              </button>
            </div>

            {customColumns.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {customColumns.map(col => (
                  <span key={col} style={{ 
                    display: 'flex', alignItems: 'center', gap: '0.25rem', 
                    padding: '0.25rem 0.75rem', backgroundColor: 'var(--surface-hover)', 
                    borderRadius: '9999px', fontSize: '0.8rem', border: '1px solid var(--border-color)' 
                  }}>
                    {col}
                    <button type="button" onClick={() => handleRemoveColumn(col)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--danger-color)', display: 'flex' }}>
                      <Trash2 size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={!projectName.trim()}>Create Project</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
