import { Badge } from "@/components/ui/badge";

const stageColors: Record<string, string> = {
  lead_created: "bg-muted text-muted-foreground",
  design_started: "bg-warning/20 text-warning-foreground",
  design_approved: "bg-warning/30 text-warning-foreground",
  proposal_approved: "bg-info/20 text-info",
  contract_signed: "bg-info/30 text-info",
  qa_passed: "bg-success/20 text-success-foreground",
  build_started: "bg-primary/20 text-primary-foreground",
  closeout_delivered: "bg-success/40 text-success-foreground",
};

const stageLabels: Record<string, string> = {
  lead_created: "Site Survey",
  design_started: "PCIR",
  design_approved: "Design",
  proposal_approved: "Proposal",
  contract_signed: "Contract Signed",
  qa_passed: "Procurement",
  build_started: "Installation",
  closeout_delivered: "Closeout Package",
};

export const StageBadge = ({
  stage,
  label,
}: {
  stage: string;
  label?: string;
}) => {
  return (
    <Badge
      className={`${stageColors[stage] || "bg-muted text-muted-foreground"} border-0 font-medium`}
    >
      {label || stageLabels[stage] || stage}
    </Badge>
  );
};

const statusColors: Record<string, string> = {
  pending: "bg-muted text-muted-foreground",
  in_progress: "bg-primary/20 text-primary-foreground",
  completed: "bg-success/20 text-success-foreground",
  rejected: "bg-destructive/20 text-destructive",
};

const statusLabels: Record<string, string> = {
  pending: "Pending",
  in_progress: "In Progress",
  completed: "Completed",
  rejected: "Rejected",
};

export const StatusBadge = ({ status }: { status: string }) => {
  return (
    <Badge
      className={`${statusColors[status] || "bg-muted text-muted-foreground"} border-0 font-medium`}
    >
      {statusLabels[status] || status}
    </Badge>
  );
};

const docStateColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  in_review: "bg-warning/20 text-warning-foreground",
  afc: "bg-info/20 text-info",
  as_built: "bg-success/20 text-success-foreground",
};

const docStateLabels: Record<string, string> = {
  draft: "Draft",
  in_review: "In Review",
  afc: "AFC",
  as_built: "As-Built",
};

export const DocStateBadge = ({ state }: { state: string }) => {
  return (
    <Badge
      className={`${docStateColors[state] || "bg-muted text-muted-foreground"} border-0 font-medium`}
    >
      {docStateLabels[state] || state}
    </Badge>
  );
};

export { stageLabels, statusLabels, docStateLabels };
