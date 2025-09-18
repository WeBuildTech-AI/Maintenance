import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { 
  MessageSquare, 
  Send, 
  Reply, 
  ThumbsUp, 
  Flag,
  MoreHorizontal,
  Edit,
  Trash2,
  Pin
} from 'lucide-react';
import { format } from 'date-fns';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';

export interface Comment {
  id: string;
  author: string;
  authorRole: string;
  authorAvatar?: string;
  content: string;
  timestamp: string;
  type: 'comment' | 'status_change' | 'assignment' | 'system' | 'internal' | 'external';
  parentId?: string;
  isPinned?: boolean;
  likes?: number;
  isLiked?: boolean;
  isEdited?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  attachments?: Array<{
    id: string;
    name: string;
    type: string;
    url: string;
  }>;
  mentions?: string[];
  tags?: string[];
}

interface CommentSystemProps {
  entityId: string;
  entityType: 'work_order' | 'asset' | 'pm_schedule' | 'helpdesk_ticket' | 'inventory_item' | 'calibration';
  comments: Comment[];
  onAddComment: (content: string, type: Comment['type'], parentId?: string) => void;
  onEditComment: (commentId: string, content: string) => void;
  onDeleteComment: (commentId: string) => void;
  onLikeComment: (commentId: string) => void;
  onPinComment: (commentId: string) => void;
  currentUserId?: string;
  allowInternalComments?: boolean;
  allowExternalComments?: boolean;
  isOpen: boolean;
  onClose: () => void;
}

