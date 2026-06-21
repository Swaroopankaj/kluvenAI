import { Baby, Loader2, Upload, Check, Copy, Download, FileText } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useToastManager } from '@/hooks/use-toast-manager';
import { cn } from '@/lib/utils';

interface VabField {
  key: string;
  label: string;
  type: string;
  description: string;
  required: boolean;
}

interface VabExport {
  type: string;
  label: string;
  template?: string;
  filename_template?: string;
  columns?: string[];
  description: string;
}

interface VabSchema {
  fields: VabField[];
  exports: VabExport[];
  post_processing: Record<string, any>;
}

interface VabResult {
  child_name?: string;
  start_date?: string;
  end_date?: string;
  total_hours_vab?: number;
  [key: string]: any;
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function fillTemplate(tpl: string, data: Record<string, any>): string {
  return tpl.replace(/\{\{(\w+)\}\}/g, (_, key) => String(data[key] ?? `[${key}]`));
}

export function VabDashboard() {
  const [schema, setSchema] = useState<VabSchema | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<VabResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const { success, error: toastError } = useToastManager();

  useEffect(() => {
    fetch(`${API_BASE}/api/config/vablogger/schema`)
      .then(r => r.json())
      .then(setSchema)
      .catch(() => setError('Failed to load configuration'));
  }, []);

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
        success('Document processed successfully!');
      } else {
        throw new Error(json.error || 'Processing failed');
      }
    } catch (err: any) {
      const msg = err.message || 'Failed to process document';
      setError(msg);
      toastError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (text: string, idx: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 2000);
      success('Copied to clipboard!');
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

  const fieldIcons: Record<string, string> = {
    child_name: '👶',
    start_date: '📅',
    end_date: '📅',
    total_hours_vab: '⏱️',
  };

  if (!schema) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
          <Baby className="h-5 w-5 text-amber-500" />
        </div>
        <div>
          <h1 className="text-xl font-semibold">VAB Auto-Log</h1>
          <p className="text-sm text-muted-foreground">
            Log sick child leave to HR & Försäkringskassan
          </p>
        </div>
      </div>

      {/* Upload Zone */}
      <Card>
        <CardContent className="p-6">
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
              dragOver ? "border-amber-500 bg-amber-50 dark:bg-amber-950" : "border-border hover:border-amber-400"
            )}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleFileDrop}
            onClick={() => document.getElementById('vab-file-input')?.click()}
          >
            <input
              id="vab-file-input"
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.webp,.txt"
              onChange={handleFileInput}
              className="hidden"
            />
            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm font-medium">
              {file ? file.name : 'Drop a document or click to upload'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Preschool absence confirmation, doctor's note, or FK notification (PDF, PNG, JPG, TXT)
            </p>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!file || loading}
            className="w-full mt-4"
          >
            {loading ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Processing...</>
            ) : (
              <><FileText className="h-4 w-4 mr-2" /> Analyze Document</>
            )}
          </Button>

          {error && (
            <p className="text-sm text-red-500 mt-2">{error}</p>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <>
          {/* Extracted Fields */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <h2 className="text-sm font-semibold">Extracted Data</h2>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-2">
              {schema.fields.map((field) => {
                const val = result[field.key];
                return (
                  <div
                    key={field.key}
                    className="flex items-center justify-between bg-muted rounded-lg px-4 py-3"
                  >
                    <span className="text-sm text-muted-foreground">
                      {fieldIcons[field.key]} {fieldLabels[field.key] || field.label}
                    </span>
                    <span className="text-sm font-semibold font-mono">
                      {val ?? <span className="text-muted-foreground italic">—</span>}
                      {field.key === 'total_hours_vab' && val ? ' h' : ''}
                    </span>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Export Actions */}
          <div className="grid gap-3">
            {schema.exports.map((exp, idx) => (
              <Card key={idx}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{exp.label}</p>
                    <p className="text-xs text-muted-foreground truncate">{exp.description}</p>
                  </div>
                  {exp.type === 'csv' ? (
                    <Button variant="outline" size="sm" onClick={handleExportCSV}>
                      <Download className="h-4 w-4 mr-1" /> CSV
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopy(fillTemplate(exp.template || '', result), idx)}
                    >
                      {copiedIdx === idx ? (
                        <><Check className="h-4 w-4 mr-1 text-green-500" /> Copied</>
                      ) : (
                        <><Copy className="h-4 w-4 mr-1" /> Copy</>
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
