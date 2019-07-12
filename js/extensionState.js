"use strict"

/**
 * Manages the state of the extension
 */
class ExtensionState {
    constructor() {
        this.isLoaded = false;
        this.isOn; // Indicates if extension is turned on or off, futureproofing background workloads memory usage
        this.sessionsCache; // Map with session title as key and session as value
        this.currentSession; // Title of current {ResearchSession}
        this.rssFeeds;
        this.researchSessionManager = new ResearchSessionManager(this);
        this.preparedScreenshotDataUrl;
        this.screenshotCompiler = new ScreenshotCompiler(this);
        this.initializeStorage();
        this.initializeMessageListeners();
    }

    /**
     * Checks and sets storage keys with default values if not already defined. Flags the isLoaded to true when finished
     */
    async initializeStorage() {
        this.isLoaded = false;
        var query = await browser.storage.local.get([
            'isOn',
            'sessions', 
            'currentSession']);
        this.isOn = getOrDefault(query.isOn, false);
        this.currentSession = getOrDefault(query.currentSession, '');
        this.sessionsCache = getOrDefault(query.sessions, new Map());
        this.rssFeeds = getOrDefault(query.sessions, new Array());
        this.isLoaded = true;
        return;
    }

    /**
     *  Sets up message listeners for content script messages
     */
     async initializeMessageListeners() {
        console.log("Initializing message listener")
        browser.runtime.onMessage.addListener(this.handleMessages.bind(this));
     }

     async handleMessages(request, sender, sendResponse) {
        // console.log(request);
        
        if (request.reqType === 'info-flow') {
            let currentTab = await browser.tabs.query({
                currentWindow: true,
                active: true
            });
            let refTag = new UrlRefTag(currentTab.url, currentTab.title);
            if (request.isScreenShot) {
                let croppedScreenshot = this.researchSessionManager.getCroppedScreenshot(
                    this.preparedScreenshotDataUrl, 
                    request.data,
                    refTag
                );
                this.researchSessionManager.addNewScreenshot(this.currentSession, croppedScreenshot);
            } else {
                this.researchSessionManager.addNewQuote(this.currentSession, request.data, refTag);
            }
        } else if (request.reqType === 'prepare-screen') {
            await this.screenshotCompiler.prepare();
        } else if (request.reqType === 'update-screen') {
            await this.screenshotCompiler.queueUpdate(request.scrollDir);
        } else if (request.reqType === 'prepare-screenshot') {
            await this.screenshotCompiler.prepare();
        } else if (request.reqType === 'update-screenshot') {
            await this.screenshotCompiler.queueUpdate(request.scrollDir);
        }
     }

    /**
     * Initiates a save process for all current state of variables
     */
    async saveStorageChanges() {
        this.isLoaded = false;
        await browser.storage.local.set({
            isOn: this.isOn,
            sessions: this.sessionsCache,
            currentSession: this.currentSession,
            rssFeeds: this.rssFeeds
        });
        this.isLoaded = true;
    }


}

/**
 * 
 * @param {Any} param The value to check
 * @param {Any} defaultValue The default value to return if $param is undefined
 */
function getOrDefault(param, defaultValue) {
    if (typeof param === 'undefined') {
        return defaultValue;
    } else {
        return param;
    }
}

var extensionState = new ExtensionState();