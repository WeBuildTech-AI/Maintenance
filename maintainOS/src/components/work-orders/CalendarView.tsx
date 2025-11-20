import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown, Plus, Lock, RefreshCcw } from 'lucide-react';
import type { WorkOrder } from "./types";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  getWeek,
  addWeeks,
  subWeeks
} from 'date-fns';

// Helper component (No change)
const renderEvent = (event: { id: string; title: string; icon: 'lock' | 'refresh' }) => (
  <div key={event.id} className="mb-1">
    <a href="#" className="flex items-center gap-1.5 p-1 rounded-md hover:bg-gray-100 group">
      {event.icon === 'lock' && <Lock className="h-3 w-3 text-gray-500 flex-shrink-0" />}
      {event.icon === 'refresh' && <RefreshCcw className="h-3 w-3 text-blue-500 flex-shrink-0" />}
      <span className="text-xs text-gray-800 group-hover:text-blue-600 break-words">
        {event.title}
      </span>
    </a>
  </div>
);

// Weekday headers (No change)
const dayHeaders = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];


interface CalendarViewProps {
  workOrders: WorkOrder[];
}

export function CalendarView({ workOrders }: CalendarViewProps) {
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd')); 
  const today = new Date();

  // --- REAL DATA LOGIC ---

  // Helper function: Din ke hisaab se events filter karna
  const getEventsForDay = (day: Date) => {
    return workOrders
      .filter(wo => {
        if (!wo.dueDate) return false;
        try {
          // Note: `wo.dueDate` string ko Date object mein convert karna zaroori hai
          return isSameDay(new Date(wo.dueDate), day);
        } catch (e) {
          return false;
        }
      })
      .map(wo => ({
        id: wo.id,
        title: wo.title,
        // TODO: Icon logic ko apne work order type se replace karein
        icon: (wo.status === 'completed' || wo.status === 'done') ? 'refresh' : 'lock'
      }));
  };

  // Memoized function jo Month View ke liye days generate karta hai
  const monthDays = useMemo(() => {
    const firstDayOfMonth = startOfMonth(currentDate);
    const lastDayOfMonth = endOfMonth(currentDate);
    // Week starts on Monday (1)
    const firstDayOfGrid = startOfWeek(firstDayOfMonth, { weekStartsOn: 1 });
    const lastDayOfGrid = endOfWeek(lastDayOfMonth, { weekStartsOn: 1 });

    const daysInGrid = eachDayOfInterval({ start: firstDayOfGrid, end: lastDayOfGrid });

    return daysInGrid.map(day => ({
      fullDate: day, // Pura date object (key aur selection ke liye)
      date: format(day, 'dd'), // Sirf din (e.g., '01', '17')
      isCurrentMonth: isSameMonth(day, currentDate),
      isToday: isSameDay(day, today),
      events: getEventsForDay(day),
    }));
  }, [currentDate, workOrders]); // Jab month ya work orders change hon, tab regenerate karein

  // Memoized function jo Week View ke liye days generate karta hai
  const weekDays = useMemo(() => {
    // Week starts on Monday (1)
    const firstDayOfWeek = startOfWeek(currentDate, { weekStartsOn: 1 });
    const lastDayOfWeek = endOfWeek(currentDate, { weekStartsOn: 1 });

    const daysInWeek = eachDayOfInterval({ start: firstDayOfWeek, end: lastDayOfWeek });

    return daysInWeek.map(day => ({
      fullDate: day,
      date: format(day, 'dd'),
      isToday: isSameDay(day, today),
      events: getEventsForDay(day),
    }));
  }, [currentDate, workOrders]); // Jab week ya work orders change hon, tab regenerate karein

  // --- Navigation Handlers ---
  const handlePrev = () => {
    if (viewMode === 'month') {
      setCurrentDate(subMonths(currentDate, 1));
    } else {
      setCurrentDate(subWeeks(currentDate, 1));
    }
  };

  const handleNext = () => {
    if (viewMode === 'month') {
      setCurrentDate(addMonths(currentDate, 1));
    } else {
      setCurrentDate(addWeeks(currentDate, 1));
    }
  };

  // --- JSX (Aapka design structure, untouched) ---
  return (
    <div className="flex flex-col h-full bg-white p-4"> 
      <div className="flex flex-col flex-1 border border-gray-200 rounded-lg overflow-hidden"> 
        
        {/* Header: Yeh fixed (non-scrolling) hai */}
        <header className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
          {/* Left Side: Toggles */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('month')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'month' ? 'bg-blue-600 text-white shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'week' ? 'bg-blue-600 text-white shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Week
            </button>
          </div>

          {/* Center: Title & Nav */}
          <div className="flex items-center gap-4">
            <button onClick={handlePrev} className="p-1 text-gray-500 hover:text-gray-800 rounded-full hover:bg-gray-100">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h2 className="text-lg font-semibold text-gray-900">
              {viewMode === 'month'
                ? format(currentDate, 'MMMM yyyy')
                : `${format(currentDate, 'MMMM yyyy')} | Week ${getWeek(currentDate, { weekStartsOn: 1 })}`
              }
            </h2>
            <button onClick={handleNext} className="p-1 text-gray-500 hover:text-gray-800 rounded-full hover:bg-gray-100">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* Right side: (Empty placeholder) */}
          <div className="w-24"></div>
        </header>

        {/* Scrollable container (Aapka original layout) */}
        <div className="flex-1 flex flex-col overflow-auto">
          
          {/* Weekday Headers: Sticky */}
          <div className="grid grid-cols-7 border-b border-gray-200 flex-shrink-0 sticky top-0 bg-white z-10">
            {dayHeaders.map(day => (
              <div key={day} className="py-2 px-3 text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 last:border-r-0">
                {day}
              </div>
            ))}
          </div>

          {/* Grid content (Month or Week) */}
          <div className="flex-1">
            {viewMode === 'month' && (
              <div className="grid grid-cols-7 grid-rows-5 border-t border-l border-gray-200">
                {monthDays.map((day) => {
                  const isSelected = selectedDate === format(day.fullDate, 'yyyy-MM-dd');
                  return(
                    <div
                      key={day.fullDate.toISOString()}
                      onClick={() => setSelectedDate(format(day.fullDate, 'yyyy-MM-dd'))}
                      className={`relative p-2 overflow-y-auto border-r border-b border-gray-200 cursor-pointer transition-all ${
                        day.isCurrentMonth ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 text-gray-400'
                      } ${
                        isSelected ? 'ring-2 ring-blue-600 ring-inset shadow-lg z-10' : ''
                      }`}
                      style={{ height: '7rem' }} // h-28
                    >
                      <time
                        className={`text-sm font-medium ${
                          day.isToday && !isSelected ? 'flex items-center justify-center h-6 w-6 rounded-full bg-blue-600 text-white' :
                          isSelected ? 'flex items-center justify-center h-6 w-6 rounded-full bg-blue-600 text-white' :
                          day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                        }`}
                      >
                        {day.date}
                      </time>
                      <div className="mt-1">
                        {day.events?.map(renderEvent)}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {viewMode === 'week' && (
              <div className="grid grid-cols-7 border-t border-l border-gray-200">
                {weekDays.map((day) => {
                  const isSelected = selectedDate === format(day.fullDate, 'yyyy-MM-dd');
                  return (
                    <div
                      key={day.fullDate.toISOString()}
                      onClick={() => setSelectedDate(format(day.fullDate, 'yyyy-MM-dd'))}
                      className={`relative p-2 bg-white overflow-y-auto border-r border-b border-gray-200 cursor-pointer transition-all hover:bg-gray-50 ${
                        isSelected ? 'ring-2 ring-blue-600 ring-inset shadow-lg z-10' : ''
                      }`}
                      style={{ minHeight: '24rem' }} // h-96
                    >
                      <time
                        className={`text-sm font-medium ${
                          day.isToday && !isSelected ? 'flex items-center justify-center h-6 w-6 rounded-full bg-blue-600 text-white' :
                          isSelected ? 'flex items-center justify-center h-6 w-6 rounded-full bg-blue-600 text-white' :
                          'text-gray-900'
                        }`}
                      >
                        {day.date}
                      </time>
                      <div className="mt-1">
                        {day.events?.map(renderEvent)}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
        
      </div>
    </div>
  );
}