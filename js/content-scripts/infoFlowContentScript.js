console.log('hello contents')
$(document).bind('keydown', (e) => hotKeyListener(e));

var screenshotSelectionArea = null;
var screenshotIsToggledOn = false;
var startCoordinate = null;
var endCoordinate = null;

function cancelScreenshot() {
    screenshotIsToggledOn = false;
    screenshotCanvas = null;
    startCoordinate = null;
    endCoordinate = null;
    $('#rm-screenshot-selection-capture-canvas').remove();
    $('#rm-screenshot-selection-capture-canvas-cancel-btn').remove();
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
            backgroundColor: 'rgba(0,0,0,0.25)',
            position: 'fixed',
            top: '0',
            left: '0',
            margin: '0',
            padding: '0',
            width: window.innerWidth,
            height: window.innerHeight,
            zIndex: '10000',
            cursor: 'crosshair'
        })
        let cancelBtn = $('<button></button>',{
            id: 'rm-screenshot-selection-capture-canvas-cancel-btn',
            text: 'Cancel',
            click: () => {cancelScreenshot();}
        });
        cancelBtn.css({
            position: 'fixed',
            fontSize: '2em',
            bottom: '2vh',
            right: '2vw',
            zIndex: '10001',
            cursor: 'pointer'
        });

        $(document.body).append(screenshotSelectionArea);
        $(document.body).append(cancelBtn);
    }
}

function hotKeyListener(e) {
    if (e.altKey && e.which === 67){
        // Check if highlighted text or nothing highlighted -> screenshot
        if (window.getSelection().toString() === '') {
            sendScreenshotDataDeliveryReq();
        } else {
            sendQuoteDataDeliveryReq();
        }
    }
}

function updateScreenshotCoordinates(e) {
    if (screenshotIsToggledOn && startCoordinate != null) {
        endCoordinate = {
            x: e.clientX,
            y: e.clientY
        };
        let canvas = screenshotSelectionArea[0]
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        let ctx = canvas.getContext('2d');

        ctx.clearRect(0, 0, canvas.width, canvas.height); // clear canvas
        ctx.beginPath();
        ctx.fillStyle  = 'rgba(255,255,255,0.5)';
        ctx.strokeStyle = 'black';
        let start = {
            x: endCoordinate.x < startCoordinate.x ? endCoordinate.x : startCoordinate.x,
            y: endCoordinate.y < startCoordinate.y ? endCoordinate.y : startCoordinate.y
        }
        let end = {
            x: endCoordinate.x < startCoordinate.x ? startCoordinate.x : endCoordinate.x,
            y: endCoordinate.y < startCoordinate.y ? startCoordinate.y : endCoordinate.y
        }
        
        canvasStart = getCanvasPos(canvas,start);
        canvasEnd = getCanvasPos(canvas,end);

        let width = canvasEnd.x-canvasStart.x;
        let height = canvasEnd.y-canvasStart.y;
        
        ctx.rect(canvasStart.x, canvasStart.y, width , height);
        ctx.fill();
        ctx.stroke();
    }
}

function getCanvasPos(canvas, clientPoint) {
    var rect = canvas.getBoundingClientRect(), // abs. size of element
        scaleX = canvas.width / rect.width,    // relationship bitmap vs. element for X
        scaleY = canvas.height / rect.height;  // relationship bitmap vs. element for Y
  
    return {
      x: (clientPoint.x - rect.left) * scaleX,   // scale mouse coordinates after they have
      y: (clientPoint.y - rect.top) * scaleY     // been adjusted to be relative to element
    }
  }

function screenshotSelectionListener(e) {
    if (screenshotIsToggledOn) {
        if (startCoordinate == null) {
            startCoordinate = {
                x: e.clientX,
                y: e.clientY
            };
        } else {
            screenshotIsToggledOn = false;
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
    let screenshot = selectScreenshot();
   
    let req = {
        reqType: 'info-flow',
        isScreenShot: true,
        data: screenshot,
        url: currentTab.url,
        title: currentTab.title
    }
    notifyBackgroundPageOfInfo(req)
}

function updateScreenshotSelection() {

}

function sendQuoteDataDeliveryReq(currentTab) {
    console.log("quote")
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

