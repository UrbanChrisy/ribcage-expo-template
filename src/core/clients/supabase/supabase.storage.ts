import type { SupportedStorage as SupabaseSupportedStorage } from "@supabase/supabase-js";
import { SupportedStorage } from "@/core/types";
import { StorageClient } from "../storage/storage.client";

export class SupabaseStorage implements SupabaseSupportedStorage {
  isServer = false;
  private _storage: SupportedStorage;

  constructor(storageClient: StorageClient) {
    this._storage = storageClient.create('supabase');
  }

  getItem(key: string) {
    return this._storage.getItem(key) ?? null;
  }

  setItem(key: string, value: string) {
    this._storage.setItem(key, value);
  }

  removeItem(key: string) {
    this._storage.removeItem(key);
  }

  clear() {
    this._storage.clear();
  }
}
