import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StageBadge, stageLabels, DocStateBadge } from "@/components/StatusBadges";
import {
  Eye,
  EyeOff,
  FolderKanban,
  ArrowLeft,
  Save,
  UserPlus,
  X,
  Pencil,
  Trash2,
  Wrench,
  Upload,
  Loader2,
  FileText,
  BookOpen,
  Circle,
  CircleCheck,
  Layers,
  Camera,
  Plus,
  Search,
  Download,
  History,
  Edit,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { DocumentUploader } from "@/components/DocumentUploader";
import { DocumentVersionHistory } from "@/components/DocumentVersionHistory";

const projectTypes = [
  { value: "rooftop", label: "Rooftop" },
  { value: "ground_mount", label: "Ground Mount" },
  { value: "carport", label: "Carport" },
  { value: "electrical_contracts", label: "Electrical Contracts" },
];

const stages = Object.entries(stageLabels).map(([value, label]) => ({
  value,
  label,
}));

type ChecklistItemDefinition = {
  id: string;
  title: string;
  references?: string[];
  inspectionLabel?: string;
};

type ChecklistFileMeta = {
  file_path: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  uploaded_at: string;
};

type ChecklistItemState = {
  notes: string;
  inspection: "pass" | "fail" | null;
  completed: boolean;
  files: ChecklistFileMeta[];
};

type ChecklistState = Record<string, ChecklistItemState>;

type ChecklistSectionDefinition = {
  id: string;
  title: string;
  items: ChecklistItemDefinition[];
};

type StageFileDocument = {
  file_path: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  uploaded_at: string;
  is_client_visible?: boolean;
};

type StageFileRow = {
  id?: string;
  project_id: string;
  stage_key: string;
  stage_name: string;
  notes: string;
  entered_at: string | null;
  completed_at: string | null;
  documents: StageFileDocument[];
};

type DealFlowItem = {
  key: string;
  label: string;
  projectStage: string | null;
  stageCardKey: string;
};

const CREATE_NEW_SECTION_OPTION = "__create_new_section__";

const defaultInstallationChecklistSections: ChecklistSectionDefinition[] = [
  {
    id: "material-management",
    title: "Material Management",
    items: [
      {
        id: "receive-deliver-materials",
        title: "Receive/Deliver Materials to Job Site",
      },
      {
        id: "materials-quality-inspection",
        title: "Materials Quality Inspection & Sign-Off",
        inspectionLabel: "Materials Quality Inspection",
      },
    ],
  },
  {
    id: "installation",
    title: "Installation",
    items: [
      {
        id: "install-racking-system",
        title: "Install Racking System",
        references: ["Engineering Visual Aids - Racking System"],
        inspectionLabel: "Racking System Inspection",
      },
      {
        id: "install-pvc-pipe",
        title: "Install PVC Pipe",
        references: ["Engineering Visual Aids - PVC Pipe"],
        inspectionLabel: "PVC Pipe Inspection",
      },
      {
        id: "install-inverter",
        title: "Install Inverter",
        references: ["Engineering Visual Aids - Inverter"],
        inspectionLabel: "Inverter Inspection",
      },
      {
        id: "install-dc-home-run",
        title: "Install Home Run for DC",
        references: ["Engineering Visual Aids - DC Home Run"],
        inspectionLabel: "DC Home Run Inspection",
      },
      {
        id: "install-ac-disconnect",
        title: "Install AC Disconnect and Wiring",
        references: ["Engineering Visual Aids - AC Disconnect"],
        inspectionLabel: "AC Disconnect & Wiring Inspection",
      },
      {
        id: "install-pv-modules",
        title: "Install PV Modules",
        references: [
          "Torque settings of End Clamps and Mid Clamps",
          "Harness Clip and Split Loom application",
          "Engineering Visual Aids - PV Modules",
        ],
        inspectionLabel: "PV Modules Inspection",
      },
    ],
  },
  {
    id: "submissions-reviews",
    title: "Submissions & Reviews",
    items: [
      {
        id: "submit-shop-drawings",
        title: "Submit Shop Drawings to ESA",
      },
      {
        id: "pm-review-signoff",
        title: "Project Manager Review & Sign-Off",
      },
    ],
  },
  {
    id: "commissioning-testing",
    title: "Commissioning & Testing",
    items: [
      {
        id: "perform-commissioning",
        title: "Perform Commissioning",
      },
      {
        id: "system-operation",
        title: "System Operation",
        references: ["Manufacturer Specification"],
      },
      {
        id: "drone-thermal-scan",
        title: "Drone Module Thermal Scanning & Photography",
      },
    ],
  },
  {
    id: "regulatory-approvals",
    title: "Regulatory Approvals",
    items: [
      {
        id: "esa-rough-ins-request",
        title: "Submit Request to ESA for Electrical Rough-Ins",
      },
      {
        id: "esa-final-acceptance-request",
        title: "Submit Request to ESA for Final Acceptance",
      },
      {
        id: "submit-der-to-hydro",
        title: "Submit DER to Hydro (SLD + ESA Certificate)",
      },
      {
        id: "der-commissioning",
        title: "DER Commissioning with Hydro Engineers",
      },
      {
        id: "scada-connections",
        title: "SCADA Connections (per DER Form)",
      },
      {
        id: "authorization-to-generate",
        title: "Obtain Authorization to Generate from Hydro",
      },
    ],
  },
  {
    id: "financial",
    title: "Financial",
    items: [
      {
        id: "invoice-10",
        title: "Submit Invoice 10% of TPC",
      },
      {
        id: "invoice-20",
        title: "Submit Invoice 20% of TPC",
      },
      {
        id: "invoice-25",
        title: "Submit Invoice 25% of TPC",
      },
    ],
  },
  {
    id: "project-closeout",
    title: "Project Closeout",
    items: [
      {
        id: "submit-closeout-package",
        title: "Submit Job Closeout Package",
        references: [
          "SLD Commissioning Report",
          "Workmanship Warranty",
          "Operation and Service Manual",
        ],
      },
      {
        id: "close-project",
        title: "Close Project",
      },
    ],
  },
];

const stageFileDefinitions = [
  { key: "site_survey", name: "Site Survey" },
  { key: "pcir", name: "PCIR" },
  { key: "design", name: "Design" },
  { key: "proposal", name: "Proposal" },
  { key: "contract", name: "Contract Signed" },
  { key: "procurement", name: "Procurement" },
  { key: "installation", name: "Installation" },
  { key: "closeout_package", name: "Closeout Package" },
];

const dealStageFlow: readonly DealFlowItem[] = [
  {
    key: "site_survey",
    label: "Site Survey",
    projectStage: "lead_created",
    stageCardKey: "site_survey",
  },
  {
    key: "pcir",
    label: "PCIR",
    projectStage: "design_started",
    stageCardKey: "pcir",
  },
  {
    key: "design",
    label: "Design",
    projectStage: "design_approved",
    stageCardKey: "design",
  },
  {
    key: "proposal",
    label: "Proposal",
    projectStage: "proposal_approved",
    stageCardKey: "proposal",
  },
  {
    key: "contract_signed",
    label: "Contract Signed",
    projectStage: "contract_signed",
    stageCardKey: "contract",
  },
  {
    key: "procurement",
    label: "Procurement",
    projectStage: "qa_passed",
    stageCardKey: "procurement",
  },
  {
    key: "installation",
    label: "Installation",
    projectStage: "build_started",
    stageCardKey: "installation",
  },
  {
    key: "closeout_package",
    label: "Closeout Package",
    projectStage: "closeout_delivered",
    stageCardKey: "closeout_package",
  },
] as const;

const projectStageToFlowKey: Record<string, DealFlowItem["key"]> = {
  lead_created: "site_survey",
  design_started: "pcir",
  design_approved: "design",
  proposal_approved: "proposal",
  contract_signed: "contract_signed",
  qa_passed: "procurement",
  build_started: "installation",
  commissioned: "closeout_package",
  closeout_delivered: "closeout_package",
};

const flowKeyToStageCardKey = Object.fromEntries(
  dealStageFlow.map((step) => [step.key, step.stageCardKey]),
) as Record<DealFlowItem["key"], string>;

const AdminProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, hasRole } = useAuth();
  const [activeTab, setActiveTab] = useState("installation");
  const [teamDialogOpen, setTeamDialogOpen] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    project_type: "rooftop",
    client_type: "residential",
    stage: "lead_created",
    capacity_kw: "",
    estimated_cost: "",
    start_date: "",
    target_completion: "",
    client_id: "",
    site_id: "",
    organization_id: "",
    is_client_portal_active: true,
    show_documents_to_client: true,
    show_milestones_to_client: true,
    show_photos_to_client: true,
  });

  const [teamForm, setTeamForm] = useState({
    user_id: "",
    role: "engineering",
  });

  const [docDialogOpen, setDocDialogOpen] = useState(false);
  const [docUploadDialogOpen, setDocUploadDialogOpen] = useState(false);
  const [docVersionHistoryOpen, setDocVersionHistoryOpen] = useState(false);
  const [docEditDialogOpen, setDocEditDialogOpen] = useState(false);
  const [docStateDialogOpen, setDocStateDialogOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [docSearch, setDocSearch] = useState("");
  const [docStateFilter, setDocStateFilter] = useState("all");
  const [newDocState, setNewDocState] = useState("");

  const [docForm, setDocForm] = useState({
    name: "",
    description: "",
    state: "draft",
    document_type: "drawing",
    category: "design",
    is_client_visible: true,
  });

  const [docEditForm, setDocEditForm] = useState({
    name: "",
    description: "",
    document_type: "",
    category: "",
    is_client_visible: true,
  });

  const { data: projectDocuments = [], isLoading: isDocsLoading } = useQuery({
    queryKey: ["project-documents", id],
    queryFn: async () => {
      if (!id) return [];
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .eq("project_id", id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const createDocMutation = useMutation({
    mutationFn: async () => {
      if (!id || !user?.id) return;
      const { error } = await supabase.from("documents").insert({
        name: docForm.name,
        description: docForm.description || null,
        project_id: id,
        state: docForm.state as any,
        document_type: docForm.document_type,
        category: docForm.category,
        is_client_visible: docForm.is_client_visible,
        uploaded_by: user.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-documents", id] });
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      setDocDialogOpen(false);
      setDocForm({
        name: "",
        description: "",
        state: "draft",
        document_type: "drawing",
        category: "design",
        is_client_visible: true,
      });
      toast({ title: "Document created successfully" });
    },
    onError: (e: any) =>
      toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const updateDocMutation = useMutation({
    mutationFn: async () => {
      if (!selectedDoc) return;
      const { error } = await supabase
        .from("documents")
        .update({
          name: docEditForm.name,
          description: docEditForm.description,
          document_type: docEditForm.document_type,
          category: docEditForm.category,
          is_client_visible: docEditForm.is_client_visible,
        })
        .eq("id", selectedDoc.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-documents", id] });
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      setDocEditDialogOpen(false);
      toast({ title: "Document updated successfully" });
    },
    onError: (e: any) =>
      toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const transitionDocStateMutation = useMutation({
    mutationFn: async () => {
      if (!selectedDoc || !user?.id) return;
      const { error } = await supabase
        .from("documents")
        .update({
          state: newDocState as any,
          updated_at: new Date().toISOString(),
          ...(newDocState === "afc"
            ? {
                approved_by: user.id,
                approved_at: new Date().toISOString(),
              }
            : {}),
          ...(newDocState === "in_review"
            ? {
                reviewed_by: user.id,
                reviewed_at: new Date().toISOString(),
              }
            : {}),
        })
        .eq("id", selectedDoc.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-documents", id] });
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      setDocStateDialogOpen(false);
      toast({ title: "Document state updated successfully" });
    },
    onError: (e: any) =>
      toast({
        title: "State transition failed",
        description: e.message,
        variant: "destructive",
      }),
  });

  const updateDocVisibilityMutation = useMutation({
    mutationFn: async ({
      docId,
      isClientVisible,
    }: {
      docId: string;
      isClientVisible: boolean;
    }) => {
      const { error } = await supabase
        .from("documents")
        .update({ is_client_visible: isClientVisible })
        .eq("id", docId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-documents", id] });
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
    onError: (e: any) =>
      toast({
        title: "Visibility update failed",
        description: e.message,
        variant: "destructive",
      }),
  });

  const downloadProjectDoc = async (doc: any) => {
    try {
      const { data: versions } = await supabase
        .from("document_versions")
        .select("file_path, version_number")
        .eq("document_id", doc.id)
        .order("version_number", { ascending: false })
        .limit(1);

      if (versions && versions.length > 0) {
        const { data, error } = await supabase.storage
          .from("project-documents")
          .download(versions[0].file_path);

        if (error) throw error;

        try {
          await supabase.rpc("log_document_download" as never, {
            doc_id: doc.id,
            version_num: versions[0].version_number,
          } as never);
        } catch (e) {
          // graceful degradation
        }

        const url = URL.createObjectURL(data);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${doc.name}_v${versions[0].version_number}`;
        a.click();
        URL.revokeObjectURL(url);

        toast({ title: "Download started" });
      } else {
        toast({
          title: "No file available",
          description: "Upload a file first",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Download failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  const [checklistState, setChecklistState] = useState<ChecklistState>({});
  const [checklistRunId, setChecklistRunId] = useState<string | null>(null);
  const [uploadingItemId, setUploadingItemId] = useState<string | null>(null);
  const [activeInstallationSection, setActiveInstallationSection] =
    useState<string>("");
  const [installationSections, setInstallationSections] = useState<
    ChecklistSectionDefinition[]
  >(defaultInstallationChecklistSections);
  const [newInstallationStageTitle, setNewInstallationStageTitle] =
    useState("");
  const [newInstallationSectionTitle, setNewInstallationSectionTitle] =
    useState("");
  const [selectedSectionForNewActivity, setSelectedSectionForNewActivity] =
    useState("");
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editingSectionTitle, setEditingSectionTitle] = useState("");
  const [selectedFlowKey, setSelectedFlowKey] =
    useState<DealFlowItem["key"]>("site_survey");
  const [stageFilesState, setStageFilesState] = useState<
    Record<string, StageFileRow>
  >({});
  const [uploadingStageKey, setUploadingStageKey] = useState<string | null>(
    null,
  );
  const [showNewOrganization, setShowNewOrganization] = useState(false);
  const [newOrganizationName, setNewOrganizationName] = useState("");
  const [newOrganizationAddress, setNewOrganizationAddress] = useState("");
  const [newOrganizationPhone, setNewOrganizationPhone] = useState("");
  const [newOrganizationEmail, setNewOrganizationEmail] = useState("");
  const [showNewSite, setShowNewSite] = useState(false);
  const [newSiteName, setNewSiteName] = useState("");
  const [newSiteAddress, setNewSiteAddress] = useState("");
  const [newSiteClientId, setNewSiteClientId] = useState("");
  const [newSiteLatitude, setNewSiteLatitude] = useState("");
  const [newSiteLongitude, setNewSiteLongitude] = useState("");
  const [deletingChecklistFilePath, setDeletingChecklistFilePath] = useState<
    string | null
  >(null);
  const [deletingStageFilePath, setDeletingStageFilePath] = useState<
    string | null
  >(null);
  const stageCardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const installationSectionRefs = useRef<Record<string, HTMLDivElement | null>>(
    {},
  );

  const allInstallationChecklistItems = useMemo(
    () => installationSections.flatMap((section) => section.items),
    [installationSections],
  );

  const scrollInstallationSectionToTop = (sectionId: string) => {
    const sectionNode = installationSectionRefs.current[sectionId];
    if (!sectionNode) return;

    const targetY =
      sectionNode.getBoundingClientRect().top + window.scrollY - 110;
    window.scrollTo({ top: Math.max(0, targetY), behavior: "auto" });

    const scrollables = sectionNode.querySelectorAll<HTMLElement>(
      "[data-radix-scroll-area-viewport], [data-radix-select-viewport], [data-radix-accordion-content], .overflow-auto, .overflow-y-auto",
    );
    scrollables.forEach((el) => {
      el.scrollTop = 0;
    });
  };

  const { data: project, isLoading } = useQuery({
    queryKey: ["project", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id!)
        .single();
      if (error) throw error;

      // Populate form
      setForm({
        name: data.name,
        description: data.description || "",
        project_type: data.project_type,
        client_type: data.client_type || "residential",
        stage: data.stage,
        capacity_kw: data.capacity_kw?.toString() || "",
        estimated_cost: data.estimated_cost?.toString() || "",
        start_date: data.start_date || "",
        target_completion: data.target_completion || "",
        client_id: data.client_id || "",
        site_id: data.site_id || "",
        organization_id: data.organization_id || "",
        is_client_portal_active: data.is_client_portal_active ?? true,
        show_documents_to_client: data.show_documents_to_client ?? true,
        show_milestones_to_client: data.show_milestones_to_client ?? true,
        show_photos_to_client: data.show_photos_to_client ?? true,
      });

      return data;
    },
    enabled: !!id,
  });

  const { data: team = [] } = useQuery({
    queryKey: ["project-team", id],
    queryFn: async () => {
      const { data: assignments, error } = await supabase
        .from("project_assignments")
        .select("*")
        .eq("project_id", id!);
      if (error) throw error;
      if (!assignments || assignments.length === 0) return [];

      const userIds = assignments.map((a) => a.user_id);
      const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("user_id, full_name, email")
        .in("user_id", userIds);

      if (profileError) throw profileError;

      return assignments.map((a) => ({
        ...a,
        profiles: profiles.find((p) => p.user_id === a.user_id) || null,
      }));
    },
    enabled: !!id,
  });

  const { data: users = [] } = useQuery({
    queryKey: ["users-for-assignment"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, full_name, email")
        .order("full_name");
      if (error) throw error;
      return data;
    },
  });

  const { data: customers = [] } = useQuery({
    queryKey: ["customers-list"],
    queryFn: async () => {
      const { data: userRoles, error: roleError } = await supabase
        .from("user_roles")
        .select("user_id")
        .in("role", ["client", "customer"]);
      if (roleError) throw roleError;
      if (!userRoles || userRoles.length === 0) return [];

      const userIds = userRoles.map((ur) => ur.user_id);
      const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("user_id, full_name, email")
        .in("user_id", userIds)
        .order("full_name");
      if (profileError) throw profileError;

      const { data: existingClients } = await supabase
        .from("clients")
        .select("id, user_id")
        .in("user_id", userIds);

      return (profiles || []).map((p) => ({
        user_id: p.user_id,
        full_name: p.full_name,
        email: p.email,
        client_id:
          existingClients?.find((c) => c.user_id === p.user_id)?.id ?? null,
      }));
    },
  });

  const { data: sites = [] } = useQuery({
    queryKey: ["sites-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sites")
        .select("id, name")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: organizations = [] } = useQuery({
    queryKey: ["organizations-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("organizations")
        .select("id, name")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: clients = [] } = useQuery({
    queryKey: ["clients-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clients")
        .select("id, name")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const createOrganization = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from("organizations")
        .insert({
          name: newOrganizationName.trim(),
          address: newOrganizationAddress.trim() || null,
          phone: newOrganizationPhone.trim() || null,
          email: newOrganizationEmail.trim() || null,
        })
        .select("id, name")
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (organization) => {
      queryClient.invalidateQueries({ queryKey: ["organizations-list"] });
      setForm((f) => ({ ...f, organization_id: organization.id }));
      setNewOrganizationName("");
      setNewOrganizationAddress("");
      setNewOrganizationPhone("");
      setNewOrganizationEmail("");
      setShowNewOrganization(false);
      toast({ title: "Organization created" });
    },
    onError: (e: any) =>
      toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const createSite = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from("sites")
        .insert({
          name: newSiteName.trim(),
          address: newSiteAddress.trim() || null,
          client_id: newSiteClientId,
          latitude: newSiteLatitude ? parseFloat(newSiteLatitude) : null,
          longitude: newSiteLongitude ? parseFloat(newSiteLongitude) : null,
        })
        .select("id, name")
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (site) => {
      queryClient.invalidateQueries({ queryKey: ["sites-list"] });
      setForm((f) => ({ ...f, site_id: site.id }));
      setNewSiteName("");
      setNewSiteAddress("");
      setNewSiteClientId("");
      setNewSiteLatitude("");
      setNewSiteLongitude("");
      setShowNewSite(false);
      toast({ title: "Site created" });
    },
    onError: (e: any) =>
      toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const { data: checklistRunData } = useQuery({
    queryKey: ["installation-checklist-run", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("checklist_runs")
        .select("id, completed_items")
        .eq("project_id", id!)
        .is("task_id", null)
        .is("template_id", null)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: stageFilesData } = useQuery({
    queryKey: ["project-stage-files", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_stage_files")
        .select("*")
        .eq("project_id", id!)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (!checklistRunData) {
      setChecklistRunId(null);
      return;
    }

    setChecklistRunId(checklistRunData.id);
    const payload = checklistRunData.completed_items;
    if (payload && typeof payload === "object" && !Array.isArray(payload)) {
      setChecklistState(payload as ChecklistState);
    }
  }, [checklistRunData]);

  useEffect(() => {
    if (!id) return;

    const fromDb = new Map(
      (stageFilesData || []).map((row: any) => [row.stage_key, row]),
    );

    const configRow = fromDb.get("installation_config");
    if (configRow?.notes) {
      try {
        const parsed = JSON.parse(configRow.notes);
        if (Array.isArray(parsed?.sections)) {
          setInstallationSections(
            parsed.sections as ChecklistSectionDefinition[],
          );
        }
      } catch {
        setInstallationSections(defaultInstallationChecklistSections);
      }
    }

    const merged = Object.fromEntries(
      stageFileDefinitions.map((stage) => {
        const existing = fromDb.get(stage.key);
        return [
          stage.key,
          {
            id: existing?.id,
            project_id: id,
            stage_key: stage.key,
            stage_name: stage.name,
            notes: existing?.notes || "",
            entered_at: existing?.entered_at || null,
            completed_at: existing?.completed_at || null,
            documents: (existing?.documents as StageFileDocument[]) || [],
          } satisfies StageFileRow,
        ];
      }),
    );

    if (configRow) {
      merged.installation_config = {
        id: configRow.id,
        project_id: id,
        stage_key: "installation_config",
        stage_name: "Installation Config",
        notes: configRow.notes || "",
        entered_at: configRow.entered_at || null,
        completed_at: configRow.completed_at || null,
        documents: (configRow.documents as StageFileDocument[]) || [],
      } satisfies StageFileRow;
    }

    setStageFilesState(merged);
  }, [id, stageFilesData]);

  useEffect(() => {
    const mappedFlow = projectStageToFlowKey[form.stage] || "site_survey";
    setSelectedFlowKey(mappedFlow);
  }, [form.stage]);

  useEffect(() => {
    if (activeTab !== "stage-files") return;

    const targetCardKey =
      flowKeyToStageCardKey[selectedFlowKey] || "site_survey";
    const node = stageCardRefs.current[targetCardKey];

    if (node) {
      window.setTimeout(() => {
        node.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
    }
  }, [activeTab, selectedFlowKey]);

  useEffect(() => {
    if (!activeInstallationSection) return;

    // Run twice to beat accordion animation/layout shifts and avoid opening at bottom.
    window.requestAnimationFrame(() => {
      scrollInstallationSectionToTop(activeInstallationSection);
      window.setTimeout(() => {
        scrollInstallationSectionToTop(activeInstallationSection);
      }, 140);
    });
  }, [activeInstallationSection]);

  useEffect(() => {
    if (installationSections.length === 0) {
      setSelectedSectionForNewActivity("");
      return;
    }

    const sectionExists = installationSections.some(
      (section) => section.id === selectedSectionForNewActivity,
    );

    if (!selectedSectionForNewActivity || !sectionExists) {
      const preferredSection = installationSections.some(
        (section) => section.id === "installation",
      )
        ? "installation"
        : installationSections[0].id;
      setSelectedSectionForNewActivity(preferredSection);
    }
  }, [installationSections, selectedSectionForNewActivity]);

  const updateProject = useMutation({
    mutationFn: async () => {
      try {
        let resolvedClientId: string | null = null;
        if (form.client_id && form.client_id !== "none") {
          // Robust client mapping with limit(1) to avoid PGRST116 multiple-rows error
          const { data: existingClient, error: existError } = await supabase
            .from("clients")
            .select("id")
            .eq("user_id", form.client_id)
            .limit(1)
            .maybeSingle();

          if (existError) {
            console.error("Error fetching client by user_id:", existError);
            throw new Error(`DB Error on client lookup: ${existError.message}`);
          }

          if (existingClient?.id) {
            resolvedClientId = existingClient.id;
          } else {
            // It might already be a clients.id if no change was made, so let's check
            const { data: existingById, error: existingByIdError } =
              await supabase
                .from("clients")
                .select("id")
                .eq("id", form.client_id)
                .maybeSingle();

            if (existingById?.id) {
              resolvedClientId = existingById.id;
            } else {
              // Auto-create missing client record for this customer
              const selectedCustomer = customers.find(
                (c) => c.user_id === form.client_id,
              );
              const { data: newClient, error: clientError } = await supabase
                .from("clients")
                .insert({
                  name:
                    selectedCustomer?.full_name ||
                    selectedCustomer?.email ||
                    "Customer",
                  email: selectedCustomer?.email || null,
                  user_id: form.client_id,
                })
                .select("id")
                .single();

              if (clientError) {
                console.error("Error inserting new client:", clientError);
                throw new Error(
                  `DB Error creating client profile: ${clientError.message}`,
                );
              }
              resolvedClientId = newClient.id;
            }
          }
        }

        const projectPayload = {
          name: form.name,
          description: form.description || null,
          project_type: form.project_type as any,
          client_type: form.client_type,
          stage: form.stage as any,
          capacity_kw: form.capacity_kw ? parseFloat(form.capacity_kw) : null,
          estimated_cost: form.estimated_cost
            ? parseFloat(form.estimated_cost)
            : null,
          start_date: form.start_date || null,
          target_completion: form.target_completion || null,
          client_id: resolvedClientId || null,
          site_id: form.site_id || null,
          organization_id: form.organization_id || null,
          is_client_portal_active: form.is_client_portal_active,
          show_documents_to_client: form.show_documents_to_client,
          show_milestones_to_client: form.show_milestones_to_client,
          show_photos_to_client: form.show_photos_to_client,
        };

        console.log("Updating project payload:", projectPayload);

        const { error: projectError } = await supabase
          .from("projects")
          .update(projectPayload)
          .eq("id", id!);

        if (projectError) {
          console.error("Error updating project:", projectError);
          // Append the resolved client_id to the error message so the UI toast shows us EXACTLY what was sent!
          throw new Error(
            `Project Update Failed: ${projectError.message}. [Debug payload_client_id: ${resolvedClientId || "null"}]`,
          );
        }
      } catch (err: any) {
        console.error("Update project top-level catch:", err);
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", id] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast({ title: "Project updated" });
    },
    onError: (e: any) =>
      toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteProject = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("projects").delete().eq("id", id!);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast({ title: "Project deleted" });
      navigate("/admin/projects");
    },
    onError: (e: any) =>
      toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const addTeamMember = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("project_assignments").insert({
        project_id: id!,
        user_id: teamForm.user_id,
        role: teamForm.role as any,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-team", id] });
      setTeamDialogOpen(false);
      setTeamForm({ user_id: "", role: "engineering" });
      toast({ title: "Team member added" });
    },
    onError: (e: any) =>
      toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const removeTeamMember = useMutation({
    mutationFn: async (assignmentId: string) => {
      const { error } = await supabase
        .from("project_assignments")
        .delete()
        .eq("id", assignmentId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-team", id] });
      toast({ title: "Team member removed" });
    },
  });

  const saveChecklistStateMutation = useMutation({
    mutationFn: async (nextState: ChecklistState) => {
      if (!id || !user?.id) return;

      const completedCount = allInstallationChecklistItems.filter(
        (item) => nextState[item.id]?.completed,
      ).length;
      const status =
        completedCount === allInstallationChecklistItems.length
          ? "completed"
          : "in_progress";

      if (checklistRunId) {
        const { error } = await supabase
          .from("checklist_runs")
          .update({
            completed_items: nextState as any,
            completed_by: user.id,
            status,
            completed_at:
              status === "completed" ? new Date().toISOString() : null,
          } as any)
          .eq("id", checklistRunId);

        if (error) throw error;
        return;
      }

      const { data, error } = await supabase
        .from("checklist_runs")
        .insert({
          project_id: id,
          completed_items: nextState as any,
          completed_by: user.id,
          status,
          completed_at:
            status === "completed" ? new Date().toISOString() : null,
        } as any)
        .select("id")
        .single();

      if (error) throw error;
      setChecklistRunId(data.id);
    },
    onError: (e: any) =>
      toast({
        title: "Error",
        description: e.message || "Failed to save checklist",
        variant: "destructive",
      }),
  });

  const saveStageFileRowMutation = useMutation({
    mutationFn: async (row: StageFileRow) => {
      const payload = {
        project_id: row.project_id,
        stage_key: row.stage_key,
        stage_name: row.stage_name,
        notes: row.notes,
        entered_at: row.entered_at,
        completed_at: row.completed_at,
        documents: row.documents as any,
      };

      const { data, error } = await supabase
        .from("project_stage_files")
        .upsert(payload as any, { onConflict: "project_id,stage_key" })
        .select("*")
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (saved: any) => {
      setStageFilesState((prev) => ({
        ...prev,
        [saved.stage_key]: {
          ...prev[saved.stage_key],
          ...saved,
          documents: (saved.documents as StageFileDocument[]) || [],
        },
      }));
    },
    onError: (e: any) =>
      toast({
        title: "Error",
        description: e.message || "Failed to save stage files",
        variant: "destructive",
      }),
  });

  const uploadStageFileMutation = useMutation({
    mutationFn: async ({
      stageKey,
      file,
    }: {
      stageKey: string;
      file: File;
    }) => {
      if (!id) throw new Error("Project ID is required");

      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const filePath = `project-stage-files/${id}/${stageKey}/${Date.now()}-${safeName}`;

      const { error: uploadError } = await supabase.storage
        .from("project-documents")
        .upload(filePath, file, { upsert: false });

      if (uploadError) throw uploadError;

      return {
        file_path: filePath,
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type,
        uploaded_at: new Date().toISOString(),
        is_client_visible: true,
      } as StageFileDocument;
    },
    onError: (e: any) =>
      toast({
        title: "Upload failed",
        description: e.message || "Could not upload stage file",
        variant: "destructive",
      }),
  });

  const uploadChecklistFileMutation = useMutation({
    mutationFn: async ({ itemId, file }: { itemId: string; file: File }) => {
      if (!id) throw new Error("Project ID is required");

      const fileExt = file.name.split(".").pop()?.toLowerCase() || "bin";
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const filePath = `installation-checklists/${id}/${itemId}/${Date.now()}-${safeName}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("project-documents")
        .upload(filePath, file, { upsert: false });

      if (uploadError) throw uploadError;

      return {
        file_path: filePath,
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type,
        uploaded_at: new Date().toISOString(),
      } as ChecklistFileMeta;
    },
    onError: (e: any) =>
      toast({
        title: "Upload failed",
        description: e.message || "Could not upload file",
        variant: "destructive",
      }),
  });

  if (isLoading) return <div className="p-6">Loading...</div>;
  if (!project) return <div className="p-6">Project not found</div>;

  const canCustomizeInstallation = hasRole("admin");

  const currentStage = form.stage || project.stage;
  const stageIndex = dealStageFlow.findIndex(
    (stage) => stage.key === selectedFlowKey,
  );
  const completedActivities = allInstallationChecklistItems.filter(
    (item) => checklistState[item.id]?.completed,
  ).length;
  const totalActivities = allInstallationChecklistItems.length;
  const installationProgress =
    totalActivities > 0
      ? Math.round((completedActivities / totalActivities) * 100)
      : 0;
  const selectedCustomer = customers.find(
    (c) => c.client_id === project.client_id,
  );
  const selectedStageCardKey =
    flowKeyToStageCardKey[selectedFlowKey] || "site_survey";
  const selectedStageDefinition =
    stageFileDefinitions.find((stage) => stage.key === selectedStageCardKey) ||
    stageFileDefinitions[0];
  const customerLabel =
    selectedCustomer?.full_name || selectedCustomer?.email || "Customer WO";

  const getChecklistItemState = (itemId: string) =>
    checklistState[itemId] ?? {
      notes: "",
      inspection: null,
      completed: false,
      files: [],
    };

  const updateChecklistItemState = (
    itemId: string,
    patch: Partial<{
      notes: string;
      inspection: "pass" | "fail" | null;
      completed: boolean;
      files: ChecklistFileMeta[];
    }>,
    options?: { persist?: boolean },
  ) => {
    setChecklistState((prev) => {
      const nextState = {
        ...prev,
        [itemId]: {
          ...getChecklistItemState(itemId),
          ...patch,
        },
      };

      if (options?.persist) {
        saveChecklistStateMutation.mutate(nextState);
      }

      return nextState;
    });
  };

  const handleChecklistFileUpload = async (
    itemId: string,
    files?: FileList | File[] | File | null,
  ) => {
    if (!files) return;

    const fileArray =
      files instanceof FileList
        ? Array.from(files)
        : Array.isArray(files)
          ? files
          : [files];
    if (fileArray.length === 0) return;

    setUploadingItemId(itemId);

    try {
      const uploadedFiles: ChecklistFileMeta[] = [];
      for (const file of fileArray) {
        const uploadedFile = await uploadChecklistFileMutation.mutateAsync({
          itemId,
          file,
        });
        uploadedFiles.push(uploadedFile);
      }

      const currentState = getChecklistItemState(itemId);
      const nextState = {
        ...checklistState,
        [itemId]: {
          ...currentState,
          files: [...currentState.files, ...uploadedFiles],
        },
      };

      setChecklistState(nextState);
      saveChecklistStateMutation.mutate(nextState);
      toast({
        title: fileArray.length > 1 ? "Files uploaded" : "File uploaded",
        description: `Successfully added ${fileArray.length} document(s)`,
      });
    } finally {
      setUploadingItemId(null);
    }
  };

  const openChecklistFile = async (filePath: string) => {
    const { data, error } = await supabase.storage
      .from("project-documents")
      .createSignedUrl(filePath, 3600);

    if (error || !data?.signedUrl) {
      toast({
        title: "Unable to open file",
        description: error?.message || "Signed URL could not be created",
        variant: "destructive",
      });
      return;
    }

    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  };

  const handleChecklistFileDelete = async (itemId: string, filePath: string) => {
    setDeletingChecklistFilePath(filePath);

    try {
      const { error: storageError } = await supabase.storage
        .from("project-documents")
        .remove([filePath]);

      if (storageError) throw storageError;

      const currentState = getChecklistItemState(itemId);
      const nextState = {
        ...checklistState,
        [itemId]: {
          ...currentState,
          files: currentState.files.filter((file) => file.file_path !== filePath),
        },
      };

      setChecklistState(nextState);
      saveChecklistStateMutation.mutate(nextState);
      toast({ title: "File removed" });
    } catch (error: any) {
      toast({
        title: "Delete failed",
        description: error?.message || "Could not remove file",
        variant: "destructive",
      });
    } finally {
      setDeletingChecklistFilePath(null);
    }
  };

  const handleStageFileDelete = async (stageKey: string, filePath: string) => {
    const row = stageFilesState[stageKey];
    if (!row) return;

    setDeletingStageFilePath(filePath);

    try {
      const { error: storageError } = await supabase.storage
        .from("project-documents")
        .remove([filePath]);

      if (storageError) throw storageError;

      const nextDocuments = row.documents.filter(
        (doc) => doc.file_path !== filePath,
      );

      const updatedRow = {
        ...row,
        documents: nextDocuments,
      };

      setStageFilesState((prev) => ({
        ...prev,
        [stageKey]: updatedRow,
      }));

      saveStageFileRowMutation.mutate({
        ...updatedRow,
        entered_at: updatedRow.entered_at || new Date().toISOString(),
      });

      toast({ title: "File removed" });
    } catch (error: any) {
      toast({
        title: "Delete failed",
        description: error?.message || "Could not remove file",
        variant: "destructive",
      });
    } finally {
      setDeletingStageFilePath(null);
    }
  };

  const updateStageFileVisibility = async (
    stageKey: string,
    filePath: string,
    isClientVisible: boolean,
  ) => {
    const row = stageFilesState[stageKey];
    if (!row) return;

    const nextDocuments = row.documents.map((doc) =>
      doc.file_path === filePath
        ? { ...doc, is_client_visible: isClientVisible }
        : doc,
    );

    const updatedRow = {
      ...row,
      documents: nextDocuments,
    };

    setStageFilesState((prev) => ({
      ...prev,
      [stageKey]: updatedRow,
    }));

    saveStageFileRowMutation.mutate({
      ...updatedRow,
      entered_at: updatedRow.entered_at || new Date().toISOString(),
    });
  };

  const formatDateTime = (value: string | null) => {
    if (!value) return "-";
    return new Date(value).toLocaleString(undefined, {
      month: "short",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleStageNotesBlur = (stageKey: string) => {
    const row = stageFilesState[stageKey];
    if (!row) return;

    const nowIso = new Date().toISOString();
    saveStageFileRowMutation.mutate({
      ...row,
      entered_at: row.entered_at || nowIso,
      completed_at: row.completed_at || nowIso,
    });
  };

  const persistInstallationConfig = (
    sections: ChecklistSectionDefinition[],
  ) => {
    if (!id) return;

    saveStageFileRowMutation.mutate({
      project_id: id,
      stage_key: "installation_config",
      stage_name: "Installation Config",
      notes: JSON.stringify({ sections }),
      entered_at: null,
      completed_at: null,
      documents: [],
    });
  };

  const makeSectionId = (title: string) => {
    const slug = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    return `${slug || "section"}-${Date.now()}`;
  };

  const startEditingSection = (section: ChecklistSectionDefinition) => {
    setEditingSectionId(section.id);
    setEditingSectionTitle(section.title);
  };

  const saveSectionTitle = (sectionId: string) => {
    const title = editingSectionTitle.trim();
    if (!title) return;

    const nextSections = installationSections.map((section) =>
      section.id === sectionId ? { ...section, title } : section,
    );

    setInstallationSections(nextSections);
    setEditingSectionId(null);
    setEditingSectionTitle("");
    persistInstallationConfig(nextSections);
  };

  const removeInstallationSection = (sectionId: string) => {
    if (installationSections.length <= 1) {
      toast({
        title: "Cannot delete section",
        description: "At least one installation section is required.",
        variant: "destructive",
      });
      return;
    }

    const sectionToRemove = installationSections.find(
      (section) => section.id === sectionId,
    );
    if (!sectionToRemove) return;

    const removedItemIds = new Set(sectionToRemove.items.map((item) => item.id));
    const nextSections = installationSections.filter(
      (section) => section.id !== sectionId,
    );

    setInstallationSections(nextSections);

    if (activeInstallationSection === sectionId) {
      setActiveInstallationSection("");
    }

    setChecklistState((prev) => {
      if (removedItemIds.size === 0) return prev;

      const nextState = { ...prev };
      removedItemIds.forEach((itemId) => {
        delete nextState[itemId];
      });

      saveChecklistStateMutation.mutate(nextState);
      return nextState;
    });

    persistInstallationConfig(nextSections);
  };

  const addInstallationStage = () => {
    const title = newInstallationStageTitle.trim();
    if (!title) return;

    const shouldCreateSection =
      selectedSectionForNewActivity === CREATE_NEW_SECTION_OPTION;
    const resolvedSectionTitle = newInstallationSectionTitle.trim();

    if (shouldCreateSection && !resolvedSectionTitle) {
      toast({
        title: "Section name required",
        description: "Enter a section name when creating a new section.",
        variant: "destructive",
      });
      return;
    }

    const targetSectionId = shouldCreateSection
      ? makeSectionId(resolvedSectionTitle)
      : selectedSectionForNewActivity;

    if (!targetSectionId) return;

    const newItem: ChecklistItemDefinition = {
      id: `custom-${Date.now()}`,
      title,
    };

    const baseSections = shouldCreateSection
      ? [
        ...installationSections,
        {
          id: targetSectionId,
          title: resolvedSectionTitle,
          items: [],
        },
      ]
      : installationSections;

    const nextSections = baseSections.map((section) =>
      section.id === targetSectionId
        ? { ...section, items: [...section.items, newItem] }
        : section,
    );

    setInstallationSections(nextSections);
    setNewInstallationStageTitle("");
    if (shouldCreateSection) {
      setSelectedSectionForNewActivity(targetSectionId);
      setNewInstallationSectionTitle("");
      setActiveInstallationSection(targetSectionId);
    }
    persistInstallationConfig(nextSections);
  };

  const removeInstallationStage = (itemId: string) => {
    const nextSections = installationSections.map((section) =>
      section.items.some((item) => item.id === itemId)
        ? {
          ...section,
          items: section.items.filter((item) => item.id !== itemId),
        }
        : section,
    );

    setInstallationSections(nextSections);
    setChecklistState((prev) => {
      const nextState = { ...prev };
      delete nextState[itemId];
      saveChecklistStateMutation.mutate(nextState);
      return nextState;
    });
    persistInstallationConfig(nextSections);
  };

  const handleStageFileUpload = async (
    stageKey: string,
    files?: FileList | File[] | File | null,
  ) => {
    if (!files) return;

    const fileArray =
      files instanceof FileList
        ? Array.from(files)
        : Array.isArray(files)
          ? files
          : [files];
    if (fileArray.length === 0) return;

    const currentRow = stageFilesState[stageKey];
    if (!currentRow) return;

    setUploadingStageKey(stageKey);

    try {
      const uploadedDocuments: StageFileDocument[] = [];

      for (const file of fileArray) {
        const uploadedFile = await uploadStageFileMutation.mutateAsync({
          stageKey,
          file,
        });
        uploadedDocuments.push(uploadedFile);
      }

      const nowIso = new Date().toISOString();
      const nextRow: StageFileRow = {
        ...currentRow,
        entered_at: currentRow.entered_at || nowIso,
        completed_at: currentRow.completed_at || nowIso,
        documents: [...currentRow.documents, ...uploadedDocuments],
      };

      setStageFilesState((prev) => ({
        ...prev,
        [stageKey]: nextRow,
      }));

      await saveStageFileRowMutation.mutateAsync(nextRow);

      toast({
        title: fileArray.length > 1 ? "Files uploaded" : "File uploaded",
        description: `Successfully added ${fileArray.length} document(s)`,
      });
    } catch (error: any) {
      console.error("Multi-upload failed:", error);
    } finally {
      setUploadingStageKey(null);
    }
  };

  const openStageFile = async (filePath: string) => {
    const { data, error } = await supabase.storage
      .from("project-documents")
      .createSignedUrl(filePath, 3600);

    if (error || !data?.signedUrl) {
      toast({
        title: "Unable to open file",
        description: error?.message || "Signed URL could not be created",
        variant: "destructive",
      });
      return;
    }

    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="space-y-6 animate-slide-in">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/admin/projects")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setActiveTab("details")}>
            <Pencil className="h-4 w-4 mr-2" /> Edit
          </Button>
          <Button
            variant="destructive"
            onClick={() => deleteProject.mutate()}
            disabled={deleteProject.isPending}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {deleteProject.isPending ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>

      <div>
        <h1 className="text-3xl font-bold">{project.name}</h1>
        <div className="flex items-center gap-2 mt-2">
          <StageBadge stage={currentStage} />
          <span className="text-sm text-muted-foreground">{customerLabel}</span>
        </div>
      </div>

      <Card className="border-border/50 bg-card/70">
        <CardContent className="p-4 md:p-5 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-foreground/80">
              Project Workflow
            </p>
            <p className="text-xs text-muted-foreground">
              Click any step to jump to its section
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
            {dealStageFlow.map((stage, index) => {
              const isCurrent = selectedFlowKey === stage.key;
              const isCompleted = stageIndex >= 0 && index < stageIndex;

              return (
                <Button
                  key={stage.key}
                  type="button"
                  variant="outline"
                  className={
                    `h-12 justify-start rounded-xl px-4 text-base transition-all ` +
                    (isCurrent
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : isCompleted
                        ? "border-primary/50 text-primary bg-primary/5"
                        : "text-foreground hover:border-primary/40")
                  }
                  onClick={() => {
                    setSelectedFlowKey(stage.key);
                    if (stage.key === "installation") {
                      setActiveTab("installation");
                    } else {
                      setActiveTab("stage-files");
                    }
                    if (stage.projectStage) {
                      setForm((f) => ({
                        ...f,
                        stage: stage.projectStage,
                      }));
                    }
                  }}
                >
                  <span className="truncate capitalize">{stage.label}</span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="h-auto flex-wrap">
          <TabsTrigger value="stage-files">Project Dashboard</TabsTrigger>
          <TabsTrigger value="installation">Installation</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="team">Team ({team.length})</TabsTrigger>
          <TabsTrigger value="tasks">Tasks (0)</TabsTrigger>
          <TabsTrigger value="documents">Project Documents</TabsTrigger>
        </TabsList>



        <TabsContent value="stage-files" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {stageFileDefinitions.map((stage) => {
              const row = stageFilesState[stage.key] || {
                project_id: id!,
                stage_key: stage.key,
                stage_name: stage.name,
                notes: "",
                entered_at: null,
                completed_at: null,
                documents: [],
              };

              const isCurrent = selectedStageCardKey === stage.key;

              return (
                <Card
                  key={stage.key}
                  ref={(node) => {
                    stageCardRefs.current[stage.key] = node;
                  }}
                  className={isCurrent ? "border-primary/70 shadow-sm" : ""}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <span>{stage.name}</span>
                      {isCurrent && <Badge className="text-xs">Current</Badge>}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium">
                          Documents ({row.documents.length})
                        </p>
                        <Label
                          htmlFor={`stage-file-${stage.key}`}
                          className="inline-flex h-8 items-center justify-center rounded-md border border-input bg-background px-3 text-xs font-medium cursor-pointer hover:bg-accent hover:text-accent-foreground"
                        >
                          {uploadingStageKey === stage.key ? (
                            <>
                              <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                              Uploading
                            </>
                          ) : (
                            <>
                              <Upload className="h-3.5 w-3.5 mr-1.5" />
                              Upload
                            </>
                          )}
                        </Label>
                        <Input
                          id={`stage-file-${stage.key}`}
                          type="file"
                          accept="image/*,.pdf"
                          className="hidden"
                          multiple
                          disabled={uploadingStageKey === stage.key}
                          onChange={(e) => {
                            handleStageFileUpload(stage.key, e.target.files);
                            e.currentTarget.value = "";
                          }}
                        />
                      </div>

                      {row.documents.length === 0 ? (
                        <p className="text-xs text-muted-foreground">
                          No files uploaded
                        </p>
                      ) : (
                        <div className="space-y-1">
                          {row.documents.map((doc) => (
                            <div
                              key={doc.file_path}
                              className="w-full text-xs border rounded-md px-2 py-1.5 flex items-center gap-2"
                            >
                              <button
                                type="button"
                                onClick={() => openStageFile(doc.file_path)}
                                className="flex-1 min-w-0 text-left hover:bg-accent/50 transition-colors rounded px-1.5 py-1"
                              >
                                <span className="truncate flex items-center gap-1.5">
                                  <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                                  {doc.file_name}
                                </span>
                              </button>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-muted-foreground">
                                  Client
                                </span>
                                <Switch
                                  checked={doc.is_client_visible ?? true}
                                  onCheckedChange={(checked) =>
                                    updateStageFileVisibility(
                                      stage.key,
                                      doc.file_path,
                                      checked,
                                    )
                                  }
                                />
                              </div>
                              <span className="text-muted-foreground whitespace-nowrap">
                                {(doc.file_size / 1024).toFixed(0)} KB
                              </span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                                disabled={deletingStageFilePath === doc.file_path}
                                onClick={() => {
                                  if (
                                    window.confirm(
                                      "Are you sure you want to delete this file?",
                                    )
                                  ) {
                                    handleStageFileDelete(stage.key, doc.file_path);
                                  }
                                }}
                              >
                                {deletingStageFilePath === doc.file_path ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Trash2 className="h-3.5 w-3.5" />
                                )}
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm">Notes</Label>
                      <Textarea
                        value={row.notes}
                        placeholder={`Notes for ${stage.name} stage...`}
                        onChange={(e) =>
                          setStageFilesState((prev) => ({
                            ...prev,
                            [stage.key]: {
                              ...row,
                              notes: e.target.value,
                            },
                          }))
                        }
                        onBlur={() => handleStageNotesBlur(stage.key)}
                        rows={2}
                      />
                      <div className="flex justify-end">
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => handleStageNotesBlur(stage.key)}
                          disabled={saveStageFileRowMutation.isPending}
                        >
                          {saveStageFileRowMutation.isPending ? "Saving..." : "Save Notes"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="installation" className="space-y-4">
          <Card className="border-border/60">
            <CardContent className="pt-6 flex items-start gap-3">
              <Wrench className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h3 className="text-xl font-semibold">
                  Installation Activities
                </h3>
                <p className="text-muted-foreground">
                  Track all activities from material delivery to project
                  closeout. Each activity supports file uploads (images/PDFs).
                </p>
                {canCustomizeInstallation ? (
                  <div className="mt-4 space-y-3">
                    <p className="text-sm font-medium">Admin Customization</p>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Select
                        value={selectedSectionForNewActivity}
                        onValueChange={setSelectedSectionForNewActivity}
                      >
                        <SelectTrigger className="sm:max-w-sm">
                          <SelectValue placeholder="Select section" />
                        </SelectTrigger>
                        <SelectContent>
                          {installationSections.map((section) => (
                            <SelectItem key={section.id} value={section.id}>
                              {section.title}
                            </SelectItem>
                          ))}
                          <SelectItem value={CREATE_NEW_SECTION_OPTION}>
                            + Create New Section
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {selectedSectionForNewActivity ===
                      CREATE_NEW_SECTION_OPTION ? (
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Input
                          value={newInstallationSectionTitle}
                          onChange={(e) =>
                            setNewInstallationSectionTitle(e.target.value)
                          }
                          placeholder="Enter new section name"
                          className="sm:max-w-sm"
                        />
                      </div>
                    ) : null}

                    <div className="flex flex-col sm:flex-row gap-2">
                      <Input
                        value={newInstallationStageTitle}
                        onChange={(e) =>
                          setNewInstallationStageTitle(e.target.value)
                        }
                        placeholder="Add a custom activity to Installation section"
                        className="sm:max-w-sm"
                      />
                      <Button
                        type="button"
                        onClick={addInstallationStage}
                        disabled={
                          !newInstallationStageTitle.trim() ||
                          !selectedSectionForNewActivity ||
                          (selectedSectionForNewActivity ===
                            CREATE_NEW_SECTION_OPTION &&
                            !newInstallationSectionTitle.trim())
                        }
                      >
                        Add Activity
                      </Button>
                    </div>
                  </div>
                ) : null}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <span>Installation Progress</span>
                <span className="text-4xl font-bold text-primary">
                  {installationProgress}%
                </span>
              </CardTitle>
              <p className="text-muted-foreground text-sm">
                {completedActivities} of {totalActivities} activities completed
              </p>
            </CardHeader>
            <CardContent>
              <Progress value={installationProgress} className="h-3" />
            </CardContent>
          </Card>

          <Accordion
            type="single"
            collapsible
            value={activeInstallationSection}
            onValueChange={(value) => {
              setActiveInstallationSection(value);
            }}
            className="space-y-3"
          >
            {installationSections.map((section) => {
              const sectionCompleted = section.items.filter(
                (item) => checklistState[item.id]?.completed,
              ).length;

              return (
                <AccordionItem
                  key={section.id}
                  value={section.id}
                  className="rounded-lg border bg-card px-4"
                  ref={(node) => {
                    installationSectionRefs.current[section.id] = node;
                  }}
                >
                  <AccordionTrigger className="hover:no-underline py-4">
                    <div className="flex w-full items-center justify-between gap-3 pr-3">
                      {editingSectionId === section.id ? (
                        <div className="flex flex-1 items-center gap-2">
                          <Input
                            value={editingSectionTitle}
                            onChange={(e) =>
                              setEditingSectionTitle(e.target.value)
                            }
                            onClick={(e) => e.stopPropagation()}
                            className="h-8 max-w-sm"
                          />
                          <Button
                            type="button"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              saveSectionTitle(section.id);
                            }}
                            disabled={!editingSectionTitle.trim()}
                          >
                            Save
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingSectionId(null);
                              setEditingSectionTitle("");
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <span className="font-semibold text-left">
                          {section.title}
                        </span>
                      )}

                      <div className="ml-auto flex items-center gap-2">
                        <Badge variant="secondary">
                          {sectionCompleted}/{section.items.length}
                        </Badge>

                        {canCustomizeInstallation &&
                          editingSectionId !== section.id ? (
                          <div className="flex items-center gap-1 rounded-full border border-border bg-muted/30 px-1 py-0.5">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 rounded-full"
                              onClick={(e) => {
                                e.stopPropagation();
                                startEditingSection(section);
                              }}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 rounded-full text-destructive"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Delete section?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will remove the section "{section.title}" and all of its activities from this project.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    Cancel
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removeInstallationSection(section.id);
                                    }}
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4">
                    <div className="space-y-4">
                      {section.items.map((item) => {
                        const itemState = getChecklistItemState(item.id);

                        return (
                          <div
                            key={item.id}
                            className="rounded-xl border border-border/80 p-6 space-y-5"
                          >
                            <div className="flex items-center gap-3">
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className={`h-7 w-7 rounded-md border ${itemState.completed ? "bg-primary/10 border-primary text-primary" : ""}`}
                                onClick={() =>
                                  updateChecklistItemState(
                                    item.id,
                                    {
                                      completed: !itemState.completed,
                                    },
                                    { persist: true },
                                  )
                                }
                              >
                                {itemState.completed ? (
                                  <CircleCheck className="h-4 w-4" />
                                ) : (
                                  <Circle className="h-4 w-4" />
                                )}
                              </Button>
                              <h4 className="text-xl font-semibold leading-tight text-primary">
                                {item.title}
                              </h4>
                              {canCustomizeInstallation && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="ml-auto h-8 w-8 text-destructive"
                                  onClick={() =>
                                    removeInstallationStage(item.id)
                                  }
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>

                            {item.references?.length ? (
                              <div className="rounded-2xl border border-amber-300/70 bg-amber-50/60 p-5 space-y-4">
                                <div className="flex items-center justify-between gap-4">
                                  <div className="min-w-0">
                                    <p className="text-lg font-medium text-amber-900 truncate flex items-center gap-2">
                                      <BookOpen className="h-5 w-5 text-amber-700" />
                                      {item.references[0]}
                                    </p>
                                  </div>
                                  <Label
                                    htmlFor={`visual-file-${item.id}`}
                                    className="inline-flex h-10 items-center justify-center rounded-xl border border-amber-400 bg-background px-4 text-sm font-medium text-amber-700 cursor-pointer hover:bg-amber-100"
                                  >
                                    <Upload className="h-4 w-4 mr-2" /> Upload
                                  </Label>
                                  <Input
                                    id={`visual-file-${item.id}`}
                                    type="file"
                                    className="hidden"
                                    multiple
                                    disabled={uploadingItemId === item.id}
                                    onChange={(e) => {
                                      handleChecklistFileUpload(
                                        item.id,
                                        e.target.files,
                                      );
                                      e.currentTarget.value = "";
                                    }}
                                  />
                                </div>

                                {item.references.slice(1).map((reference) => (
                                  <p
                                    key={reference}
                                    className="text-sm text-amber-800/90"
                                  >
                                    {reference}
                                  </p>
                                ))}

                                <p className="text-sm italic text-muted-foreground">
                                  No files uploaded
                                </p>
                              </div>
                            ) : null}

                            {item.inspectionLabel ? (
                              <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-4 flex items-center justify-between gap-4">
                                <p className="text-lg font-semibold text-blue-800">
                                  {item.inspectionLabel}
                                </p>
                                <div className="flex items-center gap-3">
                                  <Button
                                    type="button"
                                    size="default"
                                    variant={
                                      itemState.inspection === "pass"
                                        ? "default"
                                        : "outline"
                                    }
                                    className="rounded-xl min-w-28"
                                    onClick={() =>
                                      updateChecklistItemState(
                                        item.id,
                                        {
                                          inspection: "pass",
                                        },
                                        { persist: true },
                                      )
                                    }
                                  >
                                    <CircleCheck className="h-4 w-4 mr-2" />
                                    Pass
                                  </Button>
                                  <Button
                                    type="button"
                                    size="default"
                                    variant={
                                      itemState.inspection === "fail"
                                        ? "destructive"
                                        : "outline"
                                    }
                                    className="rounded-xl min-w-28"
                                    onClick={() =>
                                      updateChecklistItemState(
                                        item.id,
                                        {
                                          inspection: "fail",
                                        },
                                        { persist: true },
                                      )
                                    }
                                  >
                                    <Circle className="h-4 w-4 mr-2" />
                                    Fail
                                  </Button>
                                </div>
                              </div>
                            ) : null}

                            <div className="space-y-2">
                              <Label className="text-sm font-semibold">
                                Notes
                              </Label>
                              <Textarea
                                placeholder="Add notes..."
                                value={itemState.notes}
                                className="min-h-24 text-sm"
                                onChange={(e) =>
                                  updateChecklistItemState(item.id, {
                                    notes: e.target.value,
                                  })
                                }
                                onBlur={() =>
                                  saveChecklistStateMutation.mutate({
                                    ...checklistState,
                                    [item.id]: getChecklistItemState(item.id),
                                  })
                                }
                              />
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center justify-between gap-2">
                                <Label className="text-sm font-semibold">
                                  Work Files
                                </Label>
                                <Label
                                  htmlFor={`work-file-${item.id}`}
                                  className="inline-flex h-10 items-center justify-center rounded-xl border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm cursor-pointer hover:bg-accent hover:text-accent-foreground"
                                >
                                  {uploadingItemId === item.id ? (
                                    <>
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                      Uploading...
                                    </>
                                  ) : (
                                    <>
                                      <Upload className="h-4 w-4 mr-2" /> Upload
                                    </>
                                  )}
                                </Label>
                                <Input
                                  id={`work-file-${item.id}`}
                                  type="file"
                                  className="hidden"
                                  multiple
                                  disabled={uploadingItemId === item.id}
                                  onChange={(e) => {
                                    handleChecklistFileUpload(
                                      item.id,
                                      e.target.files,
                                    );
                                    e.currentTarget.value = "";
                                  }}
                                />
                              </div>
                              {itemState.files.length === 0 ? (
                                <p className="text-sm italic text-muted-foreground">
                                  No files uploaded
                                </p>
                              ) : (
                                <div className="space-y-2">
                                  {itemState.files.map((file) => (
                                    <div
                                      key={file.file_path}
                                      className="w-full text-sm border rounded-md px-2 py-1.5 flex items-center gap-2"
                                    >
                                      <button
                                        type="button"
                                        onClick={() =>
                                          openChecklistFile(file.file_path)
                                        }
                                        className="flex-1 min-w-0 text-left hover:bg-accent/50 transition-colors rounded px-1.5 py-1"
                                      >
                                        <span className="truncate flex items-center gap-2">
                                          <FileText className="h-4 w-4 text-muted-foreground" />
                                          {file.file_name}
                                        </span>
                                      </button>
                                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                                        {(file.file_size / 1024).toFixed(0)} KB
                                      </span>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-destructive"
                                        disabled={
                                          deletingChecklistFilePath ===
                                          file.file_path
                                        }
                                        onClick={() =>
                                          handleChecklistFileDelete(
                                            item.id,
                                            file.file_path,
                                          )
                                        }
                                      >
                                        {deletingChecklistFilePath ===
                                          file.file_path ? (
                                          <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                          <Trash2 className="h-4 w-4" />
                                        )}
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </TabsContent>

        <TabsContent value="details" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Project Name</Label>
                  <Input
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Stage</Label>
                  <Select
                    value={form.stage}
                    onValueChange={(v) => setForm((f) => ({ ...f, stage: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {stages.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select
                    value={form.project_type}
                    onValueChange={(v) =>
                      setForm((f) => ({ ...f, project_type: v }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {projectTypes.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Client Type</Label>
                  <Select
                    value={form.client_type}
                    onValueChange={(v) =>
                      setForm((f) => ({ ...f, client_type: v }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="residential">Residential</SelectItem>
                      <SelectItem value="commercial">Commercial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Capacity (kW)</Label>
                  <Input
                    type="number"
                    value={form.capacity_kw}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, capacity_kw: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Estimated Cost ($)</Label>
                  <Input
                    type="number"
                    value={form.estimated_cost}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, estimated_cost: e.target.value }))
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={form.start_date}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, start_date: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Target Completion</Label>
                  <Input
                    type="date"
                    value={form.target_completion}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        target_completion: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Client (Customer User)</Label>
                  <Select
                    value={form.client_id || "none"}
                    onValueChange={(v) =>
                      setForm((f) => ({
                        ...f,
                        client_id: v === "none" ? "" : v,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select client" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {customers.map((c) => (
                        <SelectItem key={c.user_id} value={c.user_id}>
                          {c.full_name || c.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Organization</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      className="h-7 px-2 text-xs"
                      onClick={() => setShowNewOrganization((prev) => !prev)}
                    >
                      {showNewOrganization ? "Cancel" : "+ New"}
                    </Button>
                  </div>
                  <Select
                    value={form.organization_id || "none"}
                    onValueChange={(v) =>
                      setForm((f) => ({
                        ...f,
                        organization_id: v === "none" ? "" : v,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select organization" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {organizations.map((org) => (
                        <SelectItem key={org.id} value={org.id}>
                          {org.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {showNewOrganization ? (
                    <div className="space-y-2 rounded-md border border-border/70 p-2">
                      <Input
                        value={newOrganizationName}
                        onChange={(e) => setNewOrganizationName(e.target.value)}
                        placeholder="Organization name"
                      />
                      <Input
                        value={newOrganizationAddress}
                        onChange={(e) =>
                          setNewOrganizationAddress(e.target.value)
                        }
                        placeholder="Address"
                      />
                      <Input
                        value={newOrganizationPhone}
                        onChange={(e) => setNewOrganizationPhone(e.target.value)}
                        placeholder="Phone"
                      />
                      <Input
                        type="email"
                        value={newOrganizationEmail}
                        onChange={(e) => setNewOrganizationEmail(e.target.value)}
                        placeholder="Email"
                      />
                      <Button
                        type="button"
                        className="h-8 w-full"
                        disabled={
                          createOrganization.isPending ||
                          !newOrganizationName.trim()
                        }
                        onClick={() => createOrganization.mutate()}
                      >
                        {createOrganization.isPending
                          ? "Saving..."
                          : "Create Organization"}
                      </Button>
                    </div>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Site</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      className="h-7 px-2 text-xs"
                      onClick={() => setShowNewSite((prev) => !prev)}
                    >
                      {showNewSite ? "Cancel" : "+ New"}
                    </Button>
                  </div>
                  <Select
                    value={form.site_id || "none"}
                    onValueChange={(v) =>
                      setForm((f) => ({ ...f, site_id: v === "none" ? "" : v }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select site" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {sites.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {showNewSite ? (
                    <div className="space-y-2 rounded-md border border-border/70 p-2">
                      <Input
                        value={newSiteName}
                        onChange={(e) => setNewSiteName(e.target.value)}
                        placeholder="Site name"
                      />
                      <Input
                        value={newSiteAddress}
                        onChange={(e) => setNewSiteAddress(e.target.value)}
                        placeholder="Site address"
                      />
                      <Select
                        value={newSiteClientId || "none"}
                        onValueChange={(v) =>
                          setNewSiteClientId(v === "none" ? "" : v)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select client" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Select client</SelectItem>
                          {clients.map((client) => (
                            <SelectItem key={client.id} value={client.id}>
                              {client.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          type="number"
                          step="any"
                          value={newSiteLatitude}
                          onChange={(e) => setNewSiteLatitude(e.target.value)}
                          placeholder="Latitude (optional)"
                        />
                        <Input
                          type="number"
                          step="any"
                          value={newSiteLongitude}
                          onChange={(e) => setNewSiteLongitude(e.target.value)}
                          placeholder="Longitude (optional)"
                        />
                      </div>
                      <Button
                        type="button"
                        className="h-8 w-full"
                        disabled={
                          createSite.isPending ||
                          !newSiteName.trim() ||
                          !newSiteAddress.trim() ||
                          !newSiteClientId
                        }
                        onClick={() => createSite.mutate()}
                      >
                        {createSite.isPending ? "Saving..." : "Create Site"}
                      </Button>
                    </div>
                  ) : null}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Client Portal Visibility</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Control what the client can see in their portal
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {form.is_client_portal_active ? (
                    <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-500/20">
                      <Eye className="h-3 w-3 mr-1" /> Portal Active
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="opacity-70">
                      <EyeOff className="h-3 w-3 mr-1" /> Portal Hidden
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between rounded-xl border border-border/50 bg-muted/30 p-4 transition-colors hover:bg-muted/50">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Label className="text-base font-semibold cursor-pointer" htmlFor="portal-active">
                      Master Portal Access
                    </Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Enable or disable the entire client portal for this project
                  </p>
                </div>
                <Switch
                  id="portal-active"
                  checked={form.is_client_portal_active}
                  onCheckedChange={(checked) =>
                    setForm((f) => ({ ...f, is_client_portal_active: checked }))
                  }
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col justify-between rounded-xl border border-border/50 bg-card p-4 transition-all hover:shadow-sm">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600">
                      <FileText className="h-5 w-5" />
                    </div>
                    <Switch
                      checked={form.show_documents_to_client}
                      onCheckedChange={(checked) =>
                        setForm((f) => ({ ...f, show_documents_to_client: checked }))
                      }
                      disabled={!form.is_client_portal_active}
                    />
                  </div>
                  <div>
                    <Label className="font-semibold block mb-1">Documents</Label>
                    <p className="text-xs text-muted-foreground">
                      Sharing AFC and As-Built drawings
                    </p>
                  </div>
                </div>

                <div className="flex flex-col justify-between rounded-xl border border-border/50 bg-card p-4 transition-all hover:shadow-sm">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600">
                      <Layers className="h-5 w-5" />
                    </div>
                    <Switch
                      checked={form.show_milestones_to_client}
                      onCheckedChange={(checked) =>
                        setForm((f) => ({ ...f, show_milestones_to_client: checked }))
                      }
                      disabled={!form.is_client_portal_active}
                    />
                  </div>
                  <div>
                    <Label className="font-semibold block mb-1">Milestones</Label>
                    <p className="text-xs text-muted-foreground">
                      Real-time stage tracking and SLA
                    </p>
                  </div>
                </div>

                <div className="flex flex-col justify-between rounded-xl border border-border/50 bg-card p-4 transition-all hover:shadow-sm">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600">
                      <Camera className="h-5 w-5" />
                    </div>
                    <Switch
                      checked={form.show_photos_to_client}
                      onCheckedChange={(checked) =>
                        setForm((f) => ({ ...f, show_photos_to_client: checked }))
                      }
                      disabled={!form.is_client_portal_active}
                    />
                  </div>
                  <div>
                    <Label className="font-semibold block mb-1">Photos</Label>
                    <p className="text-xs text-muted-foreground">
                      Site survey and installation progress
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Team Members</CardTitle>
              <Dialog open={teamDialogOpen} onOpenChange={setTeamDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <UserPlus className="h-4 w-4 mr-2" /> Add Member
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Team Member</DialogTitle>
                  </DialogHeader>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      addTeamMember.mutate();
                    }}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Label>User</Label>
                      <Select
                        value={teamForm.user_id}
                        onValueChange={(v) =>
                          setTeamForm((f) => ({ ...f, user_id: v }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select user" />
                        </SelectTrigger>
                        <SelectContent>
                          {users.map((u) => (
                            <SelectItem key={u.user_id} value={u.user_id}>
                              {u.full_name || u.email}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Role</Label>
                      <Select
                        value={teamForm.role}
                        onValueChange={(v) =>
                          setTeamForm((f) => ({ ...f, role: v }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sales">Sales</SelectItem>
                          <SelectItem value="engineering">
                            Engineering
                          </SelectItem>
                          <SelectItem value="procurement">
                            Procurement
                          </SelectItem>
                          <SelectItem value="execution">Execution</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={addTeamMember.isPending || !teamForm.user_id}
                    >
                      {addTeamMember.isPending ? "Adding..." : "Add to Team"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {team.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center text-muted-foreground py-8"
                      >
                        No team members assigned
                      </TableCell>
                    </TableRow>
                  ) : (
                    team.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell className="font-medium">
                          {(member as any).profiles?.full_name || "—"}
                        </TableCell>
                        <TableCell>{(member as any).profiles?.email}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="capitalize">
                            {member.role.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeTeamMember.mutate(member.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                No tasks mapped to this project yet.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          {(() => {
            const filteredDocs = projectDocuments.filter((d: any) => {
              const matchesSearch = d.name.toLowerCase().includes(docSearch.toLowerCase());
              const matchesState = docStateFilter === "all" || d.state === docStateFilter;
              return matchesSearch && matchesState;
            });
            return (
              <div className="space-y-4">
                <Card className="border-border/50">
                  <CardHeader className="pb-3">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <FileText className="h-5 w-5 text-primary" /> Project Controlled Documents
                        </CardTitle>
                        <p className="text-xs text-muted-foreground mt-1">
                          Manage official project drawings, reports, and specifications for client portal document access.
                        </p>
                      </div>
                      <Dialog open={docDialogOpen} onOpenChange={setDocDialogOpen}>
                        <DialogTrigger asChild>
                          <Button size="sm">
                            <Plus className="h-4 w-4 mr-2" /> New Document
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-lg">
                          <DialogHeader>
                            <DialogTitle>Create New Document</DialogTitle>
                          </DialogHeader>
                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              createDocMutation.mutate();
                            }}
                            className="space-y-4"
                          >
                            <div className="space-y-2">
                              <Label>Document Name *</Label>
                              <Input
                                value={docForm.name}
                                onChange={(e) =>
                                  setDocForm((f) => ({ ...f, name: e.target.value }))
                                }
                                placeholder="e.g., Site Plan Drawing"
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Description</Label>
                              <Textarea
                                value={docForm.description}
                                onChange={(e) =>
                                  setDocForm((f) => ({
                                    ...f,
                                    description: e.target.value,
                                  }))
                                }
                                placeholder="Brief description of the document"
                                rows={2}
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Document Type *</Label>
                                <Select
                                  value={docForm.document_type}
                                  onValueChange={(v) =>
                                    setDocForm((f) => ({ ...f, document_type: v }))
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="drawing">Drawing</SelectItem>
                                    <SelectItem value="specification">
                                      Specification
                                    </SelectItem>
                                    <SelectItem value="report">Report</SelectItem>
                                    <SelectItem value="permit">Permit</SelectItem>
                                    <SelectItem value="photo">Photo</SelectItem>
                                    <SelectItem value="contract">Contract</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label>Category *</Label>
                                <Select
                                  value={docForm.category}
                                  onValueChange={(v) =>
                                    setDocForm((f) => ({ ...f, category: v }))
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="design">Design</SelectItem>
                                    <SelectItem value="electrical">
                                      Electrical
                                    </SelectItem>
                                    <SelectItem value="structural">
                                      Structural
                                    </SelectItem>
                                    <SelectItem value="permitting">
                                      Permitting
                                    </SelectItem>
                                    <SelectItem value="construction">
                                      Construction
                                    </SelectItem>
                                    <SelectItem value="commissioning">
                                      Commissioning
                                    </SelectItem>
                                    <SelectItem value="closeout">Closeout</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            <div className="flex items-center justify-between rounded-lg border border-border/60 p-3">
                              <div>
                                <Label className="text-sm font-medium">
                                  Client Visible
                                </Label>
                                <p className="text-xs text-muted-foreground text-pretty">
                                  Allow clients to see this document. When enabled, setting the document state to "Approved for Construction (AFC)" or "As-Built" will automatically display it under the client's "Approved Documents", "As-Built Drawings", or "Test Reports" based on type.
                                </p>
                              </div>
                              <Switch
                                checked={docForm.is_client_visible}
                                onCheckedChange={(checked) =>
                                  setDocForm((f) => ({
                                    ...f,
                                    is_client_visible: checked,
                                  }))
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Initial State *</Label>
                              <Select
                                value={docForm.state}
                                onValueChange={(v) =>
                                  setDocForm((f) => ({ ...f, state: v }))
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="draft">Draft</SelectItem>
                                  <SelectItem value="in_review">In Review</SelectItem>
                                  <SelectItem value="afc">AFC</SelectItem>
                                  <SelectItem value="as_built">As-Built</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <Button
                              type="submit"
                              className="w-full"
                              disabled={createDocMutation.isPending}
                            >
                              {createDocMutation.isPending
                                ? "Creating..."
                                : "Create Document"}
                            </Button>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Informational Guidance Subtext Card */}
                    <div className="p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800 rounded-xl">
                      <div className="flex gap-3">
                        <AlertCircle className="h-5 w-5 text-indigo-500 mt-0.5 flex-shrink-0" />
                        <div className="text-xs space-y-1">
                          <p className="font-semibold text-slate-800 dark:text-slate-200">
                            Client Portal Document Mapping Rules (Real-time Synced)
                          </p>
                          <p className="text-muted-foreground">
                            Uploading documents here will automatically publish them to the client's portal under specific sections if **Client Visible** is toggled ON:
                          </p>
                          <ul className="list-disc pl-4 text-muted-foreground space-y-1 mt-1 font-medium">
                            <li>
                              <strong>Approved Documents</strong>: Document state set to <Badge variant="outline" className="text-[10px] py-0 px-1">AFC</Badge> (Approved for Construction), Type is NOT "Report".
                            </li>
                            <li>
                              <strong>As-Built Drawings</strong>: Document state set to <Badge variant="outline" className="text-[10px] py-0 px-1 font-mono">As-Built</Badge>, Type is set to "Drawing".
                            </li>
                            <li>
                              <strong>Test Reports (Post-QA)</strong>: Document Type set to "Report", State set to either <Badge variant="outline" className="text-[10px] py-0 px-1">AFC</Badge> or <Badge variant="outline" className="text-[10px] py-0 px-1">As-Built</Badge> (visible once the project progresses to the Procurement / Installation stages).
                            </li>
                            <li>
                              <strong>Warranty Documents</strong>: Category set to <Badge variant="outline" className="text-[10px] py-0 px-1">Closeout</Badge> OR the document name/description/category contains the word <span className="font-mono text-[10px] bg-slate-200 dark:bg-slate-800 px-1 rounded">"warranty"</span>, state set to <Badge variant="outline" className="text-[10px] py-0 px-1">AFC</Badge> or <Badge variant="outline" className="text-[10px] py-0 px-1">As-Built</Badge>.
                            </li>
                            <li>
                              <strong>Closeout Package Access</strong>: Automatically compiled details (Asset Summary & Final compiled PDF) become accessible on the customer closeout tab when the project stage is updated to <Badge variant="outline" className="text-[10px] py-0 px-1">Closeout Delivered</Badge>.
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Filters & Search */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search project documents..."
                          value={docSearch}
                          onChange={(e) => setDocSearch(e.target.value)}
                          className="pl-9"
                        />
                      </div>
                      <Select value={docStateFilter} onValueChange={setDocStateFilter}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All States</SelectItem>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="in_review">In Review</SelectItem>
                          <SelectItem value="afc">AFC</SelectItem>
                          <SelectItem value="as_built">As-Built</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Documents List */}
                    {isDocsLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      </div>
                    ) : filteredDocs.length === 0 ? (
                      <div className="py-8 text-center border border-dashed border-border/60 rounded-xl bg-muted/10">
                        <FileText className="h-10 w-10 mx-auto text-muted-foreground/35 mb-2" />
                        <p className="text-sm font-medium">No controlled documents found</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Upload your first drawing, report, or contract to start publishing.
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto rounded-lg border border-border/50">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Document</TableHead>
                              <TableHead>Type</TableHead>
                              <TableHead>Category</TableHead>
                              <TableHead>State</TableHead>
                              <TableHead>Client Visible</TableHead>
                              <TableHead>Version</TableHead>
                              <TableHead>Updated</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredDocs.map((doc: any) => (
                              <TableRow key={doc.id}>
                                <TableCell>
                                  <div className="space-y-1">
                                    <span className="font-semibold text-sm">{doc.name}</span>
                                    {doc.description && (
                                      <p className="text-xs text-muted-foreground line-clamp-1">
                                        {doc.description}
                                      </p>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline" className="text-[10px] capitalize">
                                    {doc.document_type || "unknown"}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline" className="text-[10px] capitalize">
                                    {doc.category || "unknown"}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <DocStateBadge state={doc.state} />
                                </TableCell>
                                <TableCell>
                                  <Switch
                                    checked={doc.is_client_visible ?? true}
                                    onCheckedChange={(checked) =>
                                      updateDocVisibilityMutation.mutate({
                                        docId: doc.id,
                                        isClientVisible: checked,
                                      })
                                    }
                                  />
                                </TableCell>
                                <TableCell className="font-mono text-xs">v{doc.current_version}</TableCell>
                                <TableCell className="text-xs text-muted-foreground">
                                  {new Date(doc.updated_at).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center justify-end gap-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        setSelectedDoc(doc);
                                        setDocVersionHistoryOpen(true);
                                      }}
                                      title="Version History"
                                    >
                                      <History className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        setSelectedDoc(doc);
                                        setDocUploadDialogOpen(true);
                                      }}
                                      title="Upload New Version"
                                    >
                                      <Upload className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => downloadProjectDoc(doc)}
                                      title="Download Latest"
                                    >
                                      <Download className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        setSelectedDoc(doc);
                                        setDocEditForm({
                                          name: doc.name,
                                          description: doc.description || "",
                                          document_type: doc.document_type || "drawing",
                                          category: doc.category || "design",
                                          is_client_visible: doc.is_client_visible ?? true,
                                        });
                                        setDocEditDialogOpen(true);
                                      }}
                                      title="Edit Details"
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        setSelectedDoc(doc);
                                        setNewDocState(doc.state);
                                        setDocStateDialogOpen(true);
                                      }}
                                      title="Change State"
                                    >
                                      <CheckCircle2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Upload Dialog */}
                <Dialog open={docUploadDialogOpen} onOpenChange={setDocUploadDialogOpen}>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Upload New Version</DialogTitle>
                    </DialogHeader>
                    {selectedDoc && (
                      <DocumentUploader
                        projectId={selectedDoc.project_id}
                        documentId={selectedDoc.id}
                        documentName={selectedDoc.name}
                        documentState={selectedDoc.state}
                        onSuccess={() => {
                          queryClient.invalidateQueries({
                            queryKey: ["project-documents", id],
                          });
                          queryClient.invalidateQueries({ queryKey: ["documents"] });
                          setDocUploadDialogOpen(false);
                          setSelectedDoc(null);
                        }}
                      />
                    )}
                  </DialogContent>
                </Dialog>

                {/* Version History Dialog */}
                <Dialog open={docVersionHistoryOpen} onOpenChange={setDocVersionHistoryOpen}>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{selectedDoc?.name}</DialogTitle>
                    </DialogHeader>
                    {selectedDoc && (
                      <DocumentVersionHistory
                        documentId={selectedDoc.id}
                        documentName={selectedDoc.name}
                      />
                    )}
                  </DialogContent>
                </Dialog>

                {/* Edit Dialog */}
                <Dialog open={docEditDialogOpen} onOpenChange={setDocEditDialogOpen}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit Document Details</DialogTitle>
                    </DialogHeader>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        updateDocMutation.mutate();
                      }}
                      className="space-y-4"
                    >
                      <div className="space-y-2">
                        <Label>Document Name</Label>
                        <Input
                          value={docEditForm.name}
                          onChange={(e) =>
                            setDocEditForm((f) => ({ ...f, name: e.target.value }))
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                          value={docEditForm.description}
                          onChange={(e) =>
                            setDocEditForm((f) => ({
                              ...f,
                              description: e.target.value,
                            }))
                          }
                          rows={2}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Document Type</Label>
                          <Select
                            value={docEditForm.document_type}
                            onValueChange={(v) =>
                              setDocEditForm((f) => ({ ...f, document_type: v }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="drawing">Drawing</SelectItem>
                              <SelectItem value="specification">
                                Specification
                              </SelectItem>
                              <SelectItem value="report">Report</SelectItem>
                              <SelectItem value="permit">Permit</SelectItem>
                              <SelectItem value="photo">Photo</SelectItem>
                              <SelectItem value="contract">Contract</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Category</Label>
                          <Select
                            value={docEditForm.category}
                            onValueChange={(v) =>
                              setDocEditForm((f) => ({ ...f, category: v }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="design">Design</SelectItem>
                              <SelectItem value="electrical">Electrical</SelectItem>
                              <SelectItem value="structural">Structural</SelectItem>
                              <SelectItem value="permitting">Permitting</SelectItem>
                              <SelectItem value="construction">Construction</SelectItem>
                              <SelectItem value="commissioning">
                                Commissioning
                              </SelectItem>
                              <SelectItem value="closeout">Closeout</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="flex items-center justify-between rounded-lg border border-border/60 p-3">
                        <div>
                          <Label className="text-sm font-medium">Client Visible</Label>
                          <p className="text-xs text-muted-foreground text-pretty">
                            Allow clients to see this document. When enabled, setting the document state to "Approved for Construction (AFC)" or "As-Built" will automatically display it under the client's "Approved Documents", "As-Built Drawings", or "Test Reports" based on type.
                          </p>
                        </div>
                        <Switch
                          checked={docEditForm.is_client_visible}
                          onCheckedChange={(checked) =>
                            setDocEditForm((f) => ({
                              ...f,
                              is_client_visible: checked,
                            }))
                          }
                        />
                      </div>
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={updateDocMutation.isPending}
                      >
                        {updateDocMutation.isPending ? "Saving..." : "Save Changes"}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>

                {/* State Transition Dialog */}
                <Dialog open={docStateDialogOpen} onOpenChange={setDocStateDialogOpen}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Change Document State</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="p-3 bg-muted rounded-lg text-sm">
                        <p className="font-medium">Document: {selectedDoc?.name}</p>
                        <p className="text-muted-foreground mt-1 flex items-center gap-1.5">
                          Current state: <DocStateBadge state={selectedDoc?.state} />
                        </p>
                      </div>

                      <div className="p-3 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200/50 dark:border-indigo-900/50 rounded-lg">
                        <div className="flex gap-2.5">
                          <AlertCircle className="h-4 w-4 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
                          <div className="text-xs">
                            <p className="font-semibold text-indigo-700 dark:text-indigo-300">
                              Document State Workflow
                            </p>
                            <ul className="mt-1 text-muted-foreground space-y-1">
                              <li>
                                • <strong>Draft:</strong> Initial upload, admin only.
                              </li>
                              <li>
                                • <strong>In Review:</strong> Subject to technical validation.
                              </li>
                              <li>
                                • <strong>AFC:</strong> Approved for Construction (visible to field engineers. If Client Visible is toggled ON, it automatically publishes under the client's 'Approved Documents' or 'Test Reports').
                              </li>
                              <li>
                                • <strong>As-Built:</strong> Confirmed final drawings (If Client Visible is toggled ON, it automatically publishes under the client's 'As-Built Drawings' or 'Test Reports').
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>New State</Label>
                        <Select value={newDocState} onValueChange={setNewDocState}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="in_review">In Review</SelectItem>
                            <SelectItem value="afc">
                              Approved for Construction (AFC)
                            </SelectItem>
                            <SelectItem value="as_built">As-Built</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <Button
                        onClick={() => transitionDocStateMutation.mutate()}
                        className="w-full"
                        disabled={
                          transitionDocStateMutation.isPending ||
                          newDocState === selectedDoc?.state
                        }
                      >
                        {transitionDocStateMutation.isPending
                          ? "Updating..."
                          : "Update State"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            );
          })()}
        </TabsContent>

        <div className="pt-2">
          <Button
            onClick={() => updateProject.mutate()}
            disabled={updateProject.isPending}
          >
            <Save className="h-4 w-4 mr-2" /> Save Changes
          </Button>
        </div>
      </Tabs>
    </div>
  );
};

export default AdminProjectDetail;
