"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";

export const InviteMemberDialog = ({ onInvited }: { onInvited?: () => void }) => {
  const router = useRouter();
  const { pushToast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");

  const invite = async () => {
    setLoading(true);
    const response = await fetch("/api/members", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, role })
    });
    setLoading(false);
    if (!response.ok) {
      const payload = await response.json();
      pushToast(payload.error ?? "Failed to invite member", "error");
      return;
    }
    pushToast("Invite sent", "success");
    setOpen(false);
    setEmail("");
    setRole("member");
    onInvited?.();
    router.refresh();
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>Invite member</Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Invite member">
        <div className="space-y-3">
          <Input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="admin">Admin</option>
            <option value="member">Member</option>
            <option value="viewer">Viewer</option>
          </Select>
          <Button className="w-full" onClick={invite} disabled={!email || loading}>
            {loading ? "Inviting..." : "Send invite"}
          </Button>
        </div>
      </Modal>
    </>
  );
};
