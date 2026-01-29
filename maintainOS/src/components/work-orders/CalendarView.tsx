"use client";

import { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Lock, RefreshCcw, CheckCircle2,
  X, Clock, Calendar as CalendarIcon, ChevronRight as ChevronRightIcon,
  ChevronLeft, ChevronRight,
  // ✅ Added Icons
  Search, Plus, Wrench
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

import toast from "react-hot-toast";

// ✅ REDUX HOOKS & ACTIONS IMPORT
import { useAppDispatch, useAppSelector } from "../../store/hooks";
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

  // date helpers

  startOfDay,
  isBefore,
  isAfter,
  getDay,
  getDate,
  subMonths,
  addMonths
} from 'date-fns';
import WorkOrderDetailModal from './Tableview/modals/WorkOrderDetailModal';
import type { WorkOrderResponse as WorkOrder } from '../../store/workOrders/workOrders.types';
import EventDetailPopover from './EventDetailPopover';
import type { ViewMode } from "./types";

// Helper to truncate title
const truncateTitle = (title: string, maxLength: number = 16) => {
  if (!title) return '';
  if (title.length <= maxLength) return title;
  return title.substring(0, maxLength) + '...';
};

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
                className={`group flex items-center justify-between p-4 bg-white border border-gray-200 rounded-md shadow-sm transition-all duration-200
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
                      {truncateTitle(evt.title)}
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

interface CalendarViewProps {
  workOrders: WorkOrder[];
  onRefreshWorkOrders?: () => void;
  // ✅ Props for controlled state
  currentDate?: Date;
  viewMode?: ViewMode; // Use imported type
  // ✅ Navigation handlers
  onPrevDate?: () => void;
  onNextDate?: () => void;
  onDateChange?: (date: Date) => void;
  onFilterChange?: (params: any) => void;
  filters?: any;
}

export function CalendarView({
  workOrders,
  onRefreshWorkOrders,
  currentDate: propCurrentDate, // Rename to avoid confusion if we used local state, but we won't
  viewMode: propViewMode = 'calendar-week', // Default to week view
  onPrevDate,
  onNextDate,
  onDateChange,
  onFilterChange,
  filters = {}
}: CalendarViewProps) {
  // ✅ REDUX HOOKS
  const dispatch = useAppDispatch();
  // Fetch active WO from Global State
  const selectedWorkOrder = useAppSelector((state) => state.workOrders.selectedWorkOrder);
  const filterData = useAppSelector((state) => state.workOrders.filterData);
  const navigate = useNavigate();

  // Controlled or Uncontrolled fallback (though usually controlled now)
  const currentDate = propCurrentDate || new Date();
  const viewMode = propViewMode || 'calendar'; // Default to month view if not provided

  // Local state for INTERACTION, not data
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [peopleSearchQuery, setPeopleSearchQuery] = useState("");
  const [isPeopleDropdownOpen, setIsPeopleDropdownOpen] = useState(false);
  const peopleSearchRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (peopleSearchRef.current && !peopleSearchRef.current.contains(event.target as Node)) {
        setIsPeopleDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const today = startOfDay(new Date());

  const [hoveredEventId, setHoveredEventId] = useState<string | null>(null);
  const [hoveredEventDate, setHoveredEventDate] = useState<Date | undefined>(undefined);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  const [hoveredEventGhost, setHoveredEventGhost] = useState(false);

  // Local state for Day List (Mobile/Overflow) is fine as it's transient
  const [dayListModalData, setDayListModalData] = useState<{ date: Date, events: any[] } | null>(null);

  // Internal Mini-Nav state (if we want the sidebar mini calendar to be independent? 
  // Probably matches the main calendar. Let's make it match.)

  // ✅ UPDATED HANDLER: Dispatch to Redux
  const handleEventClick = (e: React.MouseEvent, id: string, _eventDate: Date, isGhost?: boolean) => {
    e.stopPropagation();

    // 🔒 BLOCKING: If ghost, prevent opening
    if (isGhost || id.startsWith('ghost-')) {
      toast('Complete previous tasks to unlock this work order', {
        icon: '🔒',
        style: { borderRadius: '10px', background: '#333', color: '#fff', fontSize: '13px' },
      });
      return;
    }

    // ✅ Navigate to URL with view parameter to keep current view
    navigate(`/work-orders/${id}?view=${viewMode}`);

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

  // ✅ CORE LOGIC: Merge Real + Ghost Events
  const getEventsForDay = (day: Date) => {
    const dayStart = startOfDay(day);

    // 1. Real Events (Strict Due Date)
    const realEvents = workOrders.filter(wo => isStrictDueDate(wo, day));

    // 2. Ghost Events (Projections)
    const ghostEvents = workOrders
      .filter(wo => {
        // Only project from the "Active Head" of a recurring chain
        // Fix: Use wasDeleted if available, otherwise fallback
        const isActive = wo.status !== 'done' && wo.status !== 'completed' && !wo.wasDeleted;
        const hasRecurrence = !!wo.recurrenceRule;

        if (!isActive || !hasRecurrence) return false;

        // Only project into the future relative to the specific WO's due date
        const woDueDate = startOfDay(new Date(wo.dueDate || new Date()));
        if (!isAfter(dayStart, woDueDate)) return false;

        // Check rule match
        const matchesRule = matchesRecurrenceRule(wo.recurrenceRule, new Date(wo.startDate || new Date()), day);

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
        assignees: wo.assignees,
        workType: wo.workType,
        estimatedTimeHours: wo.estimatedTimeHours,
        priority: wo.priority,
        location: wo.location,
        assets: wo.assets,
        dueDate: day.toISOString()
      }));

    // 3. Map Real Events to UI format
    const uiRealEvents = realEvents.map(wo => ({
      id: wo.id,
      title: wo.title,
      icon: (wo.status === 'done' || wo.status === 'completed') ? 'check' :
        (wo.status === 'in_progress' ? 'refresh' : 'clock'),
      status: wo.status,
      isGhost: false,
      original: wo,
      assignees: wo.assignees,
      workType: wo.workType,
      estimatedTimeHours: wo.estimatedTimeHours,
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
    if (hoveredEventId.startsWith('ghost-')) {
      const ghost = monthDays.flatMap(d => d.events).find(e => e.id === hoveredEventId);
      return ghost ? ghost : null;
    }
    return workOrders.find(w => w.id === hoveredEventId);
  };

  const popoverData = getPopoverData();

  // Helper to generate mini calendar days
  // Use passed currentDate so it syncs with main
  const miniCalendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentDate));
    const end = endOfWeek(endOfMonth(currentDate));
    return eachDayOfInterval({ start, end });
  }, [currentDate]);


  // ✅ Dynamic Row Heights Calculation
  const hourHeights = useMemo(() => {
    if (viewMode !== 'calendar-week') return new Array(24).fill(80);

    return Array.from({ length: 24 }).map((_, hourIndex) => {
      let maxSegments = 0;

      weekDays.forEach((day) => {
        let segmentsInThisHour = 0;
        day.events.forEach((evt: any) => {
          let startHour = 9;
          let startMinutes = 0;
          const timeSource = evt.startDate || evt.dueDate;
          if (timeSource) {
            const d = new Date(timeSource);
            if (!isNaN(d.getTime())) {
              startHour = d.getHours();
              startMinutes = d.getMinutes();
            }
          }
          const duration = evt.estimatedTimeHours || 2;
          const fullHours = Math.ceil(duration);
          const evtStart = startHour + (startMinutes / 60);

          for (let i = 0; i < fullHours; i++) {
            const currentSegmentHour = Math.floor(evtStart + i);
            if (currentSegmentHour === hourIndex) {
              segmentsInThisHour++;
            }
          }
        });

        if (segmentsInThisHour > maxSegments) maxSegments = segmentsInThisHour;
      });

      // Calculate height: Base 80px. Each chip is ~36px (32px + 4px margin).
      // We add a little extra buffer.
      return Math.max(80, (maxSegments * 38) + 20);
    });
  }, [weekDays, viewMode]);

  return (
    <div className="calendar-page-layout">

      {/* --- SIDEBAR --- */}
      <div className="calendar-sidebar">
        {/* Removed Header Title (Jan 2026) as it's in UnifiedHeader now */}

        {/* Create Button */}
        <button className="calendar-create-btn">
          <Plus size={20} className="text-yellow-500" strokeWidth={3} />
          Create Workorder
        </button>

        {/* ✅ This Week Navigation (Added below Create Button) */}
        <div className="flex items-center justify-between border border-gray-200 rounded-lg p-2 bg-white mt-4 shadow-sm">
          <button
            onClick={onPrevDate}
            className="p-1 hover:bg-gray-100 rounded-md transition-colors text-gray-400 hover:text-gray-900"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm font-semibold text-gray-700">This Week</span>
          <button
            onClick={onNextDate}
            className="p-1 hover:bg-gray-100 rounded-md transition-colors text-gray-400 hover:text-gray-900"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Mini Calendar */}
        <div className="calendar-mini-wrapper">
          <div className="mini-calendar-header">
            <span className="mini-calendar-title">{format(currentDate, 'MMMM yyyy')}</span>
            <div className="flex gap-1">
              <button
                className="mini-calendar-nav-btn"
                // ✅ UPDATED: Jump by MONTH instead of relying on default week nav
                onClick={() => onDateChange?.(subMonths(currentDate, 1))}
              >
                <ChevronLeft size={16} />
              </button>
              <button
                className="mini-calendar-nav-btn"
                // ✅ UPDATED: Jump by MONTH
                onClick={() => onDateChange?.(addMonths(currentDate, 1))}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div className="mini-calendar-grid">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
              <div key={d} className="mini-calendar-day-header">{d}</div>
            ))}
            {miniCalendarDays.slice(0, 42).map((d, i) => {
              const isCurrentMonth = isSameMonth(d, currentDate);
              const isSelected = isSameDay(d, currentDate);

              const handleDateClick = (e: React.MouseEvent) => {
                e.stopPropagation();

                if (isCurrentMonth && onDateChange) {
                  onDateChange(d);
                }
              };

              return (
                <div
                  key={i}
                  className={`mini-calendar-day
                    ${isSelected ? 'active' : ''}
                    ${!isCurrentMonth ? 'text-muted' : ''}`}
                  onClick={handleDateClick}
                  style={{
                    cursor: isCurrentMonth ? 'pointer' : 'default',
                    pointerEvents: 'auto'
                  }}
                >
                  {isCurrentMonth ? format(d, 'd') : ''}
                </div>
              );
            })}
          </div>
        </div>

        {/* People Search Dropdown */}
        <div className="calendar-people-search relative flex flex-col z-50" ref={peopleSearchRef}>
          <div className="people-search-input-wrapper relative w-full mb-1">
            <Search className="people-search-icon absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              className="people-search-input w-full pl-8 pr-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Search for people"
              value={peopleSearchQuery}
              onChange={(e) => {
                setPeopleSearchQuery(e.target.value);
                setIsPeopleDropdownOpen(true);
              }}
              onFocus={() => setIsPeopleDropdownOpen(true)}
              onClick={() => setIsPeopleDropdownOpen(true)}
            />
          </div>

          {/* Results Dropdown */}
          {isPeopleDropdownOpen && (
            <div
              className="people-results-dropdown absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-[1000] overflow-hidden"
              style={{ maxHeight: '180px' }}
            >
              <div className="overflow-y-auto custom-scrollbar p-1 flex flex-col gap-1" style={{ maxHeight: '180px' }}>
                {(filterData?.users || [])
                  .filter(u => u.name.toLowerCase().includes(peopleSearchQuery.toLowerCase()))
                  .map(user => {
                    const isSelected = (filters?.assigneeOneOf?.split(',') || []).includes(user.id);

                    const handleToggleUser = () => {
                      const currentIds = filters?.assigneeOneOf?.split(',').filter(Boolean) || [];
                      const newIds = isSelected
                        ? currentIds.filter((id: string) => id !== user.id)
                        : [...currentIds, user.id];

                      onFilterChange?.({ assigneeOneOf: newIds.length > 0 ? newIds.join(',') : undefined });
                      setIsPeopleDropdownOpen(false); // ✅ Auto-close on selection
                    };

                    const initials = user.name
                      .split(' ')
                      .map((n: string) => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2);

                    return (
                      <div
                        key={user.id}
                        className={`people-dropdown-card flex items-center gap-2 p-1.5 rounded-md border transition-all cursor-pointer ${isSelected ? 'border-yellow-400 bg-yellow-50/50' : 'border-transparent hover:border-yellow-300 hover:bg-yellow-50/30'
                          }`}
                        onClick={handleToggleUser}
                      >
                        <div className="h-7 w-7 rounded-full border border-yellow-400 flex items-center justify-center bg-white shrink-0">
                          <Avatar className="h-6 w-6">
                            {user.image && <AvatarImage src={user.image} />}
                            <AvatarFallback className="bg-transparent text-gray-800 text-[9px] font-bold">{initials}</AvatarFallback>
                          </Avatar>
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-bold text-gray-900 truncate leading-tight">{user.name}</span>
                          <span className="text-[9px] text-gray-500 truncate leading-tight">Team Member</span>
                        </div>
                        {isSelected && (
                          <div className="ml-auto">
                            <CheckCircle2 size={12} className="text-yellow-500" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                {(filterData?.users || []).filter(u => u.name.toLowerCase().includes(peopleSearchQuery.toLowerCase())).length === 0 && (
                  <div className="p-2 text-center text-[10px] text-gray-500">No people found</div>
                )}
              </div>
            </div>
          )}

          {/* Selected People Display (Cards below input) */}
          {(filters?.assigneeOneOf?.split(',').filter(Boolean).length || 0) > 0 && (
            <div className="people-selected-row flex flex-col gap-1.5 mt-2">
              {(filterData?.users || [])
                .filter(user => (filters?.assigneeOneOf?.split(',') || []).includes(user.id))
                .map(user => {
                  const initials = user.name
                    .split(' ')
                    .map((n: string) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2);

                  return (
                    <div
                      key={user.id}
                      className="people-selected-card flex items-center gap-2 p-1.5 rounded-lg border border-yellow-400 bg-white shadow-sm relative group"
                    >
                      <div className="h-8 w-8 rounded-full border border-yellow-400 flex items-center justify-center bg-white shrink-0">
                        <Avatar className="h-7 w-7">
                          {user.image && <AvatarImage src={user.image} />}
                          <AvatarFallback className="bg-transparent text-gray-800 text-[10px] font-bold">{initials}</AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold text-gray-900 truncate leading-tight">{user.name}</span>
                        <span className="text-[10px] text-gray-500 truncate leading-tight">Team Member</span>
                      </div>
                      <button
                        className="ml-auto p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-red-500"
                        onClick={() => {
                          const currentIds = filters?.assigneeOneOf?.split(',').filter(Boolean) || [];
                          const newIds = currentIds.filter((id: string) => id !== user.id);
                          onFilterChange?.({ assigneeOneOf: newIds.length > 0 ? newIds.join(',') : undefined });
                        }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  );
                })}
            </div>
          )}


        </div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="calendar-main-content">

        {/* Top Bar REMOVED - handled by UnifiedHeader in parent */}

        {/* Calendar Grid Container */}
        <div className="calendar-grid-container relative h-full">
          {popoverData && anchorRect && (
            <EventDetailPopover
              workOrder={popoverData}
              anchorRect={anchorRect}
              eventDate={hoveredEventDate}
              isGhost={hoveredEventGhost}
              onClose={handleMouseLeave}
            />
          )}

          {/* Day List Modal */}
          {dayListModalData && (
            <DayListModal
              date={dayListModalData.date}
              workOrders={dayListModalData.events}
              onClose={() => setDayListModalData(null)}
              onItemClick={handleEventClick}
            />
          )}

          {/* Work Order Detail Modal */}
          {selectedWorkOrder && (
            <WorkOrderDetailModal
              open={!!selectedWorkOrder}
              onClose={() => dispatch(clearSelectedWorkOrder())}
              workOrder={selectedWorkOrder}
              onRefreshWorkOrders={onRefreshWorkOrders}
            />
          )}

          {/* Grid Body */}
          <div className="flex-1 overflow-auto bg-transparent custom-scrollbar">
            {viewMode === 'calendar' && (
              <div className="grid grid-cols-7 grid-rows-5 h-full border-l border-gray-100">
                {monthDays.map((day) => {
                  const isSelected = isSameDay(day.fullDate, currentDate);

                  return (
                    <div
                      key={day.fullDate.toISOString()}
                      className={`calendar-day-cell ${!day.isCurrentMonth ? 'other-month' : ''} ${selectedDate === format(day.fullDate, 'yyyy-MM-dd') ? 'bg-blue-50/20' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDayClick(day.fullDate, day.events);
                      }}
                    >
                      <div className={`calendar-day-number ${day.isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}>{day.date}</div>
                      <div className="flex-1 flex flex-col gap-1 overflow-hidden">
                        {day.events?.slice(0, 4).map((evt: any) => (
                          <div
                            key={`${evt.id}-${day.date}`}
                            className={`event-chip ${evt.status === 'done' ? 'green' :
                              evt.status === 'in_progress' ? 'blue' :
                                evt.priority === 'High' ? 'orange' : 'purple'
                              }`}
                            onClick={(e) => handleEventClick(e, evt.id, day.fullDate, evt.isGhost)}
                            onMouseEnter={(e) => handleMouseEnter(e, evt.id, day.fullDate, evt.isGhost)}
                            onMouseLeave={handleMouseLeave}
                            style={{ borderRadius: '4px' }}
                          >
                            <div className="flex items-center gap-1 truncate w-full">
                              {evt.isGhost ? <Lock size={10} className="shrink-0" /> : <Wrench size={10} className="shrink-0" />}
                              <span className="truncate">{truncateTitle(evt.title)}</span>
                            </div>
                          </div>
                        ))}
                        {day.events?.length > 4 && (
                          <span className="text-[10px] text-gray-400 pl-1">+{day.events.length - 4} more</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {viewMode === 'calendar-week' && (
              <div className="flex flex-col h-full">
                {/* Week Header */}
                <div className="week-view-header">
                  {/* Day Columns Header */}
                  {weekDays.map((day, i) => (
                    <div key={i} className={`week-day-header ${day.isToday ? 'today' : ''}`}>
                      <div className="week-day-name">{format(day.fullDate, 'EEE')}</div>
                      <div className={`week-day-number ${day.isToday ? 'today' : ''}`}>{format(day.fullDate, 'd')}</div>
                    </div>
                  ))}
                </div>

                {/* Week Grid (Scrollable) */}
                <div className="flex overflow-auto h-full">
                  {/* Time Axis (Left - Separate Column) */}
                  <div className="week-time-axis">
                    {Array.from({ length: 24 }).map((_, hour) => (
                      <div
                        key={hour}
                        className="week-time-slot"
                        style={{ height: `${hourHeights[hour]}px` }}
                      >
                        {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                      </div>
                    ))}
                  </div>

                  {/* Days Grid */}
                  <div className="week-view-grid flex px-0">
                    {weekDays.map((day, colIndex) => (
                      <div key={colIndex} className="week-day-column flex-1 border-r border-gray-100">
                        {/* Render 24 Hour Slots */}
                        {Array.from({ length: 24 }).map((_, hourIndex) => {
                          // Filter & Process Segments for this Hour
                          const segmentsInHour: any[] = [];

                          day.events.forEach((evt: any) => {
                            let startHour = 9;
                            let startMinutes = 0;
                            const timeSource = evt.startDate || evt.dueDate;
                            if (timeSource) {
                              const d = new Date(timeSource);
                              if (!isNaN(d.getTime())) {
                                startHour = d.getHours();
                                startMinutes = d.getMinutes();
                              }
                            }

                            const duration = evt.estimatedTimeHours || 2;
                            const fullHours = Math.ceil(duration);

                            // Check if this evt intersects this hour
                            // Calculate absolute start/end for the EVENT
                            const evtStart = startHour + (startMinutes / 60);
                            const evtEnd = evtStart + duration;

                            // Include if the event covers any part of this hour index (e.g. 9 to 10)
                            // Segment i (0 to fullHours-1) maps to hour (startHour + i)
                            // We can just iterate the logic we had:
                            for (let i = 0; i < fullHours; i++) {
                              const currentSegmentHour = Math.floor(evtStart + i);

                              if (currentSegmentHour === hourIndex) {
                                // Calculate Properties for this specific segment
                                const isFirst = (i === 0);

                                // Determine if we are in "Stacking Mode" for this specific slot
                                // (If more than 1 event starts/intersects this hour)
                                // We know segmentsInHour isn't fully populated yet in this loop.
                                // But we can pre-calculate count for this hour/day effectively?
                                // Actually, we are iterating `day.events`.
                                // We can just calculate the total count efficiently first.
                                const totalEventsInThisHour = day.events.filter((e: any) => {
                                  let s = 9, m = 0;
                                  const ts = e.startDate || e.dueDate;
                                  if (ts) { const td = new Date(ts); if (!isNaN(td.getTime())) { s = td.getHours(); m = td.getMinutes(); } }
                                  const dur = e.estimatedTimeHours || 2;
                                  const eStart = s + (m / 60);
                                  const eEnd = eStart + dur;
                                  // Intersects?
                                  return (eStart < hourIndex + 1) && (eEnd > hourIndex);
                                }).length;

                                const isStacked = totalEventsInThisHour > 1;

                                // Top Offset (Margin Top) - Scale with dynamic height
                                // Only applies if it's the very first segment and starts mid-hour
                                const realMarginTop = (isFirst) ? (startMinutes / 60) * hourHeights[hourIndex] : 0;

                                // Height Calculation
                                // Start of this segment in this hour
                                const segStartInHour = isFirst ? (startMinutes / 60) : 0;
                                // End of this segment in this hour
                                const segEndInHour = Math.min(1, evtEnd - currentSegmentHour);

                                const segDurationFraction = segEndInHour - segStartInHour;

                                // HYBRID LOGIC:
                                // If Stacked: Fixed compact height (32px approx) to fit many.
                                // If Single: Scale to fill the visual time slot.
                                let segmentHeight;
                                if (isStacked) {
                                  segmentHeight = 32; // Fixed compact
                                } else {
                                  segmentHeight = segDurationFraction * hourHeights[hourIndex];
                                  segmentHeight = Math.max(segmentHeight - 2, 24); // Border/Min adjustment
                                }

                                const getDurationColor = (h: number) => {
                                  if (h <= 1) return '#FFF9C4';
                                  if (h <= 1.5) return '#C8E6C9';
                                  if (h <= 2) return '#BBDEFB';
                                  if (h <= 3) return '#FFCCBC';
                                  if (h <= 4) return '#E1BEE7';
                                  return '#CFD8DC';
                                };

                                segmentsInHour.push({
                                  id: `${evt.id}-h${hourIndex}`,
                                  evt,
                                  marginTop: realMarginTop,
                                  height: segmentHeight,
                                  bgColor: getDurationColor(duration),
                                  isFirst,
                                  isStacked // Pass this down if needed for styling
                                });
                              }
                            }
                          });

                          return (
                            <div
                              key={hourIndex}
                              className="relative border-b border-gray-100 flex flex-col items-start gap-1 custom-scrollbar-vertical pr-1 py-1"
                              style={{ height: `${hourHeights[hourIndex]}px`, width: '100%' }}
                            >
                              {/* Half hour Guide Line */}
                              <div className="absolute top-1/2 left-0 w-full border-b border-dashed border-gray-100 pointer-events-none" />

                              {/* Render Segments */}
                              {segmentsInHour.map((seg) => (
                                <div
                                  key={seg.id}
                                  className="shrink-0 relative hover:brightness-95 cursor-pointer shadow-sm overflow-hidden transition-all hover:shadow-md mx-auto"
                                  style={{
                                    marginTop: '4px', // Standard gap
                                    minHeight: '32px', // Fixed height for slimmer look
                                    height: '32px',
                                    backgroundColor: seg.bgColor,
                                    // Remove localized border logic, use uniform border
                                    border: `1px solid ${seg.bgColor}`,
                                    borderRadius: '4px', // Reduced radius
                                    width: '90%', // Force Width
                                    fontSize: '10px',
                                    padding: '2px 6px', // Adjusted padding for tighter look
                                    color: '#1f2937', // Gray-800
                                    display: 'flex',
                                    flexDirection: 'row', // Horizontal for icon + title
                                    alignItems: 'center',
                                    gap: '6px',
                                    justifyContent: 'flex-start'
                                  }}
                                  onClick={(e) => handleEventClick(e, seg.evt.id, day.fullDate, seg.evt.isGhost)}
                                  onMouseEnter={(e) => handleMouseEnter(e, seg.evt.id, day.fullDate, seg.evt.isGhost)}
                                  onMouseLeave={handleMouseLeave}
                                >
                                  {seg.evt.isGhost || seg.evt.id.startsWith('ghost-') ? (
                                    <Lock size={10} className="shrink-0 text-gray-500" />
                                  ) : (
                                    <Wrench size={10} className="shrink-0 text-gray-700" />
                                  )}

                                  <div className="font-bold truncate leading-snug flex-1">
                                    {seg.isFirst ? truncateTitle(seg.evt.title) : `(cont.) ${truncateTitle(seg.evt.title)}`}
                                  </div>
                                </div>
                              ))}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
