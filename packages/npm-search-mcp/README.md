# npm-search-mcp

A Model Context Protocol (MCP) server for npm package search and exploration. This server provides comprehensive npm package information including search, metadata, dependencies, versions, and file content access.

## Installation

```bash
npm install -g @kousaku-maron/npm-search-mcp
```

## Features

The npm-search-mcp server provides the following tools:

### 🔍 Package Search
- **npm_search**: Search for npm packages with customizable result limits
- **npm_info**: Get detailed package information including metadata and links

### 📦 Package Analysis
- **npm_dependencies**: View package dependencies (regular, dev, and peer)
- **npm_versions**: List all available versions of a package
- **npm_summary**: Get comprehensive package overview with TypeScript definitions

### 📄 File Access
- **npm_list_files**: List all files in a package
- **npm_read_file**: Read specific files from packages

## Tools

### npm_search
Search for npm packages by query.

**Parameters:**
- `query` (string): Search query for npm packages
- `limit` (number, optional): Maximum number of results (default: 20)

**Example:**
```json
{
  "query": "react",
  "limit": 10
}
```

### npm_info
Get detailed information about a specific npm package.

**Parameters:**
- `package` (string): Package name
- `version` (string, optional): Specific version (defaults to latest)

**Example:**
```json
{
  "package": "react",
  "version": "18.2.0"
}
```

### npm_dependencies
Get dependency information for a package.

**Parameters:**
- `package` (string): Package name
- `version` (string, optional): Specific version (defaults to latest)

**Example:**
```json
{
  "package": "express"
}
```

### npm_versions
List all available versions of a package.

**Parameters:**
- `package` (string): Package name

**Example:**
```json
{
  "package": "lodash"
}
```

### npm_summary
Get a comprehensive package summary including TypeScript definitions.

**Parameters:**
- `package` (string): Package name
- `version` (string, optional): Specific version (defaults to latest)
- `includePatterns` (array, optional): File patterns to include in the summary

**Example:**
```json
{
  "package": "@types/node",
  "version": "20.0.0",
  "includePatterns": ["*.md", "*.txt"]
}
```

### npm_list_files
List all files in a package.

**Parameters:**
- `package` (string): Package name
- `version` (string, optional): Specific version (defaults to latest)

**Example:**
```json
{
  "package": "react",
  "version": "18.2.0"
}
```

### npm_read_file
Read a specific file from a package.

**Parameters:**
- `package` (string): Package name
- `version` (string, optional): Specific version (defaults to latest)
- `filePath` (string): Path to the file within the package

**Example:**
```json
{
  "package": "react",
  "version": "18.2.0",
  "filePath": "package.json"
}
```

## Configuration

Add the server to your MCP client configuration:

```json
{
  "mcpServers": {
    "npm-search": {
      "command": "@kousaku-maron/npm-search-mcp"
    }
  }
}
```

## Usage with Claude Desktop

Add to your Claude Desktop configuration file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "npm-search": {
      "command": "@kousaku-maron/npm-search-mcp"
    }
  }
}
```

## Caching

The server automatically caches downloaded packages in the system temporary directory to improve performance for repeated requests. The cache is located at:

- **Unix/Linux/macOS**: `/tmp/npm-search-cache/`
- **Windows**: `%TEMP%\npm-search-cache\`

## Requirements

- Node.js 16+
- npm CLI installed and accessible in PATH

## Development

```bash
# Clone the repository
git clone https://github.com/kousaku-maron/mcp.git
cd mcp/packages/npm-search-mcp

# Install dependencies
pnpm install

# Build the project
pnpm run build

# Run tests
pnpm test
```

## License

MIT

## Author

@kousaku-maron

## Repository

https://github.com/kousaku-maron/mcp