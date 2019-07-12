class ScreenshotCompiler {
    constructor(extension) {
        this.extension = extension;
        this.updateScreenDataQueue = null;
        this.updateScreenshotAreaDataQueue = null;
    }

    async prepareScreen() {
        this.updateScreenDataQueue  = new Array();
        await this.queueScreenUpdate();
    }

    async prepareScreenshot() {
        this.updateScreenshotDataQueue  = new Array();
        await this.queueScreenshotUpdate();
    }

    async queueScreenUpdate() {
        let screenArea = await browser.tabs.captureVisibleTab();
        this.updateScreenDataQueue.push(screenArea);
    }
    
    async queueScreenshotUpdate() {
        let screenshotArea = await browser.tabs.captureVisibleTab();
        this.updateScreenshotAreaDataQueue.push(screenArea);
    }

    recompileScreenshot(imageDataArr) {
        let compiledScreenImage = this.stitch(this.updateScreenDataQueue);
        let compiledScreenshotImage = this.stitch(this.updateScreenshotAreaDataQueue);
        this.extractHighlightedRegion(compiledScreenImage, compiledScreenshotImage);
    }

    stitch(imageQueueData) {
        //TODO
    }

    extractHighlightedRegion(screenshot, screen) {
        //TODO
    }

}