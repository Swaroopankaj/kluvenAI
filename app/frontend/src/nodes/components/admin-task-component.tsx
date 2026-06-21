import { type NodeProps } from '@xyflow/react';
import { Upload, Baby, Train } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { CardContent } from '@/components/ui/card';
import { useNodeState } from '@/hooks/use-node-state';
import { type AdminTaskNode } from '../types';
import { NodeShell } from './node-shell';

const TASK_CONFIGS = {
  sambosplit: {
    icon: Upload,
    iconColor: 'text-blue-500',
    apiEndpoint: '/api/process',
    configId: 'sambosplit',
    acceptedTypes: '.pdf,.png,.jpg,.jpeg,.webp,.txt',
  },
  vablogger: {
    icon: Baby,
    iconColor: 'text-amber-500',
    apiEndpoint: '/api/process',
    configId: 'vablogger',
    acceptedTypes: '.pdf,.png,.jpg,.jpeg,.webp,.txt',
  },
  commuter: {
    icon: Train,
    iconColor: 'text-green-500',
    apiEndpoint: '/api/process',
    configId: 'commuter',
    acceptedTypes: '.pdf,.png,.jpg,.jpeg,.webp,.txt',
  },
};

export function AdminTaskComponent({ data, selected, id, isConnectable }: NodeProps<AdminTaskNode>) {
  const { t } = useTranslation();
  const taskType = data.taskType || 'sambosplit';
  const config = TASK_CONFIGS[taskType];
  const Icon = config.icon;

  const [file, setFile] = useNodeState(id, 'file', null as File | null);
  const [result, setResult] = useNodeState(id, 'result', null as any);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const label = t(`nodes.${taskType}.name`, taskType);
  const tagline = t(`nodes.${taskType}.tagline`, '');

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) setFile(f);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  };

  const handleSubmit = async () => {
    if (!file) return;
    setLoading(true);
    const form = new FormData();
    form.append('file', file);
    form.append('config_id', config.configId);

    try {
      const res = await fetch(config.apiEndpoint, { method: 'POST', body: form });
      const json = await res.json();
      setResult(json.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    if (!result) return;
    const form = new FormData();
    form.append('data', JSON.stringify(result));
    form.append('config_id', config.configId);

    const res = await fetch('/api/export-csv', { method: 'POST', body: form });
    const json = await res.json();
    const blob = new Blob([json.csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = json.filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderField = (key: string, value: any) => {
    const labels: Record<string, string> = {
      vendor: t('sambosplit.vendor', { defaultValue: 'Vendor' }),
      total_amount_sek: t('sambosplit.total', { defaultValue: 'Total' }),
      split_amount_sek: t('sambosplit.split', { defaultValue: 'Your half' }),
      due_date: t('sambosplit.due', { defaultValue: 'Due date' }),
      child_name: t('vab.child', { defaultValue: 'Child' }),
      start_date: t('vab.start', { defaultValue: 'Start' }),
      end_date: t('vab.end', { defaultValue: 'End' }),
      total_hours_vab: t('vab.hours', { defaultValue: 'Hours' }),
      purchase_date: t('commuter.purchase', { defaultValue: 'Purchased' }),
      ticket_type: t('commuter.ticket', { defaultValue: 'Ticket' }),
      amount_sek: t('commuter.amount', { defaultValue: 'Amount' }),
      travel_date: t('commuter.travel', { defaultValue: 'Travel date' }),
    };
    return (
      <div key={key} className="flex justify-between bg-white dark:bg-slate-800 rounded px-3 py-2 text-sm">
        <span className="text-muted-foreground">{labels[key] || key}</span>
        <span className="font-mono font-medium">{value}{key.includes('amount') || key.includes('split') ? ' kr' : ''}</span>
      </div>
    );
  };

  return (
    <NodeShell
      id={id}
      selected={selected}
      isConnectable={isConnectable}
      icon={<Icon className="h-5 w-5" />}
      iconColor={config.iconColor}
      name={label}
      description={tagline}
      hasLeftHandle={false}
      hasRightHandle={false}
      width="w-72"
    >
      <CardContent className="p-0">
        <div className="border-t border-border p-3 space-y-3">
          <div
            className={`border-2 border-dashed rounded-lg p-4 text-center text-sm transition cursor-pointer ${
              dragOver ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' : 'border-border hover:border-blue-400'
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleFileDrop}
            onClick={() => document.getElementById(`file-${id}`)?.click()}
          >
            <input id={`file-${id}`} type="file" accept={config.acceptedTypes} onChange={handleFileInput} className="hidden" />
            {file ? (
              <span className="text-blue-600 font-medium text-xs">{file.name}</span>
            ) : (
              <span className="text-muted-foreground">{t('app.dropHint', {defaultValue: 'Drop a file or click to upload'})}</span>
            )}
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!file || loading}
            className="w-full"
            size="sm"
          >
            {loading ? t('app.processing', {defaultValue: 'Processing...'}) : t('app.analyze', {defaultValue: 'Analyze'})}
          </Button>

          {result && (
            <div className="space-y-2">
              <div className="space-y-1.5">
                {Object.entries(result).map(([k, v]) => renderField(k, v))}
              </div>
              <div className="flex gap-2">
                {taskType === 'sambosplit' && result.split_amount_sek && (
                  <Button
                    variant="default"
                    size="sm"
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => window.open(`swish://payment?number=&amount=${result.split_amount_sek}&message=Split%20${encodeURIComponent(result.vendor || '')}`, '_blank')}
                  >
                    {t('app.openSwish', {defaultValue: 'Open Swish'})}
                  </Button>
                )}
                <Button variant="outline" size="sm" className="flex-1" onClick={handleExportCSV}>
                  {t('app.exportCSV', {defaultValue: 'Export CSV'})}
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </NodeShell>
  );
}
