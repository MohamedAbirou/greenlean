import { Brain, CircleCheck, Droplet, Dumbbell, Flame, Footprints, type LucideProps, Repeat, Sunrise, Target, Trophy } from "lucide-react";

export const IconMap: Record<string, React.ComponentType<LucideProps>> = {
  target: Target,
  shoe: Footprints,
  droplet: Droplet,
  dumbbell: Dumbbell,
  brain: Brain,
  repeat: Repeat,
  sunrise: Sunrise,
  CircleCheck: CircleCheck,
  trophy: Trophy,
  flame: Flame,
};

export const canUpdateProgress = (
  challengeType: string,
  lastProgressDate: string | null
) => {
  if (!lastProgressDate) return true;

  const lastDate = new Date(lastProgressDate);
  const now = new Date();

  switch (challengeType) {
    case "daily":
      return (
        lastDate.getFullYear() !== now.getFullYear() ||
        lastDate.getMonth() !== now.getMonth() ||
        lastDate.getDate() !== now.getDate()
      );
    case "weekly": {
      // Check if last progress was in the same week
      const getWeekNumber = (d: Date) => {
        const oneJan = new Date(d.getFullYear(), 0, 1);
        return Math.ceil(
          ((d.getTime() - oneJan.getTime()) / 86400000 + oneJan.getDay() + 1) /
            7
        );
      };
      return getWeekNumber(lastDate) !== getWeekNumber(now);
    }
    case "streak": {
      const yesterday = new Date();
      yesterday.setDate(now.getDate() - 1);
      // allow only if last progress was yesterday (for streak continuity)
      return (
        lastDate.getFullYear() === yesterday.getFullYear() &&
        lastDate.getMonth() === yesterday.getMonth() &&
        lastDate.getDate() === yesterday.getDate()
      );
    }
    case "goal":
      return true; // goal can log anytime
    default:
      return true;
  }
};