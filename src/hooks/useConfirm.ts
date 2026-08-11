import { useState } from 'react';
import { useModal } from './useModal';

export function useConfirm() {
  const modal = useModal();
  const [confirmConfig, setConfirmConfig] = useState<{
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void | Promise<void>;
    isDestructive?: boolean;
  } | null>(null);

  const confirm = (config: typeof confirmConfig) => {
    setConfirmConfig(config);
    modal.open();
  };

  const handleConfirm = async () => {
    if (confirmConfig?.onConfirm) {
      await confirmConfig.onConfirm();
    }
    modal.close();
  };

  return {
    isOpen: modal.isOpen,
    close: modal.close,
    confirm,
    handleConfirm,
    config: confirmConfig,
  };
}
