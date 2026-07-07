import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Upload } from 'lucide-react';
import { getISOWeek } from 'date-fns';

export default function AddProjectUpdateModal({ project, onClose, onSave }) {
  const now = new Date();
  const [formData, setFormData] = useState({
    updateDate: now.toISOString().split('T')[0],
    weekNumber: `Week ${getISOWeek(now)}`,
    description: '',
    status: 'Open'
  });
  const [uploading, setUploading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    const form = new FormData();
    form.append('file', file);
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: form });
      const data = await res.json();
      if (data.success) {
        setFormData(prev => ({ ...prev, attachment: data.url }));
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
      updateId: 'PUPD-' + Math.floor(Math.random() * 100000).toString().padStart(5, '0'),
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
            <h2 className="modal-title" style={{ margin: 0 }}>General Project Update</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>For project: {project}</p>
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
            <div>
              <label className="form-label">Status</label>
              <select 
                name="status" 
                value={formData.status || 'Open'} 
                onChange={handleChange} 
                className="form-select"
              >
                <option value="Open">Open</option>
                <option value="Closed">Closed</option>
              </select>
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
              placeholder="What progress was made on the project this week?" 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Attachment (Optional)</label>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <input type="file" onChange={(e) => handleFileUpload(e.target.files[0])} style={{ display: 'none' }} id="file-add-pupd" />
              <label htmlFor="file-add-pupd" className="btn btn-secondary" style={{ cursor: 'pointer' }}>
                <Upload size={16} /> {uploading ? 'Uploading...' : 'Upload File'}
              </label>
              {formData.attachment && (
                <a href={formData.attachment} target="_blank" rel="noreferrer" style={{ fontSize: '0.8rem', color: 'var(--primary-color)' }}>
                  Attached
                </a>
              )}
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={uploading}>Save Update</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
