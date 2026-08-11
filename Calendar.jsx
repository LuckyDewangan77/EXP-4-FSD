import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ChevronLeft, ChevronRight, CalendarDays, Download, Trash2 } from 'lucide-react';
import EventCard from './EventCard';
import EventModal from './EventModal';

const PremiumReportWidget = React.lazy(() => import('./PremiumReportWidget'));

const Calendar = () => {
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Drag State
  const [dragOverSlot, setDragOverSlot] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTimeSlot, setModalTimeSlot] = useState('');
  const [editingEvent, setEditingEvent] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const savedEvents = localStorage.getItem('calendar_events');
    if (savedEvents) {
      setEvents(JSON.parse(savedEvents));
      setLoading(false);
    } else {
      fetch('/api/events')
        .then((res) => res.json())
        .then((data) => {
          setEvents(data);
          setLoading(false);
        })
        .catch((err) => console.error("Failed to fetch events", err));
    }
  }, []);

  useEffect(() => {
    if (!loading) {
      localStorage.setItem('calendar_events', JSON.stringify(events));
    }
  }, [events, loading]);

  // --- Day Navigation & Bonus Actions ---
  const changeDate = (daysToAdd) => {
    const currentDate = new Date(selectedDate);
    currentDate.setDate(currentDate.getDate() + daysToAdd);
    const newDate = currentDate.toISOString().split('T')[0];
    setSelectedDate(newDate);
  };

  const jumpToToday = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  const exportEvents = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(events, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "calendar_schedule.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleClearDay = () => {
    if (window.confirm("Are you sure you want to delete ALL events for this day?")) {
      setEvents(prev => prev.filter(ev => ev.date !== selectedDate));
    }
  };

  // --- Event Handlers ---
  
  const handleDragStart = useCallback((e, eventId) => {
    e.dataTransfer.setData('eventId', eventId);
  }, []);

  const handleDragOver = useCallback((e, timeSlot) => {
    e.preventDefault();
    setDragOverSlot(timeSlot);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverSlot(null);
  }, []);

  const handleDrop = useCallback((e, dateStr, timeSlot) => {
    e.preventDefault();
    setDragOverSlot(null);
    const eventId = e.dataTransfer.getData('eventId');
    
    setEvents((prevEvents) =>
      prevEvents.map((ev) =>
        ev.id.toString() === eventId
          ? { ...ev, date: dateStr, timeSlot: timeSlot }
          : ev
      )
    );
  }, []);

  const handleDeleteEvent = useCallback((eventId) => {
    setEvents((prev) => prev.filter(ev => ev.id !== eventId));
  }, []);

  const handleSlotClick = (time) => {
    setEditingEvent(null);
    setModalTimeSlot(time);
    setIsModalOpen(true);
  };

  const handleEditClick = useCallback((event) => {
    setEditingEvent(event);
    setIsModalOpen(true);
  }, []);

  const handleSaveEvent = (eventData) => {
    if (eventData.id) {
      setEvents(prev => prev.map(ev => 
        ev.id === eventData.id 
          ? { ...ev, title: eventData.title, category: eventData.category }
          : ev
      ));
    } else {
      const newEvent = {
        id: Date.now(),
        title: eventData.title,
        category: eventData.category,
        date: selectedDate,
        timeSlot: modalTimeSlot
      };
      setEvents(prev => [...prev, newEvent]);
    }
    setIsModalOpen(false);
    setEditingEvent(null);
  };

  // --- Derived State ---
  
  const filteredEvents = useMemo(() => {
    return events.filter(event => event.date === selectedDate);
  }, [events, selectedDate]);

  const timeSlots = useMemo(() => {
    return Array.from({ length: 9 }, (_, i) => {
      const hour = i + 9;
      if (hour === 12) return '12:00 PM';
      if (hour > 12) return `${hour - 12}:00 PM`;
      return `${hour}:00 AM`;
    });
  }, []);

  const isToday = selectedDate === new Date().toISOString().split('T')[0];
  const currentHour = currentTime.getHours();
  const currentMinute = currentTime.getMinutes();
  const isBusinessHours = currentHour >= 9 && currentHour <= 17;
  
  let timeLineTop = 0;
  let showTimeLine = false;
  if (isToday && isBusinessHours) {
    showTimeLine = true;
    const slotIndex = currentHour - 9;
    const percentageOfHour = currentMinute / 60;
    timeLineTop = (slotIndex * 91) + (percentageOfHour * 91); // 90px min-height + 1px border
  }

  if (loading) return <div className="loading-container">Loading Calendar...</div>;

  return (
    <div className="calendar-container">
      <header className="calendar-header">
        <div>
          <h2>Interactive Calendar</h2>
          <div className="header-actions" style={{ marginTop: '0.75rem' }}>
            <button className="action-btn" onClick={jumpToToday}>
              <CalendarDays size={16} /> Today
            </button>
            <button className="action-btn" onClick={exportEvents}>
              <Download size={16} /> Export
            </button>
            <button className="action-btn danger" onClick={handleClearDay}>
              <Trash2 size={16} /> Clear Day
            </button>
          </div>
        </div>
        
        <div className="nav-controls">
          <button className="icon-btn" onClick={() => changeDate(-1)} title="Previous Day">
            <ChevronLeft size={20} />
          </button>
          
          <input 
            type="date" 
            value={selectedDate} 
            onChange={(e) => setSelectedDate(e.target.value)} 
            className="date-picker"
          />
          
          <button className="icon-btn" onClick={() => changeDate(1)} title="Next Day">
            <ChevronRight size={20} />
          </button>
        </div>
      </header>

      <div className="slots-container">
        {showTimeLine && (
          <div 
            className="current-time-line" 
            style={{ top: `${timeLineTop}px` }}
          />
        )}
        
        {timeSlots.map((time) => {
          const slotEvents = filteredEvents.filter(e => e.timeSlot === time);
          
          // Determine drag states for conflict warning
          const isDragOver = dragOverSlot === time;
          const hasEvents = slotEvents.length > 0;
          let dragClass = '';
          if (isDragOver) {
            dragClass = hasEvents ? 'drag-conflict' : 'drag-over';
          }
          
          return (
            <div 
              key={time} 
              className={`time-slot ${dragClass}`}
              onDragOver={(e) => handleDragOver(e, time)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, selectedDate, time)}
              onClick={() => handleSlotClick(time)}
              data-testid={`slot-${time}`}
            >
              <div className="time-label">
                {time}
              </div>
              <div className="events-area">
                {slotEvents.map(event => (
                  <EventCard 
                    key={event.id}
                    event={event} 
                    onDragStart={handleDragStart}
                    onDelete={handleDeleteEvent}
                    onEdit={handleEditClick}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <EventModal 
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingEvent(null);
        }}
        onSave={handleSaveEvent}
        defaultTime={modalTimeSlot}
        initialEvent={editingEvent}
      />

      {events.length > 0 && (
        <React.Suspense fallback={<div style={{marginTop: '2rem', color: '#64748b', textAlign: 'center'}}>Loading premium widget...</div>}>
          <PremiumReportWidget metrics={events.length * 50} />
        </React.Suspense>
      )}
    </div>
  );
};

export default Calendar;
