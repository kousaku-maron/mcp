import TurndownService from "turndown";

// Type definitions for Note API responses
interface NoteContent {
  key: string;
  likeCount: number;
  [key: string]: any;
}

interface NoteListResponse {
  data: {
    contents: NoteContent[];
    isLastPage: boolean;
    totalCount: number;
  };
}

// Initialize Turndown for HTML to Markdown conversion
const turndownService = new TurndownService({
  headingStyle: "atx",
  codeBlockStyle: "fenced",
});

// Configure Turndown rules for Note.com specific HTML
turndownService.addRule("figures", {
  filter: "figure",
  replacement: function (content: string, node: TurndownService.Node) {
    // Use Turndown's built-in HTML attribute access
    const imgElement = (node as any).querySelector ? (node as any).querySelector("img") : null;
    const figcaptionElement = (node as any).querySelector ? (node as any).querySelector("figcaption") : null;

    if (imgElement) {
      const alt = imgElement.getAttribute("alt") || "";
      const src = imgElement.getAttribute("src") || "";
      let markdown = `![${alt}](${src})`;

      if (figcaptionElement && figcaptionElement.textContent) {
        markdown += `\n*${figcaptionElement.textContent.trim()}*`;
      }

      return `\n\n${markdown}\n\n`;
    }

    return content;
  },
});

// Add rule for handling Note.com's paragraph styles
turndownService.addRule("paragraphs", {
  filter: "p",
  replacement: function (content: string) {
    return `\n\n${content}\n\n`;
  },
});

// Add rule for handling Note.com's headings
turndownService.addRule("headings", {
  filter: ["h1", "h2", "h3", "h4", "h5", "h6"],
  replacement: function (content: string, node: TurndownService.Node) {
    const level = Number((node as any).nodeName.charAt(1));
    const hashes = "#".repeat(level);
    return `\n\n${hashes} ${content}\n\n`;
  },
});

// Add rule for handling Note.com's links
turndownService.addRule("links", {
  filter: "a",
  replacement: function (content: string, node: TurndownService.Node) {
    const href = (node as any).getAttribute("href") || "";
    return `[${content}](${href})`;
  },
});

// Add rule for handling Twitter embeds
turndownService.addRule("twitter", {
  filter: function (node: TurndownService.Node) {
    return (node as any).getAttribute && (node as any).getAttribute("embedded-service") === "twitter";
  },
  replacement: function (content: string, node: TurndownService.Node) {
    const tweetUrl = (node as any).getAttribute("data-src");
    if (tweetUrl) {
      return `\n\nTweet: ${tweetUrl}\n\n`;
    }
    return content;
  },
});

// Add rule for handling Instagram embeds
turndownService.addRule("instagram", {
  filter: function (node: TurndownService.Node) {
    return (node as any).getAttribute && (node as any).getAttribute("embedded-service") === "instagram";
  },
  replacement: function (content: string, node: TurndownService.Node) {
    const instagramUrl = (node as any).getAttribute("data-src");
    if (instagramUrl) {
      return `\n\nInstagram post: ${instagramUrl}\n\n`;
    }
    return content;
  },
});

/**
 * Fetch article from Note.com and convert to Markdown
 * @param notekey Note article key
 * @returns Article content in Markdown format
 */
export const fetchNoteArticle = async (notekey: string): Promise<string> => {
  try {
    // Validate notekey format (basic validation)
    if (!notekey.match(/^[a-zA-Z0-9]+$/)) {
      return `Error: Invalid notekey format. Expected alphanumeric characters.`;
    }

    // Fetch article from Note.com API
    const response = await fetch(`https://note.com/api/v3/notes/${notekey}`);

    if (!response.ok) {
      if (response.status === 404) {
        return `Error: Article with key "${notekey}" not found.`;
      }
      return `Error fetching article: HTTP ${response.status} - ${response.statusText}`;
    }

    const data = await response.json();

    // Extract title and body from response
    const title = (data as any).data?.name;
    const body = (data as any).data?.body;

    if (!title || !body) {
      return `Error: Could not extract title or body from the article.`;
    }

    // Convert HTML to Markdown directly using Turndown
    // The custom rules will handle embedded content automatically
    const markdownBody = turndownService.turndown(body);

    // Format the final output
    const markdown = `# ${title}\n\n${markdownBody}`;

    return markdown;
  } catch (error) {
    if (error instanceof Error) {
      return `Error processing article: ${error.message}`;
    }
    return `Unknown error occurred while processing the article`;
  }
};