export function CommentSystem({
  entityId,
  entityType,
  comments,
  onAddComment,
  onEditComment,
  onDeleteComment,
  onLikeComment,
  onPinComment,
  currentUserId = 'current-user',
  allowInternalComments = true,
  allowExternalComments = true,
  isOpen,
  onClose
}: CommentSystemProps) {
  const [newComment, setNewComment] = useState('');
  const [commentType, setCommentType] = useState<Comment['type']>('comment');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [showInternalOnly, setShowInternalOnly] = useState(false);

  // Sort comments: pinned first, then by timestamp
  const sortedComments = [...comments].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  // Group comments by parent/child relationship
  const groupedComments = sortedComments.reduce((acc, comment) => {
    if (!comment.parentId) {
      acc[comment.id] = {
        parent: comment,
        replies: sortedComments.filter(c => c.parentId === comment.id)
      };
    }
    return acc;
  }, {} as Record<string, { parent: Comment; replies: Comment[] }>);

  const filteredComments = Object.values(groupedComments).filter(group => {
    if (showInternalOnly) {
      return group.parent.type === 'internal' || group.parent.type === 'system';
    }
    return true;
  });

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    
    onAddComment(newComment, commentType, replyTo || undefined);
    setNewComment('');
    setReplyTo(null);
  };

  const handleEditComment = (commentId: string) => {
    const comment = comments.find(c => c.id === commentId);
    if (comment) {
      setEditingComment(commentId);
      setEditContent(comment.content);
    }
  };

  const handleSaveEdit = () => {
    if (editingComment && editContent.trim()) {
      onEditComment(editingComment, editContent);
      setEditingComment(null);
      setEditContent('');
    }
  };

  const handleCancelEdit = () => {
    setEditingComment(null);
    setEditContent('');
  };

  const getCommentTypeColor = (type: Comment['type']) => {
    switch (type) {
      case 'internal': return 'bg-blue-100 text-blue-800';
      case 'external': return 'bg-green-100 text-green-800';
      case 'system': return 'bg-gray-100 text-gray-800';
      case 'status_change': return 'bg-amber-100 text-amber-800';
      case 'assignment': return 'bg-purple-100 text-purple-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const getCommentTypeLabel = (type: Comment['type']) => {
    switch (type) {
      case 'internal': return 'Internal';
      case 'external': return 'External';
      case 'system': return 'System';
      case 'status_change': return 'Status Change';
      case 'assignment': return 'Assignment';
      default: return 'Comment';
    }
  };

  const CommentItem = ({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) => (
    <Card className={`${isReply ? 'ml-12 border-l-2 border-l-blue-200' : ''} ${comment.isPinned ? 'border-amber-200 bg-amber-50' : ''}`}>
      <CardContent className="pt-4">
        <div className="flex space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback>
              {comment.author.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">{comment.author}</span>
                <Badge variant="outline" className="text-xs">
                  {comment.authorRole}
                </Badge>
                <Badge variant="outline" className={`text-xs ${getCommentTypeColor(comment.type)}`}>
                  {getCommentTypeLabel(comment.type)}
                </Badge>
                {comment.isPinned && (
                  <Pin className="h-3 w-3 text-amber-500" />
                )}
                <span className="text-xs text-muted-foreground">
                  {format(new Date(comment.timestamp), 'MMM dd, yyyy HH:mm')}
                  {comment.isEdited && ' (edited)'}
                </span>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setReplyTo(comment.id)}>
                    <Reply className="h-4 w-4 mr-2" />
                    Reply
                  </DropdownMenuItem>
                  {comment.canEdit && (
                    <DropdownMenuItem onClick={() => handleEditComment(comment.id)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => onPinComment(comment.id)}>
                    <Pin className="h-4 w-4 mr-2" />
                    {comment.isPinned ? 'Unpin' : 'Pin'}
                  </DropdownMenuItem>
                  {comment.canDelete && (
                    <DropdownMenuItem 
                      onClick={() => onDeleteComment(comment.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            {editingComment === comment.id ? (
              <div className="space-y-2">
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={3}
                />
                <div className="flex space-x-2">
                  <Button size="sm" onClick={handleSaveEdit}>
                    Save
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-sm">{comment.content}</p>
                
                {comment.attachments && comment.attachments.length > 0 && (
                  <div className="space-y-1">
                    {comment.attachments.map(attachment => (
                      <div key={attachment.id} className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <span>📎 {attachment.name}</span>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="flex items-center space-x-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onLikeComment(comment.id)}
                    className={`h-6 ${comment.isLiked ? 'text-blue-600' : 'text-muted-foreground'}`}
                  >
                    <ThumbsUp className="h-3 w-3 mr-1" />
                    {comment.likes || 0}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setReplyTo(comment.id)}
                    className="h-6 text-muted-foreground"
                  >
                    <Reply className="h-3 w-3 mr-1" />
                    Reply
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5" />
            <span>Comments & Activity</span>
            <Badge variant="outline">{comments.length}</Badge>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col h-[70vh]">
          {/* Comment Type Filter */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Button
                variant={showInternalOnly ? 'outline' : 'default'}
                size="sm"
                onClick={() => setShowInternalOnly(false)}
              >
                All Comments
              </Button>
              <Button
                variant={showInternalOnly ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowInternalOnly(true)}
              >
                Internal Only
              </Button>
            </div>
          </div>
          
          {/* Add New Comment */}
          <Card className="mb-4">
            <CardContent className="pt-4">
              <div className="space-y-3">
                {replyTo && (
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Reply className="h-4 w-4" />
                    <span>Replying to comment...</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setReplyTo(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                
                <Textarea
                  placeholder={replyTo ? "Write a reply..." : "Add a comment..."}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={3}
                />
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {allowInternalComments && (
                      <Button
                        variant={commentType === 'internal' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setCommentType('internal')}
                      >
                        Internal
                      </Button>
                    )}
                    {allowExternalComments && (
                      <Button
                        variant={commentType === 'external' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setCommentType('external')}
                      >
                        External
                      </Button>
                    )}
                    <Button
                      variant={commentType === 'comment' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCommentType('comment')}
                    >
                      Comment
                    </Button>
                  </div>
                  
                  <Button onClick={handleAddComment} disabled={!newComment.trim()}>
                    <Send className="h-4 w-4 mr-2" />
                    {replyTo ? 'Reply' : 'Comment'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Comments List */}
          <ScrollArea className="flex-1">
            <div className="space-y-4">
              {filteredComments.map(({ parent, replies }) => (
                <div key={parent.id} className="space-y-3">
                  <CommentItem comment={parent} />
                  {replies.map(reply => (
                    <CommentItem key={reply.id} comment={reply} isReply />
                  ))}
                </div>
              ))}
              
              {filteredComments.length === 0 && (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground">
                    {showInternalOnly ? 'No internal comments yet' : 'No comments yet'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Be the first to add a comment!
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Quick Comment Button Component
interface QuickCommentButtonProps {
  entityId: string;
  entityType: string;
  commentCount: number;
  onClick: () => void;
}

export function QuickCommentButton({ entityId, entityType, commentCount, onClick }: QuickCommentButtonProps) {
  return (
    <Button variant="ghost" size="sm" onClick={onClick}>
      <MessageSquare className="h-4 w-4 mr-1" />
      {commentCount > 0 ? commentCount : 'Comment'}
    </Button>
  );
}