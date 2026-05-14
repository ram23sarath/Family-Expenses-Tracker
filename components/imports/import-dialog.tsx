"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { ImportWizard } from "@/components/imports/import-wizard";

export const ImportDialog = ({
  accounts
}: {
  accounts: Array<{ id: string; name: string; provider_type: string }>;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Upload CSV</Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Import holdings/transactions">
        <ImportWizard accounts={accounts} />
      </Modal>
    </>
  );
};
