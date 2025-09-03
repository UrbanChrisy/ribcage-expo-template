import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { QueryClient } from "@tanstack/react-query";
import { persistQueryClient } from "@tanstack/react-query-persist-client";
import { SupportedStorage } from "../../types";
import { StorageClient } from "../storage/storage.client";
import { QueryStorage } from "./queries.storage";

export type QueriesClientOptions = {
  storage: SupportedStorage;
};

export class QueriesClient {
  public client: QueryClient;
  private storage: SupportedStorage;
  private queryStorage: QueryStorage;
  
  constructor(storageClient: StorageClient) {
    this.storage = storageClient.create('queries');
    this.queryStorage = new QueryStorage(this.storage);

    this.client = new QueryClient({
      defaultOptions: {
        queries: {
          // staleTime: 2 * 24 * 60 * 60 * 1000, // 2 days
          // gcTime: 2 * 24 * 60 * 60 * 1000, // 2 days
        },
      },
    });

    persistQueryClient({
      queryClient: this.client,
      persister: this.createPersister(),
    });
  }

  private createPersister() {
    return createAsyncStoragePersister({
      storage: this.queryStorage,
    });
  }

  public clear() {
    this.client.clear();
    this.storage.clear();
  }
}
