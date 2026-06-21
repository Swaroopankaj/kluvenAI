import { Loader2, Upload, Check, Copy, Download, Sparkles } from 'lucide-react';
import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { CardContent } from '@/components/ui/card';
import { useToastManager } from '@/hooks/use-toast-manager';
import { cn } from '@/lib/utils';
import { NodeShell } from './node-shell';
import type { NodeProps } from '@xyflow/react';
import type { VabAgentNode as VabAgentNodeType } from '../types';

interface VabResult {
  child_name?: string;
  start_date?: string;
  end_date?: string;
  total_hours_vab?: number;
  [key: string]: any;
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

export function VabAgentNode({ id, selected, isConnectable }: NodeProps<VabAgentNodeType>) {
  const { success, error: toastError } = useToastManager();
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<VabResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) { setFile(f); setResult(null); setError(null); }
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) { setFile(f); setResult(null); setError(null); }
  }, []);

  const handleSubmit = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    const form = new FormData();
    form.append('file', file);
    form.append('config_id', 'vablogger');
    try {
      const res = await fetch(`${API_BASE}/api/process`, { method: 'POST', body: form });
      const json = await res.json();
      if (json.status === 'success') {
        setResult(json.data);
        success('Document processed by VAB Agent!');
      } else {
        throw new Error(json.error || 'Processing failed');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to process');
      toastError(err.message || 'Failed to process document');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
      success(`Copied ${key} to clipboard!`);
    } catch {
      toastError('Failed to copy');
    }
  };

  const handleExportCSV = async () => {
    if (!result) return;
    try {
      const form = new FormData();
      form.append('data', JSON.stringify(result));
      form.append('config_id', 'vablogger');
      const res = await fetch(`${API_BASE}/api/export-csv`, { method: 'POST', body: form });
      const json = await res.json();
      const blob = new Blob([json.csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = json.filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toastError('Failed to export CSV');
    }
  };

  const fieldLabels: Record<string, string> = {
    child_name: 'Child Name',
    start_date: 'Start Date',
    end_date: 'End Date',
    total_hours_vab: 'Total VAB Hours',
  };

  return (
    <NodeShell
      id={id}
      selected={selected}
      isConnectable={isConnectable}
      icon={<Sparkles className="h-5 w-5" />}
      iconColor="text-purple-500"
      name="VAB Agent"
      description="AI-powered VAB processing agent"
      hasLeftHandle
      hasRightHandle
      width="w-80"
    >
      <CardContent className="p-0">
        <div className="border-t border-border p-3 space-y-3">
          {/* Agent status badge */}
          <div className="flex items-center gap-2 text-xs text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950 rounded px-3 py-1.5">
            <Sparkles className="h-3 w-3" />
            <span>LLM Agent — extracts VAB data from documents</span>
          </div>

          {/* Upload Zone */}
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-4 text-center text-sm cursor-pointer transition-colors",
              dragOver ? "border-purple-500 bg-purple-50 dark:bg-purple-950" : "border-border hover:border-purple-400"
            )}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleFileDrop}
            onClick={() => document.getElementById(`vab-agent-file-${id}`)?.click()}
          >
            <input id={`vab-agent-file-${id}`} type="file" accept=".pdf,.png,.jpg,.jpeg,.webp,.txt" onChange={handleFileInput} className="hidden" />
            {file ? (
              <span className="text-purple-600 font-medium text-xs">{file.name}</span>
            ) : (
              <div>
                <Upload className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                <span className="text-muted-foreground text-xs">Drop file or click to upload</span>
              </div>
            )}
          </div>

          <Button onClick={handleSubmit} disabled={!file || loading} className="w-full" size="sm">
            {loading ? <><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Processing...</> : <><Sparkles className="h-3 w-3 mr-1" /> Analyze with AI</>}
          </Button>

          {error && <p className="text-xs text-red-500 text-center">{error}</p>}

          {/* Results */}
          {result && (
            <div className="space-y-2">
              <div className="space-y-1">
                {Object.entries(result).map(([key, val]) => (
                  <div key={key} className="flex justify-between bg-muted rounded px-3 py-2 text-sm">
                    <span className="text-muted-foreground text-xs">{fieldLabels[key] || key}</span>
                    <span className="font-mono font-medium text-xs">
                      {String(val ?? '—')}{key === 'total_hours_vab' ? ' h' : ''}
                    </span>
                  </div>
                ))}
              </div>

              {/* Section label */}
              <div className="text-xs font-medium text-muted-foreground pt-1">Export Actions</div>

              {/* Three export buttons */}
              <div className="flex gap-1.5">
                <Button variant="outline" size="sm" className="flex-1 text-xs h-7" onClick={() => handleCopy(
                  `Child: ${result.child_name}\nPeriod: ${result.start_date} \u2013 ${result.end_date}\nTotal VAB hours: ${result.total_hours_vab}\n\nThis is to certify that I have been at home with my sick child during the above period and am applying for temporary parental allowance.`,
                  'FK'
                )}>
                  {copied === 'FK' ? <Check className="h-3 w-3 mr-1 text-green-500" /> : <Copy className="h-3 w-3 mr-1" />}
                  FK
                </Button>
                <Button variant="outline" size="sm" className="flex-1 text-xs h-7" onClick={handleExportCSV}>
                  <Download className="h-3 w-3 mr-1" />
                  CSV
                </Button>
                <Button variant="outline" size="sm" className="flex-1 text-xs h-7" onClick={() => handleCopy(
                  `Hej,\n\n${result.child_name} \u00e4r sjuk och kommer vara hemma fr\u00e5n ${result.start_date} till ${result.end_date}.\nVAB anm\u00e4ls enligt rutin.\n\nMed v\u00e4nlig h\u00e4lsning`,
                  'School'
                )}>
                  {copied === 'School' ? <Check className="h-3 w-3 mr-1 text-green-500" /> : <Copy className="h-3 w-3 mr-1" />}
                  School
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </NodeShell>
  );
}
