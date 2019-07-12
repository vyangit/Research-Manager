/**
 * researchSessionManager.js
 * 
 * Manages hotswapping and organization of relevant resources for research topics
 */

/**
 * Object class for a research session
 */
class ResearchSession {
   /**
    * @param {String} title 
    */
   constructor(title) {
      this.title = title;
      this.rssFeeds = new Array();
      this.tabGroups = new Array();
      this.quoteRefs = new Array(); // Array of Quotes
      this.screenshots = new Array(); // Array of screenshots
   }
}

class ResearchSessionManager {
   /**
    * Generic ResearchSessionManager constructor
    * @param {ExtensionState} extension 
    */
   constructor(extension) {
      this.extension = extension;
   }
   
   /**
    * Start a new research session and save to storage
    * @return {ResearchSession} The new research session generated
    */
   startNewResearchSession(title) {
      let session = new ResearchSession(title);
      this.extension.sessionsCache.set(title, session);
      this.extension.saveStorageChanges();
   }

   /**
    * Load an existing research session
    */
   loadResearchSession(title) {
      this.extension.currentSession = title;
      this.extension.saveStorageChanges();
   }

   /**
    * Merge two existing research sessions
    * @param mainSessionTitle The session to be updated
    * @param mergingSessionTitle The session to be merged and deleted
    */
   mergeResearchSession(mainSessionTitle, mergingSessionTitle) {
      let mainSession = this.extension.sessionsCache.get(mainSessionTitle);
      let mergingSession = this.extension.sessionsCache.get(mergingSessionTitle);
      let mergedSession = new ResearchSession(mainSession.title);
      mergedSession.rssFeeds = mainSession.rssFeeds.concat(mergingSession.rssFeeds);
      mergedSession.tabGroups = mainSession.tabGroups.concat(mergingSession.tabGroups);
      mergedSession.savedCsvFilePaths = mainSession.savedCsvFilePaths.concat(mergingSession.savedCsvFilePaths);
      mergedSession.savedArticleFilePaths = new Map(...mainSession.savedArticleFilePaths, ...mergingSession.savedArticleFilePaths);
      mergedSession.citedArticleSnippets = new Map(...mainSession.citedArticleSnippets, ...mergingSession.citedArticleSnippets);
      
      this.extension.sessionsCache.set(mergedSession.title, mergedSession);
      this.extension.sessionsCache.delete(mainSessionTitle);
      this.extension.sessionsCache.delete(mergingSessionTitle);
      this.extension.saveStorageChanges();
   }

   /**
    * Delete an existing research session
    */
   deleteResearchSession(title) {
      this.extension.sessionsCache.delete(title);
      this.extension.saveStorageChanges();
   }

   /**
    * Add a tab group to an existing research session
    */
   addNewTabGroupToSession(name, sessionTitle, rawTabData) {
      var omittedTabs = [];
      if (this.extension.sessionsCache.has(sessionTitle)){
         var tabGroup = new TabGroup(name);
         omittedTabs = tabGroup.addTabs(rawTabData);

         this.extension.sessionsCache.get(sessionTitle).tabGroups.push(tabGroup);
         this.extension.saveStorageChanges();
         return omittedTabs;
      }   
      return omittedTabs;
  }

   /**
    * Delete a tab group from an existing research session
    */
   deleteTabGroupFromSession(sessionTitle, tabGroupIndex) {
      if (this.extension.sessionsCache.has(sessionTitle)){
         this.extension.sessionsCache.get(sessionTitle).tabGroups.splice(tabGroupIndex, 1);
         this.extension.saveStorageChanges();
         return true;
      }   
      return false;
   }

   /**
    * Launch a tab group from an existing research session
    */
   async launchTabGroupFromSession(sessionTitle, tabGroupIndex) {
      if (this.extension.sessionsCache.has(sessionTitle)){
         var tabGroup = this.extension.sessionsCache.get(sessionTitle).tabGroups[tabGroupIndex];
         var urls = tabGroup.urls;

         await browser.windows.create({
            url: urls
         });

         return true;
      }   
      return false;
   }

   /**
    * Add a new screenshot to an existing research session
    */
   addNewScreenshot(sessionTitle, screenshot) {
      if (this.extension.sessionsCache.has(sessionTitle)) {
         this.extension.sessionsCache.get(sessionTitle).screenshots.push(screenshot);
      }
   }

   getCroppedScreenshot(screenshotUrl, screenshotCoordinates, urlRefTag) {
      let croppedScreenshotUrl;
      return new Screenshot(croppedScreenshotUrl, urlRefTag) 
   }

   /**
    * Add a new quote to an existing research session
    */
   addNewQuote(sessionTitle, quote, urlRefTag) {
      if (this.extension.sessionsCache.has(sessionTitle)) {
         this.extension.sessionsCache.get(sessionTitle).quoteRefs.push(new Quote(quote, urlRefTag));
      }
   }
}

class Tab {
   constructor(url, title) {
      this.url = url;
      this.title = title;
   }
}

class TabGroup {
   constructor(name) {
      this.name = name;
      this.tabs = new Array();
      this.timestamp = new Date();
   }

   addTabs(rawTabData) {
      var omittedTabs = new Array();
      for (let rawTab of rawTabData) {
         let url = rawTab.url;
         let tab = new Tab(url, rawTab.title);
         if (url.startsWith('http://') || url.startsWith('https://')) {
            this.tabs.push(tab);
         } else {
            omittedTabs.push(tab);
         }
      }
      return omittedTabs
   }

   get urls() {
      var tabUrls = new Array();
      for (let tab of this.tabs) {
         tabUrls.push(browser.runtime.getURL(tab.url));
      }
      return tabUrls;
   }
}

class UrlRefTag {
   constructor(srcUrlPath, srcUrlTitle) {
      this.srcUrlPath = srcUrlPath;
      this.srcUrlTitle = srcUrlTitle;
   }
}

class Screenshot {
   constructor(screenshotUrl, urlRefTag) {
      this.screenshotUrl = screenshotUrl;
      this.urlRefTag = urlRefTag;
   }
}

class Quote {
   constructor(quote, urlRefTag) {
      this.quote = quote;
      this.urlRefTag = urlRefTag;
   }
}
