"use client";

import { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  ChevronLeft, ChevronRight, Lock, RefreshCcw, CheckCircle2,
  User, X, Clock, Calendar as CalendarIcon, ChevronRight as ChevronRightIcon,
  // ✅ Added Icons
  MapPin, Factory, AlertCircle
} from 'lucide-react';


import toast from "react-hot-toast";

// ✅ REDUX HOOKS & ACTIONS IMPORT
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  fetchWorkOrderById,

} from "../../store/workOrders/workOrders.thunks";
import { clearSelectedWorkOrder } from "../../store/workOrders/workOrders.reducers";
import { useNavigate } from "react-router-dom";
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
  subWeeks,
  startOfDay,
  isBefore,
  isAfter,
  getDay,
  getDate
} from 'date-fns';
import WorkOrderDetailModal from './Tableview/modals/WorkOrderDetailModal';
import { formatLabel } from "../utils/asset_formater";

// --- 1. Day List Modal (For Mobile/Overflow) ---
function DayListModal({
  date,
  workOrders,
  onClose,
  onItemClick
}: {
  date: Date;
  workOrders: any[];
  onClose: () => void;
  onItemClick: (e: React.MouseEvent, id: string, date: Date, isGhost?: boolean) => void;
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
                onClick={(e) => onItemClick(e, evt.id, date, evt.isGhost)}
                className={`group flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl shadow-sm transition-all duration-200
                  ${evt.status === 'locked'
                    ? 'opacity-60 cursor-not-allowed bg-gray-50 grayscale'
                    : 'hover:shadow-md hover:border-blue-400 hover:translate-x-1 cursor-pointer'
                  }`}
              >
                <div className="flex items-center gap-4 overflow-hidden">
                  <div className={`p-2.5 rounded-lg flex-shrink-0 ${evt.status === 'done' || evt.status === 'completed' ? 'bg-green-100 text-green-600' :
                    evt.status === 'in_progress' ? 'bg-blue-100 text-blue-600' :
                      'bg-gray-100 text-gray-500'
                    }`}>
                    {evt.status === 'locked' ? <Lock size={18} /> :
                      (evt.status === 'done' || evt.status === 'completed') ? <CheckCircle2 size={18} /> :
                        evt.status === 'in_progress' ? <RefreshCcw size={18} /> :
                          <Clock size={18} />
                    }
                  </div>

                  <div className="flex flex-col min-w-0">
                    <span className={`text-sm font-semibold truncate ${evt.status === 'locked' ? 'text-gray-500' : 'text-gray-900 group-hover:text-blue-700'}`}>
                      {evt.title}
                    </span>
                    <span className="text-xs text-gray-500 capitalize flex items-center gap-1">
                      {evt.status?.replace('_', ' ') || 'Open'}
                    </span>
                  </div>
                </div>

                {evt.status !== 'locked' && <ChevronRightIcon size={18} className="text-gray-300 group-hover:text-blue-500 transition-transform group-hover:translate-x-1" />}
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

// ✅ HELPER: Priority Colors
const getPriorityColor = (priority?: string) => {
  switch (priority?.toLowerCase()) {
    case 'high': return 'text-red-700 bg-red-50 border-red-200';
    case 'medium': return 'text-orange-700 bg-orange-50 border-orange-200';
    case 'low': return 'text-green-700 bg-green-50 border-green-200';
    default: return 'text-gray-700 bg-gray-50 border-gray-200';
  }
};

// --- 2. Hover Popover (Smart UI: Locked vs Details) ---
function EventDetailPopover({
  workOrder,
  anchorRect,
  eventDate,
  isGhost
}: {
  workOrder: any;
  anchorRect: DOMRect;
  eventDate?: Date;
  isGhost?: boolean;
}) {
  const formatDate = (date?: string) => date ? format(new Date(date), 'MMM d, yyyy') : '-';
  const assignee = workOrder.assignees?.[0] || workOrder.assignedTo;
  const assigneeName = typeof assignee === 'object' ? (assignee.fullName || assignee.name) : '-';

  const getStatusStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'in_progress': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'done':
      case 'completed': return 'bg-green-100 text-green-700 border-green-200';
      case 'locked': return 'bg-gray-100 text-gray-500 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const statusLabel = workOrder.status ? (workOrder.status as string).replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Open';

  const POPOVER_HEIGHT = 380; // Increased slightly for content
  const POPOVER_WIDTH = 320;
  const SCREEN_HEIGHT = typeof window !== 'undefined' ? window.innerHeight : 800;
  const SCREEN_WIDTH = typeof window !== 'undefined' ? window.innerWidth : 1200;

  const spaceBelow = SCREEN_HEIGHT - anchorRect.bottom;
  const openUpwards = spaceBelow < POPOVER_HEIGHT;
  const spaceRight = SCREEN_WIDTH - anchorRect.left;
  const openLeftwards = spaceRight < POPOVER_WIDTH;

  const style: React.CSSProperties = {
    position: 'fixed',
    width: `${POPOVER_WIDTH}px`,
    zIndex: 1000,
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
        {isGhost && <Lock size={16} className="text-amber-500 flex-shrink-0 mt-1" />}
      </div>

      <div className="p-4 space-y-3">

        {!isGhost ? (
          <>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Status</span>
              <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusStyle(workOrder.status)}`}>
                {workOrder.status === 'in_progress' && <RefreshCcw size={10} className="animate-spin-slow" />}
                {(workOrder.status === 'done' || workOrder.status === 'completed') && <CheckCircle2 size={10} />}
                {statusLabel}
              </span>
            </div>

            {/* ✅ Priority Section */}
            {workOrder.priority && (
              <div className="flex justify-between items-center">
                <span className="text-gray-500 flex items-center gap-2">
                  <AlertCircle size={14} className="text-gray-400" /> Priority
                </span>
                <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getPriorityColor(workOrder.priority)}`}>
                  {formatLabel(workOrder.priority)}
                </span>
              </div>
            )}

            <div className="h-px bg-gray-100 my-2" />
          </>
        ) : (
          <div className="flex justify-center items-center p-2 bg-amber-50 text-amber-700 text-xs font-medium rounded border border-amber-100 mb-2">
            <span>Completion Required</span>
          </div>
        )}

        <div className="flex justify-between items-center">
          <span className="text-gray-500">Due Date</span>
          <span className="text-gray-900 font-medium">{formatDate(eventDate?.toISOString() || workOrder.dueDate)}</span>
        </div>

        {/* ✅ Location Section */}
        <div className="flex justify-between items-start gap-4">
          <span className="text-gray-500 shrink-0 flex items-center gap-2">
            <MapPin size={14} className="text-gray-400" /> Location
          </span>
          <div className="flex items-center gap-1 text-right overflow-hidden">
            {workOrder.location ? (
              <span className="text-gray-900 truncate font-medium">{workOrder.location.name}</span>
            ) : (
              <span className="text-gray-400">-</span>
            )}
          </div>
        </div>

        {/* ✅ Assets Section */}
        <div className="flex justify-between items-start gap-4">
          <span className="text-gray-500 shrink-0 flex items-center gap-2">
            <Factory size={14} className="text-gray-400" /> Assets
          </span>
          <div className="flex flex-wrap justify-end gap-1">
            {workOrder.assets && workOrder.assets.length > 0 ? (
              workOrder.assets.slice(0, 3).map((a: any) => (
                <span key={a.id} className="flex items-center gap-1 px-2 py-1 bg-gray-50 border border-gray-200 rounded text-xs text-gray-700 max-w-[120px] truncate">
                  <span className="truncate">{a.name}</span>
                </span>
              ))
            ) : (
              <span className="text-gray-400">-</span>
            )}
            {workOrder.assets && workOrder.assets.length > 3 && (
              <span className="text-xs text-gray-400 mt-1">+{workOrder.assets.length - 3} more</span>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-500">Estimated Time</span>
          {/* ✅ UPDATED: Format to 2 decimal places */}
          <span className="text-gray-900">{workOrder.estimatedTimeHours ? `${Number(workOrder.estimatedTimeHours).toFixed(2)}h` : '-'}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-500">Work Type</span>
          <span className="text-gray-900">
            {formatLabel(workOrder.workType) || 'Reactive'}
          </span>
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

// --- 3. RECURRENCE LOGIC (UPDATED: GHOST PROJECTION) ---

// Pure math checker: Does this date fit the rule?
const matchesRecurrenceRule = (ruleStr: string | any, start: Date, target: Date) => {
  const current = startOfDay(target);
  const startDate = startOfDay(start);

  if (isBefore(current, startDate)) return false;

  let rule: any = null;
  try {
    rule = typeof ruleStr === 'string' ? JSON.parse(ruleStr) : ruleStr;
  } catch (e) { return false; }

  if (!rule || !rule.type) return false;

  if (rule.type === 'daily') return true;

  if (rule.type === 'weekly') {
    const dayIndex = getDay(current);
    // Handle array of days (e.g. [1, 3] for Mon/Wed) or single integers
    return Array.isArray(rule.daysOfWeek) && rule.daysOfWeek.includes(dayIndex);
  }

  if (rule.type === 'monthly_by_date') {
    return getDate(current) === rule.dayOfMonth;
  }

  if (rule.type === 'yearly') {
    return getDate(current) === getDate(startDate) && current.getMonth() === startDate.getMonth();
  }

  return false;
};

// Strict check for real items
const isStrictDueDate = (wo: any, targetDate: Date) => {
  if (!wo.dueDate) return false;
  return isSameDay(startOfDay(new Date(wo.dueDate)), startOfDay(targetDate));
};

const dayHeaders = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

export interface CalendarViewProps {
  workOrders: WorkOrder[];
  onRefreshWorkOrders?: () => void;
  loading?: boolean;
  hasError?: boolean;
}

export function CalendarView({ workOrders, onRefreshWorkOrders, loading, hasError }: CalendarViewProps) {
  // ✅ REDUX HOOKS
  const dispatch = useAppDispatch();
  // Fetch active WO from Global State
  const selectedWorkOrder = useAppSelector((state) => state.workOrders.selectedWorkOrder);
  const navigate = useNavigate();

  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const today = startOfDay(new Date());

  const [hoveredEventId, setHoveredEventId] = useState<string | null>(null);
  const [hoveredEventDate, setHoveredEventDate] = useState<Date | undefined>(undefined);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  const [hoveredEventGhost, setHoveredEventGhost] = useState(false);

  // Local state for Day List (Mobile/Overflow) is fine as it's transient
  const [dayListModalData, setDayListModalData] = useState<{ date: Date, events: any[] } | null>(null);

  // ✅ UPDATED HANDLER: Dispatch to Redux
  const handleEventClick = (e: React.MouseEvent, id: string, eventDate: Date, isGhost?: boolean) => {
    e.stopPropagation();

    // 🔒 BLOCKING: If ghost, prevent opening
    if (isGhost || id.startsWith('ghost-')) {
      toast('Complete previous tasks to unlock this work order', {
        icon: '🔒',
        style: { borderRadius: '10px', background: '#333', color: '#fff', fontSize: '13px' },
      });
      return;
    }

    // ✅ Navigate to URL instead of dispatching
    navigate(`/work-orders/${id}`);

    // Clear other UI states
    setDayListModalData(null);
    setHoveredEventId(null);
    setAnchorRect(null);
  };

  const handleDayClick = (date: Date, events: any[]) => {
    setSelectedDate(format(date, 'yyyy-MM-dd'));
    setDayListModalData({ date, events });
  };

  const handleMouseEnter = (e: React.MouseEvent, id: string, date: Date, isGhost?: boolean) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setAnchorRect(rect);
    setHoveredEventId(id);
    setHoveredEventDate(date);
    setHoveredEventGhost(!!isGhost);
  };

  const handleMouseLeave = () => {
    setHoveredEventId(null);
    setAnchorRect(null);
    setHoveredEventDate(undefined);
    setHoveredEventGhost(false);
  };

  const handlePrev = () => {
    if (viewMode === 'month') setCurrentDate(subMonths(currentDate, 1));
    else setCurrentDate(subWeeks(currentDate, 1));
  };

  const handleNext = () => {
    if (viewMode === 'month') setCurrentDate(addMonths(currentDate, 1));
    else setCurrentDate(addWeeks(currentDate, 1));
  };

  // ✅ CORE LOGIC: Merge Real + Ghost Events
  const getEventsForDay = (day: Date) => {
    const dayStart = startOfDay(day);
    const todayStart = startOfDay(new Date());
    const isFuture = isAfter(dayStart, todayStart);

    // 1. Real Events (Strict Due Date)
    const realEvents = workOrders.filter(wo => isStrictDueDate(wo, day));

    // 2. Ghost Events (Projections)
    const ghostEvents = workOrders
      .filter(wo => {
        // Only project from the "Active Head" of a recurring chain
        const isActive = wo.status !== 'done' && wo.status !== 'completed' && !wo.isDeleted;
        const hasRecurrence = !!wo.recurrenceRule;

        if (!isActive || !hasRecurrence) return false;

        // Only project into the future relative to the specific WO's due date
        // e.g. If WO is due Dec 25, we only ghost starting Dec 26.
        const woDueDate = startOfDay(new Date(wo.dueDate));
        if (!isAfter(dayStart, woDueDate)) return false;

        // Check rule match
        const matchesRule = matchesRecurrenceRule(wo.recurrenceRule, new Date(wo.startDate), day);

        // Don't show ghost if real item exists
        const hasRealSibling = realEvents.some(real => real.title === wo.title && real.workType === wo.workType);

        return matchesRule && !hasRealSibling;
      })
      .map(wo => ({
        id: `ghost-${wo.id}-${day.toISOString()}`,
        title: wo.title,
        status: 'locked',
        icon: 'lock',
        isGhost: true,
        original: wo,
        // Inherit props for display
        assignees: wo.assignees,
        workType: wo.workType,
        estimatedTimeHours: wo.estimatedTimeHours,

        // ✅ PASS DATA FOR POPOVER
        priority: wo.priority,
        location: wo.location,
        assets: wo.assets,

        // Ghost due date is the calendar day itself
        dueDate: day.toISOString()
      }));

    // 3. Map Real Events to UI format
    const uiRealEvents = realEvents.map(wo => ({
      id: wo.id,
      title: wo.title,
      // Icon Logic: Done=Check, Open/In_Progress=Clock/Refresh
      icon: (wo.status === 'done' || wo.status === 'completed') ? 'check' :
        (wo.status === 'in_progress' ? 'refresh' : 'clock'),
      status: wo.status,
      isGhost: false,
      // Pass full object for popover
      original: wo,
      assignees: wo.assignees,
      workType: wo.workType,
      estimatedTimeHours: wo.estimatedTimeHours,

      // ✅ PASS DATA FOR POPOVER
      priority: wo.priority,
      location: wo.location,
      assets: wo.assets,

      dueDate: wo.dueDate
    }));

    return [...uiRealEvents, ...ghostEvents];
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

  // Helper to find WO data for popover
  const getPopoverData = () => {
    if (!hoveredEventId) return null;
    // Check if ghost
    if (hoveredEventId.startsWith('ghost-')) {
      const ghost = monthDays.flatMap(d => d.events).find(e => e.id === hoveredEventId);
      return ghost ? ghost : null;
    }
    return workOrders.find(w => w.id === hoveredEventId);
  };

  const popoverData = getPopoverData();

  return (
    <div className="flex flex-col h-full bg-white p-4 relative">

      {popoverData && anchorRect && (
        <EventDetailPopover
          workOrder={popoverData}
          anchorRect={anchorRect}
          eventDate={hoveredEventDate}
          isGhost={hoveredEventGhost}
        />
      )}

      {/* ✅ GLOBAL MODAL CONTROL */}
      {selectedWorkOrder && (
        <WorkOrderDetailModal
          open={!!selectedWorkOrder}
          onClose={() => dispatch(clearSelectedWorkOrder())} // Clear Redux state on close
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

        <div className="flex-1 flex flex-col overflow-auto relative">
          {loading && (
            <div className="absolute inset-0 z-50 bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500"></div>
                <span className="text-sm font-medium animate-pulse text-muted-foreground">Work Orders Loading...</span>
              </div>
            </div>
          )}
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
                      className={`relative p-2 overflow-y-auto border-r border-b border-gray-200 transition-all ${day.isCurrentMonth ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 text-gray-400'} ${isSelected ? 'bg-blue-50/10' : ''}`}
                      style={{ height: '7rem' }}
                    >
                      <div className="flex justify-end p-1">
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDayClick(day.fullDate, day.events);
                          }}
                          className={`text-xs font-medium flex items-center justify-center h-7 w-7 p-2 rounded-full cursor-pointer transition-all ${day.isToday ? 'bg-blue-600 text-white' :
                            isSelected ? 'bg-yellow-400 text-black font-bold shadow-sm' :
                              day.isCurrentMonth ? 'text-gray-700 hover:bg-gray-200' : 'text-gray-400'
                            }`}
                        >
                          {day.date}
                        </span>
                      </div>
                      <div className="mt-1 space-y-1">
                        {day.events?.map((evt: any) => {
                          const isLocked = evt.isGhost;

                          return (
                            <div
                              key={`${evt.id}-${day.date}`}
                              onClick={(e) => handleEventClick(e, evt.id, day.fullDate, evt.isGhost)}
                              onMouseEnter={(e) => handleMouseEnter(e, evt.id, day.fullDate, evt.isGhost)}
                              onMouseLeave={handleMouseLeave}
                              className={`flex items-center gap-1.5 p-1 rounded-md border shadow-sm transition group 
                                ${isLocked
                                  ? 'bg-gray-50 border-gray-200 opacity-60 cursor-not-allowed grayscale'
                                  : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-md cursor-pointer'
                                }
                              `}
                            >
                              {evt.icon === 'lock' ? <Lock className="h-3 w-3 text-gray-400" /> :
                                evt.icon === 'check' ? <CheckCircle2 className="h-3 w-3 text-green-500" /> :
                                  evt.icon === 'refresh' ? <RefreshCcw className="h-3 w-3 text-blue-500" /> :
                                    <Clock className="h-3 w-3 text-gray-500" />}

                              <span className={`text-xs truncate ${isLocked ? 'text-gray-400' : 'text-gray-800 group-hover:text-blue-600'}`}>
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
                          className={`text-sm font-medium flex items-center justify-center h-8 w-8 rounded-full cursor-pointer transition-all ${day.isToday ? 'bg-blue-600 text-white' :
                            isSelected ? 'bg-yellow-400 text-black font-bold shadow-sm' :
                              'text-gray-900 hover:bg-gray-200'
                            }`}>
                          {day.date}
                        </span>
                      </div>
                      <div className="mt-1 space-y-1">
                        {day.events?.map((evt: any) => {
                          const isLocked = evt.isGhost;

                          return (
                            <div
                              key={`${evt.id}-${day.date}`}
                              onClick={(e) => handleEventClick(e, evt.id, day.fullDate, evt.isGhost)}
                              onMouseEnter={(e) => handleMouseEnter(e, evt.id, day.fullDate, evt.isGhost)}
                              onMouseLeave={handleMouseLeave}
                              className={`flex items-center gap-1.5 p-1 rounded-md border shadow-sm transition group 
                                ${isLocked
                                  ? 'bg-gray-50 border-gray-200 opacity-60 cursor-not-allowed grayscale'
                                  : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-md cursor-pointer'
                                }
                              `}
                            >
                              {evt.icon === 'lock' ? <Lock className="h-3 w-3 text-gray-400" /> :
                                evt.icon === 'check' ? <CheckCircle2 className="h-3 w-3 text-green-500" /> :
                                  evt.icon === 'refresh' ? <RefreshCcw className="h-3 w-3 text-blue-500" /> :
                                    <Clock className="h-3 w-3 text-gray-500" />}

                              <span className={`text-xs truncate ${isLocked ? 'text-gray-400' : 'text-gray-800 group-hover:text-blue-600'}`}>
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