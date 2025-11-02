/**
 * Admin Feature Exports
 */

export { AdminService } from "./api/adminService";
export { useAdminStatus } from "./hooks/useAdminStatus";
export type {
  AdminStatus,
  AdminUser,
  ChallengeWithParticipants,
  NotificationPayload,
} from "./types";

// Add to existing exports
export { default as SettingsTab } from './components/SettingsTab';
export * from './hooks/useSettings';
export * from './types/settings.types';