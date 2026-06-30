import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Upload } from 'lucide-react';
import { getNextWorkingWeekDate } from '@/lib/dateUtils';

export default function AddTaskModal({ columns, metadata, onClose, onSave }) {
  const baseColumns = ['ID', 'Task Name', 'Owner', 'Status', 'Priority', 'Created Date', 'Next Update Due'];
  const customColumns = columns ? columns.filter(c => !baseColumns.includes(c)) : [];

  const [formData, setFormData] = useState({
    'Task Name': '',
    'Owner': '',
    'Status': 'To Do',
    'Priority': 'Medium',
    'Next Update Due': getNextWorkingWeekDate(),
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
      'ID': 'TSK-' + Math.floor(Math.random() * 10000).toString().padStart(4, '0'),
      'Created Date': new Date().toISOString(),
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
          <h2 className="modal-title" style={{ margin: 0 }}>Add New Task</h2>
          <button onClick={onClose} className="action-icon" style={{ background: 'transparent', border: 'none' }}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Task Name</label>
            <input required type="text" name="Task Name" value={formData['Task Name']} onChange={handleChange} className="form-input" placeholder="e.g., Implement Login Feature" />
          </div>

          <div className="form-group">
            <label className="form-label">Owner</label>
            <input required type="text" name="Owner" value={formData['Owner']} onChange={handleChange} className="form-input" placeholder="e.g., John Doe" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <label className="form-label">Status</label>
              <select name="Status" value={formData['Status']} onChange={handleChange} className="form-select">
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
              </select>
            </div>

            <div>
              <label className="form-label">Priority</label>
              <select name="Priority" value={formData['Priority']} onChange={handleChange} className="form-select">
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Next Update Due</label>
            <input type="date" name="Next Update Due" value={formData['Next Update Due']} onChange={handleChange} className="form-input" />
          </div>

          {/* Dynamic Custom Fields */}
          {customColumns.map(col => {
            const type = metadata?.[col] || 'text';
            
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
                    <input type="file" onChange={(e) => handleFileUpload(col, e.target.files[0])} style={{ display: 'none' }} id={`file-add-${col}`} />
                    <label htmlFor={`file-add-${col}`} className="btn btn-secondary" style={{ cursor: 'pointer' }}>
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
            <button type="submit" className="btn btn-primary" disabled={uploading}>Save Task</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
