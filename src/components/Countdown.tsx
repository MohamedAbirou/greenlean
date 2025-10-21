import { useEffect, useState } from "react";

interface CountdownProps {
  expiry: string; // ISO string of streak_expires_at
}

export default function Countdown({ expiry }: CountdownProps) {
   const [timeLeft, setTimeLeft] = useState(getTimeDiff());

  function getTimeDiff() {
    const now = new Date();
    const end = new Date(expiry);
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return null; // expired

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    return { days, hours, minutes, seconds };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeDiff());
    }, 1000);

    return () => clearInterval(timer);
  }, [expiry]);

  if (!timeLeft) return <span className="text-red-500">Streak expired!</span>;

  return (
    <span
      title="Time before you lose all your streaks!"
      style={{ cursor: "help" }}
      className="font-mono text-sm bg-gradient-to-br from-red-50 to-red-50 dark:from-red-900/40 dark:to-red-900/40 border-2 border-red-400/50 dark:border-red-500/50 text-red-600 dark:text-red-300 shadow-xl px-2 py-1 rounded-md"
    >
      {timeLeft.days > 0 ? `${timeLeft.days}d ` : ""}
      {timeLeft.hours.toString().padStart(2, "0")}:
      {timeLeft.minutes.toString().padStart(2, "0")}:
      {timeLeft.seconds.toString().padStart(2, "0")}
    </span>
  );
}
