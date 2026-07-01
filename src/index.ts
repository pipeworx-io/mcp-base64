interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  meter?: { credits: number };
  cost?: Record<string, unknown>;
  provider?: string;
}

/**
 * Encoding MCP — Base64 / Base64URL / Base32 / Hex.
 *
 * Keyless, offline: encode text to and decode text from Base64, URL-safe
 * Base64, Base32 (RFC 4648) and hexadecimal, all UTF-8 aware. Pure functions —
 * no API, no key, nothing leaves the process.
 */


const B32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function bytesToB64(bytes: Uint8Array): string {
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}
function b64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
function bytesToB32(bytes: Uint8Array): string {
  let bits = 0, val = 0, out = '';
  for (const b of bytes) { val = (val << 8) | b; bits += 8; while (bits >= 5) { out += B32[(val >>> (bits - 5)) & 31]; bits -= 5; } }
  if (bits > 0) out += B32[(val << (5 - bits)) & 31];
  while (out.length % 8) out += '=';
  return out;
}
function b32ToBytes(s: string): Uint8Array {
  const clean = s.toUpperCase().replace(/=+$/, '').replace(/\s/g, '');
  let bits = 0, val = 0; const out: number[] = [];
  for (const ch of clean) { const idx = B32.indexOf(ch); if (idx < 0) throw new Error(`Invalid base32 character "${ch}".`); val = (val << 5) | idx; bits += 5; if (bits >= 8) { out.push((val >>> (bits - 8)) & 0xff); bits -= 8; } }
  return new Uint8Array(out);
}

function encode(text: string, variant: string): string {
  const bytes = new TextEncoder().encode(text);
  switch (variant) {
    case 'base64': return bytesToB64(bytes);
    case 'base64url': return bytesToB64(bytes).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    case 'base32': return bytesToB32(bytes);
    case 'hex': return [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
    default: throw new Error(`Unknown variant "${variant}". Use base64, base64url, base32 or hex.`);
  }
}
function decode(data: string, variant: string): string {
  let bytes: Uint8Array;
  switch (variant) {
    case 'base64': bytes = b64ToBytes(data.replace(/\s/g, '')); break;
    case 'base64url': { let b = data.replace(/-/g, '+').replace(/_/g, '/').replace(/\s/g, ''); while (b.length % 4) b += '='; bytes = b64ToBytes(b); break; }
    case 'base32': bytes = b32ToBytes(data); break;
    case 'hex': { const h = data.replace(/\s/g, ''); if (!/^[0-9a-f]*$/i.test(h) || h.length % 2) throw new Error('Invalid hex string.'); bytes = new Uint8Array(h.match(/../g)?.map((x) => parseInt(x, 16)) ?? []); break; }
    default: throw new Error(`Unknown variant "${variant}". Use base64, base64url, base32 or hex.`);
  }
  return new TextDecoder().decode(bytes);
}

const VARIANT = { type: 'string', description: 'Encoding: base64 (default), base64url, base32, or hex.' } as const;

const tools: McpToolExport['tools'] = [
  {
    name: 'base64_encode',
    description: 'Encode UTF-8 text to Base64 / Base64URL / Base32 / Hex (keyless, offline). Set `variant` (default base64).',
    inputSchema: { type: 'object', properties: { text: { type: 'string', description: 'Text to encode.' }, variant: VARIANT }, required: ['text'] },
  },
  {
    name: 'base64_decode',
    description: 'Decode Base64 / Base64URL / Base32 / Hex back to UTF-8 text (keyless, offline). Set `variant` (default base64).',
    inputSchema: { type: 'object', properties: { data: { type: 'string', description: 'Encoded data to decode.' }, variant: VARIANT }, required: ['data'] },
  },
];

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  const variant = (typeof args.variant === 'string' ? args.variant : 'base64').toLowerCase();
  try {
    if (name === 'base64_encode') { const text = str(args, 'text'); return { input_bytes: new TextEncoder().encode(text).length, variant, encoded: encode(text, variant) }; }
    if (name === 'base64_decode') { const data = str(args, 'data'); return { variant, decoded: decode(data, variant) }; }
  } catch (e) { return { error: (e as Error).message }; }
  throw new Error(`Unknown tool: ${name}`);
}

function str(args: Record<string, unknown>, key: string): string {
  const v = args[key];
  if (typeof v !== 'string') throw new Error(`Required argument "${key}" is missing (a string).`);
  return v;
}

export default { tools, callTool, meter: { credits: 1 } } satisfies McpToolExport;
