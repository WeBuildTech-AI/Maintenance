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
import { 
  Search, 
  Plus, 
  Gauge, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Eye,
  Edit,
  FileText,
  Calendar,
  Award,
  AlertCircle,
  Target
} from 'lucide-react';

export function CalibrationManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Mock calibration data
  const calibrations = [
    {
      id: 'CAL-2024-001',
      instrument: 'Pressure Gauge PG-205',
      assetId: 'PG-205',
      serialNumber: 'WKA-2023-4471',
      location: 'Boiler Room',
      calibrationType: 'Pressure',
      range: '0-150 PSI',
      accuracy: '±0.5%',
      lastCalibrated: '2024-06-15',
      nextDue: '2024-12-15',
      daysUntilDue: -2,
      status: 'Overdue',
      calibratedBy: 'Certified Lab Inc.',
      certificate: 'CERT-PG205-240615.pdf',
      asFound: 'Within tolerance',
      asLeft: 'Adjusted to spec',
      frequency: '6 months',
      priority: 'High',
      department: 'Maintenance'
    },
    {
      id: 'CAL-2024-002',
      instrument: 'Flow Meter FM-301',
      assetId: 'FM-301',
      serialNumber: 'ROS-2022-1125',
      location: 'Process Line 3',
      calibrationType: 'Flow',
      range: '0-500 GPM',
      accuracy: '±1.0%',
      lastCalibrated: '2024-09-10',
      nextDue: '2024-12-10',
      daysUntilDue: -7,
      status: 'Overdue',
      calibratedBy: 'Internal Team',
      certificate: 'CERT-FM301-240910.pdf',
      asFound: 'Out of tolerance',
      asLeft: 'Recalibrated',
      frequency: '3 months',
      priority: 'Critical',
      department: 'Production'
    },
    {
      id: 'CAL-2024-003',
      instrument: 'Temperature Sensor TS-150',
      assetId: 'TS-150',
      serialNumber: 'THM-2023-8892',
      location: 'HVAC Unit North',
      calibrationType: 'Temperature',
      range: '-20 to +120°C',
      accuracy: '±0.2°C',
      lastCalibrated: '2024-11-20',
      nextDue: '2025-02-20',
      daysUntilDue: 65,
      status: 'Current',
      calibratedBy: 'Temp-Cal Services',
      certificate: 'CERT-TS150-241120.pdf',
      asFound: 'Within tolerance',
      asLeft: 'No adjustment needed',
      frequency: '3 months',
      priority: 'Medium',
      department: 'Facilities'
    },
    {
      id: 'CAL-2024-004',
      instrument: 'Scale SC-400',
      assetId: 'SC-400',
      serialNumber: 'WGH-2023-5567',
      location: 'Warehouse',
      calibrationType: 'Weight',
      range: '0-5000 lbs',
      accuracy: '±0.1%',
      lastCalibrated: '2024-10-05',
      nextDue: '2025-04-05',
      daysUntilDue: 119,
      status: 'Current',
      calibratedBy: 'Precision Weights LLC',
      certificate: 'CERT-SC400-241005.pdf',
      asFound: 'Within tolerance',
      asLeft: 'Verified accuracy',
      frequency: '6 months',
      priority: 'Medium',
      department: 'Shipping'
    },
    {
      id: 'CAL-2024-005',
      instrument: 'Multimeter MM-101',
      assetId: 'MM-101',
      serialNumber: 'FLK-2024-3348',
      location: 'Electrical Shop',
      calibrationType: 'Electrical',
      range: 'Multi-range',
      accuracy: '±0.05%',
      lastCalibrated: '2024-08-15',
      nextDue: '2024-12-25',
      daysUntilDue: 8,
      status: 'Due Soon',
      calibratedBy: 'Cal-Tech Laboratory',
      certificate: 'CERT-MM101-240815.pdf',
      asFound: 'Within tolerance',
      asLeft: 'No adjustment needed',
      frequency: '4 months',
      priority: 'Medium',
      department: 'Electrical'
    }
  ];

  const filteredCalibrations = calibrations.filter(cal => {
    const matchesSearch = cal.instrument.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cal.assetId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cal.serialNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || cal.status.toLowerCase().includes(filterStatus.toLowerCase());
    const matchesCategory = filterCategory === 'all' || cal.calibrationType.toLowerCase() === filterCategory.toLowerCase();
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'current': return 'bg-green-100 text-green-800';
      case 'due soon': return 'bg-amber-100 text-amber-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'in progress': return 'bg-blue-100 text-blue-800';
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

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'current': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'due soon': return <Clock className="w-4 h-4 text-amber-500" />;
      case 'overdue': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'in progress': return <Target className="w-4 h-4 text-blue-500" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const calibrationStats = {
    total: calibrations.length,
    current: calibrations.filter(c => c.status === 'Current').length,
    dueSoon: calibrations.filter(c => c.status === 'Due Soon').length,
    overdue: calibrations.filter(c => c.status === 'Overdue').length,
    inProgress: calibrations.filter(c => c.status === 'In Progress').length
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1>Calibration Management</h1>
          <p className="text-muted-foreground">Track instrument calibrations and maintain compliance</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <FileText className="w-4 h-4 mr-2" />
            Compliance Report
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Instrument
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Register New Instrument</DialogTitle>
                <DialogDescription>
                  Add a new instrument that requires calibration
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="instrument-name">Instrument Name</Label>
                  <Input id="instrument-name" placeholder="e.g., Pressure Gauge PG-206" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="asset-id">Asset ID</Label>
                  <Input id="asset-id" placeholder="e.g., PG-206" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="serial-number">Serial Number</Label>
                  <Input id="serial-number" placeholder="Manufacturer serial number" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cal-type">Calibration Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pressure">Pressure</SelectItem>
                      <SelectItem value="temperature">Temperature</SelectItem>
                      <SelectItem value="flow">Flow</SelectItem>
                      <SelectItem value="weight">Weight</SelectItem>
                      <SelectItem value="electrical">Electrical</SelectItem>
                      <SelectItem value="dimensional">Dimensional</SelectItem>
                      <SelectItem value="torque">Torque</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="range">Measurement Range</Label>
                  <Input id="range" placeholder="e.g., 0-150 PSI" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accuracy">Required Accuracy</Label>
                  <Input id="accuracy" placeholder="e.g., ±0.5%" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" placeholder="Installation location" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="frequency">Calibration Frequency</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly (3 months)</SelectItem>
                      <SelectItem value="biannual">Bi-annual (6 months)</SelectItem>
                      <SelectItem value="annual">Annual (12 months)</SelectItem>
                      <SelectItem value="biennial">Bi-annual (24 months)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="production">Production</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="quality">Quality Control</SelectItem>
                      <SelectItem value="facilities">Facilities</SelectItem>
                      <SelectItem value="electrical">Electrical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
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
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea 
                    id="notes" 
                    placeholder="Additional notes about the instrument or calibration requirements"
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setIsCreateDialogOpen(false)}>
                  Register Instrument
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Instruments</p>
                <p className="text-2xl font-bold">{calibrationStats.total}</p>
              </div>
              <Gauge className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Current</p>
                <p className="text-2xl font-bold text-green-600">{calibrationStats.current}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Due Soon</p>
                <p className="text-2xl font-bold text-amber-600">{calibrationStats.dueSoon}</p>
              </div>
              <Clock className="w-8 h-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overdue</p>
                <p className="text-2xl font-bold text-red-600">{calibrationStats.overdue}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">{calibrationStats.inProgress}</p>
              </div>
              <Target className="w-8 h-8 text-blue-500" />
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
                  placeholder="Search instruments by name, asset ID, or serial number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="current">Current</SelectItem>
                  <SelectItem value="due soon">Due Soon</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="in progress">In Progress</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="pressure">Pressure</SelectItem>
                  <SelectItem value="temperature">Temperature</SelectItem>
                  <SelectItem value="flow">Flow</SelectItem>
                  <SelectItem value="weight">Weight</SelectItem>
                  <SelectItem value="electrical">Electrical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calibration Table */}
      <Card>
        <CardHeader>
          <CardTitle>Calibration Register</CardTitle>
          <CardDescription>
            All instruments requiring calibration and their current status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Instrument</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Range/Accuracy</TableHead>
                <TableHead>Last Cal.</TableHead>
                <TableHead>Next Due</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Certificate</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCalibrations.map((cal) => (
                <TableRow key={cal.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{cal.instrument}</p>
                      <p className="text-xs text-muted-foreground">
                        {cal.assetId} • {cal.location}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{cal.calibrationType}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{cal.range}</div>
                      <div className="text-muted-foreground">{cal.accuracy}</div>
                    </div>
                  </TableCell>
                  <TableCell>{cal.lastCalibrated}</TableCell>
                  <TableCell>
                    <div>
                      <div>{cal.nextDue}</div>
                      <div className={`text-xs ${cal.daysUntilDue < 0 ? 'text-red-600' : cal.daysUntilDue <= 30 ? 'text-amber-600' : 'text-muted-foreground'}`}>
                        {cal.daysUntilDue < 0 
                          ? `${Math.abs(cal.daysUntilDue)} days overdue`
                          : `${cal.daysUntilDue} days remaining`
                        }
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(cal.status)}
                      <Badge className={getStatusColor(cal.status)}>
                        {cal.status}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getPriorityColor(cal.priority)}>
                      {cal.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" className="text-blue-600">
                      <Award className="w-4 h-4 mr-1" />
                      View
                    </Button>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Calendar className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}