console.log('hello contents')
$(document).on('keydown', (e) => hotKeyListener(e));

var cancelScreenshotBtn = $('<button></button>',{
    id: 'rm-screenshot-selection-capture-canvas-cancel-btn',
    class: 'rm-screenshot-btns',
    text: 'Cancel',
    click: () => {cancelScreenshot();},
    hidden: true
});
cancelScreenshotBtn.css({
    cursor: 'pointer',
    borderRadius: '10px',
    border: '2px solid rgba(0,0,0,0.5)',
});

var saveScreenshotBtn = $('<button></button>',{
    id: 'rm-screenshot-selection-capture-canvas-save-btn',
    class: 'rm-screenshot-btns',
    text: 'Save',
    click: () => {saveScreenshot();},
    hidden: true
});
saveScreenshotBtn.css({
    cursor: 'pointer',
    borderRadius: '10px',
    border: '2px solid rgba(0,0,0,0.5)',
});

var screenshotBtns = $('<span></span>', {
    id: 'rm-screenshot-selection-btns'
});
screenshotBtns.css({
    position: 'fixed',
    fontSize: '2em',
    bottom: '2vh',
    right: '2vw',
    zIndex: '10001',
    color: 'white'
});
screenshotBtns.append(saveScreenshotBtn, cancelScreenshotBtn);

var screenshotSelectionArea = null;
var screenshotIsToggledOn = false;
var startCoordinate = null;
var endCoordinate = null;
var screenshotAreaUpdateLock = false;

var prevScrollTop = null;
var prevScrollLeft = null;
var scrollThreshold = 30;

function cancelScreenshot() {
    screenshotIsToggledOn = false;
    screenshotCanvas = null;
    startCoordinate = null;
    endCoordinate = null;

    $('#rm-screenshot-selection-capture-canvas').remove();

    $(document).off('scroll');
    $(window).off('resize');
}

function saveScreenshot() {
    let screenshotCoordinates = getCanvasTopLeftAndBottomRight(startCoordinate, endCoordinate);
    sendScreenshotDataDeliveryReq(screenshotCoordinates);
    cancelScreenshot();
}

async function hotKeyListener(e) {
    if (e.altKey && e.which === 67){
        // Check if highlighted text or nothing highlighted -> screenshot
        if (window.getSelection().toString() === '') {
            await prepareScreenArea();
            selectScreenshot();
            await prepareScreenshotArea();
        } else {
            sendQuoteDataDeliveryReq();
        }
    }
    if (e.which === 27){
        cancelScreenshot();
    }
}

function selectScreenshot() {
    if (!screenshotIsToggledOn && $('#rm-screenshot-selection-capture-canvas') !== undefined) {
        screenshotIsToggledOn = true;
        screenshotSelectionArea = $('<canvas></canvas>', {
            id: 'rm-screenshot-selection-capture-canvas',
            click: (e) => {screenshotSelectionListener(e);},
            mousemove: (e) => {updateScreenshotCoordinates(e);}
        });
        screenshotSelectionArea.css({
            position: 'absolute',
            top: '0',
            left: '0',
            margin: '0',
            padding: '0',
            width: $('body').width(),
            height: $('body').height(),
            zIndex: '10000',
            cursor: 'crosshair'
        })

        $(document).on('scroll', () => {updateScreenshotArea()});
        $(window).on('resize', () => {
            cancelScreenshot();
            selectScreenshot();
        });
        $(document.body).append(screenshotSelectionArea);
    }
}

function screenshotSelectionListener(e) {
    if (screenshotIsToggledOn) {
        if (startCoordinate != null && endCoordinate == null) {
            endCoordinate = getMousePos(e);
            prevScrollTop = e.scrollTop();
            this.attachScreenshotCmdBtns();
        } else {
            startCoordinate = getMousePos(e);
            endCoordinate = null;
            saveScreenshotBtn.attr('hidden', true);
        }
    }
}

// TODO
function attachScreenshotCmdBtns() {
    console.log("Attach btns")
}

