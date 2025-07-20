export const OperationStatus = {
    SUCCESS: "success",
    FAILED: "failed"
} as const;

export type OperationStatus = typeof OperationStatus[keyof typeof OperationStatus];
