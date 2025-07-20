import type { OperationStatus } from 'app/domain/types/OperationStatus.js';

export interface OperationResult {
    moduleName: string;
    status: OperationStatus;
    durationMs?: number;
    error?: string;
}
