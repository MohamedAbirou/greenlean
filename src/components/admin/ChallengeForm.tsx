import { cn } from "@/lib/utils";
import type { Badge, Challenge } from "@/types/challenge";
import type { ColorTheme } from "@/utils/colorUtils";
import * as LucideIcons from "lucide-react";
import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { ModalDialog } from "../ui/modal-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";
import { IconMap } from "@/helpers/challengeHelper";

interface ChallengeFormProps {
  challenge?: Challenge | null;
  badges: Badge[];
  open?: boolean; // make optional since you’re conditionally rendering it
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Partial<Challenge>) => void;
  colorTheme: ColorTheme;
}

type ChallengeType = "daily" | "weekly" | "streak" | "goal";
type ChallengeDifficulty = "beginner" | "intermediate" | "advanced";

const ChallengeForm: React.FC<ChallengeFormProps> = ({
  challenge,
  badges,
  open,
  onSubmit,
  onOpenChange,
  colorTheme,
}) => {
  const [requirementsJson, setRequirementsJson] = useState("");
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Challenge>>({
    title: "",
    description: "",
    type: "daily",
    difficulty: "beginner",
    points: 0,
    badge_id: "",
    requirements: {
      target: 0,
    },
    start_date: new Date().toISOString().split("T")[0],
    end_date: new Date().toISOString().split("T")[0],
    is_active: true,
  });

  useEffect(() => {
    if (challenge) {
      // editing existing challenge
      setFormData({
        ...challenge,
        start_date: new Date(challenge.start_date).toISOString().split("T")[0],
        end_date: new Date(challenge.end_date).toISOString().split("T")[0],
      });
      setRequirementsJson(
        JSON.stringify(challenge.requirements ?? { target: 0 }, null, 2)
      );
    } else {
      // creating new challenge → reset form
      setFormData({
        title: "",
        description: "",
        type: "daily",
        difficulty: "beginner",
        points: 0,
        badge_id: "",
        requirements: { target: 0 },
        start_date: new Date().toISOString().split("T")[0],
        end_date: new Date().toISOString().split("T")[0],
        is_active: true,
      });
      setRequirementsJson(JSON.stringify({ target: 0 }, null, 2));
    }
  }, [challenge, open]);
  
  const handleRequirementsChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const rawValue = e.target.value;
    setRequirementsJson(rawValue);

    try {
      const parsed = JSON.parse(rawValue);
      setFormData((prev) => ({
        ...prev,
        requirements: parsed,
      }));
      setJsonError(null);
    } catch (err) {
      console.error(err);
      setJsonError("Invalid JSON format");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload: Partial<Challenge> & { badge_id?: string } = {
      title: formData.title,
      description: formData.description,
      type: formData.type,
      difficulty: formData.difficulty,
      points: formData.points,
      badge_id: formData.badge_id || undefined,
      requirements: formData.requirements,
      start_date: formData.start_date,
      end_date: formData.end_date,
      is_active: formData.is_active,
    };

    onSubmit(payload);
  };

  return (
    <ModalDialog
      open={open ?? true}
      onOpenChange={onOpenChange ?? (() => {})}
      title={challenge ? "Edit Challenge" : "Create Challenge"}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            name="title"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            placeholder="Enter challenge title"
            required
          />
        </div>

        {/* Description */}
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            rows={3}
            placeholder="Describe the challenge"
            required
          />
        </div>

        {/* Type & Difficulty */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label>Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value) =>
                setFormData({ ...formData, type: value as ChallengeType })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="streak">Streak</SelectItem>
                <SelectItem value="goal">Goal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Difficulty</Label>
            <Select
              value={formData.difficulty}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  difficulty: value as ChallengeDifficulty,
                })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Points & Badge */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="points">Points</Label>
            <Input
              type="number"
              id="points"
              name="points"
              min={0}
              value={formData.points}
              onChange={(e) =>
                setFormData({ ...formData, points: Number(e.target.value) })
              }
              required
            />
          </div>

          <div>
            <Label>Reward Badge</Label>
            <Select
              value={formData.badge_id || "none"}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  badge_id: value === "none" ? undefined : value,
                })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a badge reward" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="none" className="text-foreground">
                  No badge reward
                </SelectItem>

                {badges.map((badge) => {

                  const BadgeIconComponent =
                    IconMap[badge?.icon ?? "star"] || LucideIcons.Star;
                  return (
                    <SelectItem
                      key={badge.id}
                      value={badge.id}
                      className="flex items-center gap-2 px-2 py-1"
                      style={{ color: badge.color }}
                    >
                      {BadgeIconComponent && (
                        <BadgeIconComponent
                          className="w-5 h-5"
                          style={{ color: badge.color }}
                        />
                      )}
                      <span>{badge.name}</span>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Requirements JSON */}
        <div>
          <Label htmlFor="requirements">Requirements (JSON)</Label>
          <Textarea
            id="requirements"
            value={requirementsJson}
            onChange={handleRequirementsChange}
            rows={8}
            className="font-mono text-sm"
            placeholder={`Example:\n{\n  "activity": "cardio",\n  "target": 3\n}`}
          />
          {jsonError && (
            <p className="text-destructive text-sm mt-1">{jsonError}</p>
          )}
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label>Start Date</Label>
            <Input
              type="date"
              value={formData.start_date}
              onChange={(e) =>
                setFormData({ ...formData, start_date: e.target.value })
              }
              required
            />
          </div>
          <div>
            <Label>End Date</Label>
            <Input
              type="date"
              value={formData.end_date}
              onChange={(e) =>
                setFormData({ ...formData, end_date: e.target.value })
              }
              required
            />
          </div>
        </div>

        {/* Active Checkbox */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="is_active"
            checked={formData.is_active}
            onCheckedChange={(checked) =>
              setFormData({ ...formData, is_active: !!checked })
            }
          />
          <Label htmlFor="is_active">Active Challenge</Label>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className={cn(`${colorTheme.primaryBg} text-white`)}
          >
            {challenge ? "Update Challenge" : "Create Challenge"}
          </Button>
        </div>
      </form>
    </ModalDialog>
  );
};

export default ChallengeForm;
