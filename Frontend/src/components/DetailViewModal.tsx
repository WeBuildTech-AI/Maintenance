import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { 
  MessageSquare, 
  Send, 
  Calendar, 
  User, 
  Clock, 
  AlertCircle,
  CheckCircle,
  Edit,
  Save,
  X,
  FileText,
  Settings,
  History,
  Paperclip,
  Phone,
  Mail
} from 'lucide-react';
import { format } from 'date-fns';

export interface Comment {
  id: string;
  author: string;
  authorRole: string;
  content: string;
  timestamp: string;
  type: 'comment' | 'status_change' | 'assignment' | 'system';
  metadata?: Record<string, any>;
}

export interface DetailItem {
  id: string;
  title: string;
  description?: string;
  type: 'work_order' | 'asset' | 'pm_schedule' | 'helpdesk_ticket' | 'inventory_item' | 'calibration';
  status: string;
  priority?: string;
  assignedTo?: string;
  createdBy?: string;
  createdDate: string;
  updatedDate?: string;
  dueDate?: string;
  progress?: number;
  fields: Array<{
    label: string;
    value: string | number | boolean;
    type: 'text' | 'number' | 'date' | 'badge' | 'progress' | 'boolean';
    editable?: boolean;
  }>;
  attachments?: Array<{
    id: string;
    name: string;
    type: string;
    size: string;
    uploadedBy: string;
    uploadedDate: string;
  }>;
  activities: Comment[];
}

interface DetailViewModalProps {
  item: DetailItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (item: DetailItem) => void;
  onStatusChange?: (itemId: string, newStatus: string) => void;
  onAssignmentChange?: (itemId: string, assignee: string) => void;
}

