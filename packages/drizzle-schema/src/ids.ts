/**
 * ID Management for Agor
 *
 * All entities use UUIDv7 (time-ordered UUIDs) for primary keys.
 * UUIDs are displayed as short 8-character prefixes to users (git-style).
 */

/**
 * Generate UUIDv7 (time-ordered UUID)
 *
 * Format: xxxxxxxx-xxxx-7xxx-xxxx-xxxxxxxxxxxx
 * - First 48 bits: Unix timestamp in milliseconds
 * - Version bits: 0111 (version 7)
 * - Variant bits: 10xx (RFC 4122)
 * - Random bits: 62 bits
 *
 * @returns UUIDv7 string (36 chars with hyphens)
 */
export function generateId(): string {
  const timestamp = Date.now();
  const timestampHex = timestamp.toString(16).padStart(12, '0');

  // Time component (48 bits = 12 hex chars)
  const timeLow = timestampHex.slice(0, 8);
  const timeMid = timestampHex.slice(8, 12);

  // Version 7 + random
  const timeHiAndVersion = (0x7000 | (Math.random() * 0x0fff)).toString(16).padStart(4, '0');

  // Variant + random
  const clockSeqAndVariant = (0x8000 | (Math.random() * 0x3fff)).toString(16).padStart(4, '0');
  const node = Array.from({ length: 12 }, () => Math.floor(Math.random() * 16).toString(16)).join(
    ''
  );

  return `${timeLow}-${timeMid}-${timeHiAndVersion}-${clockSeqAndVariant}-${node}`;
}

/**
 * Error thrown when short ID resolution fails
 */
export class IdResolutionError extends Error {
  constructor(
    message: string,
    public readonly type: 'not_found' | 'ambiguous',
    public readonly prefix?: string,
    public readonly candidates?: Array<{ id: string; label?: string }>
  ) {
    super(message);
    this.name = 'IdResolutionError';
  }
}

/**
 * Resolve short ID prefix to full UUID
 *
 * @param shortId - 8+ character prefix (hyphens optional)
 * @param entities - Array of entities with id field
 * @returns Matched entity
 * @throws IdResolutionError if no match or ambiguous
 *
 * @example
 * ```ts
 * const session = resolveShortId('01933e4a', allSessions);
 * ```
 */
export function resolveShortId<T extends { id: string }>(shortId: string, entities: T[]): T {
  // Normalize: remove hyphens, lowercase
  const normalized = shortId.replace(/-/g, '').toLowerCase();

  // Find matches (prefix matching)
  const matches = entities.filter(entity => {
    const entityId = entity.id.replace(/-/g, '').toLowerCase();
    return entityId.startsWith(normalized);
  });

  if (matches.length === 0) {
    throw new IdResolutionError(`No entity found with ID prefix: ${shortId}`, 'not_found', shortId);
  }

  if (matches.length === 1) {
    return matches[0];
  }

  // Multiple matches - ambiguous
  throw new IdResolutionError(
    `Ambiguous ID prefix: ${shortId} (${matches.length} matches found)`,
    'ambiguous',
    shortId,
    matches.map(m => ({ id: m.id }))
  );
}

/**
 * Format UUID as short ID for display
 *
 * @param uuid - Full UUID (36 chars)
 * @param length - Prefix length (default: 8)
 * @returns Short ID prefix
 *
 * @example
 * ```ts
 * formatShortId('01933e4a-7b89-7c35-a8f3-9d2e1c4b5a6f') // => '01933e4a'
 * ```
 */
export function formatShortId(uuid: string, length: number = 8): string {
  return uuid.replace(/-/g, '').slice(0, length);
}
