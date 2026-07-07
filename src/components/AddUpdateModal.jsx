import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Upload } from 'lucide-react';
import { getISOWeek } from 'date-fns';

const BASE_UPDATE_COLUMNS = ['Update ID', 'Task ID', 'Task Name', 'Week Number', 'Update Date', 'Description'];

export default function AddUpdateModal({ task, updateColumns, metadata, onClose, onSave }) {
  const customColumns = updateColumns ? updateColumns.filter(c => !BASE_UPDATE_COLUMNS.includes(c)) : [];

  const now = new Date();
  const [formData, setFormData] = useState({
    updateDate: now.toISOString().split('T')[0],
    weekNumber: `Week ${getISOWeek(now)}`,
    description: '',
    ...customColumns.reduce((acc, col) => ({ ...acc, [col]: '' }), {})
  });
  const [uploading, setUploading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (col, file) => {
    if (!file) return;
    setUploading(true);
    const form = new FormData();
    form.append('file', file);
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: form });
      const data = await res.json();
      if (data.success) {
        setFormData(prev => ({ ...prev, [col]: data.url }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      updateId: 'UPD-' + Math.floor(Math.random() * 100000).toString().padStart(5, '0'),
      taskId: task['ID'],
      taskName: task['Task Name'],
      ...formData
    });
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
          <div>
            <h2 className="modal-title" style={{ margin: 0 }}>Add Update</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>For task: {task.taskName}</p>
          </div>
          <button onClick={onClose} className="action-icon" style={{ background: 'transparent', border: 'none' }}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label className="form-label">Update Date</label>
              <input 
                type="date" 
                name="updateDate"
                value={formData.updateDate} 
                onChange={handleChange}
                className="form-input" 
                required
              />
            </div>
            <div>
              <label className="form-label">Week Number</label>
              <input 
                type="text" 
                name="weekNumber"
                value={formData.weekNumber} 
                onChange={handleChange}
                className="form-input" 
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Update Description</label>
            <textarea 
              required 
              rows="4"
              name="description"
              value={formData.description} 
              onChange={handleChange} 
              className="form-textarea" 
              placeholder="What progress was made this week?" 
            />
          </div>

          {/* Dynamic Custom Fields */}
          {customColumns.map(col => {
            const type = metadata?.[`Updates_${col}`] || 'text';
            
            if (type === 'date') {
              return (
                <div className="form-group" key={col}>
                  <label className="form-label">{col}</label>
                  <input type="date" name={col} value={formData[col] || ''} onChange={handleChange} className="form-input" />
                </div>
              );
            }
            
            if (type === 'attachment') {
              return (
                <div className="form-group" key={col}>
                  <label className="form-label">{col}</label>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <input type="file" onChange={(e) => handleFileUpload(col, e.target.files[0])} style={{ display: 'none' }} id={`file-add-upd-${col}`} />
                    <label htmlFor={`file-add-upd-${col}`} className="btn btn-secondary" style={{ cursor: 'pointer' }}>
                      <Upload size={16} /> {uploading ? 'Uploading...' : 'Upload File'}
                    </label>
                    {formData[col] && (
                      <a href={formData[col]} target="_blank" rel="noreferrer" style={{ fontSize: '0.8rem', color: 'var(--primary-color)' }}>
                        Attached
                      </a>
                    )}
                  </div>
                </div>
              );
            }
            
            if (type === 'dropdown') {
              const options = metadata?.options?.[`Updates_${col}`] || [];
              return (
                <div className="form-group" key={col}>
                  <label className="form-label">{col}</label>
                  <select name={col} value={formData[col] || ''} onChange={handleChange} className="form-select">
                    <option value="">-- Select --</option>
                    {options.map((opt, i) => (
                      <option key={i} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              );
            }

            return (
              <div className="form-group" key={col}>
                <label className="form-label">{col}</label>
                <input type="text" name={col} value={formData[col] || ''} onChange={handleChange} className="form-input" />
              </div>
            );
          })}

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={uploading}>Save Update</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
