// PDF Preview Cache - renders once and reuses
const previewCache = new Map<string, string[]>();
const cacheKeyPrefix = 'pdf-preview-';

// Generate a cache key from file metadata
export function generateCacheKey(file: File): string {
  return `${cacheKeyPrefix}${file.name}-${file.size}-${file.lastModified}`;
}

// Get cached previews
export function getCachedPreviews(file: File): string[] | null {
  const key = generateCacheKey(file);
  return previewCache.get(key) || null;
}

// Set cached previews
export function setCachedPreviews(file: File, previews: string[]): void {
  const key = generateCacheKey(file);
  previewCache.set(key, previews);
}

// Clear specific cache entry
export function clearCachedPreviews(file: File): void {
  const key = generateCacheKey(file);
  previewCache.delete(key);
}

// Clear all cached previews
export function clearAllCachedPreviews(): void {
  previewCache.clear();
}

// Get cache size for debugging
export function getCacheSize(): number {
  return previewCache.size;
}
