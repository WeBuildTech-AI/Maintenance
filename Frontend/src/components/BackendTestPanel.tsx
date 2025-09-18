import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { useAuth } from './AuthContext';
import { apiClient } from '../utils/api';
import { CheckCircle, XCircle, Loader2, Database, Server } from 'lucide-react';

export function BackendTestPanel() {
  const { token } = useAuth();
  const [testResults, setTestResults] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const runTest = async (testName: string, testFn: () => Promise<any>) => {
    setLoading(prev => ({ ...prev, [testName]: true }));
    try {
      const result = await testFn();
      setTestResults(prev => ({ 
        ...prev, 
        [testName]: { success: true, data: result, timestamp: new Date().toISOString() }
      }));
    } catch (error: any) {
      setTestResults(prev => ({ 
        ...prev, 
        [testName]: { success: false, error: error.message, timestamp: new Date().toISOString() }
      }));
    } finally {
      setLoading(prev => ({ ...prev, [testName]: false }));
    }
  };

  const tests = [
    {
      name: 'health',
      label: 'Health Check',
      description: 'Test server connectivity',
      fn: () => apiClient.healthCheck()
    },
    {
      name: 'workorders',
      label: 'Get Work Orders',
      description: 'Fetch work orders from backend',
      fn: () => apiClient.getWorkOrders(token!)
    },
    {
      name: 'assets',
      label: 'Get Assets',
      description: 'Fetch assets from backend',
      fn: () => apiClient.getAssets(token!)
    },
    {
      name: 'tickets',
      label: 'Get Tickets',
      description: 'Fetch helpdesk tickets from backend',
      fn: () => apiClient.getTickets(token!)
    },
    {
      name: 'inventory',
      label: 'Get Inventory',
      description: 'Fetch inventory items from backend',
      fn: () => apiClient.getInventory(token!)
    },
    {
      name: 'calibrations',
      label: 'Get Calibrations',
      description: 'Fetch calibration records from backend',
      fn: () => apiClient.getCalibrations(token!)
    },
    {
      name: 'logbook',
      label: 'Get Logbook',
      description: 'Fetch logbook entries from backend',
      fn: () => apiClient.getLogbookEntries(token!)
    }
  ];

  const seedData = async () => {
    if (!token) return;

    setLoading(prev => ({ ...prev, seed: true }));
    try {
      // Create sample work order
      const workOrder = {
        title: 'Replace Motor Bearing',
        description: 'Motor bearing showing signs of wear during inspection',
        asset: 'M-205 - Electric Motor 50HP',
        type: 'Corrective',
        priority: 'High',
        assignedTo: 'Mike Johnson',
        dueDate: '2024-12-20',
        estimatedHours: 4
      };
      await apiClient.createWorkOrder(workOrder, token);

      // Create sample asset
      const asset = {
        id: 'M-206',
        name: 'Electric Motor 75HP',
        category: 'Motors',
        location: 'Building A - Floor 2',
        manufacturer: 'ABB',
        model: 'M3BP315SMB2',
        serialNumber: 'ABB2024001',
        status: 'Active'
      };
      await apiClient.createAsset(asset, token);

      // Create sample ticket
      const ticket = {
        title: 'HVAC not cooling properly',
        description: 'Office temperature rising above comfortable levels',
        category: 'HVAC',
        priority: 'Medium',
        asset: 'H-103 - HVAC Unit South Wing',
        department: 'Facilities'
      };
      await apiClient.createTicket(ticket, token);

      // Create sample inventory item
      const inventoryItem = {
        id: 'BRG-6206',
        name: 'Ball Bearing 6206',
        category: 'Bearings',
        description: 'Deep groove ball bearing, 30mm bore',
        vendor: 'SKF Industrial',
        currentStock: 15,
        minStock: 5,
        maxStock: 30,
        unitCost: 35.00,
        location: 'A-15-C',
        leadTime: 7,
        unitOfMeasure: 'Each',
        partNumber: 'SKF-6206-2RS'
      };
      await apiClient.createInventoryItem(inventoryItem, token);

      // Create sample calibration
      const calibration = {
        instrument: 'Pressure Gauge PG-206',
        assetId: 'PG-206',
        serialNumber: 'WKA-2024-5582',
        location: 'Compressor Room',
        calibrationType: 'Pressure',
        range: '0-200 PSI',
        accuracy: '±0.5%',
        lastCalibrated: '2024-06-01',
        nextDue: '2024-12-01',
        frequency: '6 months',
        priority: 'Medium',
        department: 'Maintenance'
      };
      await apiClient.createCalibration(calibration, token);

      // Create sample logbook entry
      const logEntry = {
        title: 'Daily Production Startup',
        description: 'All production lines started successfully. No issues detected during startup sequence.',
        category: 'Equipment Status',
        priority: 'Normal',
        shift: 'Day Shift',
        department: 'Production',
        downtime: 0,
        tags: ['startup', 'routine', 'production']
      };
      await apiClient.createLogbookEntry(logEntry, token);

      setTestResults(prev => ({ 
        ...prev, 
        seed: { success: true, message: 'Sample data created successfully', timestamp: new Date().toISOString() }
      }));
    } catch (error: any) {
      setTestResults(prev => ({ 
        ...prev, 
        seed: { success: false, error: error.message, timestamp: new Date().toISOString() }
      }));
    } finally {
      setLoading(prev => ({ ...prev, seed: false }));
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1>Backend Integration Test</h1>
        <p className="text-muted-foreground">Test backend connectivity and API endpoints</p>
      </div>

      {/* Seed Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="w-5 h-5 mr-2" />
            Create Sample Data
          </CardTitle>
          <CardDescription>
            Create sample data across all modules for testing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={seedData} 
            disabled={loading.seed || !token}
            className="w-full"
          >
            {loading.seed ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating Sample Data...
              </>
            ) : (
              <>
                <Database className="w-4 h-4 mr-2" />
                Create Sample Data
              </>
            )}
          </Button>
          {testResults.seed && (
            <div className="mt-4">
              <div className={`flex items-center space-x-2 ${testResults.seed.success ? 'text-green-600' : 'text-red-600'}`}>
                {testResults.seed.success ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                <span className="text-sm">
                  {testResults.seed.success ? testResults.seed.message : testResults.seed.error}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* API Tests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Server className="w-5 h-5 mr-2" />
            API Endpoint Tests
          </CardTitle>
          <CardDescription>
            Test individual API endpoints and functionality
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tests.map((test) => (
              <div key={test.name} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">{test.label}</h3>
                  {testResults[test.name] && (
                    <Badge variant={testResults[test.name].success ? "default" : "destructive"}>
                      {testResults[test.name].success ? "Success" : "Failed"}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-3">{test.description}</p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => runTest(test.name, test.fn)}
                  disabled={loading[test.name] || (!token && test.name !== 'health')}
                  className="w-full"
                >
                  {loading[test.name] ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    `Test ${test.label}`
                  )}
                </Button>
                
                {testResults[test.name] && (
                  <div className="mt-3 p-2 bg-gray-50 rounded text-xs">
                    <div className={`flex items-center space-x-2 mb-1 ${testResults[test.name].success ? 'text-green-600' : 'text-red-600'}`}>
                      {testResults[test.name].success ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      <span>{testResults[test.name].success ? 'Success' : 'Error'}</span>
                    </div>
                    {testResults[test.name].success ? (
                      <div>
                        <div className="text-gray-600">
                          Items: {Array.isArray(testResults[test.name].data) ? testResults[test.name].data.length : 'N/A'}
                        </div>
                      </div>
                    ) : (
                      <div className="text-red-600">{testResults[test.name].error}</div>
                    )}
                    <div className="text-gray-500 mt-1">
                      {new Date(testResults[test.name].timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}