import { useState } from "react";

export const useConfirmDeleteDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [targetId, setTargetId] = useState<number | null>(null);

  const openDialog = (id: number) => {
    setTargetId(id);
    setIsOpen(true);
  };

  const closeDialog = () => {
    setIsOpen(false);
    setTargetId(null);
  };

  return {
    isOpen,
    targetId,
    openDialog,
    closeDialog,
  };
};
