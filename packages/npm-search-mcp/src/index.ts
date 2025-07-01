#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  NpmSearchSchema,
  NpmInfoSchema,
  NpmDependenciesSchema,
  NpmVersionsSchema,
  NpmSummarySchema,
  NpmListFilesSchema,
  NpmReadFileSchema,
} from "./tools/schemas.js";
import {
  npmSearch,
  npmInfo,
  npmDependencies,
  npmVersions,
  npmSummary,
  npmListFiles,
  npmReadFile,
} from "./tools/npm-tools.js";

const server = new McpServer({
  name: "npm-search",
  version: "0.0.1",
});

// Register npm search tool
server.tool(
  "npm_search",
  "Search for npm packages",
  NpmSearchSchema,
  async ({ query, limit }) => {
    const result = await npmSearch(query, limit);
    return {
      content: [
        {
          type: "text",
          text: result,
        },
      ],
    };
  }
);

// Register npm info tool
server.tool(
  "npm_info",
  "Get information about a specific npm package",
  NpmInfoSchema,
  async ({ package: packageName, version }) => {
    const result = await npmInfo(packageName, version);
    return {
      content: [
        {
          type: "text",
          text: result,
        },
      ],
    };
  }
);

// Register npm dependencies tool
server.tool(
  "npm_dependencies",
  "Get dependencies for a specific npm package",
  NpmDependenciesSchema,
  async ({ package: packageName, version }) => {
    const result = await npmDependencies(packageName, version);
    return {
      content: [
        {
          type: "text",
          text: result,
        },
      ],
    };
  }
);

// Register npm versions tool
server.tool(
  "npm_versions",
  "Get available versions for a specific npm package",
  NpmVersionsSchema,
  async ({ package: packageName }) => {
    const result = await npmVersions(packageName);
    return {
      content: [
        {
          type: "text",
          text: result,
        },
      ],
    };
  }
);

// Register npm summary tool
server.tool(
  "npm_summary",
  "Get package summary with type definitions",
  NpmSummarySchema,
  async ({ package: packageName, version, includePatterns }) => {
    const result = await npmSummary(packageName, version, includePatterns);
    return {
      content: [
        {
          type: "text",
          text: result,
        },
      ],
    };
  }
);

// Register npm list files tool
server.tool(
  "npm_list_files",
  "List all files in a package",
  NpmListFilesSchema,
  async ({ package: packageName, version }) => {
    const result = await npmListFiles(packageName, version);
    return {
      content: [
        {
          type: "text",
          text: result,
        },
      ],
    };
  }
);

// Register npm read file tool
server.tool(
  "npm_read_file",
  "Read a specific file from a package",
  NpmReadFileSchema,
  async ({ package: packageName, version, filePath }) => {
    const result = await npmReadFile(packageName, version, filePath);
    return {
      content: [
        {
          type: "text",
          text: result,
        },
      ],
    };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Npm Search MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
