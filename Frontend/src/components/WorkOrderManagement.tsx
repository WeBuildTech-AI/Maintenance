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
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ChecklistBuilder, ChecklistTemplate } from './ChecklistBuilder';
import { DetailViewModal, DetailItem } from './DetailViewModal';
import { CommentSystem, QuickCommentButton, Comment } from './CommentSystem';
import { 
  Search, 
  Plus, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  Eye,
  Edit,
  User,
  Calendar,
  Filter,
  FileText,
  ClipboardList,
  MessageSquare
} from 'lucide-react';

export function WorkOrderManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('work-orders');
  const [selectedChecklist, setSelectedChecklist] = useState<string | null>(null);
  const [checklists, setChecklists] = useState<ChecklistTemplate[]>([]);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<DetailItem | null>(null);
  const [isDetailViewOpen, setIsDetailViewOpen] = useState(false);
  const [isCommentSystemOpen, setIsCommentSystemOpen] = useState(false);
  const [workOrderComments, setWorkOrderComments] = useState<Record<string, Comment[]>>({});

  // Mock work order data
  const workOrders = [
    {
      id: 'WO-2024-001',
      title: 'Replace Bearing in Pump A-101',
      description: 'Abnormal vibration detected during routine inspection',
      asset: 'A-101 - Centrifugal Pump #1',
      type: 'Corrective',
      priority: 'High',
      status: 'In Progress',
      assignedTo: 'Mike Johnson',
      createdBy: 'John Doe',
      createdDate: '2024-12-15',
      dueDate: '2024-12-18',
      estimatedHours: 4,
      actualHours: 2.5,
      cost: '$450',
      progress: 60
    },
    {
      id: 'WO-2024-002',
      title: 'Quarterly PM - Motor M-205',
      description: 'Scheduled preventive maintenance as per PM schedule',
      asset: 'M-205 - Electric Motor 50HP',
      type: 'Preventive',
      priority: 'Medium',
      status: 'Assigned',
      assignedTo: 'Sarah Wilson',
      createdBy: 'System',
      createdDate: '2024-12-14',
      dueDate: '2024-12-20',
      estimatedHours: 2,
      actualHours: 0,
      cost: '$120',
      progress: 0
    },
    {
      id: 'WO-2024-003',
      title: 'Valve Actuator Calibration',
      description: 'Annual calibration of control valve assembly',
      asset: 'V-150 - Control Valve Assembly',
      type: 'Calibration',
      priority: 'Medium',
      status: 'Completed',
      assignedTo: 'David Chen',
      createdBy: 'Lisa Brown',
      createdDate: '2024-12-10',
      dueDate: '2024-12-12',
      estimatedHours: 3,
      actualHours: 2.8,
      cost: '$200',
      progress: 100
    },
    {
      id: 'WO-2024-004',
      title: 'HVAC Filter Replacement',
      description: 'Replace air filters in north wing HVAC unit',
      asset: 'H-102 - HVAC Unit - North Wing',
      type: 'Preventive',
      priority: 'Low',
      status: 'Pending Approval',
      assignedTo: 'Unassigned',
      createdBy: 'Mike Johnson',
      createdDate: '2024-12-16',
      dueDate: '2024-12-22',
      estimatedHours: 1,
      actualHours: 0,
      cost: '$85',
      progress: 0
    },
    {
      id: 'WO-2024-005',
      title: 'Emergency Repair - Compressor C-301',
      description: 'Compressor shutdown due to high temperature alarm',
      asset: 'C-301 - Air Compressor Unit',
      type: 'Emergency',
      priority: 'Critical',
      status: 'Open',
      assignedTo: 'Emergency Team',
      createdBy: 'System Alert',
      createdDate: '2024-12-17',
      dueDate: '2024-12-17',
      estimatedHours: 6,
      actualHours: 0,
      cost: '$800',
      progress: 0
    }
  ];

  const filteredWorkOrders = workOrders.filter(wo => {
    const matchesSearch = wo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         wo.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         wo.asset.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || wo.status.toLowerCase().includes(filterStatus.toLowerCase());
    const matchesPriority = filterPriority === 'all' || wo.priority.toLowerCase() === filterPriority.toLowerCase();
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in progress': return 'bg-blue-100 text-blue-800';
      case 'assigned': return 'bg-amber-100 text-amber-800';
      case 'open': return 'bg-red-100 text-red-800';
      case 'pending approval': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'emergency': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'corrective': return <AlertCircle className="w-4 h-4 text-amber-500" />;
      case 'preventive': return <Calendar className="w-4 h-4 text-blue-500" />;
      case 'calibration': return <CheckCircle className="w-4 h-4 text-green-500" />;
      default: return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  const statusCounts = {
    total: workOrders.length,
    open: workOrders.filter(wo => wo.status === 'Open').length,
    inProgress: workOrders.filter(wo => wo.status === 'In Progress').length,
    completed: workOrders.filter(wo => wo.status === 'Completed').length
  };

  const handleSaveChecklist = (template: ChecklistTemplate) => {
    setChecklists(prev => [...prev, template]);
    setActiveTab('work-orders');
  };

  const handleViewWorkOrder = (wo: any) => {
    const detailItem: DetailItem = {
      id: wo.id,
      title: wo.title,
      description: wo.description,
      type: 'work_order',
      status: wo.status,
      priority: wo.priority,
      assignedTo: wo.assignedTo,
      createdBy: wo.createdBy,
      createdDate: wo.createdDate,
      updatedDate: wo.createdDate,
      dueDate: wo.dueDate,
      progress: wo.progress,
      fields: [
        { label: 'Asset', value: wo.asset, type: 'text' },
        { label: 'Type', value: wo.type, type: 'text' },
        { label: 'Estimated Hours', value: wo.estimatedHours, type: 'number' },
        { label: 'Actual Hours', value: wo.actualHours, type: 'number' },
        { label: 'Cost', value: wo.cost, type: 'text' },
        { label: 'Progress', value: wo.progress, type: 'progress' }
      ],
      activities: workOrderComments[wo.id] || []
    };
    
    setSelectedWorkOrder(detailItem);
    setIsDetailViewOpen(true);
  };

  const handleOpenComments = (workOrderId: string) => {
    const wo = workOrders.find(w => w.id === workOrderId);
    if (wo) {
      handleViewWorkOrder(wo);
      // Set timeout to switch to comments tab after modal opens
      setTimeout(() => {
        const commentsTab = document.querySelector('[data-state="inactive"][value="comments"]') as HTMLElement;
        if (commentsTab) commentsTab.click();
      }, 100);
    }
  };

  const handleAddComment = (workOrderId: string, content: string, type: Comment['type'], parentId?: string) => {
    const newComment: Comment = {
      id: crypto.randomUUID(),
      author: 'Current User',
      authorRole: 'Technician',
      content,
      timestamp: new Date().toISOString(),
      type,
      parentId,
      canEdit: true,
      canDelete: true
    };

    setWorkOrderComments(prev => ({
      ...prev,
      [workOrderId]: [newComment, ...(prev[workOrderId] || [])]
    }));
  };

  const handleEditComment = (commentId: string, content: string) => {
    setWorkOrderComments(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(woId => {
        updated[woId] = updated[woId].map(comment =>
          comment.id === commentId
            ? { ...comment, content, isEdited: true }
            : comment
        );
      });
      return updated;
    });
  };

  const handleDeleteComment = (commentId: string) => {
    setWorkOrderComments(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(woId => {
        updated[woId] = updated[woId].filter(comment => comment.id !== commentId);
      });
      return updated;
    });
  };

  const getCommentCount = (workOrderId: string) => {
    return workOrderComments[workOrderId]?.length || 0;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1>Work Order Management</h1>
          <p className="text-muted-foreground">Create, assign, and track maintenance work orders</p>
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
                Create Work Order
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Work Order</DialogTitle>
              <DialogDescription>
                Enter the details for the new work order
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="col-span-2 space-y-2">
                <Label htmlFor="wo-title">Work Order Title</Label>
                <Input id="wo-title" placeholder="Brief description of the work" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wo-asset">Asset</Label>
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
                <Label htmlFor="wo-type">Work Order Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="corrective">Corrective</SelectItem>
                    <SelectItem value="preventive">Preventive</SelectItem>
                    <SelectItem value="calibration">Calibration</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="wo-priority">Priority</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="wo-assignee">Assign To</Label>
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
                <Label htmlFor="wo-due-date">Due Date</Label>
                <Input id="wo-due-date" type="date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wo-estimated-hours">Estimated Hours</Label>
                <Input id="wo-estimated-hours" type="number" placeholder="0" />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="wo-description">Description</Label>
                <Textarea 
                  id="wo-description" 
                  placeholder="Detailed description of the work to be performed"
                  rows={3}
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="wo-checklist">Checklist Template (Optional)</Label>
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
                Create Work Order
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
                <p className="text-sm text-muted-foreground">Total Work Orders</p>
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
                <p className="text-sm text-muted-foreground">Open</p>
                <p className="text-2xl font-bold text-red-600">{statusCounts.open}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold text-amber-600">{statusCounts.inProgress}</p>
              </div>
              <Clock className="w-8 h-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-green-600">{statusCounts.completed}</p>
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
                  placeholder="Search work orders by title, ID, or asset..."
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
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="assigned">Assigned</SelectItem>
                  <SelectItem value="in progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending Approval</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Work Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Work Orders</CardTitle>
          <CardDescription>
            All maintenance work orders with their current status and details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Asset</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredWorkOrders.map((wo) => (
                <TableRow key={wo.id}>
                  <TableCell className="font-medium">{wo.id}</TableCell>
                  <TableCell className="max-w-48">
                    <div>
                      <p className="font-medium truncate">{wo.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{wo.description}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{wo.asset}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(wo.type)}
                      <span className="text-sm">{wo.type}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getPriorityColor(wo.priority)}>
                      {wo.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(wo.status)}>
                      {wo.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{wo.assignedTo}</span>
                    </div>
                  </TableCell>
                  <TableCell>{wo.dueDate}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Progress value={wo.progress} className="w-16" />
                      <span className="text-sm text-muted-foreground">{wo.progress}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleViewWorkOrder(wo)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <QuickCommentButton
                        entityId={wo.id}
                        entityType="work_order"
                        commentCount={getCommentCount(wo.id)}
                        onClick={() => handleOpenComments(wo.id)}
                      />
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
        item={selectedWorkOrder}
        isOpen={isDetailViewOpen}
        onClose={() => {
          setIsDetailViewOpen(false);
          setSelectedWorkOrder(null);
        }}
        onSave={(updatedItem) => {
          console.log('Save work order:', updatedItem);
          // Here you would update the work order in your data source
        }}
      />
    </div>
  );
}