export function DetailViewModal({ 
  item, 
  isOpen, 
  onClose, 
  onSave,
  onStatusChange,
  onAssignmentChange 
}: DetailViewModalProps) {
  const [editMode, setEditMode] = useState(false);
  const [editedItem, setEditedItem] = useState<DetailItem | null>(null);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);

  if (!item) return null;

  const handleEdit = () => {
    setEditedItem({ ...item });
    setEditMode(true);
  };

  const handleSave = () => {
    if (editedItem && onSave) {
      onSave(editedItem);
      setEditMode(false);
      setEditedItem(null);
    }
  };

  const handleCancel = () => {
    setEditMode(false);
    setEditedItem(null);
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: crypto.randomUUID(),
      author: 'Current User', // This would come from auth context
      authorRole: 'Technician',
      content: newComment,
      timestamp: new Date().toISOString(),
      type: 'comment'
    };

    setComments(prev => [comment, ...prev]);
    setNewComment('');
  };

  const handleFieldChange = (fieldIndex: number, value: any) => {
    if (!editedItem) return;
    
    const updatedFields = [...editedItem.fields];
    updatedFields[fieldIndex] = { ...updatedFields[fieldIndex], value };
    
    setEditedItem({ ...editedItem, fields: updatedFields });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': case 'closed': case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'in progress': case 'active': case 'assigned':
        return 'bg-blue-100 text-blue-800';
      case 'pending': case 'scheduled': case 'open':
        return 'bg-amber-100 text-amber-800';
      case 'overdue': case 'critical': case 'urgent':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'work_order': return <Settings className="h-4 w-4" />;
      case 'asset': return <FileText className="h-4 w-4" />;
      case 'pm_schedule': return <Calendar className="h-4 w-4" />;
      case 'helpdesk_ticket': return <MessageSquare className="h-4 w-4" />;
      case 'inventory_item': return <FileText className="h-4 w-4" />;
      case 'calibration': return <CheckCircle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const renderFieldValue = (field: any, index: number) => {
    const isEditing = editMode && field.editable;
    const value = editMode ? editedItem?.fields[index]?.value : field.value;

    if (isEditing) {
      switch (field.type) {
        case 'text':
          return (
            <Input
              value={value as string}
              onChange={(e) => handleFieldChange(index, e.target.value)}
            />
          );
        case 'number':
          return (
            <Input
              type="number"
              value={value as number}
              onChange={(e) => handleFieldChange(index, Number(e.target.value))}
            />
          );
        case 'date':
          return (
            <Input
              type="date"
              value={value as string}
              onChange={(e) => handleFieldChange(index, e.target.value)}
            />
          );
        default:
          return <span>{String(value)}</span>;
      }
    }

    switch (field.type) {
      case 'badge':
        return <Badge className={getStatusColor(String(value))}>{String(value)}</Badge>;
      case 'progress':
        return (
          <div className="flex items-center space-x-2">
            <Progress value={value as number} className="w-24" />
            <span className="text-sm text-muted-foreground">{value}%</span>
          </div>
        );
      case 'boolean':
        return (
          <Badge variant={value ? 'default' : 'secondary'}>
            {value ? 'Yes' : 'No'}
          </Badge>
        );
      case 'date':
        return format(new Date(value as string), 'MMM dd, yyyy');
      default:
        return <span>{String(value)}</span>;
    }
  };

  const currentItem = editMode ? editedItem : item;
  const allActivities = [...(currentItem?.activities || []), ...comments].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getTypeIcon(item.type)}
              <div>
                <DialogTitle className="text-xl">{currentItem?.title}</DialogTitle>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant="outline">{item.id}</Badge>
                  <Badge className={getStatusColor(currentItem?.status || '')}>
                    {currentItem?.status}
                  </Badge>
                  {currentItem?.priority && (
                    <Badge variant="outline" className={getPriorityColor(currentItem.priority)}>
                      {currentItem.priority}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {editMode ? (
                <>
                  <Button variant="outline" size="sm" onClick={handleCancel}>
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSave}>
                    <Save className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                </>
              ) : (
                <Button variant="outline" size="sm" onClick={handleEdit}>
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="details" className="flex-1">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="comments">
              Comments ({allActivities.filter(a => a.type === 'comment').length})
            </TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="attachments">
              Files ({currentItem?.attachments?.length || 0})
            </TabsTrigger>
          </TabsList>

          <div className="mt-4 h-[60vh]">
            <TabsContent value="details" className="h-full">
              <ScrollArea className="h-full">
                <div className="space-y-6">
                  {/* Description */}
                  {currentItem?.description && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Description</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          {currentItem.description}
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {/* Key Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Key Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">Created By</Label>
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{currentItem?.createdBy}</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">Created Date</Label>
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              {format(new Date(currentItem?.createdDate || ''), 'MMM dd, yyyy')}
                            </span>
                          </div>
                        </div>
                        {currentItem?.assignedTo && (
                          <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">Assigned To</Label>
                            <div className="flex items-center space-x-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{currentItem.assignedTo}</span>
                            </div>
                          </div>
                        )}
                        {currentItem?.dueDate && (
                          <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">Due Date</Label>
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">
                                {format(new Date(currentItem.dueDate), 'MMM dd, yyyy')}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Custom Fields */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        {currentItem?.fields.map((field, index) => (
                          <div key={field.label} className="space-y-2">
                            <Label className="text-xs text-muted-foreground">
                              {field.label}
                            </Label>
                            {renderFieldValue(field, index)}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="comments" className="h-full">
              <div className="flex flex-col h-full">
                {/* Add Comment */}
                <Card className="mb-4">
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <Textarea
                        placeholder="Add a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        rows={3}
                      />
                      <div className="flex justify-end">
                        <Button onClick={handleAddComment} disabled={!newComment.trim()}>
                          <Send className="h-4 w-4 mr-2" />
                          Add Comment
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Comments List */}
                <ScrollArea className="flex-1">
                  <div className="space-y-4">
                    {allActivities.map((activity) => (
                      <Card key={activity.id}>
                        <CardContent className="pt-4">
                          <div className="flex space-x-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>
                                {activity.author.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium">{activity.author}</span>
                                <Badge variant="outline" className="text-xs">
                                  {activity.authorRole}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {format(new Date(activity.timestamp), 'MMM dd, yyyy HH:mm')}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {activity.content}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </TabsContent>

            <TabsContent value="history" className="h-full">
              <ScrollArea className="h-full">
                <div className="space-y-4">
                  {allActivities.filter(a => a.type !== 'comment').map((activity) => (
                    <Card key={activity.id}>
                      <CardContent className="pt-4">
                        <div className="flex space-x-3">
                          <div className="flex-shrink-0">
                            {activity.type === 'status_change' && (
                              <CheckCircle className="h-5 w-5 text-blue-500" />
                            )}
                            {activity.type === 'assignment' && (
                              <User className="h-5 w-5 text-green-500" />
                            )}
                            {activity.type === 'system' && (
                              <Settings className="h-5 w-5 text-gray-500" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium">{activity.author}</span>
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(activity.timestamp), 'MMM dd, yyyy HH:mm')}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {activity.content}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="attachments" className="h-full">
              <ScrollArea className="h-full">
                <div className="space-y-4">
                  {currentItem?.attachments?.map((attachment) => (
                    <Card key={attachment.id}>
                      <CardContent className="pt-4">
                        <div className="flex items-center space-x-3">
                          <Paperclip className="h-5 w-5 text-muted-foreground" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">{attachment.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {attachment.size} • Uploaded by {attachment.uploadedBy} on{' '}
                              {format(new Date(attachment.uploadedDate), 'MMM dd, yyyy')}
                            </p>
                          </div>
                          <Button variant="outline" size="sm">
                            Download
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {(!currentItem?.attachments || currentItem.attachments.length === 0) && (
                    <div className="text-center py-8">
                      <Paperclip className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-sm text-muted-foreground">No attachments</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}