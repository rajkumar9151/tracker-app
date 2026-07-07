"use client";

import React, { useState, useEffect } from 'react';
import { format, getISOWeek } from 'date-fns';

import TrackerTable from '@/components/TrackerTable';
import AddTaskModal from '@/components/AddTaskModal';
import AddUpdateModal from '@/components/AddUpdateModal';
import EditUpdateModal from '@/components/EditUpdateModal';
import AddProjectModal from '@/components/AddProjectModal';
import AddColumnModal from '@/components/AddColumnModal';
import EditTaskModal from '@/components/EditTaskModal';
import WeeklySummaryModal from '@/components/WeeklySummaryModal';
import LoginScreen from '@/components/LoginScreen';
import AddProjectUpdateModal from '@/components/AddProjectUpdateModal';
import EditProjectUpdateModal from '@/components/EditProjectUpdateModal';
import ProjectUpdatesSection from '@/components/ProjectUpdatesSection';
import { AnimatePresence } from 'framer-motion';
import { FolderPlus, Plus, Trash2, FileText, LogOut } from 'lucide-react';

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (localStorage.getItem('tracker_auth') === 'true') {
      setIsLoggedIn(true);
    }
  }, []);

  const [projects, setProjects] = useState([]);
  const [dueTasks, setDueTasks] = useState([]);
  const [activeProject, setActiveProject] = useState('');
  
  const [data, setData] = useState({ columns: [], tasks: [], updates: [], projectUpdates: [], metadata: {} });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showColumnModal, setShowColumnModal] = useState(false);
  const [showWeeklySummaryModal, setShowWeeklySummaryModal] = useState(false);
  const [showProjectUpdateModal, setShowProjectUpdateModal] = useState(false);
  const [activeTaskForUpdate, setActiveTaskForUpdate] = useState(null);
  const [activeTaskForEdit, setActiveTaskForEdit] = useState(null);
  const [activeUpdateForEdit, setActiveUpdateForEdit] = useState(null);
  const [activeProjectUpdateForEdit, setActiveProjectUpdateForEdit] = useState(null);

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
        setData({ columns: [], tasks: [], updates: [], projectUpdates: [], metadata: {} });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setData({ columns: [], tasks: [], updates: [], projectUpdates: [], metadata: {} });
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
        body: JSON.stringify({ project: activeProject, taskId: taskData['ID'] || taskData.id, ...taskData })
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

  const handleAddColumn = async (columnName, columnType, targetSheet, options = '') => {
    try {
      const res = await fetch('/api/columns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project: activeProject, columnName, columnType, targetSheet, options })
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

  const handleAddProjectUpdate = async (updateData) => {
    try {
      const res = await fetch('/api/project-updates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project: activeProject, ...updateData })
      });
      if (res.ok) {
        setShowProjectUpdateModal(false);
        fetchData(activeProject);
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to add project update');
      }
    } catch (error) {
      console.error('Error adding project update:', error);
    }
  };

  const handleEditProjectUpdate = async (updateData) => {
    try {
      const res = await fetch('/api/project-updates', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project: activeProject, ...updateData })
      });
      if (res.ok) {
        setActiveProjectUpdateForEdit(null);
        fetchData(activeProject);
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to edit project update');
      }
    } catch (error) {
      console.error('Error editing project update:', error);
    }
  };

  const handleDeleteProjectUpdate = async (updateId) => {
    if (!confirm('Are you sure you want to delete this project update?')) return;
    try {
      const res = await fetch(`/api/project-updates?project=${encodeURIComponent(activeProject)}&updateId=${encodeURIComponent(updateId)}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchData(activeProject);
      }
    } catch (error) {
      console.error('Error deleting project update:', error);
    }
  };

  const handleDeleteUpdate = async (taskId, updateId) => {
    try {
      const res = await fetch(`/api/updates?project=${encodeURIComponent(activeProject)}&updateId=${encodeURIComponent(updateId)}`, {
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
    tasks: (data.tasks || []).filter(task => {
      if (!searchQuery) return true;
      const lowerQuery = searchQuery.toLowerCase();
      // Only search through the actual task properties (not updates array)
      return Object.values(task).some(val => 
        val && String(val).toLowerCase().includes(lowerQuery)
      );
    }).map(task => {
      return {
        ...task,
        updates: (data.updates || []).filter(u => u.taskId === task['ID']).sort((a, b) => {
          const dateDiff = new Date(b.updateDate) - new Date(a.updateDate);
          if (dateDiff !== 0) return dateDiff;
          
          // If dates are the same, try sorting by week number descending
          const getWk = (w) => {
            if (!w) return 0;
            const m = String(w).match(/\d+/);
            return m ? parseInt(m[0], 10) : 0;
          };
          return getWk(b.weekNumber || b['Week Number']) - getWk(a.weekNumber || a['Week Number']);
        })
      };
    }),
    projectUpdates: (data.projectUpdates || []).filter(update => {
      if (!searchQuery) return true;
      const lowerQuery = searchQuery.toLowerCase();
      return Object.values(update).some(val => 
        val && String(val).toLowerCase().includes(lowerQuery)
      );
    })
  };

  if (!isMounted) {
    return null; // Or a subtle loading spinner
  }

  if (!isLoggedIn) {
    return (
      <LoginScreen 
        onLoginSuccess={() => {
          localStorage.setItem('tracker_auth', 'true');
          setIsLoggedIn(true);
        }} 
      />
    );
  }

  return (
    <div className="flex min-h-screen overflow-hidden bg-background font-body-md text-text-main">
      {/* Sidebar */}
      <aside className="flex flex-col h-screen fixed left-0 top-0 p-stack-md border-r border-border-subtle bg-surface-container-lowest w-64 z-40">
        <div className="flex items-center gap-3 px-2 mb-8">
          <div className="w-8 h-8 rounded bg-primary-container flex items-center justify-center text-white">
            <span className="material-symbols-outlined text-lg">monitoring</span>
          </div>
          <div>
            <h1 className="font-headline-sm text-headline-sm font-bold text-primary">Personal Tracker</h1>
          </div>
        </div>
        <nav className="flex-1 space-y-1">
          <a onClick={() => setActiveProject('')} className={`flex items-center gap-3 px-3 py-2.5 font-label-md text-label-md rounded-lg cursor-pointer transition-all ${!activeProject ? 'bg-secondary-container text-on-secondary-container' : 'text-text-muted hover:bg-surface-container-low'}`}>
            <span className="material-symbols-outlined">dashboard</span>
            <span>Dashboard</span>
          </a>
          <a onClick={() => setShowProjectModal(true)} className="flex items-center gap-3 px-3 py-2.5 font-label-md text-label-md text-text-muted hover:bg-surface-container-low rounded-lg cursor-pointer transition-all">
            <span className="material-symbols-outlined">create_new_folder</span>
            <span>New Project</span>
          </a>
          {projects.map(p => (
            <a key={p.name} onClick={() => setActiveProject(p.name)} className={`flex items-center gap-3 px-3 py-2.5 font-label-md text-label-md rounded-lg cursor-pointer transition-all ${activeProject === p.name ? 'bg-secondary-container text-on-secondary-container' : 'text-text-muted hover:bg-surface-container-low'}`}>
              <span className="material-symbols-outlined">folder</span>
              <span className="truncate">{p.name}</span>
            </a>
          ))}
        </nav>
        <div className="mt-auto space-y-6">
          <div className="space-y-1">
            <a href="/annual-planner" className="flex items-center gap-3 px-3 py-2 text-text-muted hover:text-primary transition-colors cursor-pointer">
              <span className="material-symbols-outlined text-sm">event</span>
              <span className="text-label-sm font-label-sm">Annual Planner</span>
            </a>
            <a onClick={() => {
                localStorage.removeItem('tracker_auth');
                setIsLoggedIn(false);
              }} className="flex items-center gap-3 px-3 py-2 text-text-muted hover:text-danger transition-colors cursor-pointer">
              <span className="material-symbols-outlined text-sm">logout</span>
              <span className="text-label-sm font-label-sm">Logout</span>
            </a>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 flex flex-col overflow-hidden bg-background">
        {/* TopNavBar */}
        <header className="flex items-center justify-between px-margin-desktop h-16 w-full sticky top-0 z-50 bg-surface-container-lowest border-b border-border-subtle">
          <div className="flex items-center flex-1 max-w-xl">
            <div className="relative w-full">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-lg">search</span>
              <input 
                className="w-full bg-surface-container-low border-none rounded-lg pl-10 pr-4 py-2 text-body-md focus:ring-2 focus:ring-primary/20 placeholder:text-text-muted" 
                placeholder="Search tasks, agents, or projects..." 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-1 justify-center items-center gap-3 px-6 text-label-md font-label-md text-text-muted select-none">
            <span className="tracking-wide">{format(new Date(), 'dd.MM.yyyy')}</span>
            <span 
              className="px-2 py-0.5 rounded text-primary font-bold bg-primary/5 shadow-[0_0_12px_rgba(59,130,246,0.3)] border border-primary/20"
              style={{ textShadow: '0 0 8px rgba(59,130,246,0.4)' }}
            >
              WK{getISOWeek(new Date())}
            </span>
          </div>
          <div className="flex items-center gap-4">
            {activeProject && (
              <div className="flex items-center gap-2 mr-4">
                <button onClick={() => setShowTaskModal(true)} className="px-4 py-2 bg-primary-container text-on-primary rounded-lg font-label-md text-label-md flex items-center gap-2 hover:opacity-90 active:opacity-80 transition-colors">
                  <span className="material-symbols-outlined text-sm">add</span>
                  Add New Task
                </button>
                <button onClick={() => setShowProjectUpdateModal(true)} className="px-4 py-2 border border-border-subtle text-text-main rounded-lg font-label-md text-label-md hover:bg-surface-container-low transition-colors">
                  General Update
                </button>
                <button onClick={() => setShowColumnModal(true)} className="px-4 py-2 border border-border-subtle text-text-main rounded-lg font-label-md text-label-md hover:bg-surface-container-low transition-colors">
                  Add Column
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Content Canvas */}
        <div className="flex-1 overflow-y-auto p-margin-desktop custom-scrollbar">
          {activeProject ? (
            loading ? (
              <div className="flex justify-center p-16">
                <div className="spinner"></div>
              </div>
            ) : (
              <>


                {/* Dashboard Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter mb-8">
                  <div className="bg-white p-5 rounded-xl border border-border-subtle flex flex-col justify-between h-32 hover:border-primary/30 transition-all">
                    <span className="text-label-sm font-label-sm text-text-muted uppercase tracking-wider">Total Tasks</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-bold text-text-main">{String(processedData.tasks.length).padStart(2, '0')}</span>
                    </div>
                  </div>
                  <div className="bg-white p-5 rounded-xl border border-border-subtle flex flex-col justify-between h-32 hover:border-primary/30 transition-all">
                    <span className="text-label-sm font-label-sm text-text-muted uppercase tracking-wider">In Progress</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-bold text-text-main">{String(processedData.tasks.filter(t => t['Status'] === 'In Progress').length).padStart(2, '0')}</span>
                    </div>
                  </div>
                  <div className="bg-white p-5 rounded-xl border border-border-subtle flex flex-col justify-between h-32 hover:border-primary/30 transition-all">
                    <span className="text-label-sm font-label-sm text-text-muted uppercase tracking-wider">High Priority</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-bold text-danger">{String(processedData.tasks.filter(t => t['Priority'] === 'High' || t['Priority'] === 'Critical').length).padStart(2, '0')}</span>
                    </div>
                  </div>
                  <div className="bg-white p-5 rounded-xl border border-border-subtle flex flex-col justify-between h-32 hover:border-primary/30 transition-all overflow-hidden relative">
                    <div className="relative z-10">
                      <span className="text-label-sm font-label-sm text-text-muted uppercase tracking-wider">Completion</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-bold text-text-main">{processedData.tasks.length ? Math.round((processedData.tasks.filter(t => t['Status'] === 'Done' || t['Status'] === 'Closed').length / processedData.tasks.length) * 100) : 0}%</span>
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-surface-container">
                      <div className="h-full bg-primary" style={{ width: `${processedData.tasks.length ? Math.round((processedData.tasks.filter(t => t['Status'] === 'Done' || t['Status'] === 'Closed').length / processedData.tasks.length) * 100) : 0}%` }}></div>
                    </div>
                  </div>
                </div>

                <ProjectUpdatesSection 
                  projectUpdates={processedData.projectUpdates} 
                  onEdit={setActiveProjectUpdateForEdit} 
                  onDelete={handleDeleteProjectUpdate} 
                />

                <TrackerTable 
                  data={processedData} 
                  onAddUpdate={setActiveTaskForUpdate} 
                  onEditUpdate={setActiveUpdateForEdit}
                  onEditTask={setActiveTaskForEdit}
                  onDeleteTask={handleDeleteTask}
                  onDeleteUpdate={handleDeleteUpdate}
                  onSnoozeTask={handleSnoozeTask}
                  onCloseTask={handleCloseTask}
                  onAddColumn={() => setShowColumnModal(true)}
                />

                {/* Bento Preview Section */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-gutter">
                  <div className="bg-white rounded-xl border border-border-subtle p-6 flex flex-col">
                    <h3 className="font-headline-sm text-headline-sm text-text-main mb-6">Quick Actions</h3>
                    <div className="space-y-3 flex-1">
                      <button onClick={() => setShowWeeklySummaryModal(true)} className="w-full flex items-center justify-between p-3 rounded-lg border border-border-subtle hover:bg-primary/5 hover:border-primary/30 transition-all text-left">
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-primary">share</span>
                          <span className="font-label-md text-label-md text-text-main">Share Report AI Weekly Summary</span>
                        </div>
                        <span className="material-symbols-outlined text-text-muted text-sm">arrow_forward</span>
                      </button>
                    </div>
                  </div>
                </div>

              </>
            )
          ) : (
            // Dashboard Default View
            <div className="flex flex-col gap-8">
               {dueTasks.length > 0 && (
                <div>
                  <h2 className="text-headline-sm font-headline-sm text-text-main mb-4">
                    Tasks Due for Update ({dueTasks.length})
                  </h2>
                  <div className="bg-white rounded-xl border border-border-subtle overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-border-subtle bg-surface-container-lowest">
                          <th className="px-6 py-4 text-label-sm font-label-sm text-text-muted uppercase tracking-widest">Project</th>
                          <th className="px-6 py-4 text-label-sm font-label-sm text-text-muted uppercase tracking-widest">Task Name</th>
                          <th className="px-6 py-4 text-label-sm font-label-sm text-text-muted uppercase tracking-widest">Due Date</th>
                          <th className="px-6 py-4 text-label-sm font-label-sm text-text-muted uppercase tracking-widest">Status</th>
                          <th className="px-6 py-4 text-label-sm font-label-sm text-text-muted uppercase tracking-widest text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border-subtle">
                        {dueTasks.map(task => (
                          <tr key={`${task.projectName}-${task['ID']}`} className="hover:bg-surface-container-low transition-colors group cursor-pointer">
                            <td className="px-6 py-6 text-body-md text-text-main"><span className="px-2.5 py-1 rounded bg-surface-container-high text-text-secondary font-label-sm">{task.projectName}</span></td>
                            <td className="px-6 py-6 font-label-md text-text-main"><strong>{task['Task Name']}</strong></td>
                            <td className="px-6 py-6 text-body-md text-danger font-semibold">
                              {task['Next Update Due']}
                            </td>
                            <td className="px-6 py-6">
                              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-surface-container-high text-text-muted">{task['Status']}</span>
                            </td>
                            <td className="px-6 py-6">
                              <div className="flex gap-2 justify-end">
                                <button
                                  onClick={() => handleSnoozeTask(task)}
                                  className="px-3 py-1.5 border border-border-subtle rounded text-text-main hover:bg-surface-container-low transition-colors"
                                >
                                  Snooze
                                </button>
                                <button
                                  onClick={() => handleCloseTask(task)}
                                  className="px-3 py-1.5 bg-primary-container text-on-primary rounded hover:opacity-90 transition-colors"
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
                <h2 className="text-headline-sm font-headline-sm text-text-main mb-4">Your Projects</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {projects.length === 0 ? (
                    <div className="col-span-full text-center p-16 text-text-muted">
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
                      className="bg-white border border-border-subtle rounded-xl p-6 cursor-pointer transition-all hover:-translate-y-1 hover:shadow-md relative"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="font-headline-sm text-text-main m-0">{p.name}</h3>
                        <button 
                          onClick={(e) => handleDeleteProject(e, p.name)}
                          className="w-8 h-8 rounded-lg hover:bg-danger/10 flex items-center justify-center text-text-muted hover:text-danger transition-colors"
                          title="Delete Project"
                        >
                          <span className="material-symbols-outlined text-lg">delete</span>
                        </button>
                      </div>
                      
                      <div className="flex justify-between mb-6 text-sm">
                        <div className="flex flex-col gap-1">
                          <span className="text-text-muted">Total</span>
                          <span className="font-semibold text-lg text-text-main">{total}</span>
                        </div>
                        <div className="flex flex-col gap-1 items-center">
                          <span className="text-[#d97706]">To Do</span>
                          <span className="font-semibold text-text-main">{todo}</span>
                        </div>
                        <div className="flex flex-col gap-1 items-center">
                          <span className="text-[#2563eb]">In Prog</span>
                          <span className="font-semibold text-text-main">{inProgress}</span>
                        </div>
                        <div className="flex flex-col gap-1 items-end">
                          <span className="text-[#059669]">Done</span>
                          <span className="font-semibold text-text-main">{done}</span>
                        </div>
                      </div>

                      <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                        <div className="h-full bg-success transition-all duration-500" style={{ width: `${donePercent}%` }} />
                      </div>
                      <div className="text-xs text-text-muted mt-2 text-right">
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
        </div>
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
            refreshData={() => fetchData(activeProject)}
          />
        )}
        {showProjectUpdateModal && (
          <AddProjectUpdateModal 
            project={activeProject}
            onClose={() => setShowProjectUpdateModal(false)}
            onSave={handleAddProjectUpdate}
          />
        )}
        {activeProjectUpdateForEdit && (
          <EditProjectUpdateModal 
            update={activeProjectUpdateForEdit}
            onClose={() => setActiveProjectUpdateForEdit(null)}
            onSave={handleEditProjectUpdate}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
