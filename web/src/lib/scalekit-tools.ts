export const SCALEKIT_CONNECTIONS = {
  gmail: "gmail",
  googleDrive: "googledrive",
  notifications: "notifications",
} as const;

export const SCALEKIT_TOOL_NAMES = {
  gmailList: "gmail_messages_list",
  gmailSend: "gmail_message_send",
  driveGet: "googledrive_file_get",
  notificationSend: "notification_send",
} as const;

export function scopedToolFilter(mode: "read_only" | "act") {
  const toolNames =
    mode === "act"
      ? [SCALEKIT_TOOL_NAMES.gmailList, SCALEKIT_TOOL_NAMES.gmailSend, SCALEKIT_TOOL_NAMES.driveGet]
      : [SCALEKIT_TOOL_NAMES.gmailList, SCALEKIT_TOOL_NAMES.driveGet];

  return {
    connectionNames: [SCALEKIT_CONNECTIONS.gmail, SCALEKIT_CONNECTIONS.googleDrive],
    toolNames,
  };
}

export function futureNotificationToolFilter() {
  return {
    connectionNames: [SCALEKIT_CONNECTIONS.notifications],
    toolNames: [SCALEKIT_TOOL_NAMES.notificationSend],
  };
}
