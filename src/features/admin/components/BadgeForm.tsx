import type { Badge } from "@/shared/types/challenge";
import { useEffect, useState } from "react";
import { Button } from "../../../shared/components/ui/button";
import { Input } from "../../../shared/components/ui/input";
import { Label } from "../../../shared/components/ui/label";
import { ModalDialog } from "../../../shared/components/ui/modal-dialog";

interface BadgeFormProps {
  badge?: Badge | null;
  open?: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Partial<Badge>) => void;
}

const BadgeForm: React.FC<BadgeFormProps> = ({ badge, open, onOpenChange, onSubmit }) => {
  const [formData, setFormData] = useState({ name: "", description: "", icon: "", color: "" });

  useEffect(() => {
    if (badge) setFormData(badge);
    else setFormData({ name: "", description: "", icon: "", color: "" });
  }, [badge, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <ModalDialog open={open ?? true} onOpenChange={onOpenChange} title={badge ? "Edit Badge" : "Create Badge"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>Name</Label>
          <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
        </div>
        <div>
          <Label>Description</Label>
          <Input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
        </div>
        <div>
          <Label>Icon</Label>
          <Input value={formData.icon} onChange={(e) => setFormData({ ...formData, icon: e.target.value })} />
        </div>
        <div>
          <Label>Color</Label>
          <Input type="color" value={formData.color} onChange={(e) => setFormData({ ...formData, color: e.target.value })} />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="submit">{badge ? "Update Badge" : "Create Badge"}</Button>
        </div>
      </form>
    </ModalDialog>
  );
};

export default BadgeForm;
