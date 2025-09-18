import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Progress } from './ui/progress';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { ChecklistBuilder, ChecklistTemplate } from './ChecklistBuilder';
import { DetailViewModal, DetailItem } from './DetailViewModal';
import { QuickCommentButton, Comment } from './CommentSystem';
import { 
  Search, 
  Plus, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Calendar as CalendarIcon,
  PlayCircle,
  PauseCircle,
  Edit,
  Filter,
  FileText,
  ClipboardList,
  Eye
} from 'lucide-react';

export function PreventiveMaintenance() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [activeTab, setActiveTab] = useState('pm-schedules');
  const [selectedChecklist, setSelectedChecklist] = useState<string | null>(null);
  const [checklists, setChecklists] = useState<ChecklistTemplate[]>([]);
  const [selectedPMSchedule, setSelectedPMSchedule] = useState<DetailItem | null>(null);
  const [isDetailViewOpen, setIsDetailViewOpen] = useState(false);
  const [pmComments, setPmComments] = useState<Record<string, Comment[]>>({});

  // Mock PM schedule data
  const pmSchedules = [
    {
      id: 'PM-001',
      name: 'Pump A-101 Quarterly Maintenance',
      asset: 'A-101 - Centrifugal Pump #1',
      frequency: 'Quarterly',
      lastCompleted: '2024-09-15',
      nextDue: '2024-12-15',
      status: 'Overdue',
      assignedTo: 'Mike Johnson',
      estimatedHours: 4,
      tasks: ['Bearing lubrication', 'Vibration check', 'Alignment verification'],
      compliance: 85,
      priority: 'High'
    },
    {
      id: 'PM-002',
      name: 'Motor M-205 Monthly Inspection',
      asset: 'M-205 - Electric Motor 50HP',
      frequency: 'Monthly',
      lastCompleted: '2024-11-20',
      nextDue: '2024-12-20',
      status: 'Scheduled',
      assignedTo: 'Sarah Wilson',
      estimatedHours: 2,
      tasks: ['Temperature check', 'Current measurement', 'Visual inspection'],
      compliance: 92,
      priority: 'Medium'
    },
    {
      id: 'PM-003',
      name: 'Compressor C-301 Semi-Annual Service',
      asset: 'C-301 - Air Compressor Unit',
      frequency: 'Semi-Annual',
      lastCompleted: '2024-06-15',
      nextDue: '2024-12-15',
      status: 'In Progress',
      assignedTo: 'David Chen',
      estimatedHours: 6,
      tasks: ['Oil change', 'Filter replacement', 'Pressure test', 'Safety valve check'],
      compliance: 78,
      priority: 'High'
    },
    {
      id: 'PM-004',
      name: 'HVAC H-102 Filter Change',
      asset: 'H-102 - HVAC Unit - North Wing',
      frequency: 'Monthly',
      lastCompleted: '2024-11-18',
      nextDue: '2024-12-18',
      status: 'Scheduled',
      assignedTo: 'Lisa Brown',
      estimatedHours: 1,
      tasks: ['Replace air filters', 'Clean coils', 'Check thermostat'],
      compliance: 95,
      priority: 'Low'
    },
    {
      id: 'PM-005',
      name: 'Valve V-150 Annual Calibration',
      asset: 'V-150 - Control Valve Assembly',
      frequency: 'Annual',
      lastCompleted: '2023-12-10',
      nextDue: '2024-12-10',
      status: 'Completed',
      assignedTo: 'David Chen',
      estimatedHours: 3,
      tasks: ['Position calibration', 'Signal verification', 'Stroke test'],
      compliance: 100,
      priority: 'Medium'
    }
  ];

  const filteredSchedules = pmSchedules.filter(schedule => {
    const matchesSearch = schedule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         schedule.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         schedule.asset.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || schedule.status.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in progress': return 'bg-blue-100 text-blue-800';
      case 'scheduled': return 'bg-amber-100 text-amber-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'in progress': return <PlayCircle className="w-4 h-4 text-blue-500" />;
      case 'scheduled': return <Clock className="w-4 h-4 text-amber-500" />;
      case 'overdue': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default: return <PauseCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const statusCounts = {
    total: pmSchedules.length,
    scheduled: pmSchedules.filter(pm => pm.status === 'Scheduled').length,
    overdue: pmSchedules.filter(pm => pm.status === 'Overdue').length,
    inProgress: pmSchedules.filter(pm => pm.status === 'In Progress').length,
    avgCompliance: Math.round(pmSchedules.reduce((acc, pm) => acc + pm.compliance, 0) / pmSchedules.length)
  };

  const handleSaveChecklist = (template: ChecklistTemplate) => {
    setChecklists(prev => [...prev, template]);
    setActiveTab('pm-schedules');
  };

  const handleViewPMSchedule = (schedule: any) => {
    const detailItem: DetailItem = {
      id: schedule.id,
      title: schedule.name,
      description: `${schedule.frequency} maintenance schedule for ${schedule.asset}`,
      type: 'pm_schedule',
      status: schedule.status,
      assignedTo: schedule.assignedTo,
      createdBy: 'System',
      createdDate: schedule.lastCompleted,
      dueDate: schedule.nextDue,
      fields: [
        { label: 'Asset', value: schedule.asset, type: 'text' },
        { label: 'Frequency', value: schedule.frequency, type: 'text' },
        { label: 'Last Completed', value: schedule.lastCompleted, type: 'date' },
        { label: 'Next Due', value: schedule.nextDue, type: 'date' },
        { label: 'Estimated Hours', value: schedule.estimatedHours, type: 'number' },
        { label: 'Compliance', value: schedule.compliance, type: 'progress' },
        { label: 'Priority', value: schedule.priority, type: 'badge' },
        { label: 'Tasks', value: schedule.tasks.join(', '), type: 'text' }
      ],
      activities: pmComments[schedule.id] || []
    };
    
    setSelectedPMSchedule(detailItem);
    setIsDetailViewOpen(true);
  };

  const handleOpenComments = (scheduleId: string) => {
    const schedule = pmSchedules.find(s => s.id === scheduleId);
    if (schedule) {
      handleViewPMSchedule(schedule);
      setTimeout(() => {
        const commentsTab = document.querySelector('[data-state="inactive"][value="comments"]') as HTMLElement;
        if (commentsTab) commentsTab.click();
      }, 100);
    }
  };

  const getCommentCount = (scheduleId: string) => {
    return pmComments[scheduleId]?.length || 0;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1>Preventive Maintenance</h1>
          <p className="text-muted-foreground">Schedule and track preventive maintenance activities</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={activeTab === 'checklists' ? 'default' : 'outline'}
            onClick={() => setActiveTab('checklists')}
          >
            <ClipboardList className="w-4 h-4 mr-2" />
            Manage Checklists
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create PM Schedule
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create PM Schedule</DialogTitle>
              <DialogDescription>
                Set up a new preventive maintenance schedule
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="col-span-2 space-y-2">
                <Label htmlFor="pm-name">PM Schedule Name</Label>
                <Input id="pm-name" placeholder="e.g., Monthly Motor Inspection" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pm-asset">Asset</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select asset" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A-101">A-101 - Centrifugal Pump #1</SelectItem>
                    <SelectItem value="M-205">M-205 - Electric Motor 50HP</SelectItem>
                    <SelectItem value="C-301">C-301 - Air Compressor Unit</SelectItem>
                    <SelectItem value="H-102">H-102 - HVAC Unit - North Wing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pm-frequency">Frequency</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="semi-annual">Semi-Annual</SelectItem>
                    <SelectItem value="annual">Annual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pm-assignee">Assign To</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select technician" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mike">Mike Johnson</SelectItem>
                    <SelectItem value="sarah">Sarah Wilson</SelectItem>
                    <SelectItem value="david">David Chen</SelectItem>
                    <SelectItem value="lisa">Lisa Brown</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pm-priority">Priority</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pm-estimated-hours">Estimated Hours</Label>
                <Input id="pm-estimated-hours" type="number" placeholder="0" />
              </div>
              <div className="space-y-2">
                <Label>Next Due Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? selectedDate.toDateString() : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="pm-tasks">Maintenance Tasks</Label>
                <Textarea 
                  id="pm-tasks" 
                  placeholder="List the tasks to be performed (one per line)"
                  rows={4}
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="pm-checklist">Checklist Template (Optional)</Label>
                <Select value={selectedChecklist || ''} onValueChange={setSelectedChecklist}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select checklist template" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No checklist</SelectItem>
                    {checklists.map((checklist) => (
                      <SelectItem key={checklist.id} value={checklist.id}>
                        {checklist.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsCreateDialogOpen(false)}>
                Create Schedule
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {/* Main Content */}
      {activeTab === 'checklists' ? (
        <ChecklistBuilder 
          onSave={handleSaveChecklist}
          mode="create"
        />
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total PM Schedules</p>
                <p className="text-2xl font-bold">{statusCounts.total}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overdue</p>
                <p className="text-2xl font-bold text-red-600">{statusCounts.overdue}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Scheduled</p>
                <p className="text-2xl font-bold text-amber-600">{statusCounts.scheduled}</p>
              </div>
              <Clock className="w-8 h-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Compliance</p>
                <p className="text-2xl font-bold text-green-600">{statusCounts.avgCompliance}%</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search PM schedules by name, ID, or asset..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="in progress">In Progress</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* PM Calendar View */}
      <Card>
        <CardHeader>
          <CardTitle>This Week's PM Schedule</CardTitle>
          <CardDescription>Upcoming preventive maintenance activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2 mb-4">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
              <div key={day} className="text-center font-medium p-2 bg-muted rounded">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {[16, 17, 18, 19, 20, 21, 22].map(date => (
              <div key={date} className="min-h-24 p-2 border rounded">
                <div className="font-medium text-sm mb-1">{date}</div>
                {date === 18 && (
                  <div className="text-xs bg-blue-100 text-blue-800 p-1 rounded mb-1">
                    HVAC Filter Change
                  </div>
                )}
                {date === 20 && (
                  <div className="text-xs bg-amber-100 text-amber-800 p-1 rounded mb-1">
                    Motor Inspection
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* PM Schedules Table */}
      <Card>
        <CardHeader>
          <CardTitle>PM Schedules</CardTitle>
          <CardDescription>
            All preventive maintenance schedules with their status and compliance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Schedule Name</TableHead>
                <TableHead>Asset</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Next Due</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Compliance</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSchedules.map((schedule) => (
                <TableRow key={schedule.id}>
                  <TableCell className="font-medium">{schedule.id}</TableCell>
                  <TableCell className="max-w-48">
                    <div>
                      <p className="font-medium truncate">{schedule.name}</p>
                      <p className="text-xs text-muted-foreground">{schedule.estimatedHours}h estimated</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{schedule.asset}</TableCell>
                  <TableCell>{schedule.frequency}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(schedule.status)}
                      <Badge className={getStatusColor(schedule.status)}>
                        {schedule.status}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getPriorityColor(schedule.priority)}>
                      {schedule.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>{schedule.nextDue}</TableCell>
                  <TableCell>{schedule.assignedTo}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Progress value={schedule.compliance} className="w-16" />
                      <span className="text-sm text-muted-foreground">{schedule.compliance}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleViewPMSchedule(schedule)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <QuickCommentButton
                        entityId={schedule.id}
                        entityType="pm_schedule"
                        commentCount={getCommentCount(schedule.id)}
                        onClick={() => handleOpenComments(schedule.id)}
                      />
                      <Button variant="ghost" size="sm">
                        <PlayCircle className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      </>
      )}

      {/* Detail View Modal */}
      <DetailViewModal
        item={selectedPMSchedule}
        isOpen={isDetailViewOpen}
        onClose={() => {
          setIsDetailViewOpen(false);
          setSelectedPMSchedule(null);
        }}
        onSave={(updatedItem) => {
          console.log('Save PM schedule:', updatedItem);
          // Here you would update the PM schedule in your data source
        }}
      />
    </div>
  );
}