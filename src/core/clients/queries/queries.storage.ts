import type { AsyncStorage } from "@tanstack/react-query-persist-client";
import { SupportedStorage } from "../../types";

export class QueryStorage implements AsyncStorage {

  constructor(private readonly storage: SupportedStorage) {}

  getItem(key: string) {
    return this.storage.getItem(key);
  }

  removeItem(key: string) {
    this.storage.removeItem(key);
  }

  setItem(key: string, value: string) {
    this.storage.setItem(key, value);
  }

  async entries() {
    const keys = await this.storage.keys();
    const entries = await Promise.all(
      keys.map(async (key) => [key, await this.storage.getItem(key) ?? ''] as [string, string])
    );
    return entries;
  }
}
