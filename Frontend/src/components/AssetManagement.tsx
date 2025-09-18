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
  QrCode, 
  FileText, 
  Calendar, 
  DollarSign, 
  MapPin,
  Filter,
  Eye,
  Edit
} from 'lucide-react';

export function AssetManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<DetailItem | null>(null);
  const [isDetailViewOpen, setIsDetailViewOpen] = useState(false);
  const [assetComments, setAssetComments] = useState<Record<string, Comment[]>>({});

  // Mock asset data
  const assets = [
    {
      id: 'A-101',
      name: 'Centrifugal Pump #1',
      type: 'Pump',
      location: 'Building A - Floor 1',
      status: 'Active',
      purchaseDate: '2022-03-15',
      vendor: 'FlowTech Industries',
      warranty: '2025-03-15',
      lastMaintenance: '2024-11-15',
      nextPM: '2024-12-30',
      criticality: 'High',
      cost: '$15,250'
    },
    {
      id: 'M-205',
      name: 'Electric Motor 50HP',
      type: 'Motor',
      location: 'Building B - Floor 2',
      status: 'Under Repair',
      purchaseDate: '2021-08-20',
      vendor: 'MotorCorp',
      warranty: 'Expired',
      lastMaintenance: '2024-10-20',
      nextPM: '2024-12-25',
      criticality: 'Medium',
      cost: '$8,750'
    },
    {
      id: 'C-301',
      name: 'Air Compressor Unit',
      type: 'Compressor',
      location: 'Building C - Floor 3',
      status: 'Active',
      purchaseDate: '2023-01-10',
      vendor: 'AirMax Systems',
      warranty: '2026-01-10',
      lastMaintenance: '2024-11-10',
      nextPM: '2025-01-10',
      criticality: 'High',
      cost: '$22,500'
    },
    {
      id: 'H-102',
      name: 'HVAC Unit - North Wing',
      type: 'HVAC',
      location: 'Building A - Roof',
      status: 'Active',
      purchaseDate: '2020-05-15',
      vendor: 'Climate Control Pro',
      warranty: 'Expired',
      lastMaintenance: '2024-11-08',
      nextPM: '2024-12-20',
      criticality: 'Medium',
      cost: '$18,900'
    },
    {
      id: 'V-150',
      name: 'Control Valve Assembly',
      type: 'Valve',
      location: 'Building A - Floor 2',
      status: 'Spare',
      purchaseDate: '2023-06-30',
      vendor: 'ValveTech Solutions',
      warranty: '2025-06-30',
      lastMaintenance: 'N/A',
      nextPM: 'N/A',
      criticality: 'Low',
      cost: '$3,200'
    }
  ];

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || asset.status.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'under repair': return 'bg-amber-100 text-amber-800';
      case 'spare': return 'bg-blue-100 text-blue-800';
      case 'retired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCriticalityColor = (criticality: string) => {
    switch (criticality.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-amber-100 text-amber-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewAsset = (asset: any) => {
    const detailItem: DetailItem = {
      id: asset.id,
      title: asset.name,
      description: `${asset.type} asset located at ${asset.location}`,
      type: 'asset',
      status: asset.status,
      assignedTo: 'N/A',
      createdBy: 'System',
      createdDate: asset.purchaseDate,
      fields: [
        { label: 'Asset Type', value: asset.type, type: 'text' },
        { label: 'Location', value: asset.location, type: 'text' },
        { label: 'Vendor', value: asset.vendor, type: 'text' },
        { label: 'Purchase Date', value: asset.purchaseDate, type: 'date' },
        { label: 'Warranty Expiry', value: asset.warranty, type: 'text' },
        { label: 'Last Maintenance', value: asset.lastMaintenance, type: 'text' },
        { label: 'Next PM', value: asset.nextPM, type: 'text' },
        { label: 'Criticality', value: asset.criticality, type: 'badge' },
        { label: 'Purchase Cost', value: asset.cost, type: 'text' }
      ],
      activities: assetComments[asset.id] || []
    };
    
    setSelectedAsset(detailItem);
    setIsDetailViewOpen(true);
  };

  const handleOpenComments = (assetId: string) => {
    const asset = assets.find(a => a.id === assetId);
    if (asset) {
      handleViewAsset(asset);
      setTimeout(() => {
        const commentsTab = document.querySelector('[data-state="inactive"][value="comments"]') as HTMLElement;
        if (commentsTab) commentsTab.click();
      }, 100);
    }
  };

  const getCommentCount = (assetId: string) => {
    return assetComments[assetId]?.length || 0;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1>Asset Management</h1>
          <p className="text-muted-foreground">Manage and track your facility assets</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Asset
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Asset</DialogTitle>
              <DialogDescription>
                Enter the details for the new asset
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="asset-id">Asset ID</Label>
                <Input id="asset-id" placeholder="A-XXX" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="asset-name">Asset Name</Label>
                <Input id="asset-name" placeholder="Enter asset name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="asset-type">Asset Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pump">Pump</SelectItem>
                    <SelectItem value="motor">Motor</SelectItem>
                    <SelectItem value="compressor">Compressor</SelectItem>
                    <SelectItem value="hvac">HVAC</SelectItem>
                    <SelectItem value="valve">Valve</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" placeholder="Building - Floor" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vendor">Vendor</Label>
                <Input id="vendor" placeholder="Vendor name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="purchase-date">Purchase Date</Label>
                <Input id="purchase-date" type="date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="warranty">Warranty Expiry</Label>
                <Input id="warranty" type="date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cost">Purchase Cost</Label>
                <Input id="cost" placeholder="$0.00" />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" placeholder="Asset description and specifications" />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsAddDialogOpen(false)}>
                Add Asset
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search assets by name, ID, or type..."
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
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="under repair">Under Repair</SelectItem>
                  <SelectItem value="spare">Spare</SelectItem>
                  <SelectItem value="retired">Retired</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <QrCode className="w-4 h-4 mr-2" />
                Scan QR
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assets Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Assets</p>
                <p className="text-2xl font-bold">{assets.length}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-full">
                <FileText className="w-4 h-4 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-green-600">
                  {assets.filter(a => a.status === 'Active').length}
                </p>
              </div>
              <div className="p-2 bg-green-100 rounded-full">
                <Calendar className="w-4 h-4 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Under Repair</p>
                <p className="text-2xl font-bold text-amber-600">
                  {assets.filter(a => a.status === 'Under Repair').length}
                </p>
              </div>
              <div className="p-2 bg-amber-100 rounded-full">
                <MapPin className="w-4 h-4 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">$68.6K</p>
              </div>
              <div className="p-2 bg-purple-100 rounded-full">
                <DollarSign className="w-4 h-4 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assets Table */}
      <Card>
        <CardHeader>
          <CardTitle>Asset Registry</CardTitle>
          <CardDescription>
            Complete list of all facility assets with their current status and details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Asset ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Criticality</TableHead>
                <TableHead>Next PM</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAssets.map((asset) => (
                <TableRow key={asset.id}>
                  <TableCell className="font-medium">{asset.id}</TableCell>
                  <TableCell>{asset.name}</TableCell>
                  <TableCell>{asset.type}</TableCell>
                  <TableCell>{asset.location}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(asset.status)}>
                      {asset.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getCriticalityColor(asset.criticality)}>
                      {asset.criticality}
                    </Badge>
                  </TableCell>
                  <TableCell>{asset.nextPM}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleViewAsset(asset)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <QuickCommentButton
                        entityId={asset.id}
                        entityType="asset"
                        commentCount={getCommentCount(asset.id)}
                        onClick={() => handleOpenComments(asset.id)}
                      />
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <QrCode className="w-4 h-4" />
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
        item={selectedAsset}
        isOpen={isDetailViewOpen}
        onClose={() => {
          setIsDetailViewOpen(false);
          setSelectedAsset(null);
        }}
        onSave={(updatedItem) => {
          console.log('Save asset:', updatedItem);
          // Here you would update the asset in your data source
        }}
      />
    </div>
  );
}