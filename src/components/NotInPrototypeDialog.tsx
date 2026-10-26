import Button from './Button';
import Modal from './Modal';

export interface NotInPrototypeDialogProps {
  open: boolean;
  onClose: () => void;
  /** What was clicked, e.g. "Reports". */
  feature?: string;
  /** Gallery only. */
  preview?: boolean;
}

/** Friendly dialog for anything that was not designed for this walkthrough. */
export default function NotInPrototypeDialog({ open, onClose, feature, preview }: NotInPrototypeDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      preview={preview}
      width={400}
      title="Not part of this prototype"
      description={
        feature
          ? `${feature} isn’t designed for this walkthrough yet. Everything else you can click is working.`
          : 'This part isn’t designed for this walkthrough yet. Everything else you can click is working.'
      }
      actions={<Button onClick={onClose}>OK</Button>}
    />
  );
}
