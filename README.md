# mcp-base64

Encoding MCP — Base64 / Base64URL / Base32 / Hex.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1394+ live data sources.

## Tools

| Tool | Description |
|------|-------------|
| `base64_encode` | Encode UTF-8 text to Base64 / Base64URL / Base32 / Hex (keyless, offline). Set `variant` (default base64). |
| `base64_decode` | Decode Base64 / Base64URL / Base32 / Hex back to UTF-8 text (keyless, offline). Set `variant` (default base64). |

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "base64": {
      "url": "https://gateway.pipeworx.io/base64/mcp"
    }
  }
}
```

Or connect to the full Pipeworx gateway for access to all 1394+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Base64 data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
