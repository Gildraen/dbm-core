import fs from "fs";
import path from "path";
import { describe, expect, test } from "vitest";

function collectTsFiles(dirPath: string): string[] {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    const files: string[] = [];

    for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        if (entry.isDirectory()) {
            files.push(...collectTsFiles(fullPath));
            continue;
        }

        if (entry.isFile() && fullPath.endsWith(".ts")) {
            files.push(fullPath);
        }
    }

    return files;
}

describe("Architecture boundaries", () => {
    test("domain layer must not import infrastructure layer", () => {
        const domainRoot = path.resolve(process.cwd(), "src/domain");
        const files = collectTsFiles(domainRoot);
        const violations: string[] = [];

        for (const filePath of files) {
            const content = fs.readFileSync(filePath, "utf8");
            if (content.includes('from "app/infrastructure') || content.includes("from 'app/infrastructure")) {
                violations.push(path.relative(process.cwd(), filePath));
            }
        }

        expect(violations).toEqual([]);
    });
});
