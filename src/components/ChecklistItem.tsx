import { useState } from 'react';
import { Check, X, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

interface ChecklistItemData {
  id: string;
  text: string;
  required: boolean;
  checked?: boolean;
  notes?: string;
}

interface ChecklistItemProps {
  item: ChecklistItemData;
  onToggle: (id: string, checked: boolean) => void;
  onNotesChange: (id: string, notes: string) => void;
  disabled?: boolean;
}

export const ChecklistItem = ({ item, onToggle, onNotesChange, disabled }: ChecklistItemProps) => {
  const [showNotes, setShowNotes] = useState(!!item.notes);

  return (
    <div 
      className={cn(
        "border rounded-lg p-4 transition-all",
        item.checked ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800" : "bg-background"
      )}
    >
      <div className="flex items-start gap-3">
        <Checkbox
          id={item.id}
          checked={item.checked || false}
          onCheckedChange={(checked) => onToggle(item.id, checked as boolean)}
          disabled={disabled}
          className="mt-1"
        />
        <div className="flex-1">
          <Label
            htmlFor={item.id}
            className={cn(
              "text-sm font-medium cursor-pointer",
              item.checked && "line-through text-muted-foreground"
            )}
          >
            {item.text}
            {item.required && (
              <Badge variant="outline" className="ml-2 text-xs">
                Required
              </Badge>
            )}
          </Label>
          
          {(showNotes || item.notes) && (
            <div className="mt-2">
              <Textarea
                placeholder="Add notes for this item..."
                value={item.notes || ''}
                onChange={(e) => onNotesChange(item.id, e.target.value)}
                disabled={disabled}
                className="min-h-[60px] text-sm"
              />
            </div>
          )}
          
          {!showNotes && !item.notes && (
            <button
              onClick={() => setShowNotes(true)}
              className="text-xs text-muted-foreground hover:text-foreground mt-1"
              disabled={disabled}
            >
              Add notes...
            </button>
          )}
        </div>
        
        {item.checked ? (
          <Check className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
        ) : item.required ? (
          <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
        ) : (
          <X className="h-5 w-5 text-muted-foreground flex-shrink-0" />
        )}
      </div>
    </div>
  );
};
