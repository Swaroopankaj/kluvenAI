import { Cpu, Loader2, Send } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CardContent } from '@/components/ui/card';
import { useToastManager } from '@/hooks/use-toast-manager';
import { NodeShell } from './node-shell';
import type { NodeProps } from '@xyflow/react';
import type { LlmAgentNode as LlmAgentNodeType } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export function LlmAgentNode({ id, selected, isConnectable }: NodeProps<LlmAgentNodeType>) {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { success, error: toastError } = useToastManager();

  const handleSubmit = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setResponse(null);
    try {
      const res = await fetch(`${API_BASE}/api/llm-agent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim(), config_id: 'vablogger' }),
      });
      const json = await res.json();
      if (json.status === 'success') {
        setResponse(json.response);
        success('LLM Agent responded!');
      } else {
        throw new Error(json.error || 'LLM request failed');
      }
    } catch (err: any) {
      toastError(err.message || 'Failed to get LLM response');
      setResponse(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <NodeShell
      id={id}
      selected={selected}
      isConnectable={isConnectable}
      icon={<Cpu className="h-5 w-5" />}
      iconColor="text-cyan-500"
      name="LLM Agent"
      description="General-purpose LLM agent"
      hasLeftHandle
      hasRightHandle
      width="w-80"
    >
      <CardContent className="p-0">
        <div className="border-t border-border p-3 space-y-3">
          {/* Prompt Input */}
          <div>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask the LLM agent anything about VAB, SamboSplit, or Swedish admin..."
              rows={3}
              className="w-full text-xs rounded-md border border-border bg-background px-3 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!prompt.trim() || loading}
            className="w-full"
            size="sm"
          >
            {loading ? <><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Thinking...</> : <><Send className="h-3 w-3 mr-1" /> Send to LLM</>}
          </Button>

          {/* Response */}
          {response && (
            <div className="bg-muted rounded-lg px-3 py-2 text-xs leading-relaxed max-h-40 overflow-y-auto whitespace-pre-wrap">
              {response}
            </div>
          )}
        </div>
      </CardContent>
    </NodeShell>
  );
}
