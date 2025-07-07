export type ModuleMigrationResult = {
    moduleName: string;
    status: 'success' | 'skipped' | 'failed';
    durationMs?: number;
    error?: string; // on serialize l'erreur
};

export type MigrationReport = {
    results: ModuleMigrationResult[];
    totalDurationMs: number;
    successCount: number;
    failureCount: number;
};
