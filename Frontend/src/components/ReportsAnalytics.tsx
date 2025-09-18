import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Checkbox } from './ui/checkbox';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart
} from 'recharts';
import {
  Calendar as CalendarIcon,
  Download,
  Filter,
  FileText,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Clock,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Settings,
  Mail,
  Plus,
  Eye,
  Edit,
  Trash2,
  Search
} from 'lucide-react';
import { format, subDays, subMonths } from 'date-fns';

export function ReportsAnalytics() {
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState({
    from: subMonths(new Date(), 3),
    to: new Date()
  });
  const [selectedMetrics, setSelectedMetrics] = useState(['cost', 'mttr', 'mtbf', 'compliance']);
  const [isCustomReportOpen, setIsCustomReportOpen] = useState(false);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);

  // Mock data for charts and metrics
  const kpiData = {
    totalWorkOrders: 245,
    completedWorkOrders: 198,
    avgCompletionTime: 4.2,
    totalMaintenanceCost: 125680,
    avgMTTR: 3.8,
    avgMTBF: 168,
    complianceRate: 94.2,
    assetUptime: 96.8
  };

  const monthlyTrends = [
    { month: 'Aug', workOrders: 65, cost: 28500, mttr: 4.2, mtbf: 152, uptime: 94.5 },
    { month: 'Sep', workOrders: 72, cost: 31200, mttr: 3.9, mtbf: 161, uptime: 95.8 },
    { month: 'Oct', workOrders: 58, cost: 26800, mttr: 3.6, mtbf: 175, uptime: 97.2 },
    { month: 'Nov', workOrders: 50, cost: 39180, mttr: 3.8, mtbf: 168, uptime: 96.8 }
  ];

  const costBreakdown = [
    { name: 'Labor', value: 45680, color: '#0088FE' },
    { name: 'Parts', value: 32400, color: '#00C49F' },
    { name: 'External', value: 28900, color: '#FFBB28' },
    { name: 'Emergency', value: 18700, color: '#FF8042' }
  ];

  const assetReliability = [
    { asset: 'Pump A-101', mtbf: 245, mttr: 2.4, uptime: 98.2, category: 'Critical' },
    { asset: 'Motor M-205', mtbf: 189, mttr: 4.1, uptime: 94.5, category: 'High' },
    { asset: 'Compressor C-301', mtbf: 312, mttr: 1.8, uptime: 99.1, category: 'Critical' },
    { asset: 'HVAC H-102', mtbf: 156, mttr: 5.2, uptime: 91.8, category: 'Medium' },
    { asset: 'Valve V-150', mtbf: 428, mttr: 1.2, uptime: 99.6, category: 'Low' }
  ];

  const complianceData = [
    { category: 'Safety Inspections', completed: 48, total: 50, percentage: 96 },
    { category: 'PM Schedules', completed: 142, total: 150, percentage: 94.7 },
    { category: 'Calibrations', completed: 28, total: 30, percentage: 93.3 },
    { category: 'Regulatory Audits', completed: 12, total: 12, percentage: 100 }
  ];

  const savedReports = [
    { id: 1, name: 'Monthly Maintenance Summary', type: 'Scheduled', frequency: 'Monthly', lastRun: '2024-12-01', nextRun: '2025-01-01' },
    { id: 2, name: 'Critical Asset Report', type: 'On-demand', frequency: 'Weekly', lastRun: '2024-12-15', nextRun: '2024-12-22' },
    { id: 3, name: 'Cost Analysis Report', type: 'Scheduled', frequency: 'Quarterly', lastRun: '2024-10-01', nextRun: '2025-01-01' },
    { id: 4, name: 'Compliance Dashboard', type: 'On-demand', frequency: 'Monthly', lastRun: '2024-12-10', nextRun: '2024-01-10' }
  ];

  const workOrderTrends = [
    { date: '2024-11-01', emergency: 2, scheduled: 8, corrective: 5 },
    { date: '2024-11-05', emergency: 1, scheduled: 12, corrective: 7 },
    { date: '2024-11-10', emergency: 3, scheduled: 10, corrective: 4 },
    { date: '2024-11-15', emergency: 0, scheduled: 15, corrective: 6 },
    { date: '2024-11-20', emergency: 2, scheduled: 11, corrective: 8 },
    { date: '2024-11-25', emergency: 1, scheduled: 9, corrective: 5 },
    { date: '2024-11-30', emergency: 2, scheduled: 13, corrective: 7 }
  ];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'critical': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-amber-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const exportReport = (format: 'pdf' | 'excel' | 'csv') => {
    console.log(`Exporting report as ${format}`);
    // Here you would implement the actual export functionality
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1>Reports & Analytics</h1>
          <p className="text-muted-foreground">Comprehensive maintenance insights and analytics</p>
        </div>
        <div className="flex space-x-2">
          <Dialog open={isCustomReportOpen} onOpenChange={setIsCustomReportOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Custom Report
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Custom Report</DialogTitle>
                <DialogDescription>
                  Build a custom report with your selected metrics and filters
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Report Name</Label>
                  <Input placeholder="Enter report name" />
                </div>
                <div className="space-y-2">
                  <Label>Select Metrics</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Work Orders', 'Costs', 'Asset Uptime', 'MTTR', 'MTBF', 'Compliance'].map(metric => (
                      <div key={metric} className="flex items-center space-x-2">
                        <Checkbox id={metric} />
                        <Label htmlFor={metric}>{metric}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Date Range</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7d">Last 7 days</SelectItem>
                        <SelectItem value="30d">Last 30 days</SelectItem>
                        <SelectItem value="90d">Last 90 days</SelectItem>
                        <SelectItem value="1y">Last year</SelectItem>
                        <SelectItem value="custom">Custom range</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Asset Category</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="All categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                        <SelectItem value="high">High Priority</SelectItem>
                        <SelectItem value="medium">Medium Priority</SelectItem>
                        <SelectItem value="low">Low Priority</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCustomReportOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setIsCustomReportOpen(false)}>
                  Generate Report
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Date Range Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <CalendarIcon className="w-4 h-4 text-muted-foreground" />
              <Label>Date Range:</Label>
            </div>
            <Select defaultValue="3m">
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="3m">Last 3 months</SelectItem>
                <SelectItem value="6m">Last 6 months</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={() => exportReport('pdf')}>
                <FileText className="w-4 h-4 mr-1" />
                PDF
              </Button>
              <Button variant="outline" size="sm" onClick={() => exportReport('excel')}>
                <BarChart3 className="w-4 h-4 mr-1" />
                Excel
              </Button>
              <Button variant="outline" size="sm" onClick={() => exportReport('csv')}>
                <Download className="w-4 h-4 mr-1" />
                CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="costs">Cost Analysis</TabsTrigger>
          <TabsTrigger value="reliability">Asset Reliability</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="reports">Saved Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Work Orders</p>
                    <p className="text-2xl font-bold">{kpiData.totalWorkOrders}</p>
                    <p className="text-xs text-green-600 flex items-center mt-1">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      +12% from last month
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Maintenance Cost</p>
                    <p className="text-2xl font-bold">{formatCurrency(kpiData.totalMaintenanceCost)}</p>
                    <p className="text-xs text-red-600 flex items-center mt-1">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      +8% from last month
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg MTTR</p>
                    <p className="text-2xl font-bold">{kpiData.avgMTTR}h</p>
                    <p className="text-xs text-green-600 flex items-center mt-1">
                      <TrendingDown className="w-3 h-3 mr-1" />
                      -5% from last month
                    </p>
                  </div>
                  <Clock className="w-8 h-8 text-amber-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Asset Uptime</p>
                    <p className="text-2xl font-bold">{kpiData.assetUptime}%</p>
                    <p className="text-xs text-green-600 flex items-center mt-1">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      +2.1% from last month
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Work Orders</CardTitle>
                <CardDescription>Trend of work orders completed over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="workOrders" stroke="#8884d8" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cost Breakdown</CardTitle>
                <CardDescription>Distribution of maintenance costs by category</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={costBreakdown}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {costBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="costs" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Cost Trends</CardTitle>
                <CardDescription>Maintenance costs over the last 4 months</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <ComposedChart data={monthlyTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value, name) => 
                      name === 'cost' ? formatCurrency(value as number) : value
                    } />
                    <Legend />
                    <Bar dataKey="cost" fill="#8884d8" name="Total Cost" />
                    <Line type="monotone" dataKey="workOrders" stroke="#82ca9d" strokeWidth={2} name="Work Orders" />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cost Analysis Summary</CardTitle>
                <CardDescription>Breakdown of maintenance expenses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {costBreakdown.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="font-medium">{item.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatCurrency(item.value)}</p>
                        <p className="text-sm text-muted-foreground">
                          {((item.value / costBreakdown.reduce((sum, i) => sum + i.value, 0)) * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reliability" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Asset Reliability Metrics</CardTitle>
              <CardDescription>MTBF, MTTR, and uptime statistics for critical assets</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Asset</TableHead>
                    <TableHead>MTBF (hours)</TableHead>
                    <TableHead>MTTR (hours)</TableHead>
                    <TableHead>Uptime %</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assetReliability.map((asset, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{asset.asset}</TableCell>
                      <TableCell>{asset.mtbf}</TableCell>
                      <TableCell>{asset.mttr}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Progress value={asset.uptime} className="w-16" />
                          <span className="text-sm">{asset.uptime}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusColor(asset.category)}>
                          {asset.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {asset.uptime > 95 ? (
                          <Badge className="bg-green-100 text-green-800">Excellent</Badge>
                        ) : asset.uptime > 90 ? (
                          <Badge className="bg-yellow-100 text-yellow-800">Good</Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-800">Needs Attention</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Compliance Overview</CardTitle>
                <CardDescription>Current compliance status across all categories</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {complianceData.map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{item.category}</span>
                        <span className="text-sm text-muted-foreground">
                          {item.completed}/{item.total}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Progress value={item.percentage} className="flex-1" />
                        <span className="text-sm font-medium">{item.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Compliance Trends</CardTitle>
                <CardDescription>Compliance rate over the last 6 months</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={monthlyTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis domain={[90, 100]} />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="uptime" 
                      stroke="#82ca9d" 
                      fill="#82ca9d" 
                      fillOpacity={0.6}
                      name="Compliance Rate %" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Work Order Trends</CardTitle>
              <CardDescription>Breakdown of work orders by type over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={workOrderTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickFormatter={(value) => format(new Date(value), 'MMM dd')} />
                  <YAxis />
                  <Tooltip labelFormatter={(value) => format(new Date(value), 'MMM dd, yyyy')} />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="emergency"
                    stackId="1"
                    stroke="#ff4444"
                    fill="#ff4444"
                    name="Emergency"
                  />
                  <Area
                    type="monotone"
                    dataKey="corrective"
                    stackId="1"
                    stroke="#ffaa44"
                    fill="#ffaa44"
                    name="Corrective"
                  />
                  <Area
                    type="monotone"
                    dataKey="scheduled"
                    stackId="1"
                    stroke="#44aa44"
                    fill="#44aa44"
                    name="Scheduled"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Saved Reports</CardTitle>
                  <CardDescription>Manage your scheduled and on-demand reports</CardDescription>
                </div>
                <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Mail className="w-4 h-4 mr-2" />
                      Schedule Report
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Schedule Report Delivery</DialogTitle>
                      <DialogDescription>Set up automatic report delivery via email</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Report Template</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select report template" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="monthly">Monthly Summary</SelectItem>
                            <SelectItem value="assets">Asset Report</SelectItem>
                            <SelectItem value="costs">Cost Analysis</SelectItem>
                            <SelectItem value="compliance">Compliance Report</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Frequency</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="quarterly">Quarterly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Email Recipients</Label>
                        <Input placeholder="email1@company.com, email2@company.com" />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setIsScheduleDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={() => setIsScheduleDialogOpen(false)}>
                        Schedule Report
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Report Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Frequency</TableHead>
                    <TableHead>Last Run</TableHead>
                    <TableHead>Next Run</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {savedReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium">{report.name}</TableCell>
                      <TableCell>
                        <Badge variant={report.type === 'Scheduled' ? 'default' : 'secondary'}>
                          {report.type}
                        </Badge>
                      </TableCell>
                      <TableCell>{report.frequency}</TableCell>
                      <TableCell>{report.lastRun}</TableCell>
                      <TableCell>{report.nextRun}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}