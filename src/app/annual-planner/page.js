"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AnnualWheel from '@/components/planner/AnnualWheel';
import ActivityLog from '@/components/planner/ActivityLog';
import StatCards from '@/components/planner/StatCards';
import AddGoalModal from '@/components/planner/AddGoalModal';
import ManageCategoriesModal from '@/components/planner/ManageCategoriesModal';
import { Search, Bell, Settings, Target, Calendar, ListTodo, BarChart2, Archive, HelpCircle, LogOut } from 'lucide-react';

export default function AnnualPlanner() {
  const [activeNav, setActiveNav] = useState('Annual Wheel');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [goals, setGoals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingGoal, setEditingGoal] = useState(null);
  const [currentDateTime, setCurrentDateTime] = useState(null);

  useEffect(() => {
    setCurrentDateTime(new Date());
    const interval = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetch('/api/annual-planner')
      .then(res => res.json())
      .then(data => {
        if (data && data.goals) {
          setGoals(data.goals);
        }
        if (data && data.categories) {
          setCategories(data.categories);
        }
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Error fetching planner data:', err);
        setIsLoading(false);
      });
  }, []);

  const handleAddGoal = (newGoal) => {
    setGoals(prev => [...prev, newGoal]);
  };

  const handleUpdateGoal = (updatedGoal) => {
    setGoals(prev => prev.map(g => g.id === updatedGoal.id ? updatedGoal : g));
  };

  const handleDeleteGoal = (deletedGoalId) => {
    setGoals(prev => prev.filter(g => g.id !== deletedGoalId));
  };

  const handleCategoryAdded = (newCat) => {
    setCategories(prev => [...prev, newCat]);
  };

  const handleCategoryDeleted = (catId) => {
    setCategories(prev => prev.filter(c => c.id !== catId));
  };

  const handleCategoryUpdated = (updatedCat) => {
    setCategories(prev => prev.map(c => c.id === updatedCat.id ? updatedCat : c));
  };

  const currentMonth = new Date().toLocaleString('en-US', { month: 'short' }).toUpperCase();

  // Helper to generate events
  const createWheelEvent = (g, dateObj, cloneId) => {
    let monthStr = dateObj.toLocaleString('en-US', { month: 'short' }).toUpperCase();
    const dayOfMonth = dateObj.getDate();
    const daysInMonth = new Date(dateObj.getFullYear(), dateObj.getMonth() + 1, 0).getDate();
    
    const idHash = g.id ? g.id.charCodeAt(g.id.length - 1) : 0;
    const jitterAngle = (idHash % 5) - 2; 
    const angleOffset = (((dayOfMonth - 1) / (Math.max(1, daysInMonth - 1))) * 30 - 15) + jitterAngle;
    
    const weekOfMonth = Math.ceil(dayOfMonth / 7);
    const radius = 0.4 + (weekOfMonth * 0.1);

    return {
      id: `${g.id}-${cloneId}`,
      originalId: g.id,
      title: g.title,
      description: g.description,
      category: g.category,
      timestamp: dateObj.getTime(),
      tags: [
        { label: 'Priority', type: 'priority' },
        { label: g.status, type: 'status' }
      ],
      month: monthStr,
      radius: radius,
      angleOffset: angleOffset
    };
  };

  // Compute Dynamic Data using a Year-Agnostic Engine
  const wheelEvents = goals.flatMap(g => {
    let events = [];
    const recurrence = g.recurrence || 'none';
    const dummyYear = 2024; // Leap year to safely support Feb 29
    
    if (recurrence === 'weekly' && g.recurrenceConfig) {
      let currentDate = new Date(dummyYear, 0, 1);
      const targetDay = parseInt(g.recurrenceConfig, 10);
      while (currentDate.getDay() !== targetDay) {
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      let safetyCounter = 0;
      while (currentDate.getFullYear() === dummyYear && safetyCounter < 53) {
        events.push(createWheelEvent(g, currentDate, safetyCounter));
        currentDate.setDate(currentDate.getDate() + 7);
        safetyCounter++;
      }
    } else if (recurrence === 'monthly' && g.recurrenceConfig) {
      const targetDate = parseInt(g.recurrenceConfig, 10);
      for (let month = 0; month < 12; month++) {
        let currentDate = new Date(dummyYear, month, 1);
        const lastDay = new Date(dummyYear, month + 1, 0).getDate();
        currentDate.setDate(Math.min(targetDate, lastDay));
        events.push(createWheelEvent(g, currentDate, month));
      }
    } else {
      let currentDate = g.startDate ? new Date(g.startDate) : new Date();
      currentDate.setFullYear(dummyYear);
      events.push(createWheelEvent(g, currentDate, 0));
    }
    
    return events;
  });

  const activityLog = [...goals].reverse().map(g => {
    const tags = [{ label: 'NEW', type: 'status' }];
    
    let displayDate = 'Any Time';
    if (g.recurrence === 'weekly') {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      displayDate = `Every ${days[parseInt(g.recurrenceConfig || '0', 10)]}`;
      tags.push({ label: `🔄 WEEKLY`, type: 'priority' });
    } else if (g.recurrence === 'monthly') {
      const dateSuffix = (day) => {
        if (day > 3 && day < 21) return 'th';
        switch (day % 10) {
          case 1:  return "st";
          case 2:  return "nd";
          case 3:  return "rd";
          default: return "th";
        }
      };
      const day = parseInt(g.recurrenceConfig || '1', 10);
      displayDate = `${day}${dateSuffix(day)} of every month`;
      tags.push({ label: `🔄 MONTHLY`, type: 'priority' });
    } else {
      if (g.startDate) {
        displayDate = new Date(g.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }
    }

    return {
      id: g.id,
      title: g.title,
      date: displayDate,
      description: g.description,
      category: g.category,
      tags
    };
  });

  const stats = {
    progress: goals.length > 0 ? Math.round((goals.filter(g => g.status === 'completed').length / goals.length) * 100) : 0,
    totalTasks: goals.length,
    milestones: goals.length
  };

  const bottomCards = [
    {
      title: 'Total Active Goals',
      value: `${goals.length} Goals`,
      subValue: `Across ${categories.length} categories`,
      icon: 'flag',
      color: 'blue'
    },
    {
      title: 'Recent Activity',
      value: activityLog.length > 0 ? activityLog[0].title : 'No Activity',
      subValue: activityLog.length > 0 ? `Added ${activityLog[0].date}` : '',
      icon: 'clipboard-list',
      color: 'orange'
    },
    {
      title: 'Progress',
      value: `${stats.progress}%`,
      subValue: 'Overall Completion',
      icon: 'check-circle',
      color: 'green'
    }
  ];

  const pageData = {
    currentMonth,
    categories,
    wheelEvents,
    activityLog,
    stats,
    bottomCards
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc] text-slate-800 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-[#f8fafc] flex flex-col border-r border-slate-200">
        <div className="p-6">
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Yearly Planner</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Strategy</p>
        </div>
        
        <nav className="flex-1 px-4 mt-4 space-y-1">
          <button onClick={() => setActiveNav('Annual Wheel')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${activeNav === 'Annual Wheel' ? 'bg-blue-100/50 text-blue-700' : 'text-slate-600 hover:bg-slate-100'}`}>
            <Target className="w-4 h-4" /> Annual Wheel
          </button>
          <button onClick={() => setActiveNav('Monthly View')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${activeNav === 'Monthly View' ? 'bg-blue-100/50 text-blue-700' : 'text-slate-600 hover:bg-slate-100'}`}>
            <Calendar className="w-4 h-4" /> Monthly View
          </button>
          <button onClick={() => setActiveNav('Activity Log')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${activeNav === 'Activity Log' ? 'bg-blue-100/50 text-blue-700' : 'text-slate-600 hover:bg-slate-100'}`}>
            <ListTodo className="w-4 h-4" /> Activity Log
          </button>
          <button onClick={() => setActiveNav('Statistics')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${activeNav === 'Statistics' ? 'bg-blue-100/50 text-blue-700' : 'text-slate-600 hover:bg-slate-100'}`}>
            <BarChart2 className="w-4 h-4" /> Statistics
          </button>
          <button onClick={() => setActiveNav('Archived')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${activeNav === 'Archived' ? 'bg-blue-100/50 text-blue-700' : 'text-slate-600 hover:bg-slate-100'}`}>
            <Archive className="w-4 h-4" /> Archived
          </button>
        </nav>

        <div className="p-4 mt-auto space-y-2 border-t border-slate-200">
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setEditingGoal(null);
              setIsModalOpen(true);
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#0247c7] hover:bg-blue-800 text-white rounded-lg text-sm font-semibold shadow-[0_4px_14px_0_rgba(2,71,199,0.39)] hover:shadow-[0_6px_20px_rgba(2,71,199,0.23)] transition-all mb-4"
          >
            <span className="material-symbols-outlined text-sm">add</span> Add New Goal
          </motion.button>
          
          <a href="/" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-100 hover:text-[#0247c7] transition-colors">
            <span className="material-symbols-outlined text-[18px]">monitoring</span>
            Personal Tracker
          </a>
          
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors">
            <HelpCircle className="w-4 h-4" /> Help
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-8 bg-[#f8fafc]">
          <div className="flex items-center gap-6">
            <h2 className="text-xl font-bold text-[#0247c7] tracking-tight">Rajkumar</h2>
            
            {/* Live Date/Time/Week Widget */}
            {currentDateTime && (
              <div className="hidden md:flex items-center gap-3 px-4 py-1.5 bg-white border border-slate-200 rounded-full shadow-sm text-sm font-medium text-slate-600">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {currentDateTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </span>
                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px] text-slate-400">schedule</span>
                  {currentDateTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                </span>
                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-bold tracking-wide">
                  WK {Math.ceil((((currentDateTime - new Date(currentDateTime.getFullYear(), 0, 1)) / 86400000) + currentDateTime.getDay() + 1) / 7)}
                </span>
              </div>
            )}
          </div>
          
          <div className="flex-1 max-w-md mx-8 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search strategy..." 
              className="w-full pl-10 pr-4 py-2 bg-white rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 border border-slate-200"
            />
          </div>

          <div className="flex items-center gap-6">
            <button className="text-slate-500 hover:text-slate-700 relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-[#f8fafc]"></span>
            </button>
            <button onClick={() => setIsCategoryModalOpen(true)} className="text-slate-500 hover:text-slate-700 transition-colors">
              <Settings className="w-5 h-5" />
            </button>
            <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-200 cursor-pointer">
              {/* Dummy avatar color block if no image */}
              <div className="w-full h-full bg-slate-400"></div>
            </div>
          </div>
        </header>

        {/* Content Canvas */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Annual Wheel</h1>
          </motion.div>

          <motion.div 
            initial="hidden"
            animate="show"
            variants={{
              hidden: { opacity: 0 },
              show: { opacity: 1, transition: { staggerChildren: 0.1 } }
            }}
            className="grid grid-cols-1 xl:grid-cols-3 gap-6"
          >
            {/* Left Column (Wheel) */}
            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }} className="xl:col-span-2 flex flex-col gap-6">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 flex-1 min-h-[500px] flex flex-col antialiased">
                {isLoading ? (
                  <div className="flex-1 flex items-center justify-center text-slate-400 font-semibold">Loading Planner...</div>
                ) : (
                  <AnnualWheel data={pageData} />
                )}
              </div>
              
              {/* Bottom Cards Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCards type="bottom" cards={pageData.bottomCards} />
              </div>
            </motion.div>

            {/* Right Column (Stats & Log) */}
            <motion.div variants={{ hidden: { opacity: 0, x: 20 }, show: { opacity: 1, x: 0 } }} className="flex flex-col gap-6">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 antialiased">
                <StatCards type="yearly" stats={pageData.stats} />
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex-1 overflow-hidden flex flex-col antialiased">
                <ActivityLog 
                  events={pageData.activityLog} 
                  wheelEvents={pageData.wheelEvents}
                  currentMonth={pageData.currentMonth}
                  categories={pageData.categories} 
                  onGoalClick={(goalId) => {
                    const goal = goals.find(g => g.id === goalId);
                    if (goal) {
                      setEditingGoal(goal);
                      setIsModalOpen(true);
                    }
                  }}
                />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </main>

      <AddGoalModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setTimeout(() => setEditingGoal(null), 200); // clear after animation
        }} 
        onAdd={handleAddGoal}
        onUpdate={handleUpdateGoal}
        onDelete={handleDeleteGoal}
        categories={categories}
        editingGoal={editingGoal}
      />
      <ManageCategoriesModal 
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categories={categories}
        onCategoryAdded={handleCategoryAdded}
        onCategoryDeleted={handleCategoryDeleted}
        onCategoryUpdated={handleCategoryUpdated}
      />
    </div>
  );
}