/**
 * Sleep for the specified number of milliseconds
 * @param ms Milliseconds to sleep
 * @returns Promise that resolves after the specified time
 */
const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Fetch top 10 notes by likeCount from a creator
 * @param creator Note creator username
 * @returns Top 10 notes by likeCount in Markdown format
 */
export const fetchNotesByCreator = async (creator: string): Promise<string> => {
  try {
    // Validate creator format (basic validation)
    if (!creator.match(/^[a-zA-Z0-9_-]+$/)) {
      return `Error: Invalid creator format. Expected alphanumeric characters, underscores, or hyphens.`;
    }

    // Array to store all notes
    const allNotes: NoteContent[] = [];
    let currentPage = 1;
    let isLastPage = false;

    // Fetch all pages of notes
    while (!isLastPage) {
      // Fetch notes from Note.com API
      const response = await fetch(
        `https://note.com/api/v2/creators/${creator}/contents?kind=note&page=${currentPage}`
      );

      if (!response.ok) {
        if (response.status === 404) {
          return `Error: Creator "${creator}" not found.`;
        }
        return `Error fetching notes: HTTP ${response.status} - ${response.statusText}`;
      }

      const data = (await response.json()) as NoteListResponse;

      if (!data.data?.contents || !Array.isArray(data.data.contents)) {
        return `Error: Could not extract note contents from the response.`;
      }

      // Add notes from this page to our collection
      allNotes.push(...data.data.contents);

      // Check if this is the last page
      isLastPage = data.data.isLastPage;

      // Add a 1-second delay before fetching the next page to reduce load on the server
      if (!isLastPage) {
        await sleep(1000);
      }

      // Move to next page
      currentPage++;

      // Safety check to prevent infinite loops
      if (currentPage > 10) {
        break;
      }
    }

    // Sort notes by likeCount (descending)
    const sortedNotes = allNotes.sort((a, b) => {
      const likeCountA =
        typeof a.likeCount === "number"
          ? a.likeCount
          : typeof a.likeCount === "string"
          ? parseInt(a.likeCount, 10)
          : 0;
      const likeCountB =
        typeof b.likeCount === "number"
          ? b.likeCount
          : typeof b.likeCount === "string"
          ? parseInt(b.likeCount, 10)
          : 0;
      return likeCountB - likeCountA;
    });

    // Take top 10 notes
    const topNotes = sortedNotes.slice(0, 10);

    // Format the notes as a summary
    let markdown = `# Top 10 Most Liked Notes by ${creator}\n\n`;

    // Fetch full content for each note
    for (let i = 0; i < topNotes.length; i++) {
      const note = topNotes[i];
      if (!note) continue;
      
      const likeCount =
        typeof note.likeCount === "number"
          ? note.likeCount
          : typeof note.likeCount === "string"
          ? parseInt(note.likeCount, 10)
          : 0;

      markdown += `# ${note.name || "Untitled"}\n\n`;
      markdown += `- Likes: ${likeCount}\n`;
      markdown += `- Note key: \`${note.key}\`\n`;
      markdown += `- URL: https://note.com/${creator}/n/${note.key}\n`;

      // Add publish date if available
      if (note.publishAt) {
        markdown += `- Published: ${note.publishAt}\n`;
      }

      markdown += "\n";

      // Fetch and add the full content of the article
      try {
        console.error(
          `Fetching content for note ${i + 1}/${topNotes.length}: ${note.key}`
        );
        const articleContent = await fetchNoteArticle(note.key);

        // Check if the content is an error message
        if (articleContent.startsWith("Error:")) {
          markdown += `*Content could not be fetched: ${articleContent}*\n\n`;
        } else {
          // Extract just the content part (skip the title as we already have it)
          const contentWithoutTitle = articleContent
            .split("\n")
            .slice(2)
            .join("\n");
          markdown += `## Content\n\n${contentWithoutTitle}\n\n`;
        }
      } catch (error) {
        markdown += `*Content could not be fetched due to an error*\n\n`;
        console.error(`Error fetching content for ${note.key}:`, error);
      }

      // Add separator between notes (except after the last one)
      if (i < topNotes.length - 1) {
        markdown += "---\n\n";
        // Add a delay before fetching the next article to reduce load on the server
        await sleep(1000);
      }
    }

    return markdown;
  } catch (error) {
    if (error instanceof Error) {
      return `Error processing notes: ${error.message}`;
    }
    return `Unknown error occurred while processing the notes`;
  }
};

