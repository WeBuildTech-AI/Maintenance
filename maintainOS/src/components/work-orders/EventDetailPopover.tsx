import React from 'react';
import { format } from 'date-fns';
import {
    Pencil,
    Trash2,
    MoreVertical,
    X,
    MessageSquare,
    Mail,
    MapPin,
    Package,
    Briefcase
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

interface EventDetailPopoverProps {
    workOrder: any;
    anchorRect: DOMRect;
    eventDate?: Date;
    isGhost?: boolean;
    onClose?: () => void; // Added onClose prop
}

export default function EventDetailPopover({
    workOrder,
    anchorRect,
    eventDate,
    isGhost,
    onClose
}: EventDetailPopoverProps) {
    const formatDate = (date?: string) => date ? format(new Date(date), 'EEEE, d MMM') : '-';

    // Helper to format minutes into readable string
    const formatDuration = (hours?: number) => {
        if (!hours) return '-';
        const h = Math.floor(hours);
        const m = Math.round((hours - h) * 60);
        return `${h} Hours ${m} Minutes`;
    };

    const POPOVER_WIDTH = 420;
    const SCREEN_HEIGHT = typeof window !== 'undefined' ? window.innerHeight : 800;
    const SCREEN_WIDTH = typeof window !== 'undefined' ? window.innerWidth : 1200;

    const spaceBelow = SCREEN_HEIGHT - anchorRect.bottom;
    const openUpwards = spaceBelow < 480;
    const spaceRight = SCREEN_WIDTH - anchorRect.left;
    const openLeftwards = spaceRight < POPOVER_WIDTH;

    const positionStyle: React.CSSProperties = {};

    if (openUpwards) {
        positionStyle.bottom = `${SCREEN_HEIGHT - anchorRect.top + 10}px`;
    } else {
        positionStyle.top = `${anchorRect.bottom + 10}px`;
    }

    if (openLeftwards) {
        positionStyle.left = `${anchorRect.right - POPOVER_WIDTH}px`;
    } else {
        positionStyle.left = `${anchorRect.left}px`;
    }

    const statuses = ['Open', 'On hold', 'In Progress', 'Done'];

    return (
        <div
            className="event-detail-popover bg-white border border-gray-200 text-sm animate-in fade-in zoom-in-95 duration-150 flex flex-col font-sans"
            style={positionStyle}
        >
            {/* Header Actions */}
            <div className="event-detail-popover-header">
                <button className="event-detail-popover-header-btn">
                    <Pencil size={15} />
                </button>
                <button className="event-detail-popover-header-btn event-detail-popover-header-btn-delete">
                    <Trash2 size={15} />
                </button>
                <button className="event-detail-popover-header-btn">
                    <MoreVertical size={15} />
                </button>
                <button
                    onClick={onClose}
                    className="event-detail-popover-header-btn event-detail-popover-header-btn-close"
                >
                    <X size={15} />
                </button>
            </div>

            <div className="event-detail-popover-content">
                {/* Title with Priority Square */}
                <div className="event-detail-popover-title-section">
                    <div className={`event-detail-popover-priority ${workOrder.priority === 'High' ? 'event-detail-popover-priority-high' :
                        workOrder.priority === 'Medium' ? 'event-detail-popover-priority-medium' : 'event-detail-popover-priority-low'
                        }`} />
                    <div className="flex-1">
                        <h3 className="event-detail-popover-title">
                            {workOrder.title || "Untitled Work Order"}
                        </h3>
                        <div className="event-detail-popover-metadata">
                            <span><span className="event-detail-popover-metadata-label">Due Date:</span> <span className="event-detail-popover-metadata-value">{formatDate(eventDate?.toISOString() || workOrder.dueDate)}</span></span>
                            <span className="event-detail-popover-metadata-dot" />
                            <span><span className="event-detail-popover-metadata-label">Estimated time:</span> <span className="event-detail-popover-metadata-value">{formatDuration(workOrder.estimatedTimeHours)}</span></span>
                        </div>
                    </div>
                </div>

                {/* Status Pills */}
                <div className="event-detail-popover-status">
                    <span className="event-detail-popover-status-label">Status:</span>
                    {statuses.map((status) => {
                        const currentStatus = workOrder.status?.toLowerCase().replace('_', ' ');
                        const isActive = currentStatus === status.toLowerCase();

                        return (
                            <div
                                key={status}
                                className={`event-detail-popover-status-pill ${isActive
                                    ? 'event-detail-popover-status-pill-active'
                                    : 'event-detail-popover-status-pill-inactive'
                                    }`}
                            >
                                {status}
                            </div>
                        );
                    })}
                </div>

                {/* Assigned Section */}
                <div className="event-detail-popover-assigned">
                    <div className="event-detail-popover-assigned-header">
                        <div className="event-detail-popover-assigned-label">
                            <svg width="14.93" height="14.93" viewBox="0 0 24 24" fill="#F59E0B" xmlns="http://www.w3.org/2000/svg">
                                <path d="M16 11C17.66 11 18.99 9.66 18.99 8C18.99 6.34 17.66 5 16 5C14.34 5 13 6.34 13 8C13 9.66 14.34 11 16 11ZM8 11C9.66 11 10.99 9.66 10.99 8C10.99 6.34 9.66 5 8 5C6.34 5 5 6.34 5 8C5 9.66 6.34 11 8 11ZM8 13C5.67 13 1 14.17 1 16.5V19H15V16.5C15 14.17 10.33 13 8 13ZM16 13C15.71 13 15.38 13.02 15.03 13.05C16.19 13.89 17 15.11 17 16.5V19H23V16.5C23 14.17 18.33 13 16 13Z" />
                            </svg>
                            <span>Assigned</span>
                        </div>
                        <div className="event-detail-popover-assigned-icons">
                            <MessageSquare size={15} className="event-detail-popover-assigned-icon" />
                            <Mail size={15} className="event-detail-popover-assigned-icon" />
                        </div>
                    </div>

                    <div className="event-detail-popover-assigned-list">
                        {workOrder.assignees?.map((u: any) => (
                            <div key={u.id} className="event-detail-popover-assigned-item">
                                <Avatar style={{ width: '22.39px', height: '22.39px' }}>
                                    <AvatarImage src={u.avatar} />
                                    <AvatarFallback className="text-sm bg-gray-200 text-gray-700 font-medium">
                                        {u.fullName?.substring(0, 2).toUpperCase() || 'UN'}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="event-detail-popover-assigned-name">{u.fullName}</span>
                            </div>
                        )) || (
                                <div className="event-detail-popover-assigned-item">
                                    <Avatar style={{ width: '22.39px', height: '22.39px' }}>
                                        <AvatarFallback className="text-sm bg-gray-200 text-gray-500">NA</AvatarFallback>
                                    </Avatar>
                                    <span className="event-detail-popover-assigned-name" style={{ fontStyle: 'italic', color: 'var(--color-gray-500)' }}>No assignee</span>
                                </div>
                            )}
                    </div>
                </div>

                {/* Details Rows */}
                <div className="event-detail-popover-details">
                    {/* Location */}
                    <div className="event-detail-popover-detail-row">
                        <div className="event-detail-popover-detail-label">
                            <MapPin size={15} className="event-detail-popover-detail-icon" />
                            <span>Location</span>
                        </div>
                        <span className="event-detail-popover-detail-value">
                            {workOrder.location?.name || 'No location'}
                        </span>
                    </div>

                    {/* Asset */}
                    <div className="event-detail-popover-detail-row">
                        <div className="event-detail-popover-detail-label">
                            <Package size={15} className="event-detail-popover-detail-icon" />
                            <span>Asset</span>
                        </div>
                        <span className="event-detail-popover-detail-value">
                            {workOrder.assets?.[0]?.name || 'No asset'}
                            {workOrder.assets?.length > 1 && ` - ${workOrder.assets.length - 1}`}
                        </span>
                    </div>

                    {/* Work Type */}
                    <div className="event-detail-popover-detail-row">
                        <div className="event-detail-popover-detail-label">
                            <Briefcase size={15} className="event-detail-popover-detail-icon" />
                            <span>Work type</span>
                        </div>
                        <span className="event-detail-popover-detail-value-green">
                            {workOrder.workType || 'Preventive'}
                        </span>
                    </div>
                </div>

            </div>
        </div>
    );
}
