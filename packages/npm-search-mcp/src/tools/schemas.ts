import { z, ZodRawShape } from "zod";

// Tool-specific schemas
export const NpmSearchSchema: ZodRawShape = {
  query: z.string().describe("Search query for npm packages"),
  limit: z
    .number()
    .int()
    .positive()
    .default(20)
    .describe("Maximum number of results to return"),
};

export const NpmInfoSchema: ZodRawShape = {
  package: z.string().describe("Package name to get information about"),
  version: z
    .string()
    .optional()
    .describe("Specific version to get information about (defaults to latest)"),
};

export const NpmDependenciesSchema: ZodRawShape = {
  package: z.string().describe("Package name to get dependencies for"),
  version: z
    .string()
    .optional()
    .describe("Specific version to get dependencies for (defaults to latest)"),
};

export const NpmVersionsSchema: ZodRawShape = {
  package: z.string().describe("Package name to get versions for"),
};

// Schemas for npm-summary functionality
export const NpmSummarySchema: ZodRawShape = {
  package: z.string().describe("Package name to get type definitions for"),
  version: z
    .string()
    .optional()
    .describe(
      "Specific version to get type definitions for (defaults to latest)"
    ),
  includePatterns: z
    .array(z.string())
    .optional()
    .describe("Optional patterns to include specific files"),
};

export const NpmListFilesSchema: ZodRawShape = {
  package: z.string().describe("Package name to list files for"),
  version: z
    .string()
    .optional()
    .describe("Specific version to list files for (defaults to latest)"),
};

export const NpmReadFileSchema: ZodRawShape = {
  package: z.string().describe("Package name to read file from"),
  version: z
    .string()
    .optional()
    .describe("Specific version to read file from (defaults to latest)"),
  filePath: z.string().describe("Path to the file within the package"),
};
