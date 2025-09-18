import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  Wrench, 
  Calendar,
  DollarSign,
  Activity
} from 'lucide-react';

export function Dashboard() {
  // Mock data for charts
  const workOrderData = [
    { name: 'Mon', completed: 12, pending: 5, overdue: 2 },
    { name: 'Tue', completed: 15, pending: 8, overdue: 1 },
    { name: 'Wed', completed: 10, pending: 12, overdue: 3 },
    { name: 'Thu', completed: 18, pending: 6, overdue: 1 },
    { name: 'Fri', completed: 14, pending: 9, overdue: 2 },
    { name: 'Sat', completed: 8, pending: 4, overdue: 1 },
    { name: 'Sun', completed: 6, pending: 3, overdue: 0 },
  ];

  const mttrData = [
    { month: 'Jan', mttr: 4.2 },
    { month: 'Feb', mttr: 3.8 },
    { month: 'Mar', mttr: 4.5 },
    { month: 'Apr', mttr: 3.2 },
    { month: 'May', mttr: 3.9 },
    { month: 'Jun', mttr: 3.1 },
  ];

  const assetStatusData = [
    { name: 'Active', value: 145, color: '#10b981' },
    { name: 'Under Repair', value: 12, color: '#f59e0b' },
    { name: 'Spare', value: 23, color: '#6b7280' },
    { name: 'Retired', value: 8, color: '#ef4444' },
  ];

  const kpiCards = [
    {
      title: 'Open Work Orders',
      value: '24',
      change: '+12%',
      trend: 'up',
      icon: Wrench,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'PM Compliance',
      value: '87%',
      change: '+5%',
      trend: 'up',
      icon: Calendar,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Avg MTTR (Hours)',
      value: '3.2',
      change: '-0.8',
      trend: 'down',
      icon: Clock,
      color: 'text-amber-600',
      bgColor: 'bg-amber-100'
    },
    {
      title: 'Maintenance Cost',
      value: '$12,450',
      change: '-8%',
      trend: 'down',
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  ];

  const recentAlerts = [
    { id: 1, message: 'Pump #A-101 showing abnormal vibration', priority: 'high', time: '2 hours ago' },
    { id: 2, message: 'PM for Compressor #C-205 overdue', priority: 'medium', time: '4 hours ago' },
    { id: 3, message: 'Low stock alert: Bearing SKF-6205', priority: 'low', time: '6 hours ago' },
    { id: 4, message: 'Calibration due for Flow meter #F-301', priority: 'medium', time: '1 day ago' },
  ];

  const upcomingTasks = [
    { id: 1, task: 'PM - Motor M-101 Inspection', dueDate: 'Today', technician: 'Mike Johnson' },
    { id: 2, task: 'WO-2024-001 - Valve Replacement', dueDate: 'Tomorrow', technician: 'Sarah Wilson' },
    { id: 3, task: 'Calibration - Pressure Gauge PG-205', dueDate: 'Dec 20', technician: 'David Chen' },
    { id: 4, task: 'PM - HVAC System Check', dueDate: 'Dec 22', technician: 'Lisa Brown' },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1>Maintenance Dashboard</h1>
          <p className="text-muted-foreground">Overview of your facility maintenance operations</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-green-600 border-green-200">
            <Activity className="w-3 h-3 mr-1" />
            System Online
          </Badge>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
                <div className={`p-2 rounded-full ${kpi.bgColor}`}>
                  <Icon className={`w-4 h-4 ${kpi.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpi.value}</div>
                <p className={`text-xs ${kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'} flex items-center mt-1`}>
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {kpi.change} from last month
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Work Orders Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Work Orders This Week</CardTitle>
            <CardDescription>Daily breakdown of completed, pending, and overdue work orders</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={workOrderData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="completed" stackId="a" fill="#10b981" name="Completed" />
                <Bar dataKey="pending" stackId="a" fill="#f59e0b" name="Pending" />
                <Bar dataKey="overdue" stackId="a" fill="#ef4444" name="Overdue" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* MTTR Trend */}
        <Card>
          <CardHeader>
            <CardTitle>MTTR Trend</CardTitle>
            <CardDescription>Mean Time to Repair over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mttrData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="mttr" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Asset Status */}
        <Card>
          <CardHeader>
            <CardTitle>Asset Status Distribution</CardTitle>
            <CardDescription>Current status of all assets</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={assetStatusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {assetStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Alerts</CardTitle>
            <CardDescription>Latest system notifications and alerts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentAlerts.map((alert) => (
              <div key={alert.id} className="flex items-start space-x-3">
                <AlertTriangle className={`w-4 h-4 mt-0.5 ${
                  alert.priority === 'high' ? 'text-red-500' : 
                  alert.priority === 'medium' ? 'text-amber-500' : 'text-gray-500'
                }`} />
                <div className="flex-1">
                  <p className="text-sm">{alert.message}</p>
                  <p className="text-xs text-muted-foreground">{alert.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Upcoming Tasks */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Tasks</CardTitle>
            <CardDescription>Scheduled maintenance and work orders</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingTasks.map((task) => (
              <div key={task.id} className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="text-sm font-medium">{task.task}</p>
                  <p className="text-xs text-muted-foreground">{task.technician}</p>
                </div>
                <Badge variant={task.dueDate === 'Today' ? 'destructive' : 'secondary'} className="text-xs">
                  {task.dueDate}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}