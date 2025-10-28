import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { ModalDialog } from "@/shared/components/ui/modal-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Textarea } from "@/shared/components/ui/textarea";
import { Plus, Save, X } from "lucide-react";
import React from "react";

interface ExerciseLog {
  name: string;
  reps: number;
  sets: number;
  difficulty: string;
  category: string;
  rest_seconds: number;
}

interface WorkoutLog {
  workout_type: string;
  exercises: ExerciseLog[];
  notes: string;
  duration_minutes?: number;
  calories_burned?: number;
  completed?: boolean;
}

interface LogWorkoutModalProps {
  show: boolean;
  onClose: () => void;
  workoutLog: WorkoutLog;
  newExercise: ExerciseLog;
  onNewExerciseChange: (exercise: ExerciseLog) => void;
  onWorkoutLogChange: (log: WorkoutLog) => void;
  onAddExercise: () => void;
  onRemoveExercise: (index: number) => void;
  onSave: () => void;
}

export const LogWorkoutModal: React.FC<LogWorkoutModalProps> = ({
  show,
  onClose,
  workoutLog,
  newExercise,
  onNewExerciseChange,
  onWorkoutLogChange,
  onAddExercise,
  onRemoveExercise,
  onSave,
}) => {
  return (
    <ModalDialog
      open={show}
      onOpenChange={onClose}
      title="Log Your Workout"
      size="md"
    >
      <div className="space-y-4">
        <div>
          <Label>Workout Type*</Label>
          <Select
            value={workoutLog.workout_type}
            onValueChange={(value) =>
              onWorkoutLogChange({ ...workoutLog, workout_type: value })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Workout Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Strength training">Strength Training</SelectItem>
              <SelectItem value="Cardio">Cardio</SelectItem>
              <SelectItem value="HIIT">HIIT</SelectItem>
              <SelectItem value="Yoga">Yoga</SelectItem>
              <SelectItem value="Pilates">Pilates</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Duration (minutes)*</Label>
            <Input
              type="number"
              value={workoutLog.duration_minutes || ""}
              onChange={(e) =>
                onWorkoutLogChange({
                  ...workoutLog,
                  duration_minutes: Number(e.target.value)
                })
              }
              placeholder="e.g., 45"
            />
          </div>
          <div>
            <Label>Calories Burned*</Label>
            <Input
              type="number"
              value={workoutLog.calories_burned || ""}
              onChange={(e) =>
                onWorkoutLogChange({
                  ...workoutLog,
                  calories_burned: Number(e.target.value)
                })
              }
              placeholder="e.g., 300"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="completed"
            checked={workoutLog.completed ?? false}
            onChange={(e) =>
              onWorkoutLogChange({
                ...workoutLog,
                completed: e.target.checked
              })
            }
            className="w-4 h-4 rounded border-gray-300"
          />
          <Label htmlFor="completed" className="cursor-pointer">
            Mark as completed
          </Label>
        </div>

        <div className="border rounded-lg p-4 space-y-3">
          <h4 className="font-semibold">Add Exercises</h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Exercise Name*</Label>
              <Input
                value={newExercise.name}
                onChange={(e) =>
                  onNewExerciseChange({ ...newExercise, name: e.target.value })
                }
                placeholder="e.g., Push-ups"
              />
            </div>
            <div>
              <Label>Category*</Label>
              <Select
                value={newExercise.category}
                onValueChange={(value) =>
                  onNewExerciseChange({ ...newExercise, category: value })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="strength">Strength</SelectItem>
                  <SelectItem value="cardio">Cardio</SelectItem>
                  <SelectItem value="flexibility">Flexibility</SelectItem>
                  <SelectItem value="balance">Balance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Sets*</Label>
              <Input
                type="number"
                value={newExercise.sets || ""}
                onChange={(e) =>
                  onNewExerciseChange({
                    ...newExercise,
                    sets: Number(e.target.value),
                  })
                }
              />
            </div>
            <div>
              <Label>Reps*</Label>
              <Input
                type="number"
                value={newExercise.reps || ""}
                onChange={(e) =>
                  onNewExerciseChange({
                    ...newExercise,
                    reps: Number(e.target.value),
                  })
                }
              />
            </div>
            <div>
              <Label>Difficulty</Label>
              <Select
                value={newExercise.difficulty}
                onValueChange={(value) =>
                  onNewExerciseChange({ ...newExercise, difficulty: value })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Rest (seconds)</Label>
              <Input
                type="number"
                value={newExercise.rest_seconds || ""}
                onChange={(e) =>
                  onNewExerciseChange({
                    ...newExercise,
                    rest_seconds: Number(e.target.value),
                  })
                }
              />
            </div>
          </div>
          <Button onClick={onAddExercise} variant="secondary" className="w-full">
            <Plus className="h-4 w-4" />
            Add Exercise
          </Button>
        </div>

        {workoutLog.exercises.length > 0 && (
          <div className="border rounded-lg p-4">
            <h4 className="font-semibold mb-2">Added Exercises</h4>
            <div className="space-y-2">
              {workoutLog.exercises.map((exercise, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-background p-2 rounded"
                >
                  <div>
                    <div className="font-medium">{exercise.name}</div>
                    <div className="text-sm text-foreground/70">
                      {exercise.sets} sets × {exercise.reps} reps
                    </div>
                  </div>
                  <button
                    onClick={() => onRemoveExercise(index)}
                    className="text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <Label>Notes</Label>
          <Textarea
            value={workoutLog.notes}
            onChange={(e) =>
              onWorkoutLogChange({ ...workoutLog, notes: e.target.value })
            }
            placeholder="Any additional notes about this workout..."
          />
        </div>

        <Button onClick={onSave} className="w-full text-white">
          <Save className="h-4 w-4" />
          Save Workout Log
        </Button>
      </div>
    </ModalDialog>
  );
};