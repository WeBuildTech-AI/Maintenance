import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Progress } from './ui/progress';
import { 
  Search, 
  Plus, 
  Package, 
  AlertTriangle, 
  TrendingUp,
  TrendingDown,
  Eye,
  Edit,
  ShoppingCart,
  ArrowUpDown,
  Filter,
  DollarSign,
  Boxes,
  AlertCircle
} from 'lucide-react';

export function InventoryManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Mock inventory data
  const inventory = [
    {
      id: 'SKF-6205',
      name: 'Ball Bearing SKF 6205',
      category: 'Bearings',
      description: 'Deep groove ball bearing, 25mm bore',
      vendor: 'SKF Industrial',
      currentStock: 8,
      minStock: 10,
      maxStock: 50,
      unitCost: 25.50,
      totalValue: 204.00,
      location: 'A-12-B',
      leadTime: 7,
      lastRestocked: '2024-12-10',
      reserved: 2,
      available: 6,
      unitOfMeasure: 'Each',
      partNumber: 'SKF-6205-2RS',
      status: 'Low Stock'
    },
    {
      id: 'OIL-15W40',
      name: 'Motor Oil 15W-40',
      category: 'Lubricants',
      description: 'Heavy duty motor oil for industrial equipment',
      vendor: 'Shell Industrial',
      currentStock: 45,
      minStock: 20,
      maxStock: 100,
      unitCost: 12.75,
      totalValue: 573.75,
      location: 'B-05-A',
      leadTime: 3,
      lastRestocked: '2024-12-15',
      reserved: 5,
      available: 40,
      unitOfMeasure: 'Liters',
      partNumber: 'SHELL-15W40-5L',
      status: 'In Stock'
    },
    {
      id: 'FLT-HYD-001',
      name: 'Hydraulic Filter Element',
      category: 'Filters',
      description: 'High-pressure hydraulic system filter',
      vendor: 'Parker Hannifin',
      currentStock: 0,
      minStock: 5,
      maxStock: 25,
      unitCost: 85.00,
      totalValue: 0.00,
      location: 'C-08-C',
      leadTime: 14,
      lastRestocked: '2024-11-28',
      reserved: 0,
      available: 0,
      unitOfMeasure: 'Each',
      partNumber: 'PKR-HF-3842',
      status: 'Out of Stock'
    },
    {
      id: 'BLT-M12-80',
      name: 'Hex Bolt M12x80',
      category: 'Fasteners',
      description: 'Stainless steel hex bolt with nut',
      vendor: 'McMaster-Carr',
      currentStock: 156,
      minStock: 50,
      maxStock: 200,
      unitCost: 1.25,
      totalValue: 195.00,
      location: 'D-15-A',
      leadTime: 5,
      lastRestocked: '2024-12-12',
      reserved: 12,
      available: 144,
      unitOfMeasure: 'Each',
      partNumber: 'MC-91290A542',
      status: 'In Stock'
    },
    {
      id: 'GSK-PUMP-101',
      name: 'Pump Seal Kit',
      category: 'Seals & Gaskets',
      description: 'Complete seal kit for centrifugal pump A-101',
      vendor: 'John Crane',
      currentStock: 3,
      minStock: 2,
      maxStock: 10,
      unitCost: 145.00,
      totalValue: 435.00,
      location: 'A-18-D',
      leadTime: 10,
      lastRestocked: '2024-12-08',
      reserved: 1,
      available: 2,
      unitOfMeasure: 'Kit',
      partNumber: 'JC-TYPE1-A101',
      status: 'In Stock'
    },
    {
      id: 'WRE-14AWG-BLK',
      name: 'Electrical Wire 14 AWG Black',
      category: 'Electrical',
      description: 'THHN/THWN-2 copper wire, 600V rated',
      vendor: 'Southwire',
      currentStock: 245,
      minStock: 100,
      maxStock: 500,
      unitCost: 2.85,
      totalValue: 698.25,
      location: 'E-22-B',
      leadTime: 2,
      lastRestocked: '2024-12-16',
      reserved: 15,
      available: 230,
      unitOfMeasure: 'Meters',
      partNumber: 'SW-14-THHN-BLK',
      status: 'In Stock'
    }
  ];

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.partNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || item.category.toLowerCase() === filterCategory.toLowerCase();
    const matchesStatus = filterStatus === 'all' || item.status.toLowerCase().includes(filterStatus.toLowerCase());
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'in stock': return 'bg-green-100 text-green-800';
      case 'low stock': return 'bg-amber-100 text-amber-800';
      case 'out of stock': return 'bg-red-100 text-red-800';
      case 'on order': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStockLevel = (current: number, min: number, max: number) => {
    return (current / max) * 100;
  };

  const getStockLevelColor = (current: number, min: number) => {
    if (current === 0) return 'text-red-600';
    if (current <= min) return 'text-amber-600';
    return 'text-green-600';
  };

  const inventoryStats = {
    totalItems: inventory.length,
    totalValue: inventory.reduce((sum, item) => sum + item.totalValue, 0),
    lowStock: inventory.filter(item => item.currentStock <= item.minStock && item.currentStock > 0).length,
    outOfStock: inventory.filter(item => item.currentStock === 0).length,
    inStock: inventory.filter(item => item.currentStock > item.minStock).length
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1>Inventory Management</h1>
          <p className="text-muted-foreground">Manage spare parts, consumables, and stock levels</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <ArrowUpDown className="w-4 h-4 mr-2" />
            Stock Transfer
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Inventory Item</DialogTitle>
                <DialogDescription>
                  Add a new spare part or consumable to the inventory
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="item-id">Item ID</Label>
                  <Input id="item-id" placeholder="Unique identifier" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="item-name">Item Name</Label>
                  <Input id="item-name" placeholder="Descriptive name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="item-category">Category</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bearings">Bearings</SelectItem>
                      <SelectItem value="lubricants">Lubricants</SelectItem>
                      <SelectItem value="filters">Filters</SelectItem>
                      <SelectItem value="fasteners">Fasteners</SelectItem>
                      <SelectItem value="seals">Seals & Gaskets</SelectItem>
                      <SelectItem value="electrical">Electrical</SelectItem>
                      <SelectItem value="tools">Tools</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="item-vendor">Vendor</Label>
                  <Input id="item-vendor" placeholder="Supplier name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="item-part-number">Part Number</Label>
                  <Input id="item-part-number" placeholder="Manufacturer part number" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="item-location">Storage Location</Label>
                  <Input id="item-location" placeholder="e.g., A-12-B" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="item-min-stock">Min Stock Level</Label>
                  <Input id="item-min-stock" type="number" placeholder="0" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="item-max-stock">Max Stock Level</Label>
                  <Input id="item-max-stock" type="number" placeholder="0" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="item-unit-cost">Unit Cost ($)</Label>
                  <Input id="item-unit-cost" type="number" step="0.01" placeholder="0.00" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="item-lead-time">Lead Time (days)</Label>
                  <Input id="item-lead-time" type="number" placeholder="0" />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="item-description">Description</Label>
                  <Input id="item-description" placeholder="Detailed description of the item" />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setIsCreateDialogOpen(false)}>
                  Add Item
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
                <p className="text-sm text-muted-foreground">Total Items</p>
                <p className="text-2xl font-bold">{inventoryStats.totalItems}</p>
              </div>
              <Package className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">${inventoryStats.totalValue.toLocaleString()}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">In Stock</p>
                <p className="text-2xl font-bold text-green-600">{inventoryStats.inStock}</p>
              </div>
              <Boxes className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Low Stock</p>
                <p className="text-2xl font-bold text-amber-600">{inventoryStats.lowStock}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Out of Stock</p>
                <p className="text-2xl font-bold text-red-600">{inventoryStats.outOfStock}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-500" />
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
                  placeholder="Search by item name, ID, or part number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-40">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="bearings">Bearings</SelectItem>
                  <SelectItem value="lubricants">Lubricants</SelectItem>
                  <SelectItem value="filters">Filters</SelectItem>
                  <SelectItem value="fasteners">Fasteners</SelectItem>
                  <SelectItem value="seals & gaskets">Seals & Gaskets</SelectItem>
                  <SelectItem value="electrical">Electrical</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="in stock">In Stock</SelectItem>
                  <SelectItem value="low stock">Low Stock</SelectItem>
                  <SelectItem value="out of stock">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle>Inventory Items</CardTitle>
          <CardDescription>
            All spare parts and consumables with current stock levels
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Stock Level</TableHead>
                <TableHead>Available</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Unit Cost</TableHead>
                <TableHead>Total Value</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInventory.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.id}</TableCell>
                  <TableCell className="max-w-48">
                    <div>
                      <p className="font-medium truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{item.partNumber}</p>
                    </div>
                  </TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className={getStockLevelColor(item.currentStock, item.minStock)}>
                          {item.currentStock}/{item.maxStock}
                        </span>
                      </div>
                      <Progress 
                        value={getStockLevel(item.currentStock, item.minStock, item.maxStock)} 
                        className="h-2" 
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{item.available} {item.unitOfMeasure}</span>
                    {item.reserved > 0 && (
                      <p className="text-xs text-muted-foreground">({item.reserved} reserved)</p>
                    )}
                  </TableCell>
                  <TableCell>{item.location}</TableCell>
                  <TableCell>${item.unitCost.toFixed(2)}</TableCell>
                  <TableCell className="font-medium">${item.totalValue.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(item.status)}>
                      {item.status}
                    </Badge>
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
                        <ShoppingCart className="w-4 h-4" />
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