import { ResetIcon } from '@radix-ui/react-icons';
import { ControlButton, Controls } from '@xyflow/react';
import { Maximize2 } from 'lucide-react';

type CustomControlsProps = {
  onReset: () => void;
  onFitView: () => void;
};

export function CustomControls({ onReset, onFitView }: CustomControlsProps) {
  return (
    <Controls 
      position="bottom-center" 
      orientation="horizontal" 
      style={{ bottom: 20, borderRadius: 20, gap: 10 }}
      className="bg-ramp-grey-800 text-primary px-4 py-2 rounded-md [&_button]:border-0 [&_button]:outline-0 [&_button]:shadow-none"
    >
      <ControlButton onClick={onFitView} title="Fit to View">
        <Maximize2 size={16} />
      </ControlButton>
      <ControlButton onClick={onReset} title="Reset Flow">
        <ResetIcon />
      </ControlButton>
    </Controls>
  );
} 