"use client";

import React, { useState, useEffect } from 'react';

import TrackerTable from '@/components/TrackerTable';
import AddTaskModal from '@/components/AddTaskModal';
import AddUpdateModal from '@/components/AddUpdateModal';
import EditUpdateModal from '@/components/EditUpdateModal';
import AddProjectModal from '@/components/AddProjectModal';
import AddColumnModal from '@/components/AddColumnModal';
import EditTaskModal from '@/components/EditTaskModal';
import WeeklySummaryModal from '@/components/WeeklySummaryModal';
import { AnimatePresence } from 'framer-motion';
import { FolderPlus, Plus, Trash2, FileText } from 'lucide-react';

export default function Home() {
  const [projects, setProjects] = useState([]);
  const [dueTasks, setDueTasks] = useState([]);
  const [activeProject, setActiveProject] = useState('');
  
  const [data, setData] = useState({ columns: [], tasks: [], updates: [], metadata: {} });
  const [loading, setLoading] = useState(true);
  
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showColumnModal, setShowColumnModal] = useState(false);
  const [showWeeklySummaryModal, setShowWeeklySummaryModal] = useState(false);
  const [activeTaskForUpdate, setActiveTaskForUpdate] = useState(null);
  const [activeTaskForEdit, setActiveTaskForEdit] = useState(null);
  const [activeUpdateForEdit, setActiveUpdateForEdit] = useState(null);

  const fetchProjects = async () => {
    try {
      const res = await fetch(`/api/projects?t=${Date.now()}`);
      const result = await res.json();
      setProjects(result.projects || []);
      // We don't auto-select a project anymore so the Dashboard is shown
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const fetchDueTasks = async () => {
    try {
      const res = await fetch('/api/duetasks');
      if (res.ok) {
        const result = await res.json();
        setDueTasks(result.dueTasks || []);
      }
    } catch (error) {
      console.error('Error fetching due tasks:', error);
    }
  };

  const fetchData = async (projectName) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/data?project=${encodeURIComponent(projectName)}&t=${Date.now()}`);
      if (res.ok) {
        const result = await res.json();
        setData(result);
      } else {
        setData({ columns: [], tasks: [], updates: [], metadata: {} });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setData({ columns: [], tasks: [], updates: [], metadata: {} });
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchProjects();
    fetchDueTasks();
  }, []);

  // Fetch data when active project changes
  useEffect(() => {
    if (activeProject) {
      fetchData(activeProject);
    } else {
      setLoading(false);
    }
  }, [activeProject]);

  const handleCreateProject = async (projectName, customColumns) => {
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectName, customColumns })
      });
      if (res.ok) {
        setShowProjectModal(false);
        await fetchProjects();
        setActiveProject(projectName);
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to create project');
      }
    } catch (error) {
      console.error('Error creating project:', error);
      alert('An unexpected error occurred while creating the project.');
    }
  };

  const handleDeleteProject = async (e, projectName) => {
    e.stopPropagation(); // prevent clicking the card to enter the project
    if (!window.confirm(`Are you sure you want to permanently delete the project "${projectName}"? This cannot be undone.`)) {
      return;
    }
    
    try {
      const res = await fetch(`/api/projects?projectName=${encodeURIComponent(projectName)}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        await fetchProjects();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to delete project');
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('An unexpected error occurred while deleting the project.');
    }
  };

  const handleDeleteTask = async (taskData) => {
    try {
      const res = await fetch(`/api/tasks?project=${encodeURIComponent(activeProject)}&taskId=${encodeURIComponent(taskData['ID'])}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchData(activeProject);
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to delete task');
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('An unexpected error occurred while deleting the task.');
    }
  };

  const handleAddTask = async (taskData) => {
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project: activeProject, ...taskData })
      });
      if (res.ok) {
        setShowTaskModal(false);
        fetchData(activeProject);
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to add task');
      }
    } catch (error) {
      console.error('Error adding task:', error);
      alert('An unexpected error occurred while adding the task.');
    }
  };

  const handleAddUpdate = async (updateData) => {
    try {
      const res = await fetch('/api/updates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project: activeProject, ...updateData })
      });
      if (res.ok) {
        setActiveTaskForUpdate(null);
        fetchData(activeProject);
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to add update');
      }
    } catch (error) {
      console.error('Error adding update:', error);
      alert('An unexpected error occurred while adding the update.');
    }
  };

  const handleEditTask = async (taskData) => {
    try {
      const res = await fetch('/api/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project: activeProject, ...taskData })
      });
      if (res.ok) {
        setActiveTaskForEdit(null);
        fetchData(activeProject);
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to edit task');
      }
    } catch (error) {
      console.error('Error editing task:', error);
      alert('An unexpected error occurred while editing the task.');
    }
  };

  const handleAddColumn = async (columnName, columnType, targetSheet) => {
    try {
      const res = await fetch('/api/columns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project: activeProject, columnName, columnType, targetSheet })
      });
      if (res.ok) {
        setShowColumnModal(false);
        fetchData(activeProject);
      }
    } catch (error) {
      console.error('Error adding column:', error);
    }
  };

  const handleEditUpdate = async (updateData) => {
    try {
      const res = await fetch('/api/updates', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project: activeProject, ...updateData })
      });
      if (res.ok) {
        setActiveUpdateForEdit(null);
        fetchData(activeProject);
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to edit update');
      }
    } catch (error) {
      console.error('Error editing update:', error);
      alert('An unexpected error occurred while editing the update.');
    }
  };

  const handleDeleteUpdate = async (updateData) => {
    try {
      const res = await fetch(`/api/updates?project=${encodeURIComponent(activeProject)}&updateId=${encodeURIComponent(updateData.updateId)}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchData(activeProject);
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to delete update');
      }
    } catch (error) {
      console.error('Error deleting update:', error);
      alert('An unexpected error occurred while deleting the update.');
    }
  };

  const handleSnoozeTask = async (taskData) => {
    try {
      const res = await fetch('/api/tasks/snooze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project: taskData.projectName, taskId: taskData['ID'] })
      });
      if (res.ok) {
        fetchDueTasks();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to snooze task');
      }
    } catch (error) {
      console.error('Error snoozing task:', error);
      alert('An unexpected error occurred while snoozing the task.');
    }
  };

  const handleCloseTask = async (taskData) => {
    try {
      const res = await fetch('/api/tasks/close', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project: taskData.projectName, taskId: taskData['ID'] })
      });
      if (res.ok) {
        fetchDueTasks();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to close task');
      }
    } catch (error) {
      console.error('Error closing task:', error);
      alert('An unexpected error occurred while closing the task.');
    }
  };

  const processedData = {
    columns: data.columns || [],
    updateColumns: data.updateColumns || [],
    metadata: data.metadata || {},
    updates: data.updates || [],
    tasks: (data.tasks || []).map(task => {
      return {
        ...task,
        updates: (data.updates || []).filter(u => u.taskId === task['ID']).sort((a, b) => new Date(b.updateDate) - new Date(a.updateDate))
      };
    })
  };

  return (
    <div className="app-container">
      <header className="header" style={{ alignItems: 'flex-start' }}>
        <div>
          <h1 className="title">{activeProject ? `${activeProject} Tracker` : 'Tracker Dashboard'}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
            {activeProject ? (
              <button onClick={() => { setActiveProject(''); fetchProjects(); }} className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>
                &larr; Back to Dashboard
              </button>
            ) : (
              <button onClick={() => setShowProjectModal(true)} className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>
                <FolderPlus size={16} /> New Project
              </button>
            )}
          </div>
        </div>
        
        {activeProject && (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={() => setShowWeeklySummaryModal(true)} className="btn btn-secondary">
              <FileText size={18} /> Weekly Summary
            </button>
            <button onClick={() => setShowColumnModal(true)} className="btn btn-secondary">
              <Plus size={18} /> Add Column
            </button>
            <button onClick={() => setShowTaskModal(true)} className="btn btn-primary">
              <Plus size={18} /> Add New Task
            </button>
          </div>
        )}
      </header>

      <main>
        {activeProject ? (
          loading ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
              Loading tracker data...
            </div>
          ) : (
            <TrackerTable 
              data={processedData} 
              onAddUpdate={(task) => setActiveTaskForUpdate(task)} 
              onEditTask={(task) => setActiveTaskForEdit(task)}
              onDeleteTask={handleDeleteTask}
              onEditUpdate={(update) => setActiveUpdateForEdit(update)}
              onDeleteUpdate={handleDeleteUpdate}
            />
          )
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {dueTasks.length > 0 && (
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                  Tasks Due for Update ({dueTasks.length})
                </h2>
                <div style={{ backgroundColor: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: '1rem', overflow: 'hidden' }}>
                  <table className="tracker-table" style={{ margin: 0 }}>
                    <thead>
                      <tr>
                        <th>Project</th>
                        <th>Task Name</th>
                        <th>Due Date</th>
                        <th>Status</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dueTasks.map(task => (
                        <tr key={`${task.projectName}-${task['ID']}`}>
                          <td><span className="status-badge" style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-secondary)' }}>{task.projectName}</span></td>
                          <td><strong>{task['Task Name']}</strong></td>
                          <td style={{ color: 'var(--danger-color)', fontWeight: '500' }}>
                            {task['Next Update Due']}
                          </td>
                          <td><span className={`status-badge status-${task['Status'].toLowerCase().replace(' ', '')}`}>{task['Status']}</span></td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                              <button
                                onClick={() => handleSnoozeTask(task)}
                                className="btn btn-secondary"
                                style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                              >
                                Snooze
                              </button>
                              <button
                                onClick={() => handleCloseTask(task)}
                                className="btn btn-primary"
                                style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                              >
                                Close
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--text-primary)' }}>Your Projects</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {projects.length === 0 ? (
                  <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
                    No projects found. Create one to get started!
                  </div>
                ) : (
              projects.map(p => {
                const { total, todo, inProgress, done } = p.stats || { total: 0, todo: 0, inProgress: 0, done: 0 };
                const donePercent = total === 0 ? 0 : Math.round((done / total) * 100);
                return (
                  <div 
                    key={p.name} 
                    onClick={() => setActiveProject(p.name)}
                    style={{
                      backgroundColor: 'var(--surface-color)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '1rem',
                      padding: '1.5rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                      position: 'relative'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05)'; }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>{p.name}</h3>
                      <button 
                        onClick={(e) => handleDeleteProject(e, p.name)}
                        className="action-icon"
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)' }}
                        title="Delete Project"
                        onMouseEnter={e => e.currentTarget.style.color = 'var(--danger-color)'}
                        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Total</span>
                        <span style={{ fontWeight: '600', fontSize: '1.1rem' }}>{total}</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', alignItems: 'center' }}>
                        <span style={{ color: '#d97706' }}>To Do</span>
                        <span style={{ fontWeight: '600' }}>{todo}</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', alignItems: 'center' }}>
                        <span style={{ color: '#2563eb' }}>In Prog</span>
                        <span style={{ fontWeight: '600' }}>{inProgress}</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', alignItems: 'flex-end' }}>
                        <span style={{ color: '#059669' }}>Done</span>
                        <span style={{ fontWeight: '600' }}>{done}</span>
                      </div>
                    </div>

                    <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--border-color)', borderRadius: '9999px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${donePercent}%`, backgroundColor: 'var(--success-color)', transition: 'width 0.5s ease' }} />
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem', textAlign: 'right' }}>
                      {donePercent}% Completed
                    </div>
                  </div>
                );
              })
            )}
              </div>
            </div>
          </div>
        )}
      </main>

      <AnimatePresence>
        {showProjectModal && (
          <AddProjectModal 
            onClose={() => setShowProjectModal(false)} 
            onSave={handleCreateProject} 
          />
        )}
        {showTaskModal && (
          <AddTaskModal 
            columns={data.columns}
            metadata={data.metadata}
            onClose={() => setShowTaskModal(false)} 
            onSave={handleAddTask} 
          />
        )}
        {activeTaskForUpdate && (
          <AddUpdateModal 
            task={activeTaskForUpdate}
            updateColumns={data.updateColumns}
            metadata={data.metadata}
            onClose={() => setActiveTaskForUpdate(null)} 
            onSave={handleAddUpdate} 
          />
        )}
        {activeTaskForEdit && (
          <EditTaskModal 
            task={activeTaskForEdit} 
            columns={data.columns}
            metadata={data.metadata}
            onClose={() => setActiveTaskForEdit(null)} 
            onSave={handleEditTask} 
          />
        )}
        {activeUpdateForEdit && (
          <EditUpdateModal 
            update={activeUpdateForEdit}
            updateColumns={data.updateColumns}
            metadata={data.metadata}
            onClose={() => setActiveUpdateForEdit(null)} 
            onSave={handleEditUpdate} 
          />
        )}
        {showColumnModal && (
          <AddColumnModal 
            onClose={() => setShowColumnModal(false)} 
            onSave={handleAddColumn} 
          />
        )}
        {showWeeklySummaryModal && (
          <WeeklySummaryModal 
            data={processedData}
            onClose={() => setShowWeeklySummaryModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
