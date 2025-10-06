/**
 * Base Repository Interface
 *
 * Generic CRUD interface for type-safe repository pattern.
 * All repositories extend this base interface.
 */

/**
 * Base repository interface with generic CRUD operations
 */
export interface BaseRepository<T, TInsert = T> {
  /**
   * Create a new entity
   */
  create(data: TInsert): Promise<T>;

  /**
   * Find entity by ID (supports short ID resolution)
   */
  findById(id: string): Promise<T | null>;

  /**
   * Find all entities
   */
  findAll(): Promise<T[]>;

  /**
   * Update entity by ID
   */
  update(id: string, updates: Partial<TInsert>): Promise<T>;

  /**
   * Delete entity by ID
   */
  delete(id: string): Promise<void>;
}

/**
 * Base repository error
 */
export class RepositoryError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = 'RepositoryError';
  }
}

/**
 * Entity not found error
 */
export class EntityNotFoundError extends RepositoryError {
  constructor(
    public readonly entityType: string,
    public readonly id: string
  ) {
    super(`${entityType} with ID '${id}' not found`);
    this.name = 'EntityNotFoundError';
  }
}

/**
 * Ambiguous ID error
 */
export class AmbiguousIdError extends RepositoryError {
  constructor(
    public readonly entityType: string,
    public readonly prefix: string,
    public readonly matches: string[]
  ) {
    super(
      `Ambiguous ID prefix '${prefix}' for ${entityType} (${matches.length} matches: ${matches.slice(0, 3).join(', ')}${matches.length > 3 ? '...' : ''})`
    );
    this.name = 'AmbiguousIdError';
  }
}