function updateScreenshotCoordinates(e) {
    if (!screenshotAreaUpdateLock && screenshotIsToggledOn && startCoordinate != null && endCoordinate == null) {
        let tempCoordinate = getMousePos(e);
        let canvas = screenshotSelectionArea[0]
        canvas.width = $('body').width();
        canvas.height = $('body').height();
        let ctx = canvas.getContext('2d');

        ctx.clearRect(0, 0, canvas.width, canvas.height); // clear canvas
        ctx.beginPath();
        ctx.fillStyle  = 'rgba(0,0,0,0.5)';
        
        let frame = getCanvasTopLeftAndBottomRight(startCoordinate, tempCoordinate);
        let canvasStart = frame.topLeft;
        let canvasEnd = frame.bottomRight;
        
        let width = canvasEnd.x-canvasStart.x;
        let height = canvasEnd.y-canvasStart.y;
        ctx.rect(canvasStart.x, canvasStart.y, width , height);
        ctx.fill();
    }
}

function handleInfoExtractionResponse() {
    // Use pageAction to acknowledge capture
}

function handleInfoExtractionError() {
    // Use pageAction pop up to notif user
}

async function sendScreenshotDataDeliveryReq(screenshotCoordinates) {
    let req = {
        reqType: 'info-flow',
        isScreenShot: true,
        data: screenshotCoordinates
    }
    notifyBackgroundPageOfInfo(req)
}

async function sendQuoteDataDeliveryReq() {
    let req = {
        reqType: 'info-flow',
        isScreenShot: false,
        data: window.getSelection().toString()
    }
    notifyBackgroundPageOfInfo(req)
}

async function updateImageAreas(e) {
    let scrollTop = $(document).scrollTop();
    let scrollLeft = $(document).scrollLeft();
    if (screenshotIsToggledOn && 
        startCoordinate != null && 
        endCoordinate == null && 
        Math.abs(scrollTop-prevScrollTop) > scrollThreshold  && 
        Math.abs(scrollLeft-prevScrollLeft) > scrollThreshold) {

        screenshotAreaUpdateLock = true;
    
        screenshotSelectionArea.attr('hidden', true);
        screenshotAreaUpdateLock = true;

        let scrollDir = scrollTop == prevScrollTop ? scrollLeft > prevScrollLeft ? 'R' : 'L' : scrollTop > prevScrollLeft ? 'D': 'U' ; //Extra information could be useful optimization later
        prevScrollTop = scrollTop;
        prevScrollLeft = scrollLeft;
        
        let req = {
            reqType: 'update-screen',
            scrollDir: scrollDir 
        }
        await notifyBackgroundPageOfInfo(req);
        
        req.reqType = 'update-screenshot';
        screenshotSelectionArea.attr('hidden', false);
        screenshotAreaUpdateLock = false;
        await notifyBackgroundPageOfInfo(req)
    }
}

async function prepareScreenArea() {
    let req = {
        reqType: 'prepare-screen'
    }
    await notifyBackgroundPageOfInfo(req)
}

async function prepareScreenshotArea() {
    let req = {
        reqType: 'prepare-screenshot'
    }
    await notifyBackgroundPageOfInfo(req)
}

async function notifyBackgroundPageOfInfo(infoDeliveryReq) {
    var sending = browser.runtime.sendMessage(infoDeliveryReq)
    sending.then(handleInfoExtractionResponse, handleInfoExtractionError);
}

function getMousePos(e) {
    return {
        x: e.pageX,
        y: e.pageY
    };
}

function getCanvasTopLeftAndBottomRight(coordinate1, coordinate2) {
    var coordinates = {};
    coordinates.topLeft = {
        x: coordinate1.x < coordinate2.x ? coordinate1.x : coordinate2.x,
        y: coordinate1.y < coordinate2.y ? coordinate1.y : coordinate2.y
    }
    coordinates.bottomRight = {
        x: coordinate1.x < coordinate2.x ? coordinate2.x : coordinate1.x,
        y: coordinate1.y < coordinate2.y ? coordinate2.y : coordinate1.y
    }
    return coordinates;
}