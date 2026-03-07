import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ProjectData {
  name: string;
  description?: string;
  project_type: string;
  capacity_kw?: number;
  estimated_cost?: number;
  start_date?: string;
  target_completion?: string;
  stage: string;
}

interface ClientData {
  full_name: string;
  email?: string;
  phone?: string;
  address?: string;
}

interface SiteData {
  name: string;
  address: string;
  latitude?: number;
  longitude?: number;
}

interface DocumentData {
  name: string;
  state: string;
  current_version: number;
}

interface MilestoneData {
  name: string;
  description?: string;
  due_date?: string;
  completed_at?: string;
}

interface CloseoutPackageData {
  project: ProjectData;
  client?: ClientData;
  site?: SiteData;
  documents?: DocumentData[];
  milestones?: MilestoneData[];
}

export const generateCloseoutPackagePDF = async (data: CloseoutPackageData): Promise<Blob> => {
  const doc = new jsPDF();
  let yPos = 20;

  // Header
  doc.setFontSize(24);
  doc.setTextColor(0, 0, 0);
  doc.text('PROJECT CLOSEOUT PACKAGE', 105, yPos, { align: 'center' });

  yPos += 15;
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated on ${new Date().toLocaleDateString()}`, 105, yPos, { align: 'center' });

  yPos += 15;

  // Project Information
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text('Project Information', 20, yPos);
  yPos += 5;

  doc.setLineWidth(0.5);
  doc.line(20, yPos, 190, yPos);
  yPos += 10;

  doc.setFontSize(10);
  const projectInfo = [
    ['Project Name:', data.project.name],
    ['Type:', data.project.project_type.replace('_', ' ').toUpperCase()],
    ['Capacity:', data.project.capacity_kw ? `${data.project.capacity_kw} kW` : 'N/A'],
    ['Status:', 'COMMISSIONED & CLOSED'],
    ['Start Date:', data.project.start_date ? new Date(data.project.start_date).toLocaleDateString() : 'N/A'],
    ['Completion Date:', data.project.target_completion ? new Date(data.project.target_completion).toLocaleDateString() : 'N/A'],
  ];

  projectInfo.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label, 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(value, 70, yPos);
    yPos += 7;
  });

  if (data.project.description) {
    yPos += 5;
    doc.setFont('helvetica', 'bold');
    doc.text('Description:', 20, yPos);
    yPos += 7;
    doc.setFont('helvetica', 'normal');
    const splitDescription = doc.splitTextToSize(data.project.description, 170);
    doc.text(splitDescription, 20, yPos);
    yPos += splitDescription.length * 7;
  }

  yPos += 10;

  // Client Information
  if (data.client) {
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text('Client Information', 20, yPos);
    yPos += 5;

    doc.setLineWidth(0.5);
    doc.line(20, yPos, 190, yPos);
    yPos += 10;

    doc.setFontSize(10);
    const clientInfo = [
      ['Client Name:', data.client.full_name || 'N/A'],
      ['Email:', data.client.email || 'N/A'],
      ['Phone:', data.client.phone || 'N/A'],
      ['Address:', data.client.address || 'N/A'],
    ];

    clientInfo.forEach(([label, value]) => {
      doc.setFont('helvetica', 'bold');
      doc.text(label, 20, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(value, 70, yPos);
      yPos += 7;
    });

    yPos += 10;
  }

  // Site Information
  if (data.site) {
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(16);
    doc.text('Site Information', 20, yPos);
    yPos += 5;

    doc.setLineWidth(0.5);
    doc.line(20, yPos, 190, yPos);
    yPos += 10;

    doc.setFontSize(10);
    const siteInfo = [
      ['Site Name:', data.site.name],
      ['Address:', data.site.address],
      ['Coordinates:', data.site.latitude && data.site.longitude ?
        `${data.site.latitude.toFixed(4)}, ${data.site.longitude.toFixed(4)}` : 'N/A'],
    ];

    siteInfo.forEach(([label, value]) => {
      doc.setFont('helvetica', 'bold');
      doc.text(label, 20, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(value, 70, yPos);
      yPos += 7;
    });

    yPos += 10;
  }

  // Project Milestones
  if (data.milestones && data.milestones.length > 0) {
    if (yPos > 220) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(16);
    doc.text('Project Milestones', 20, yPos);
    yPos += 10;

    const milestoneRows = data.milestones.map(m => [
      m.name,
      m.due_date ? new Date(m.due_date).toLocaleDateString() : 'N/A',
      m.completed_at ? new Date(m.completed_at).toLocaleDateString() : 'Pending',
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Milestone', 'Due Date', 'Completed']],
      body: milestoneRows,
      theme: 'grid',
      headStyles: { fillColor: [66, 139, 202] },
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;
  }

  // Documents Delivered
  if (data.documents && data.documents.length > 0) {
    if (yPos > 220) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(16);
    doc.text('Documents Delivered', 20, yPos);
    yPos += 10;

    const docRows = data.documents
      .filter(d => d.state === 'as_built' || d.state === 'afc')
      .map(d => [
        d.name,
        d.state.toUpperCase().replace('_', ' '),
        `v${d.current_version}`,
      ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Document Name', 'Status', 'Version']],
      body: docRows,
      theme: 'grid',
      headStyles: { fillColor: [66, 139, 202] },
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;
  }

  // System Specifications (new page)
  doc.addPage();
  yPos = 20;

  doc.setFontSize(16);
  doc.text('System Specifications', 20, yPos);
  yPos += 5;
  doc.line(20, yPos, 190, yPos);
  yPos += 15;

  doc.setFontSize(10);
  doc.text('This solar photovoltaic system has been installed, commissioned, and tested', 20, yPos);
  yPos += 7;
  doc.text('in accordance with all applicable codes and standards.', 20, yPos);
  yPos += 15;

  const specs = [
    ['System Type:', data.project.project_type.replace('_', ' ').toUpperCase()],
    ['Total Capacity:', data.project.capacity_kw ? `${data.project.capacity_kw} kW DC` : 'N/A'],
    ['Estimated Annual Production:', data.project.capacity_kw ? `${(data.project.capacity_kw * 1200).toFixed(0)} kWh/year` : 'N/A'],
  ];

  specs.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label, 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(value, 80, yPos);
    yPos += 10;
  });

  // Certification
  yPos += 20;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('CERTIFICATION', 105, yPos, { align: 'center' });
  yPos += 15;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const certText = [
    'This document certifies that the solar installation project has been completed',
    'in accordance with the contract specifications and all applicable regulations.',
    '',
    'The system has passed all required inspections and is ready for operation.',
  ];

  certText.forEach(line => {
    doc.text(line, 105, yPos, { align: 'center' });
    yPos += 7;
  });

  yPos += 20;
  doc.line(50, yPos, 160, yPos);
  yPos += 7;
  doc.setFontSize(8);
  doc.text('Authorized Signature                    Date', 105, yPos, { align: 'center' });

  // Footer on all pages
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Page ${i} of ${pageCount}`, 105, 285, { align: 'center' });
    doc.text('SPD Nexus - Solar Project Management', 105, 290, { align: 'center' });
  }

  return doc.output('blob');
};
