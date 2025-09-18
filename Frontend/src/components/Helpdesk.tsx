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
import { DetailViewModal, DetailItem } from './DetailViewModal';
import { QuickCommentButton, Comment } from './CommentSystem';
import { 
  Search, 
  Plus, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  Eye,
  MessageSquare,
  User,
  Calendar,
  Filter,
  TicketIcon,
  ArrowRight,
  Timer
} from 'lucide-react';

export function Helpdesk() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<DetailItem | null>(null);
  const [isDetailViewOpen, setIsDetailViewOpen] = useState(false);
  const [ticketComments, setTicketComments] = useState<Record<string, Comment[]>>({});

  // Mock ticket data
  const tickets = [
    {
      id: 'TKT-2024-001',
      title: 'Pump making unusual noise',
      description: 'Centrifugal pump in Building A is making grinding noise during operation',
      category: 'Mechanical',
      priority: 'High',
      status: 'Open',
      submittedBy: 'Production Operator',
      assignedTo: 'Mike Johnson',
      createdDate: '2024-12-17 08:30 AM',
      dueDate: '2024-12-18 05:00 PM',
      sla: 24,
      timeRemaining: 8.5,
      asset: 'A-101 - Centrifugal Pump #1',
      department: 'Production',
      comments: 3
    },
    {
      id: 'TKT-2024-002',
      title: 'Air conditioning not working',
      description: 'Office AC unit not cooling properly, temperature rising above 78°F',
      category: 'HVAC',
      priority: 'Medium',
      status: 'In Progress',
      submittedBy: 'Office Manager',
      assignedTo: 'Sarah Wilson',
      createdDate: '2024-12-16 02:15 PM',
      dueDate: '2024-12-19 02:15 PM',
      sla: 72,
      timeRemaining: 46.2,
      asset: 'H-102 - HVAC Unit - North Wing',
      department: 'Facilities',
      comments: 5
    },
    {
      id: 'TKT-2024-003',
      title: 'Electrical panel tripping frequently',
      description: 'Main electrical panel keeps tripping breaker #12 every few hours',
      category: 'Electrical',
      priority: 'Critical',
      status: 'Escalated',
      submittedBy: 'Safety Officer',
      assignedTo: 'Emergency Team',
      createdDate: '2024-12-17 11:00 AM',
      dueDate: '2024-12-17 03:00 PM',
      sla: 4,
      timeRemaining: -2.5,
      asset: 'E-205 - Main Electrical Panel',
      department: 'Electrical',
      comments: 8
    },
    {
      id: 'TKT-2024-004',
      title: 'Water leak in basement',
      description: 'Small water leak discovered near the boiler room, needs investigation',
      category: 'Utility',
      priority: 'Medium',
      status: 'Resolved',
      submittedBy: 'Maintenance Tech',
      assignedTo: 'David Chen',
      createdDate: '2024-12-15 09:45 AM',
      dueDate: '2024-12-18 09:45 AM',
      sla: 72,
      timeRemaining: 0,
      asset: 'U-301 - Boiler Room',
      department: 'Facilities',
      comments: 4
    },
    {
      id: 'TKT-2024-005',
      title: 'Conveyor belt alignment issue',
      description: 'Production line conveyor belt is misaligned causing product jams',
      category: 'Mechanical',
      priority: 'High',
      status: 'Pending Assignment',
      submittedBy: 'Line Supervisor',
      assignedTo: 'Unassigned',
      createdDate: '2024-12-17 01:20 PM',
      dueDate: '2024-12-18 01:20 PM',
      sla: 24,
      timeRemaining: 20.3,
      asset: 'C-450 - Conveyor Belt Line 3',
      department: 'Production',
      comments: 1
    }
  ];

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.asset.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || ticket.status.toLowerCase().includes(filterStatus.toLowerCase());
    const matchesCategory = filterCategory === 'all' || ticket.category.toLowerCase() === filterCategory.toLowerCase();
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'in progress': return 'bg-blue-100 text-blue-800';
      case 'escalated': return 'bg-red-100 text-red-800';
      case 'open': return 'bg-amber-100 text-amber-800';
      case 'pending assignment': return 'bg-purple-100 text-purple-800';
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

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'mechanical': return <AlertCircle className="w-4 h-4 text-blue-500" />;
      case 'electrical': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'hvac': return <AlertCircle className="w-4 h-4 text-cyan-500" />;
      case 'utility': return <AlertCircle className="w-4 h-4 text-purple-500" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const statusCounts = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'Open' || t.status === 'Pending Assignment').length,
    inProgress: tickets.filter(t => t.status === 'In Progress').length,
    escalated: tickets.filter(t => t.status === 'Escalated').length,
    resolved: tickets.filter(t => t.status === 'Resolved').length
  };

  const handleViewTicket = (ticket: any) => {
    const detailItem: DetailItem = {
      id: ticket.id,
      title: ticket.title,
      description: ticket.description,
      type: 'helpdesk_ticket',
      status: ticket.status,
      priority: ticket.priority,
      assignedTo: ticket.assignedTo,
      createdBy: ticket.submittedBy,
      createdDate: ticket.createdDate,
      dueDate: ticket.dueDate,
      fields: [
        { label: 'Category', value: ticket.category, type: 'text' },
        { label: 'Related Asset', value: ticket.asset, type: 'text' },
        { label: 'Department', value: ticket.department, type: 'text' },
        { label: 'SLA (hours)', value: ticket.sla, type: 'number' },
        { label: 'Time Remaining', value: `${ticket.timeRemaining}h`, type: 'text' },
        { label: 'Priority', value: ticket.priority, type: 'badge' },
        { label: 'Status', value: ticket.status, type: 'badge' }
      ],
      activities: ticketComments[ticket.id] || []
    };
    
    setSelectedTicket(detailItem);
    setIsDetailViewOpen(true);
  };

  const handleOpenComments = (ticketId: string) => {
    const ticket = tickets.find(t => t.id === ticketId);
    if (ticket) {
      handleViewTicket(ticket);
      setTimeout(() => {
        const commentsTab = document.querySelector('[data-state="inactive"][value="comments"]') as HTMLElement;
        if (commentsTab) commentsTab.click();
      }, 100);
    }
  };

  const getCommentCount = (ticketId: string) => {
    return ticketComments[ticketId]?.length || 0;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1>Helpdesk</h1>
          <p className="text-muted-foreground">Manage support tickets and service requests</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Ticket
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Ticket</DialogTitle>
              <DialogDescription>
                Submit a new support request or issue report
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="col-span-2 space-y-2">
                <Label htmlFor="ticket-title">Issue Title</Label>
                <Input id="ticket-title" placeholder="Brief description of the issue" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ticket-category">Category</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mechanical">Mechanical</SelectItem>
                    <SelectItem value="electrical">Electrical</SelectItem>
                    <SelectItem value="hvac">HVAC</SelectItem>
                    <SelectItem value="utility">Utility</SelectItem>
                    <SelectItem value="safety">Safety</SelectItem>
                    <SelectItem value="it">IT Support</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ticket-priority">Priority</Label>
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
                <Label htmlFor="ticket-asset">Related Asset</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select asset (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A-101">A-101 - Centrifugal Pump #1</SelectItem>
                    <SelectItem value="H-102">H-102 - HVAC Unit - North Wing</SelectItem>
                    <SelectItem value="E-205">E-205 - Main Electrical Panel</SelectItem>
                    <SelectItem value="C-450">C-450 - Conveyor Belt Line 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ticket-department">Department</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="production">Production</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="facilities">Facilities</SelectItem>
                    <SelectItem value="electrical">Electrical</SelectItem>
                    <SelectItem value="safety">Safety</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="ticket-description">Detailed Description</Label>
                <Textarea 
                  id="ticket-description" 
                  placeholder="Provide detailed information about the issue, including any symptoms, error messages, or observations"
                  rows={4}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsCreateDialogOpen(false)}>
                Create Ticket
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Tickets</p>
                <p className="text-2xl font-bold">{statusCounts.total}</p>
              </div>
              <TicketIcon className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Open</p>
                <p className="text-2xl font-bold text-amber-600">{statusCounts.open}</p>
              </div>
              <Clock className="w-8 h-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">{statusCounts.inProgress}</p>
              </div>
              <Timer className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Escalated</p>
                <p className="text-2xl font-bold text-red-600">{statusCounts.escalated}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Resolved</p>
                <p className="text-2xl font-bold text-green-600">{statusCounts.resolved}</p>
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
                  placeholder="Search tickets by title, ID, or asset..."
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
                  <SelectItem value="in progress">In Progress</SelectItem>
                  <SelectItem value="escalated">Escalated</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="pending">Pending Assignment</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="mechanical">Mechanical</SelectItem>
                  <SelectItem value="electrical">Electrical</SelectItem>
                  <SelectItem value="hvac">HVAC</SelectItem>
                  <SelectItem value="utility">Utility</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tickets Table */}
      <Card>
        <CardHeader>
          <CardTitle>Support Tickets</CardTitle>
          <CardDescription>
            All support requests and their current status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ticket ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>SLA</TableHead>
                <TableHead>Comments</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell className="font-medium">{ticket.id}</TableCell>
                  <TableCell className="max-w-48">
                    <div>
                      <p className="font-medium truncate">{ticket.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{ticket.asset}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getCategoryIcon(ticket.category)}
                      <span className="text-sm">{ticket.category}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getPriorityColor(ticket.priority)}>
                      {ticket.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(ticket.status)}>
                      {ticket.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{ticket.assignedTo}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <span className={ticket.timeRemaining < 0 ? 'text-red-600' : 'text-muted-foreground'}>
                        {ticket.timeRemaining < 0 
                          ? `${Math.abs(ticket.timeRemaining)}h overdue` 
                          : `${ticket.timeRemaining}h remaining`
                        }
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <MessageSquare className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{ticket.comments}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleViewTicket(ticket)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <QuickCommentButton
                        entityId={ticket.id}
                        entityType="helpdesk_ticket"
                        commentCount={getCommentCount(ticket.id)}
                        onClick={() => handleOpenComments(ticket.id)}
                      />
                      <Button variant="ghost" size="sm">
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Detail View Modal */}
      <DetailViewModal
        item={selectedTicket}
        isOpen={isDetailViewOpen}
        onClose={() => {
          setIsDetailViewOpen(false);
          setSelectedTicket(null);
        }}
        onSave={(updatedItem) => {
          console.log('Save ticket:', updatedItem);
          // Here you would update the ticket in your data source
        }}
      />
    </div>
  );
}