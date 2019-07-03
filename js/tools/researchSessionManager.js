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
      this.savedCsvFilePaths = new Array();
      this.savedArticleFilePaths = new Map(); //Articles should have a corresponding webpage
      this.citedArticleSnippets = new Map(); // Article snippets should have a corresponding file path or webpage reference
      this.citations = new Map(); // Empty until generated; keys are citation formats and values are arrays of citations
   }
   
   generateCitations(citationType) {
      // Be mindful that there are different types of citations such as APA/MLA and also if the citation should be webpage based or article based
      //TODO: Figure out how to extract citations from a webpage as well from the summary/pdf doc provided on the page
      //TODO: Implement func
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

   addNewTabGroupToSession(name, sessionTitle, rawTabData) {
      if (this.extension.sessionsCache.has(sessionTitle)){
         var tabs = new Array();
         for (let rawTab of rawTabData) {
            tabs.push(new Tab(rawTab.url, rawTab.title))
         }
         this.extension.sessionsCache.get(sessionTitle).tabGroups.push(new TabGroup(name, tabs));
         console.log(tabs);
         this.extension.saveStorageChanges();
         return true;
      }   
      return false;
  }
}

class Tab {
   constructor(url, title) {
      this.url = url;
      this.title = title;
   }
}

class TabGroup {
   constructor(name, tabs) {
      this.name = name;
      this.tabs = tabs;
      this.timestamp = new Date();
   }
}
