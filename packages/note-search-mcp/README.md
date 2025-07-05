# Note Search MCP

A Model Context Protocol (MCP) server for fetching and searching content from Note.com, Japan's popular blogging platform.

## Features

- **Fetch individual articles**: Get any Note.com article converted to clean Markdown format
- **Creator top articles**: Retrieve the top 10 most liked articles from any Note.com creator
- **Smart HTML conversion**: Properly handles Note.com's HTML structure including images, embeds, and formatting
- **Social media embeds**: Converts Twitter and Instagram embeds to readable links
- **Rate limiting**: Built-in delays to be respectful to Note.com's servers

## Installation

```bash
npm install @kousaku-maron/note-search-mcp
```

## Usage

This MCP server provides two main tools:

### 1. `get_note`
Fetches a single Note.com article and converts it to Markdown.

**Parameters:**
- `notekey` (string): The article key from the Note.com URL

**Example:**
```
URL: https://note.com/username/n/n4f0c7b884789
Note key: n4f0c7b884789
```

### 2. `get_notes_by_creator`
Fetches the top 10 most liked articles from a Note.com creator.

**Parameters:**
- `creator` (string): The creator's username

**Example:**
```
URL: https://note.com/username
Creator: username
```

## Configuration

Add this to your MCP client configuration:

```json
{
  "mcpServers": {
    "note-search": {
      "command": "npx",
      "args": ["@kousaku-maron/note-search-mcp"]
    }
  }
}
```

## Output Format

Articles are converted to clean Markdown with:
- Proper heading hierarchy
- Image captions preserved
- Social media embeds converted to links
- Clean paragraph formatting
- Metadata including like counts and publish dates

## Rate Limiting

The server includes built-in rate limiting (1-second delays) to be respectful to Note.com's infrastructure when fetching multiple articles.

## Error Handling

The server provides clear error messages for common issues:
- Invalid note keys or creator names
- Articles not found (404 errors)
- Network connection problems
- Malformed API responses

## Development

```bash
# Install dependencies
pnpm install

# Build the project
pnpm run build

# Run tests
pnpm test

# Run tests in watch mode
pnpm run test:watch
```

## License

MIT

## Repository

https://github.com/kousaku-maron/mcp