window.addEventListener("keypress", (e) => hotKeyListener(e))

function hotKeyListener(e) {
    console.log("hello");
    if (e.altKey && e.which === 'c'){
        // Check if highlighted text or nothing highlighted -> screenshot
        if (window.getSelection().toString() === '') {
            sendScreenshotDataDeliveryReq();
        } else {
            sendQuoteDataDeliveryReq();
        }
    }
}

function handleInfoExtractionResponse() {
    // Use pageAction to acknowledge capture
}

function handleInfoExtractionError() {
    // Use pageAction pop up to notif user
}

function sendScreenshotDataDeliveryReq() {
    let screenshot = null; //TODO extract screenshot coordinates or process screenshot before sending

    let req = {
        reqType: 'info-flow',
        isScreenShot: true,
        data: screenshot,
        url: currentTab.url,
        title: currentTab.title
    }
    notifyBackgroundPageOfInfo(req)
}

function sendQuoteDataDeliveryReq(currentTab) {
    let req = {
        reqType: 'info-flow',
        isScreenShot: false,
        data: window.getSelection().toString(),
        url: currentTab.url,
        title: currentTab.title
    }
    notifyBackgroundPageOfInfo(req)
}

function notifyBackgroundPageOfInfo(infoDeliveryReq) {
    var sending = browser.runtime.sendMessage(infoDeliveryReq)
    sending.then(handleInfoExtractionResponse, handleInfoExtractionError);
}

