import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

export default function AddColumnModal({ onClose, onSave }) {
  const [columnName, setColumnName] = useState('');
  const [columnType, setColumnType] = useState('text');
  const [targetSheet, setTargetSheet] = useState('Tasks');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (columnName.trim()) {
      onSave(columnName.trim(), columnType, targetSheet);
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
          <h2 className="modal-title" style={{ margin: 0 }}>Add New Column</h2>
          <button onClick={onClose} className="action-icon" style={{ background: 'transparent', border: 'none' }}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Column Name</label>
            <input 
              required 
              type="text" 
              value={columnName} 
              onChange={(e) => setColumnName(e.target.value)} 
              className="form-input" 
              placeholder="e.g., Launch Date, Evidence..." 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Column Type</label>
            <select 
              value={columnType} 
              onChange={(e) => setColumnType(e.target.value)} 
              className="form-select"
            >
              <option value="text">Text (Default)</option>
              <option value="date">Date</option>
              <option value="attachment">Image / Attachment</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Apply To</label>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input 
                  type="radio" 
                  name="targetSheet" 
                  value="Tasks" 
                  checked={targetSheet === 'Tasks'} 
                  onChange={(e) => setTargetSheet(e.target.value)} 
                />
                Tasks Table
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input 
                  type="radio" 
                  name="targetSheet" 
                  value="Updates" 
                  checked={targetSheet === 'Updates'} 
                  onChange={(e) => setTargetSheet(e.target.value)} 
                />
                Updates Table
              </label>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={!columnName.trim()}>Add Column</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
