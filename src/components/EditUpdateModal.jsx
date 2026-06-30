import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Upload } from 'lucide-react';
import { format } from 'date-fns';

const BASE_UPDATE_COLUMNS = ['Update ID', 'Task ID', 'Task Name', 'Week Number', 'Update Date', 'Description'];

export default function EditUpdateModal({ update, updateColumns, metadata, onClose, onSave }) {
  const customColumns = updateColumns ? updateColumns.filter(c => !BASE_UPDATE_COLUMNS.includes(c)) : [];

  const [formData, setFormData] = useState({
    updateId: update.updateId,
    taskId: update.taskId,
    taskName: update.taskName,
    weekNumber: update.weekNumber,
    updateDate: update.updateDate,
    description: update.description,
    ...customColumns.reduce((acc, col) => ({ ...acc, [col]: update[col] || '' }), {})
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
    onSave(formData);
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
            <h2 className="modal-title" style={{ margin: 0 }}>Edit Update</h2>
            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              {formData.taskId}: {formData.taskName}
            </p>
          </div>
          <button onClick={onClose} className="action-icon" style={{ background: 'transparent', border: 'none' }}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
            <div className="form-group">
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

            <div className="form-group">
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
              rows={4}
              name="description"
              value={formData.description} 
              onChange={handleChange}
              className="form-input" 
              placeholder="What's the status this week?"
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
                    <input type="file" onChange={(e) => handleFileUpload(col, e.target.files[0])} style={{ display: 'none' }} id={`file-edit-upd-${col}`} />
                    <label htmlFor={`file-edit-upd-${col}`} className="btn btn-secondary" style={{ cursor: 'pointer' }}>
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

            return (
              <div className="form-group" key={col}>
                <label className="form-label">{col}</label>
                <input type="text" name={col} value={formData[col] || ''} onChange={handleChange} className="form-input" />
              </div>
            );
          })}

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={uploading}>Save Changes</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
