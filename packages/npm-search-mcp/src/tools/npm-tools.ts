import { exec } from "child_process";
import { promisify } from "util";
import { promises as fs } from "fs";
import { join } from "path";
import * as os from "os";
import * as crypto from "crypto";

const execPromise = promisify(exec);

// Cache directory for downloaded packages
const CACHE_DIR = join(os.tmpdir(), "npm-search-cache");

// Helper function to ensure a directory exists
const ensureDir = async (dir: string): Promise<void> => {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (error) {
    // Ignore if directory already exists
    if ((error as NodeJS.ErrnoException).code !== "EEXIST") {
      throw error;
    }
  }
};

// Helper function to create a hash for caching
const createHash = (input: string): string => {
  return crypto.createHash("md5").update(input).digest("hex");
};

// Helper function to download and extract a package
const downloadPackage = async (
  packageName: string,
  version: string,
  useCache: boolean = true
): Promise<string> => {
  // Create a unique directory name based on package and version
  const packageDir = join(
    CACHE_DIR,
    `${packageName.replace("/", "-")}-${version}`
  );

  // Check if package is already cached
  if (useCache) {
    try {
      await fs.access(packageDir);
      return packageDir;
    } catch (error) {
      // Package not cached, continue with download
    }
  }

  // Ensure cache directory exists
  await ensureDir(CACHE_DIR);

  // Create a temporary directory for the package
  await ensureDir(packageDir);

  // Download the package using npm pack
  const versionStr = version === "latest" ? "" : `@${version}`;
  const { stdout } = await execPromise(
    `npm pack ${packageName}${versionStr} --pack-destination="${packageDir}"`
  );

  // The tarball name is in the stdout
  const tarballPath = join(packageDir, stdout.trim());

  // Extract the tarball
  await execPromise(`tar -xzf "${tarballPath}" -C "${packageDir}"`);

  // The extracted content is in a 'package' directory
  const extractedDir = join(packageDir, "package");

  return extractedDir;
};

// Helper function to find TypeScript definition files in a directory
const findTypeDefinitions = async (dir: string): Promise<string[]> => {
  const typeFiles: string[] = [];

  // Function to recursively search for .d.ts files
  const searchDir = async (currentDir: string) => {
    const entries = await fs.readdir(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(currentDir, entry.name);

      if (entry.isDirectory() && entry.name !== "node_modules") {
        await searchDir(fullPath);
      } else if (entry.isFile() && entry.name.endsWith(".d.ts")) {
        typeFiles.push(fullPath);
      }
    }
  };

  await searchDir(dir);
  return typeFiles;
};

// Helper function to list all files in a package
const listFiles = async (dir: string): Promise<string[]> => {
  const files: string[] = [];

  // Function to recursively list files
  const searchDir = async (currentDir: string, relativePath: string = "") => {
    const entries = await fs.readdir(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const entryRelativePath = join(relativePath, entry.name);

      if (entry.isDirectory()) {
        files.push(`${entryRelativePath}/`);
        await searchDir(join(currentDir, entry.name), entryRelativePath);
      } else if (entry.isFile()) {
        files.push(entryRelativePath);
      }
    }
  };

  await searchDir(dir);
  return files;
};

/**
 * Search for npm packages
 * @param query Search query
 * @param limit Maximum number of results to return
 * @returns Search results as a string
 */
