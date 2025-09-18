import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { 
  Search, 
  Plus, 
  FileText, 
  Clock, 
  User,
  Eye,
  Edit,
  Filter,
  Calendar,
  AlertTriangle,
  Info,
  CheckCircle,
  Download
} from 'lucide-react';

export function DigitalLogbook() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterShift, setFilterShift] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Mock logbook entries
  const logEntries = [
    {
      id: 'LOG-2024-1217-001',
      timestamp: '2024-12-17 07:00 AM',
      shift: 'Day Shift',
      operator: 'Mike Johnson',
      department: 'Production',
      category: 'Equipment Status',
      title: 'Production Line 3 Startup',
      description: 'Started production line 3 at 07:00. All systems operational. Pre-start checks completed successfully. No issues detected.',
      priority: 'Normal',
      assets: ['L3-CONV-001', 'L3-MOTOR-001', 'L3-CTRL-001'],
      downtime: 0,
      tags: ['startup', 'routine', 'line3'],
      attachments: 0
    },
    {
      id: 'LOG-2024-1217-002',
      timestamp: '2024-12-17 09:15 AM',
      shift: 'Day Shift',
      operator: 'Sarah Wilson',
      department: 'Maintenance',
      category: 'Maintenance Activity',
      title: 'Pump A-101 Bearing Replacement',
      description: 'Replaced worn bearing in centrifugal pump A-101. Found significant wear on outer race. Pump returned to service at 09:45. Running smoothly with normal vibration levels.',
      priority: 'High',
      assets: ['A-101'],
      downtime: 30,
      tags: ['bearing', 'replacement', 'pump'],
      attachments: 3
    },
    {
      id: 'LOG-2024-1217-003',
      timestamp: '2024-12-17 11:30 AM',
      shift: 'Day Shift',
      operator: 'David Chen',
      department: 'Production',
      category: 'Downtime Event',
      title: 'Unplanned Downtime - Conveyor Belt',
      description: 'Conveyor belt on Line 2 stopped due to jam. Foreign object found in belt mechanism. Removed object and restarted operations. Lost 45 minutes of production.',
      priority: 'High',
      assets: ['L2-CONV-002'],
      downtime: 45,
      tags: ['downtime', 'jam', 'line2'],
      attachments: 2
    },
    {
      id: 'LOG-2024-1217-004',
      timestamp: '2024-12-17 02:30 PM',
      shift: 'Day Shift',
      operator: 'Lisa Brown',
      department: 'Quality',
      category: 'Quality Event',
      title: 'Quality Check Failed - Batch #Q2471',
      description: 'Batch Q2471 failed quality inspection due to dimensional variance. Investigating root cause. Production held pending resolution. QC manager notified.',
      priority: 'Critical',
      assets: ['QC-STATION-1'],
      downtime: 0,
      tags: ['quality', 'batch-hold', 'investigation'],
      attachments: 1
    },
    {
      id: 'LOG-2024-1216-015',
      timestamp: '2024-12-16 11:00 PM',
      shift: 'Night Shift',
      operator: 'Robert Garcia',
      department: 'Production',
      category: 'Shift Handover',
      title: 'Night Shift Handover Report',
      description: 'All equipment running normally. Completed 847 units during shift. Minor oil leak noticed on compressor C-205, tagged for day shift maintenance. No safety incidents.',
      priority: 'Normal',
      assets: ['C-205'],
      downtime: 0,
      tags: ['handover', 'production', 'oil-leak'],
      attachments: 1
    },
    {
      id: 'LOG-2024-1216-014',
      timestamp: '2024-12-16 08:45 PM',
      shift: 'Evening Shift',
      operator: 'Jennifer Lee',
      department: 'Facilities',
      category: 'Safety Event',
      title: 'Safety Incident - Near Miss',
      description: 'Near miss incident in warehouse area. Forklift operator failed to see pedestrian due to blocked view. No injuries. Reviewed safety protocols with operator. Area marked for improved signage.',
      priority: 'High',
      assets: [],
      downtime: 0,
      tags: ['safety', 'near-miss', 'forklift'],
      attachments: 2
    }
  ];

  const filteredEntries = logEntries.filter(entry => {
    const matchesSearch = entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.operator.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesShift = filterShift === 'all' || entry.shift.toLowerCase().includes(filterShift.toLowerCase());
    const matchesCategory = filterCategory === 'all' || entry.category.toLowerCase() === filterCategory.toLowerCase();
    return matchesSearch && matchesShift && matchesCategory;
  });

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'equipment status': return 'bg-blue-100 text-blue-800';
      case 'maintenance activity': return 'bg-green-100 text-green-800';
      case 'downtime event': return 'bg-red-100 text-red-800';
      case 'quality event': return 'bg-purple-100 text-purple-800';
      case 'safety event': return 'bg-orange-100 text-orange-800';
      case 'shift handover': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'normal': return 'bg-green-100 text-green-800 border-green-200';
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'equipment status': return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'maintenance activity': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'downtime event': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'quality event': return <AlertTriangle className="w-4 h-4 text-purple-500" />;
      case 'safety event': return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'shift handover': return <Info className="w-4 h-4 text-gray-500" />;
      default: return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  const logStats = {
    totalEntries: logEntries.length,
    todayEntries: logEntries.filter(e => e.timestamp.includes('2024-12-17')).length,
    totalDowntime: logEntries.reduce((sum, entry) => sum + entry.downtime, 0),
    criticalEvents: logEntries.filter(e => e.priority === 'Critical').length
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1>Digital Logbook</h1>
          <p className="text-muted-foreground">Record and track daily operations, events, and observations</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Logs
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Entry
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Log Entry</DialogTitle>
                <DialogDescription>
                  Record a new event, observation, or activity
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="entry-title">Entry Title</Label>
                  <Input id="entry-title" placeholder="Brief description of the event" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="entry-category">Category</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="equipment">Equipment Status</SelectItem>
                      <SelectItem value="maintenance">Maintenance Activity</SelectItem>
                      <SelectItem value="downtime">Downtime Event</SelectItem>
                      <SelectItem value="quality">Quality Event</SelectItem>
                      <SelectItem value="safety">Safety Event</SelectItem>
                      <SelectItem value="handover">Shift Handover</SelectItem>
                      <SelectItem value="observation">General Observation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="entry-priority">Priority</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="entry-shift">Shift</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select shift" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="day">Day Shift (7AM - 3PM)</SelectItem>
                      <SelectItem value="evening">Evening Shift (3PM - 11PM)</SelectItem>
                      <SelectItem value="night">Night Shift (11PM - 7AM)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="entry-department">Department</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="production">Production</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="quality">Quality Control</SelectItem>
                      <SelectItem value="safety">Safety</SelectItem>
                      <SelectItem value="facilities">Facilities</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="downtime-minutes">Downtime (minutes)</Label>
                  <Input id="downtime-minutes" type="number" placeholder="0" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="affected-assets">Affected Assets</Label>
                  <Input id="affected-assets" placeholder="Asset IDs (comma separated)" />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="entry-description">Detailed Description</Label>
                  <Textarea 
                    id="entry-description" 
                    placeholder="Provide detailed information about the event, including actions taken and observations"
                    rows={4}
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="entry-tags">Tags</Label>
                  <Input id="entry-tags" placeholder="Add tags for easy searching (comma separated)" />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setIsCreateDialogOpen(false)}>
                  Create Entry
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Entries</p>
                <p className="text-2xl font-bold">{logStats.totalEntries}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Today's Entries</p>
                <p className="text-2xl font-bold text-green-600">{logStats.todayEntries}</p>
              </div>
              <Calendar className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Downtime</p>
                <p className="text-2xl font-bold text-red-600">{logStats.totalDowntime}min</p>
              </div>
              <Clock className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Critical Events</p>
                <p className="text-2xl font-bold text-orange-600">{logStats.criticalEvents}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-500" />
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
                  placeholder="Search log entries by title, description, or operator..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={filterShift} onValueChange={setFilterShift}>
                <SelectTrigger className="w-40">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="All Shifts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Shifts</SelectItem>
                  <SelectItem value="day">Day Shift</SelectItem>
                  <SelectItem value="evening">Evening Shift</SelectItem>
                  <SelectItem value="night">Night Shift</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="equipment status">Equipment Status</SelectItem>
                  <SelectItem value="maintenance activity">Maintenance</SelectItem>
                  <SelectItem value="downtime event">Downtime</SelectItem>
                  <SelectItem value="quality event">Quality</SelectItem>
                  <SelectItem value="safety event">Safety</SelectItem>
                  <SelectItem value="shift handover">Handover</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Log Entries */}
      <div className="space-y-4">
        {filteredEntries.map((entry) => (
          <Card key={entry.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    {getCategoryIcon(entry.category)}
                    <h3 className="font-semibold">{entry.title}</h3>
                    <Badge className={getCategoryColor(entry.category)}>
                      {entry.category}
                    </Badge>
                    <Badge variant="outline" className={getPriorityColor(entry.priority)}>
                      {entry.priority}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{entry.timestamp}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <User className="w-4 h-4" />
                      <span>{entry.operator}</span>
                    </div>
                    <div>
                      <span>{entry.shift}</span>
                    </div>
                    {entry.downtime > 0 && (
                      <div className="flex items-center space-x-1 text-red-600">
                        <AlertTriangle className="w-4 h-4" />
                        <span>{entry.downtime} min downtime</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="sm">
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm mb-3">{entry.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  {entry.assets.length > 0 && (
                    <div className="text-xs">
                      <span className="text-muted-foreground">Assets: </span>
                      {entry.assets.map((asset, index) => (
                        <Badge key={asset} variant="outline" className="text-xs mr-1">
                          {asset}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                  <span>#{entry.id}</span>
                  {entry.attachments > 0 && (
                    <span>{entry.attachments} attachment{entry.attachments > 1 ? 's' : ''}</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}