const DB_NAME = "giteria-db";
const DB_VERSION = 11;

const STORES = {
  REPOSITORIES: "repositories",
  USERS: "users",
  SESSIONS: "sessions",
  ORGANIZATIONS: "organizations",
  ORG_FOLLOWERS: "org_followers",
  ISSUES: "issues",
  PULLS: "pulls",
  SETTINGS: "settings",
  AGENTS: "agents",
  WORKFLOWS: "workflows",
  WORKFLOW_RUNS: "workflow_runs",
  BRANCHES: "branches",
  PR_COMMENTS: "pr_comments",
  DISCUSSIONS: "discussions",
  DISCUSSION_COMMENTS: "discussion_comments",
  TAGS: "tags",
} as const;

let dbPromise: Promise<IDBDatabase> | null = null;

function openDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      dbPromise = null;
      reject(request.error);
    };

    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains(STORES.REPOSITORIES)) {
        const repoStore = db.createObjectStore(STORES.REPOSITORIES, { keyPath: "id" });
        repoStore.createIndex("owner", "owner", { unique: false });
        repoStore.createIndex("fullName", "fullName", { unique: true });
      }

      if (!db.objectStoreNames.contains(STORES.USERS)) {
        const userStore = db.createObjectStore(STORES.USERS, { keyPath: "id" });
        userStore.createIndex("email", "email", { unique: true });
        userStore.createIndex("username", "username", { unique: true });
      }

      if (!db.objectStoreNames.contains(STORES.SESSIONS)) {
        db.createObjectStore(STORES.SESSIONS, { keyPath: "id" });
      }

      if (!db.objectStoreNames.contains(STORES.ORGANIZATIONS)) {
        const orgStore = db.createObjectStore(STORES.ORGANIZATIONS, { keyPath: "id" });
        orgStore.createIndex("slug", "slug", { unique: true });
      }

      if (!db.objectStoreNames.contains(STORES.ORG_FOLLOWERS)) {
        const orgFollowersStore = db.createObjectStore(STORES.ORG_FOLLOWERS, {
          keyPath: "orgSlug",
        });
        orgFollowersStore.createIndex("followedAt", "followedAt", { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.ISSUES)) {
        const issueStore = db.createObjectStore(STORES.ISSUES, { keyPath: "id" });
        issueStore.createIndex("repoFullName", "repoFullName", { unique: false });
        issueStore.createIndex("number", "number", { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.PULLS)) {
        const pullStore = db.createObjectStore(STORES.PULLS, { keyPath: "id" });
        pullStore.createIndex("repoFullName", "repoFullName", { unique: false });
        pullStore.createIndex("number", "number", { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.BRANCHES)) {
        const branchStore = db.createObjectStore(STORES.BRANCHES, { keyPath: "id" });
        branchStore.createIndex("repoFullName", "repoFullName", { unique: false });
        branchStore.createIndex("name", "name", { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
        const settingsStore = db.createObjectStore(STORES.SETTINGS, { keyPath: "id" });
        settingsStore.createIndex("slug", "slug", { unique: true });
      }

      if (!db.objectStoreNames.contains(STORES.AGENTS)) {
        const agentStore = db.createObjectStore(STORES.AGENTS, { keyPath: "id" });
        agentStore.createIndex("repoFullName", "repoFullName", { unique: false });
        agentStore.createIndex("status", "status", { unique: false });
        agentStore.createIndex("type", "type", { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.WORKFLOWS)) {
        const workflowStore = db.createObjectStore(STORES.WORKFLOWS, { keyPath: "id" });
        workflowStore.createIndex("repoFullName", "repoFullName", { unique: false });
        workflowStore.createIndex("path", "path", { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.WORKFLOW_RUNS)) {
        const runStore = db.createObjectStore(STORES.WORKFLOW_RUNS, { keyPath: "id" });
        runStore.createIndex("repoFullName", "repoFullName", { unique: false });
        runStore.createIndex("workflowId", "workflowId", { unique: false });
        runStore.createIndex("status", "status", { unique: false });
        runStore.createIndex("createdAt", "createdAt", { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.PR_COMMENTS)) {
        const prCommentStore = db.createObjectStore(STORES.PR_COMMENTS, { keyPath: "id" });
        prCommentStore.createIndex("prId", "prId", { unique: false });
        prCommentStore.createIndex("repoFullName", "repoFullName", { unique: false });
        prCommentStore.createIndex("createdAt", "createdAt", { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.DISCUSSIONS)) {
        const discussionStore = db.createObjectStore(STORES.DISCUSSIONS, { keyPath: "id" });
        discussionStore.createIndex("repoFullName", "repoFullName", { unique: false });
        discussionStore.createIndex("number", "number", { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.DISCUSSION_COMMENTS)) {
        const discussionCommentStore = db.createObjectStore(STORES.DISCUSSION_COMMENTS, {
          keyPath: "id",
        });
        discussionCommentStore.createIndex("discussionId", "discussionId", { unique: false });
        discussionCommentStore.createIndex("repoFullName", "repoFullName", { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.TAGS)) {
        const tagStore = db.createObjectStore(STORES.TAGS, { keyPath: "id" });
        tagStore.createIndex("repoFullName", "repoFullName", { unique: false });
        tagStore.createIndex("name", "name", { unique: false });
      }
    };
  });

  return dbPromise;
}

export const db = {
  async getAll<T>(storeName: string): Promise<T[]> {
    const database = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(storeName, "readonly");
      const store = transaction.objectStore(storeName);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  },

  async get<T>(storeName: string, id: string): Promise<T | null> {
    const database = await openDB();
    if (!database.objectStoreNames.contains(storeName)) {
      return null;
    }
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(storeName, "readonly");
      const store = transaction.objectStore(storeName);
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  },

  async getByIndex<T>(storeName: string, indexName: string, value: string): Promise<T | null> {
    const database = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(storeName, "readonly");
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      const request = index.get(value.toLowerCase());
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  },

  async getAllByIndex<T>(storeName: string, indexName: string, value: string): Promise<T[]> {
    const database = await openDB();
    if (!database.objectStoreNames.contains(storeName)) {
      return [];
    }
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(storeName, "readonly");
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      const request = index.getAll(value.toLowerCase());
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  },

  async add<T>(storeName: string, item: T): Promise<T> {
    const database = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(storeName, "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.add(item);
      request.onsuccess = () => resolve(item);
      request.onerror = () => reject(request.error);
    });
  },

  async put<T>(storeName: string, item: T): Promise<T> {
    const database = await openDB();
    if (!database.objectStoreNames.contains(storeName)) {
      console.warn(`Store ${storeName} does not exist in database`);
      return item;
    }
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(storeName, "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.put(item);
      request.onsuccess = () => resolve(item);
      request.onerror = () => reject(request.error);
    });
  },

  async delete(storeName: string, id: string): Promise<boolean> {
    const database = await openDB();
    if (!database.objectStoreNames.contains(storeName)) {
      return false;
    }
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(storeName, "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);
      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  },

  async count(storeName: string): Promise<number> {
    const database = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(storeName, "readonly");
      const store = transaction.objectStore(storeName);
      const request = store.count();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  async clear(storeName: string): Promise<void> {
    const database = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(storeName, "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },
};

export { STORES };
