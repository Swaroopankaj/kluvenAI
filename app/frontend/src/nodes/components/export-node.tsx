import { Download, Copy, Check, FileText, Building, GraduationCap, Landmark } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CardContent } from '@/components/ui/card';
import { useToastManager } from '@/hooks/use-toast-manager';
import { NodeShell } from './node-shell';
import type { NodeProps } from '@xyflow/react';
import type { ExportNode as ExportNodeType } from '../types';

const CONFIG: Record<string, {
  label: string;
  icon: typeof FileText;
  iconColor: string;
  description: string;
}> = {
  hr: {
    label: 'HR Export',
    icon: Building,
    iconColor: 'text-blue-500',
    description: 'Employer CSV for HR portal',
  },
  fk: {
    label: 'FK Export',
    icon: Landmark,
    iconColor: 'text-green-500',
    description: 'Försäkringskassan copy-paste',
  },
  school: {
    label: 'School Export',
    icon: GraduationCap,
    iconColor: 'text-amber-500',
    description: 'School/daycare notification',
  },
};

function getExportType(name: string): string {
  if (name.includes('HR')) return 'hr';
  if (name.includes('FK')) return 'fk';
  if (name.includes('School')) return 'school';
  return 'hr';
}

export function ExportNode({ data, selected, id, isConnectable }: NodeProps<ExportNodeType>) {
  const exportType = getExportType(data.name);
  const config = CONFIG[exportType] || CONFIG.hr;
  const Icon = config.icon;
  const { success, error: toastError } = useToastManager();
  const [copied, setCopied] = useState(false);

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      success('Copied to clipboard!');
    } catch {
      toastError('Failed to copy');
    }
  };

  const handleExportCSV = async () => {
    try {
      const blob = new Blob([sampleCSV()], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${exportType}-export.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toastError('Failed to export');
    }
  };

  return (
    <NodeShell
      id={id}
      selected={selected}
      isConnectable={isConnectable}
      icon={<Icon className="h-5 w-5" />}
      iconColor={config.iconColor}
      name={config.label}
      description={config.description}
      hasLeftHandle
      hasRightHandle={false}
      width="w-72"
    >
      <CardContent className="p-0">
        <div className="border-t border-border p-3 space-y-3">
          <div className="text-xs text-muted-foreground bg-muted rounded px-3 py-2 leading-relaxed">
            {exportType === 'hr' && (
              <span>Parsed VAB data ready for employer HR system (Primula/Visma). Download CSV with one click.</span>
            )}
            {exportType === 'fk' && (
              <span>Formatted VAB summary ready for Försäkringskassan. Copy the text and paste into the FK portal.</span>
            )}
            {exportType === 'school' && (
              <span>Swedish absence notification for Unikum/Skolplattformen. Copy and send to your child's school.</span>
            )}
          </div>

          {exportType === 'hr' && (
            <Button variant="outline" size="sm" className="w-full text-xs h-7" onClick={handleExportCSV}>
              <Download className="h-3 w-3 mr-1" /> Download HR CSV
            </Button>
          )}

          {exportType === 'fk' && (
            <Button variant="outline" size="sm" className="w-full text-xs h-7" onClick={() => handleCopy(
              'Child: [Child Name]\nPeriod: [Start Date] – [End Date]\nTotal VAB hours: [Hours]\n\nI have been at home caring for my sick child and apply for temporary parental allowance.'
            )}>
              {copied ? <Check className="h-3 w-3 mr-1 text-green-500" /> : <Copy className="h-3 w-3 mr-1" />}
              Copy for FK
            </Button>
          )}

          {exportType === 'school' && (
            <Button variant="outline" size="sm" className="w-full text-xs h-7" onClick={() => handleCopy(
              'Hej,\n\n[Child Name] är sjuk och kommer vara hemma från [Start Date] till [End Date].\nVAB anmäls enligt rutin.\n\nMed vänlig hälsning'
            )}>
              {copied ? <Check className="h-3 w-3 mr-1 text-green-500" /> : <Copy className="h-3 w-3 mr-1" />}
              Copy School Notification
            </Button>
          )}
        </div>
      </CardContent>
    </NodeShell>
  );
}

function sampleCSV(): string {
  return 'child_name,start_date,end_date,total_hours_vab\nExample Child,2026-01-20,2026-01-22,15';
}
