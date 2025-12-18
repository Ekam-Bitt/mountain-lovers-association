"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { api } from "@/lib/api";

interface ModerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  entityType: "User" | "Blog" | "Event";
  entityId: string;
  actionName: string; // "Suspend", "Flag", "Ban"
  onConfirm: (reason: string) => Promise<void>;
}

export function ModerationModal({
  isOpen,
  onClose,
  title,
  description,
  entityType,
  entityId,
  actionName,
  onConfirm,
}: ModerationModalProps) {
  const [reason, setReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    if (!reason.trim()) return;

    setIsLoading(true);
    try {
      await onConfirm(reason);
      // Create Admin Note
      await api.post("/admin/notes", {
        entityType: entityType,
        entityId: entityId,
        content: `Action: ${actionName}\nReason: ${reason}`,
      });
      setReason("");
      onClose();
    } catch (error) {
      console.error("Moderation action failed", error);
      // Assuming onConfirm handles its own alerts, or we can alert here
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="reason">Reason for {actionName}</Label>
            <Textarea
              id="reason"
              placeholder={`Explain why you are performing this action...`}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleConfirm}
            disabled={!reason.trim() || isLoading}
            variant="destructive"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {actionName}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
