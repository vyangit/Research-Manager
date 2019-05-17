class StorageWrapper {
    constructor() {
        this.isLoaded = false;
        this.sessionsCache; // Map with session title as key and session as value
        this.currentSession; // Title of current {ResearchSession}
        this.initializeStorage();
    }

    /**
     * Checks and sets storage keys with default values if not already defined. Flags the isLoaded to true when finished
     */
    async initializeStorage() {
        isLoaded = false;
        var query = await browser.storage.local.get(['sessions', 'currentSession']);
        currentSession = typeof query.sessions === 'undefined' ? '': query.sessions;
        sessionsCache = typeof query.sessions === 'undefined' ? new Map(): query.sessions;
        isLoaded = true;
        return;
    }

    /**
     * Initiates a save process for all current state of variables
     */
    async saveStorageChanges() {
        isLoaded = false;
        await browser.storage.local.set({
            sessions: this.sessionsCache,
            currentSession: this.currentSession
        });
        isLoaded = true;
    }
}

var storageWrapper = new StorageWrapper()