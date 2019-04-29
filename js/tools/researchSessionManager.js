/**
 * researchSessionManager.js
 * 
 * Manages hotswapping and organization of relevant resources for research topics
 */

/**
 * Object class for a research session
 */
class researchSession {
   constructor() {
      this.rssFeeds = new Array();
      this.tabSessions = new Array();
      this.savedCsvFilePaths = new Array();
      this.savedArticleFilePaths = new Map(); //Articles should have a corresponding webpage
      this.citedArticleSnippets = new Map(); // Article snippets should have a corresponding file path or webpage reference
      this.citations = new Map(); // Empty until generated; keys are citation formats and values are arrays of citations
   }

   
   generateCitations() {
      // Be mindful that there are different types of citations such as APA/MLA and also if the citation should be webpage based or article based
      //TODO: Figure out how to extract citations from a webpage as well from the summary/pdf doc provided on the page
      //TODO: Implement func
   }
}

/**
 * Start a new research session
 */
function startNewResearchSession() {
   //TODO: Implement func
}

/**
 * Load an existing research session
 */
function loadResearchSession() {
   //TODO: Implement func
}

/**
 * Merge two existing research sessions
 * @param mainSession The session to be updated
 * @param mergingSession The session to be merged and deleted
 */
function mergeResearchSession(mainSession, mergingSession) {
   //TODO: Implement func
}

/**
 * Delete an existing research session
 */
function deleteResearchSession() {
   //TODO: Implement func
}
