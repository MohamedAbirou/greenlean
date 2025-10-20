export const queryKeys = {
  overview: ["overview"] as const,
  challenges: ["challenges"] as const,
  users: ["users"] as const,
  user: (id: string) => [...queryKeys.users, id] as const,
  currentUser: ["currentUser"] as const,
  rewards: ["rewards"] as const,
  reward: (id: string) => [...queryKeys.rewards, id] as const,
  settings: ["settings"] as const,
  badges: ["badges"] as const
};
