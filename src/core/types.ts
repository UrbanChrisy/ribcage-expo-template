export type SupportedStorage = {
  preload: () => void;
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
  clear: () => void;
  keys: () => string[];
}

export interface StorageClientInterface  {
  create: (namespace: string) => SupportedStorage;
}