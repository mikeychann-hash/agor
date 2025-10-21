// src/types/index.ts
// Re-export all types from @agor/core for consistency
// Only keep UI-specific types in this directory

export * from '@agor/core/types';
export * from './ui';

// Legacy type alias for backwards compatibility with old UI code
import type { ContextFileListItem } from '@agor/core/types';

export type ConceptListItem = ContextFileListItem;
