import type { OperationResult } from 'app/domain/types/OperationResult.js';

export interface OperationReport {
    results: OperationResult[];
    totalDurationMs?: number;
    successCount: number;
    failureCount: number;
}
