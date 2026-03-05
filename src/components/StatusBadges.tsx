import { Badge } from '@/components/ui/badge';

const stageColors: Record<string, string> = {
  lead_created: 'bg-muted text-muted-foreground',
  proposal_approved: 'bg-info/20 text-info',
  contract_signed: 'bg-info/30 text-info',
  design_started: 'bg-warning/20 text-warning',
  design_approved: 'bg-warning/30 text-warning',
  build_started: 'bg-primary/20 text-primary',
  qa_passed: 'bg-success/20 text-success',
  commissioned: 'bg-success/30 text-success',
  closeout_delivered: 'bg-success/40 text-success',
};

const stageLabels: Record<string, string> = {
  lead_created: 'Lead Created',
  proposal_approved: 'Proposal Approved',
  contract_signed: 'Contract Signed',
  design_started: 'Design Started',
  design_approved: 'Design Approved',
  build_started: 'Build Started',
  qa_passed: 'QA Passed',
  commissioned: 'Commissioned',
  closeout_delivered: 'Closeout Delivered',
};

export const StageBadge = ({ stage }: { stage: string }) => {
  return (
    <Badge className={`${stageColors[stage] || 'bg-muted text-muted-foreground'} border-0 font-medium`}>
      {stageLabels[stage] || stage}
    </Badge>
  );
};

const statusColors: Record<string, string> = {
  pending: 'bg-muted text-muted-foreground',
  in_progress: 'bg-primary/20 text-primary',
  completed: 'bg-success/20 text-success',
  rejected: 'bg-destructive/20 text-destructive',
};

const statusLabels: Record<string, string> = {
  pending: 'Pending',
  in_progress: 'In Progress',
  completed: 'Completed',
  rejected: 'Rejected',
};

export const StatusBadge = ({ status }: { status: string }) => {
  return (
    <Badge className={`${statusColors[status] || 'bg-muted text-muted-foreground'} border-0 font-medium`}>
      {statusLabels[status] || status}
    </Badge>
  );
};

const docStateColors: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  in_review: 'bg-warning/20 text-warning',
  afc: 'bg-info/20 text-info',
  as_built: 'bg-success/20 text-success',
};

const docStateLabels: Record<string, string> = {
  draft: 'Draft',
  in_review: 'In Review',
  afc: 'AFC',
  as_built: 'As-Built',
};

export const DocStateBadge = ({ state }: { state: string }) => {
  return (
    <Badge className={`${docStateColors[state] || 'bg-muted text-muted-foreground'} border-0 font-medium`}>
      {docStateLabels[state] || state}
    </Badge>
  );
};

export { stageLabels, statusLabels, docStateLabels };
