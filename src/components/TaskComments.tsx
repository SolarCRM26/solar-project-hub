import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageSquare, Send, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface TaskCommentsProps {
  taskId: string;
}

export const TaskComments = ({ taskId }: TaskCommentsProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [comment, setComment] = useState('');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Query task comments
  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['task-comments', taskId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('task_comments')
        .select('*, profiles!task_comments_user_id_fkey(full_name, email)')
        .eq('task_id', taskId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const addComment = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('task_comments').insert({
        task_id: taskId,
        user_id: user!.id,
        content: comment.trim(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-comments', taskId] });
      setComment('');
      toast({ title: 'Comment added' });
    },
    onError: (e: any) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  // Auto-scroll to bottom of comments list on load or when new comment added
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [comments, isLoading]);

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Dynamic avatar background color based on name hash
  const getAvatarBgColor = (name: string) => {
    if (!name) return 'bg-slate-400';
    const colors = [
      'bg-red-500 text-white',
      'bg-orange-500 text-white',
      'bg-amber-500 text-white',
      'bg-emerald-500 text-white',
      'bg-teal-500 text-white',
      'bg-blue-500 text-white',
      'bg-indigo-500 text-white',
      'bg-violet-500 text-white',
      'bg-purple-500 text-white',
      'bg-pink-500 text-white',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Just now';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Just now';
    
    const diffMs = Date.now() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (comment.trim() && !addComment.isPending) {
        addComment.mutate();
      }
    }
  };

  return (
    <Card className="border-border/60 shadow-sm bg-card overflow-hidden flex flex-col max-h-[500px]">
      <CardHeader className="pb-3 border-b border-border/40">
        <CardTitle className="text-base flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold text-foreground">
            <MessageSquare className="h-4 w-4 text-primary" /> 
            <span>Comments</span>
          </div>
          <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-medium">
            {comments.length}
          </span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-0 flex flex-col flex-1 overflow-hidden">
        {/* Comments List Area */}
        <div 
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[200px]"
        >
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <p className="text-xs">Loading comments...</p>
            </div>
          ) : comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <MessageSquare className="h-10 w-10 mb-2 opacity-30 text-primary" />
              <p className="text-sm font-medium">No comments yet</p>
              <p className="text-xs max-w-[200px] mt-1">Be the first to share an update or ask a question.</p>
            </div>
          ) : (
            comments.map(c => {
              const profile = (c as any).profiles;
              const authorName = profile?.full_name || 'Team Member';
              const initials = getInitials(authorName);
              const isCurrentUser = c.user_id === user?.id;

              return (
                <div 
                  key={c.id} 
                  className={cn(
                    "flex gap-3 max-w-[85%] animate-fade-in",
                    isCurrentUser ? "ml-auto flex-row-reverse" : "mr-auto"
                  )}
                >
                  <Avatar className={cn("h-8 w-8 shadow-sm flex-shrink-0", getAvatarBgColor(authorName))}>
                    <AvatarFallback className="text-[10px] font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <div className={cn("flex items-center gap-2 px-1", isCurrentUser && "justify-end")}>
                      <span className="text-xs font-semibold text-foreground">
                        {isCurrentUser ? "You" : authorName}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {formatDate(c.created_at)}
                      </span>
                    </div>
                    <div 
                      className={cn(
                        "rounded-2xl px-3.5 py-2 text-sm shadow-sm border",
                        isCurrentUser 
                          ? "bg-primary text-primary-foreground border-primary" 
                          : "bg-muted/50 text-foreground border-border/40"
                      )}
                    >
                      <p className="whitespace-pre-wrap leading-relaxed break-words">{c.content}</p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Input Area */}
        <div className="p-3 border-t border-border/40 bg-muted/20">
          <div className="relative flex items-end gap-2 bg-background border border-border/80 focus-within:border-primary/80 focus-within:ring-1 focus-within:ring-primary/40 rounded-xl px-3 py-2 transition-all">
            <Textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Write a message... (Press Enter to send)"
              className="flex-1 resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 text-sm min-h-[24px] max-h-[120px] bg-transparent"
              rows={1}
            />
            <Button
              onClick={() => {
                if (comment.trim()) {
                  addComment.mutate();
                }
              }}
              disabled={!comment.trim() || addComment.isPending}
              size="icon"
              className="h-8 w-8 rounded-lg shrink-0 transition-all shadow-sm"
            >
              {addComment.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
