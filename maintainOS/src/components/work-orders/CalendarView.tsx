import { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom'; 
import { 
  ChevronLeft, ChevronRight, Lock, RefreshCcw, CheckCircle2, 
  MapPin, User, X, Clock, Calendar as CalendarIcon, ChevronRight as ChevronRightIcon
} from 'lucide-react';
import type { WorkOrder } from "./types";

import toast from "react-hot-toast"; 

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
  subWeeks,
  startOfDay,
  isBefore,
  isAfter, 
  getDay,
  getDate
} from 'date-fns';
import WorkOrderDetailModal from './Tableview/modals/WorkOrderDetailModal';

// --- 1. Day List Modal (Unchanged) ---
function DayListModal({
  date,
  workOrders,
  onClose,
  onItemClick
}: {
  date: Date;
  workOrders: any[]; 
  onClose: () => void;
  onItemClick: (e: React.MouseEvent, id: string, date: Date) => void;
}) {
  const formattedDate = format(date, 'EEEE, MMMM do, yyyy');
  const today = startOfDay(new Date());
  const isFuture = isAfter(startOfDay(date), today);

  return createPortal(
    <div 
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 p-4" 
      onClick={onClose}
    >
      <div 
        className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200 border border-gray-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Work Orders</h3>
            <p className="text-sm text-blue-600 font-medium">{formattedDate}</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-white rounded-full transition border border-transparent hover:border-gray-200 shadow-sm"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* List Body */}
        <div className="overflow-y-auto p-4 space-y-3 bg-gray-50/30 flex-1 custom-scrollbar">
          {workOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <div className="bg-gray-100 p-4 rounded-full mb-3">
                <CalendarIcon size={32} className="opacity-40" />
              </div>
              <p className="text-sm font-medium">No work orders scheduled.</p>
            </div>
          ) : (
            workOrders.map((evt) => (
              <div
                key={evt.id}
                onClick={(e) => onItemClick(e, evt.id, date)}
                className={`group flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl shadow-sm transition-all duration-200
                  ${isFuture 
                    ? 'opacity-60 cursor-not-allowed bg-gray-50 grayscale' 
                    : 'hover:shadow-md hover:border-blue-400 hover:translate-x-1 cursor-pointer'
                  }`}
              >
                <div className="flex items-center gap-4 overflow-hidden">
                  {/* Status Icon */}
                  <div className={`p-2.5 rounded-lg flex-shrink-0 ${
                    evt.status === 'done' ? 'bg-green-100 text-green-600' :
                    evt.status === 'in_progress' ? 'bg-blue-100 text-blue-600' :
                    'bg-gray-100 text-gray-500'
                  }`}>
                    {isFuture ? <Lock size={18} /> : 
                     evt.status === 'done' ? <CheckCircle2 size={18} /> : 
                     evt.status === 'in_progress' ? <RefreshCcw size={18} /> : 
                     <Clock size={18} />
                    }
                  </div>

                  <div className="flex flex-col min-w-0">
                    <span className={`text-sm font-semibold truncate ${isFuture ? 'text-gray-500' : 'text-gray-900 group-hover:text-blue-700'}`}>
                      {evt.title}
                    </span>
                    <span className="text-xs text-gray-500 capitalize flex items-center gap-1">
                      {evt.status?.replace('_', ' ') || 'Open'}
                    </span>
                  </div>
                </div>

                {!isFuture && <ChevronRightIcon size={18} className="text-gray-300 group-hover:text-blue-500 transition-transform group-hover:translate-x-1" />}
              </div>
            ))
          )}
        </div>
        
        {/* Footer */}
        <div className="p-3 border-t border-gray-200 bg-white flex justify-between items-center text-xs text-gray-500">
          <span className="font-medium">{workOrders.length} tasks total</span>
          {isFuture && (
            <span className="flex items-center gap-1.5 text-amber-700 bg-amber-50 px-2 py-1 rounded-md border border-amber-100">
              <Lock size={10} /> Locked (Future Date)
            </span>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

// --- 2. Hover Popover (UPDATED: Hide Status/Due Date for Future) ---
function EventDetailPopover({ 
  workOrder, 
  anchorRect,
  eventDate // ✅ Passed from Parent to know context date
}: { 
  workOrder: WorkOrder; 
  anchorRect: DOMRect; 
  eventDate?: Date; 
}) {
  const formatDate = (date?: string) => date ? format(new Date(date), 'MMM d, yyyy') : '-';
  const assignee = workOrder.assignees?.[0] || workOrder.assignedTo;
  const assigneeName = typeof assignee === 'object' ? (assignee.fullName || assignee.name) : '-';
  
  const getStatusStyle = (status: string) => {
    switch(status?.toLowerCase()) {
      case 'in_progress': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'done':
      case 'completed': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const statusLabel = workOrder.status ? workOrder.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Open';

  // ✅ Future Check Logic
  const today = startOfDay(new Date());
  // Use passed eventDate or fallback to workOrder due date or today
  const targetDate = eventDate ? startOfDay(eventDate) : (workOrder.dueDate ? startOfDay(new Date(workOrder.dueDate)) : today);
  const isFuture = isAfter(targetDate, today);

  const POPOVER_HEIGHT = 320; 
  const POPOVER_WIDTH = 300;
  const SCREEN_HEIGHT = typeof window !== 'undefined' ? window.innerHeight : 800;
  const SCREEN_WIDTH = typeof window !== 'undefined' ? window.innerWidth : 1200;

  const spaceBelow = SCREEN_HEIGHT - anchorRect.bottom;
  const openUpwards = spaceBelow < POPOVER_HEIGHT; 
  const spaceRight = SCREEN_WIDTH - anchorRect.left;
  const openLeftwards = spaceRight < POPOVER_WIDTH;

  const style: React.CSSProperties = {
    position: 'fixed',
    width: `${POPOVER_WIDTH}px`,
    zIndex: 9999,
    pointerEvents: 'none', 
  };

  if (openUpwards) {
    style.bottom = `${SCREEN_HEIGHT - anchorRect.top + 8}px`;
  } else {
    style.top = `${anchorRect.bottom + 8}px`;
  }

  if (openLeftwards) {
    style.left = `${anchorRect.right - POPOVER_WIDTH}px`;
  } else {
    style.left = `${anchorRect.left}px`;
  }

  return (
    <div 
      className="bg-white rounded-lg shadow-xl border border-gray-200 text-sm animate-in fade-in zoom-in-95 duration-150"
      style={style}
    >
      <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-start gap-2 bg-gray-50/50">
        <h3 className="font-semibold text-gray-900 line-clamp-2 leading-tight">
          {workOrder.title || "Untitled Work Order"}
        </h3>
        {/* Optional: Show Lock icon in header for future */}
        {isFuture && <Lock size={16} className="text-amber-500 flex-shrink-0 mt-1" />}
      </div>
      
      <div className="p-4 space-y-3">
        
        {/* ✅ HIDE STATUS IF FUTURE */}
        {!isFuture && (
          <>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Status</span>
              <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusStyle(workOrder.status)}`}>
                {workOrder.status === 'in_progress' && <RefreshCcw size={10} className="animate-spin-slow" />}
                {workOrder.status === 'done' && <CheckCircle2 size={10} />}
                {statusLabel}
              </span>
            </div>
            <div className="h-px bg-gray-100 my-2" />
          </>
        )}

        {/* ✅ HIDE DUE DATE IF FUTURE (or show 'Locked') */}
        {isFuture ? (
           <div className="flex justify-center items-center p-2 bg-amber-50 text-amber-700 text-xs font-medium rounded border border-amber-100">
              Locked until {formatDate(targetDate.toISOString())}
           </div>
        ) : (
           <div className="flex justify-between items-center">
             <span className="text-gray-500">Due Date</span>
             <span className="text-gray-900 font-medium">{formatDate(workOrder.dueDate)}</span>
           </div>
        )}

        <div className="flex justify-between items-center">
          <span className="text-gray-500">Estimated Time</span>
          <span className="text-gray-900">{workOrder.estimatedTimeHours ? `${workOrder.estimatedTimeHours}h` : '-'}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-500">Work Type</span>
          <span className="text-gray-900">{workOrder.workType || 'Reactive'}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-500">Assigned To</span>
          {assigneeName !== '-' ? (
             <div className="flex items-center gap-1.5 text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                <User size={12} />
                <span className="font-medium text-xs truncate max-w-[120px]">{assigneeName}</span>
             </div>
          ) : (
             <span>-</span>
          )}
        </div>
      </div>
    </div>
  );
}

// --- 3. Recurrence Logic (Unchanged) ---
const checkRecurrence = (wo: any, targetDate: Date) => {
  if (!wo.startDate) return false;
  const start = startOfDay(new Date(wo.startDate));
  const current = startOfDay(targetDate);
  if (isBefore(current, start)) return false;

  let rule: any = null;
  try {
    if (wo.recurrenceRule) {
      rule = typeof wo.recurrenceRule === 'string' ? JSON.parse(wo.recurrenceRule) : wo.recurrenceRule;
    }
  } catch (e) { return isSameDay(current, start); }

  if (!rule || !rule.type || rule.type === 'do_not_repeat') return isSameDay(current, start);
  if (rule.type === 'daily') return true;
  if (rule.type === 'weekly') {
    const dayIndex = getDay(current); 
    return rule.daysOfWeek && rule.daysOfWeek.includes(dayIndex);
  }
  if (rule.type === 'monthly_by_date') return getDate(current) === rule.dayOfMonth;
  if (rule.type === 'yearly') return getDate(current) === getDate(start) && current.getMonth() === start.getMonth();
  return false;
};

const dayHeaders = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

interface CalendarViewProps {
  workOrders: WorkOrder[];
  onRefreshWorkOrders?: () => void;
}

export function CalendarView({ workOrders, onRefreshWorkOrders }: CalendarViewProps) {
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd')); 
  
  const today = startOfDay(new Date());

  const [hoveredEventId, setHoveredEventId] = useState<string | null>(null);
  const [hoveredEventDate, setHoveredEventDate] = useState<Date | undefined>(undefined); // ✅ Track Date for Hover
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null);
  const [dayListModalData, setDayListModalData] = useState<{ date: Date, events: any[] } | null>(null);

  const handleEventClick = (e: React.MouseEvent, id: string, eventDate: Date) => {
    e.stopPropagation();
    const isFuture = isAfter(startOfDay(eventDate), today);

    if (isFuture) {
      toast.error(`Locked until ${format(eventDate, 'MMM d')}`, {
        icon: '🔒',
        style: { borderRadius: '10px', background: '#333', color: '#fff' },
      });
      return;
    }

    const wo = workOrders.find(w => w.id === id);
    if (wo) {
      setDayListModalData(null); 
      setSelectedWorkOrder(wo);
      setHoveredEventId(null);
      setAnchorRect(null);
    }
  };

  const handleDayClick = (date: Date, events: any[]) => {
    setSelectedDate(format(date, 'yyyy-MM-dd'));
    setDayListModalData({ date, events });
  };

  // ✅ Updated Hover Handler to capture Date
  const handleMouseEnter = (e: React.MouseEvent, id: string, date: Date) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setAnchorRect(rect);
    setHoveredEventId(id);
    setHoveredEventDate(date);
  };

  const handleMouseLeave = () => {
    setHoveredEventId(null);
    setAnchorRect(null);
    setHoveredEventDate(undefined);
  };

  const handlePrev = () => {
    if (viewMode === 'month') setCurrentDate(subMonths(currentDate, 1));
    else setCurrentDate(subWeeks(currentDate, 1));
  };

  const handleNext = () => {
    if (viewMode === 'month') setCurrentDate(addMonths(currentDate, 1));
    else setCurrentDate(addWeeks(currentDate, 1));
  };

  const getEventsForDay = (day: Date) => {
    return workOrders
      .filter(wo => checkRecurrence(wo, day))
      .map(wo => ({
        id: wo.id,
        title: wo.title,
        icon: (wo.status === 'completed' || wo.status === 'done') ? 'refresh' : 'lock',
        status: wo.status
      }));
  };

  const monthDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end }).map(day => ({
      fullDate: day,
      date: format(day, 'dd'),
      isCurrentMonth: isSameMonth(day, currentDate),
      isToday: isSameDay(day, today),
      events: getEventsForDay(day),
    }));
  }, [currentDate, workOrders]);

  const weekDays = useMemo(() => {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 });
    const end = endOfWeek(currentDate, { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end }).map(day => ({
      fullDate: day,
      date: format(day, 'dd'),
      isToday: isSameDay(day, today),
      events: getEventsForDay(day),
    }));
  }, [currentDate, workOrders]);

  return (
    <div className="flex flex-col h-full bg-white p-4 relative"> 
      
      {hoveredEventId && anchorRect && (
        <EventDetailPopover
          workOrder={workOrders.find(w => w.id === hoveredEventId)!}
          anchorRect={anchorRect}
          eventDate={hoveredEventDate} // ✅ Pass date to popover
        />
      )}

      {selectedWorkOrder && (
        <WorkOrderDetailModal
          open={!!selectedWorkOrder}
          onClose={() => setSelectedWorkOrder(null)}
          workOrder={selectedWorkOrder}
          onRefreshWorkOrders={onRefreshWorkOrders}
        />
      )}

      {dayListModalData && (
        <DayListModal
          date={dayListModalData.date}
          workOrders={dayListModalData.events}
          onClose={() => setDayListModalData(null)}
          onItemClick={handleEventClick}
        />
      )}

      <div className="flex flex-col flex-1 border border-gray-200 rounded-lg overflow-hidden"> 
        
        <header className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-2">
            <button onClick={() => setViewMode('month')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === 'month' ? 'bg-blue-600 text-white shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Month</button>
            <button onClick={() => setViewMode('week')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === 'week' ? 'bg-blue-600 text-white shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Week</button>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={handlePrev} className="p-1 text-gray-500 hover:text-gray-800 rounded-full hover:bg-gray-100"><ChevronLeft className="h-5 w-5" /></button>
            <h2 className="text-lg font-semibold text-gray-900 text-center w-40">
              {viewMode === 'month' ? format(currentDate, 'MMMM yyyy') : `Week ${getWeek(currentDate)}`}
            </h2>
            <button onClick={handleNext} className="p-1 text-gray-500 hover:text-gray-800 rounded-full hover:bg-gray-100"><ChevronRight className="h-5 w-5" /></button>
          </div>
          <div className="w-24"></div>
        </header>

        <div className="flex-1 flex flex-col overflow-auto">
          <div className="grid grid-cols-7 border-b border-gray-200 flex-shrink-0 sticky top-0 bg-white z-10">
            {dayHeaders.map(day => <div key={day} className="py-2 px-3 text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 last:border-r-0">{day}</div>)}
          </div>

          <div className="flex-1">
            {viewMode === 'month' && (
              <div className="grid grid-cols-7 grid-rows-5 border-t border-l border-gray-200">
                {monthDays.map((day) => {
                  const isSelected = selectedDate === format(day.fullDate, 'yyyy-MM-dd');
                  return (
                    <div
                      key={day.fullDate.toISOString()}
                      // CLICK: Opens Modal ONLY on Number
                      className={`relative p-2 overflow-y-auto border-r border-b border-gray-200 transition-all ${day.isCurrentMonth ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 text-gray-400'} ${isSelected ? 'bg-blue-50/10' : ''}`}
                      style={{ height: '7rem' }}
                    >
                      <div className="flex justify-end p-1">
                        <span
                            onClick={(e) => {
                                e.stopPropagation(); // Prevent row click
                                handleDayClick(day.fullDate, day.events);
                            }}
                            className={`text-xs font-medium flex items-center justify-center h-7 w-7 p-2 rounded-full cursor-pointer transition-all ${
                            day.isToday ? 'bg-blue-600 text-white' : 
                            isSelected ? 'bg-yellow-400 text-black font-bold shadow-sm' : 
                            day.isCurrentMonth ? 'text-gray-700 hover:bg-gray-200' : 'text-gray-400'
                            }`}
                        >
                            {day.date}
                        </span>
                      </div>
                      <div className="mt-1 space-y-1">
                        {day.events?.map((evt: any) => {
                          const isFuture = isAfter(startOfDay(day.fullDate), today);
                          return (
                            <div 
                              key={`${evt.id}-${day.date}`} 
                              onClick={(e) => handleEventClick(e, evt.id, day.fullDate)} 
                              onMouseEnter={(e) => handleMouseEnter(e, evt.id, day.fullDate)} // ✅ Pass Date
                              onMouseLeave={handleMouseLeave}
                              className={`flex items-center gap-1.5 p-1 rounded-md border shadow-sm transition group 
                                ${isFuture 
                                  ? 'bg-gray-50 border-gray-200 opacity-60 cursor-not-allowed grayscale' 
                                  : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-md cursor-pointer'
                                }
                              `}
                            >
                              {isFuture ? <Lock className="h-3 w-3 text-gray-400" /> : (evt.icon === 'refresh' ? <RefreshCcw className="h-3 w-3 text-blue-500" /> : <Clock className="h-3 w-3 text-green-600" />)}
                              <span className={`text-xs truncate ${isFuture ? 'text-gray-400' : 'text-gray-800 group-hover:text-blue-600'}`}>
                                {evt.title}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
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
                      className={`relative p-2 bg-white overflow-y-auto border-r border-b border-gray-200 hover:bg-gray-50 ${isSelected ? 'bg-blue-50/10' : ''}`}
                      style={{ minHeight: '24rem' }}
                    >
                      <div className="flex justify-center mb-2">
                        <span 
                           onClick={(e) => {
                                e.stopPropagation();
                                handleDayClick(day.fullDate, day.events);
                           }}
                           className={`text-sm font-medium flex items-center justify-center h-8 w-8 rounded-full cursor-pointer transition-all ${
                            day.isToday ? 'bg-blue-600 text-white' : 
                            isSelected ? 'bg-yellow-400 text-black font-bold shadow-sm' : 
                            'text-gray-900 hover:bg-gray-200'
                        }`}>
                            {day.date}
                        </span>
                      </div>
                      <div className="mt-1 space-y-1">
                        {day.events?.map((evt: any) => {
                          const isFuture = isAfter(startOfDay(day.fullDate), today);
                          return (
                            <div 
                              key={`${evt.id}-${day.date}`} 
                              onClick={(e) => handleEventClick(e, evt.id, day.fullDate)}
                              onMouseEnter={(e) => handleMouseEnter(e, evt.id, day.fullDate)} // ✅ Pass Date
                              onMouseLeave={handleMouseLeave}
                              className={`flex items-center gap-1.5 p-1 rounded-md border shadow-sm transition group 
                                ${isFuture 
                                  ? 'bg-gray-50 border-gray-200 opacity-60 cursor-not-allowed grayscale' 
                                  : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-md cursor-pointer'
                                }
                              `}
                            >
                              {isFuture ? <Lock className="h-3 w-3 text-gray-400" /> : (evt.icon === 'refresh' ? <RefreshCcw className="h-3 w-3 text-blue-500" /> : <Clock className="h-3 w-3 text-green-600" />)}
                              <span className={`text-xs truncate ${isFuture ? 'text-gray-400' : 'text-gray-800 group-hover:text-blue-600'}`}>
                                {evt.title}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}