export const npmSearch = async (
  query: string,
  limit: number = 20
): Promise<string> => {
  try {
    const { stdout, stderr } = await execPromise(
      `npm search ${query} --json --limit=${limit}`
    );

    if (stderr) {
      return `Error searching for packages: ${stderr}`;
    }

    // Parse the JSON output and format it nicely
    const results = JSON.parse(stdout);

    if (results.length === 0) {
      return `No packages found matching "${query}"`;
    }

    const formattedResults = results
      .map((pkg: any) => {
        return `Package: ${pkg.name}
Version: ${pkg.version}
Description: ${pkg.description || "No description"}
Author: ${pkg.author?.name || pkg.maintainers?.[0]?.name || "Unknown"}
Keywords: ${(pkg.keywords || []).join(", ")}
Date: ${pkg.date ? new Date(pkg.date).toISOString() : "Unknown"}
Links: ${pkg.links?.npm || `https://www.npmjs.com/package/${pkg.name}`}
`;
      })
      .join("\n---\n\n");

    return `Found ${results.length} packages matching "${query}":\n\n${formattedResults}`;
  } catch (error) {
    if (error instanceof Error) {
      return `Error searching for packages: ${error.message}`;
    }
    return `Unknown error occurred while searching for packages`;
  }
};

/**
 * Get information about a specific npm package
 * @param packageName Package name
 * @param version Specific version (optional, defaults to latest)
 * @returns Package information as a string
 */
export const npmInfo = async (
  packageName: string,
  version?: string
): Promise<string> => {
  try {
    const versionStr = version ? `@${version}` : "";
    const { stdout, stderr } = await execPromise(
      `npm view ${packageName}${versionStr} --json`
    );

    if (stderr) {
      return `Error getting package information: ${stderr}`;
    }

    // Parse the JSON output and format it nicely
    const info = JSON.parse(stdout);

    // Format the output
    const formattedInfo = `
Package: ${info.name}
Version: ${info.version}
Description: ${info.description || "No description"}
Author: ${
      typeof info.author === "string"
        ? info.author
        : info.author?.name || "Unknown"
    }
License: ${info.license || "Unknown"}
Homepage: ${info.homepage || "Not specified"}
Repository: ${
      typeof info.repository === "string"
        ? info.repository
        : info.repository?.url || "Not specified"
    }
NPM: https://www.npmjs.com/package/${info.name}
Published: ${
      info.time?.modified
        ? new Date(info.time.modified).toISOString()
        : "Unknown"
    }
Keywords: ${(info.keywords || []).join(", ")}
`;

    return formattedInfo;
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("code E404")) {
        return `Package "${packageName}" not found`;
      }
      return `Error getting package information: ${error.message}`;
    }
    return `Unknown error occurred while getting package information`;
  }
};

/**
 * Get dependencies for a specific npm package
 * @param packageName Package name
 * @param version Specific version (optional, defaults to latest)
 * @returns Dependencies information as a string
 */
export const npmDependencies = async (
  packageName: string,
  version?: string
): Promise<string> => {
  try {
    const versionStr = version ? `@${version}` : "";
    const { stdout, stderr } = await execPromise(
      `npm view ${packageName}${versionStr} dependencies devDependencies peerDependencies --json`
    );

    if (stderr) {
      return `Error getting package dependencies: ${stderr}`;
    }

    // Parse the JSON output
    const deps = JSON.parse(stdout);

    // Format the output
    let result = `Dependencies for ${packageName}${versionStr}:\n\n`;

    if (deps.dependencies && Object.keys(deps.dependencies).length > 0) {
      result += "Dependencies:\n";
      for (const [name, ver] of Object.entries(deps.dependencies)) {
        result += `- ${name}: ${ver}\n`;
      }
      result += "\n";
    } else {
      result += "Dependencies: None\n\n";
    }

    if (deps.devDependencies && Object.keys(deps.devDependencies).length > 0) {
      result += "Dev Dependencies:\n";
      for (const [name, ver] of Object.entries(deps.devDependencies)) {
        result += `- ${name}: ${ver}\n`;
      }
      result += "\n";
    } else {
      result += "Dev Dependencies: None\n\n";
    }

    if (
      deps.peerDependencies &&
      Object.keys(deps.peerDependencies).length > 0
    ) {
      result += "Peer Dependencies:\n";
      for (const [name, ver] of Object.entries(deps.peerDependencies)) {
        result += `- ${name}: ${ver}\n`;
      }
    } else {
      result += "Peer Dependencies: None";
    }

    return result;
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("code E404")) {
        return `Package "${packageName}" not found`;
      }
      return `Error getting package dependencies: ${error.message}`;
    }
    return `Unknown error occurred while getting package dependencies`;
  }
};

/**
 * Get available versions for a specific npm package
 * @param packageName Package name
 * @returns Available versions as a string
 */
export const npmVersions = async (packageName: string): Promise<string> => {
  try {
    const { stdout, stderr } = await execPromise(
      `npm view ${packageName} versions --json`
    );

    if (stderr) {
      return `Error getting package versions: ${stderr}`;
    }

    // Parse the JSON output
    const versions = JSON.parse(stdout);

    if (!Array.isArray(versions)) {
      return `Error: Unexpected response format for versions of ${packageName}`;
    }

    // Format the output
    const formattedVersions = versions.map((v: string) => `- ${v}`).join("\n");

    return `Available versions for ${packageName}:\n\n${formattedVersions}`;
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("code E404")) {
        return `Package "${packageName}" not found`;
      }
      return `Error getting package versions: ${error.message}`;
    }
    return `Unknown error occurred while getting package versions`;
  }
};

/**
 * Get package summary with type definitions
 * @param packageName Package name
 * @param version Package version (optional, defaults to latest)
 * @param includePatterns Optional patterns to include specific files
 * @returns Package summary as a string
 */
export const npmSummary = async (
  packageName: string,
  version: string = "latest",
  includePatterns: string[] = []
): Promise<string> => {
  try {
    // Download and extract the package
    const packageDir = await downloadPackage(packageName, version);

    // Find TypeScript definition files
    const typeFiles = await findTypeDefinitions(packageDir);

    // If no type files found, return a message
    if (typeFiles.length === 0) {
      return `No TypeScript definition files found for ${packageName}@${version}`;
    }

    // Read package.json to get basic info
    let packageInfo = {};
    try {
      const packageJsonPath = join(packageDir, "package.json");
      const packageJsonContent = await fs.readFile(packageJsonPath, "utf-8");
      packageInfo = JSON.parse(packageJsonContent);
    } catch (error) {
      // Ignore errors reading package.json
    }

    // Build the summary
    let summary = `# ${packageName}@${version} Summary\n\n`;

    // Add package info if available
    if (Object.keys(packageInfo).length > 0) {
      const info = packageInfo as any;
      summary += `## Package Information\n\n`;
      summary += `- Name: ${info.name || packageName}\n`;
      summary += `- Version: ${info.version || version}\n`;
      if (info.description) summary += `- Description: ${info.description}\n`;
      if (info.author)
        summary += `- Author: ${
          typeof info.author === "string" ? info.author : info.author.name
        }\n`;
      if (info.license) summary += `- License: ${info.license}\n`;
      if (info.homepage) summary += `- Homepage: ${info.homepage}\n`;
      if (info.repository)
        summary += `- Repository: ${
          typeof info.repository === "string"
            ? info.repository
            : info.repository.url
        }\n`;
      summary += `\n`;
    }

    // Add type definitions
    summary += `## Type Definitions\n\n`;

    // Process each type definition file
    for (const typeFile of typeFiles) {
      const relativePath = typeFile.replace(packageDir, "").replace(/^\//, "");
      const content = await fs.readFile(typeFile, "utf-8");

      summary += `### ${relativePath}\n\n`;
      summary += "```typescript\n";
      summary += content;
      summary += "\n```\n\n";
    }

    // Include additional files if patterns are specified
    if (includePatterns.length > 0) {
      const allFiles = await listFiles(packageDir);
      const includedFiles: string[] = [];

      // Match files against patterns
      for (const file of allFiles) {
        for (const pattern of includePatterns) {
          if (
            file.includes(pattern) ||
            (pattern.includes("*") &&
              new RegExp(pattern.replace("*", ".*")).test(file))
          ) {
            includedFiles.push(file);
            break;
          }
        }
      }

      if (includedFiles.length > 0) {
        summary += `## Additional Files\n\n`;

        for (const file of includedFiles) {
          try {
            const filePath = join(packageDir, file);
            const stats = await fs.stat(filePath);

            if (stats.isFile()) {
              const content = await fs.readFile(filePath, "utf-8");
              const extension = file.split(".").pop() || "";

              summary += `### ${file}\n\n`;
              summary += "```" + extension + "\n";
              summary += content;
              summary += "\n```\n\n";
            }
          } catch (error) {
            // Skip files that can't be read
          }
        }
      }
    }

    return summary;
  } catch (error) {
    if (error instanceof Error) {
      return `Error getting package summary: ${error.message}`;
    }
    return `Unknown error occurred while getting package summary`;
  }
};

/**
 * List all files in a package
 * @param packageName Package name
 * @param version Package version (optional, defaults to latest)
 * @returns List of files as a string
 */
export const npmListFiles = async (
  packageName: string,
  version: string = "latest"
): Promise<string> => {
  try {
    // Download and extract the package
    const packageDir = await downloadPackage(packageName, version);

    // List all files
    const files = await listFiles(packageDir);

    // Sort files for better readability
    files.sort();

    return `Files in ${packageName}@${version}:\n\n${files.join("\n")}`;
  } catch (error) {
    if (error instanceof Error) {
      return `Error listing package files: ${error.message}`;
    }
    return `Unknown error occurred while listing package files`;
  }
};

/**
 * Read a specific file from a package
 * @param packageName Package name
 * @param version Package version (optional, defaults to latest)
 * @param filePath Path to the file within the package
 * @returns File content as a string
 */
export const npmReadFile = async (
  packageName: string,
  version: string = "latest",
  filePath: string
): Promise<string> => {
  try {
    // Download and extract the package
    const packageDir = await downloadPackage(packageName, version);

    // Normalize the file path (remove leading slash if present)
    const normalizedFilePath = filePath.replace(/^\//, "");

    // Get the full path to the file
    const fullFilePath = join(packageDir, normalizedFilePath);

    // Check if the file exists
    try {
      await fs.access(fullFilePath);
    } catch (error) {
      return `File not found: ${filePath} in package ${packageName}@${version}`;
    }

    // Read the file content
    const content = await fs.readFile(fullFilePath, "utf-8");

    // Get the file extension
    const extension = filePath.split(".").pop() || "";

    // Format the output
    let result = `File: ${filePath} from ${packageName}@${version}\n\n`;

    // Add code formatting based on file extension
    result += "```" + extension + "\n";
    result += content;
    result += "\n```";

    return result;
  } catch (error) {
    if (error instanceof Error) {
      return `Error reading file: ${error.message}`;
    }
    return `Unknown error occurred while reading file`;
  }
};
