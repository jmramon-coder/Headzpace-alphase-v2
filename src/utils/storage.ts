import { logger } from './logger';

const MAX_ITEMS = 50; // Maximum number of layouts to store
const MAX_SIZE = 4.5 * 1024 * 1024; // 4.5MB limit (leaving buffer for other storage)

interface StorageStats {
  used: number;
  available: number;
  itemCount: number;
}

export const storage = {
  getStats(): StorageStats {
    let used = 0;
    let itemCount = 0;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key) || '';
        used += new Blob([value]).size;
        itemCount++;
      }
    }

    return {
      used,
      available: MAX_SIZE - used,
      itemCount
    };
  },

  set(key: string, value: unknown): boolean {
    try {
      const serialized = JSON.stringify(value);
      const size = new Blob([serialized]).size;

      // Check if adding this item would exceed quota
      const stats = this.getStats();
      if (stats.used + size > MAX_SIZE) {
        logger.warn(`Storage quota would be exceeded. Current: ${stats.used}, Adding: ${size}, Max: ${MAX_SIZE}`);
        return false;
      }

      localStorage.setItem(key, serialized);
      return true;
    } catch (error) {
      logger.error('Storage error:', error);
      return false;
    }
  },

  get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      logger.error('Storage error:', error);
      return null;
    }
  },

  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      logger.error('Storage error:', error);
    }
  },

  // Cleanup old items if needed
  cleanup(): void {
    const stats = this.getStats();
    if (stats.itemCount > MAX_ITEMS || stats.available < MAX_SIZE * 0.1) {
      logger.info('Running storage cleanup');
      
      // Get all items sorted by timestamp (if available)
      const items = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          const value = localStorage.getItem(key);
          items.push({ key, value, size: new Blob([value || '']).size });
        }
      }

      // Sort by size (largest first) and remove until we're under limit
      items.sort((a, b) => b.size - a.size);
      
      while (items.length > MAX_ITEMS || stats.available < MAX_SIZE * 0.2) {
        const item = items.pop();
        if (item) {
          localStorage.removeItem(item.key);
          logger.info(`Removed item: ${item.key}, size: ${item.size}`);
        }
        const newStats = this.getStats();
        if (newStats.available >= MAX_SIZE * 0.2) break;
      }
    }
  }
};