# @kousaku-maron/o3-search

An MCP (Model Context Protocol) server for web search powered by OpenAI's o3 model.

## Description

This package provides an MCP server that enables AI agents to perform advanced web searches using OpenAI's o3 model with web search capabilities. It's designed to help with finding latest information and troubleshooting errors through natural language queries.

## Installation

```bash
npm install @kousaku-maron/o3-search
```

## Prerequisites

- OpenAI API key with access to the o3 model
- Node.js environment

## Configuration

The server can be configured using environment variables:

- `OPENAI_API_KEY` (required): Your OpenAI API key
- `SEARCH_CONTEXT_SIZE` (optional): Search context size - "low", "medium", or "high" (default: "medium")
- `REASONING_EFFORT` (optional): Reasoning effort level for the o3 model (default: "medium")

## Usage

### As an MCP Server

Run the server directly:

```bash
@kousaku-maron/o3-search
```

Or use it in your MCP configuration file:

```json
{
  "mcpServers": {
    "o3-search": {
      "command": "@kousaku-maron/o3-search"
    }
  }
}
```

### Available Tools

- **o3-search**: An AI agent with advanced web search capabilities
  - Input: Natural language query in English
  - Output: Search results and analysis from the o3 model

## Example

```javascript
// The tool accepts natural language queries like:
"What are the latest developments in AI?"
"How to fix TypeError in Node.js?"
"Current weather in Tokyo"
```

## Development

```bash
# Build the project
pnpm run build

# Run tests
pnpm run test

# Watch mode for tests
pnpm run test:watch

# Coverage report
pnpm run test:coverage
```

## License

MIT

## Repository

[GitHub Repository](https://github.com/kousaku-maron/mcp)