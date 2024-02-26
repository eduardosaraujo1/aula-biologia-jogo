const gameWindow = document.querySelector(".game-window");
const wolf = document.querySelector("#wolf");
const deer = document.querySelector("#deer");
const hunter1 = document.querySelector("#hunter1");
const hunter2 = document.querySelector("#hunter2");
let points = 0;

function randomizePosition(entity) {
    const gameWindowWidth = gameWindow.clientWidth;
    const gameWindowHeight = gameWindow.clientHeight;
    const entityWidth = entity.clientWidth;
    const entityHeight = entity.clientHeight;

    const entityX = getRandomNumber(entityWidth, gameWindowWidth) - entityWidth;
    const entityY = getRandomNumber(entityHeight, gameWindowHeight) - entityHeight;

    entity.style.left = entityX + "px";
    entity.style.top = entityY + "px";
}

function checkColision(rect1, rect2) {
    const rect1Box = rect1.getBoundingClientRect();
    const rect2Box = rect2.getBoundingClientRect();
    
    // https://jeffreythompson.org/collision-detection/rect-rect.php
    // https://stackoverflow.com/questions/31022269/collision-detection-between-two-rectangles-in-java#31035335
    const colliding = rect1Box.left < rect2Box.right && 
        rect1Box.right > rect2Box.left &&
        rect1Box.top < rect2Box.bottom && 
        rect1Box.bottom > rect2Box.top

    return colliding;
}

function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max-min+1)) + min;
}

function awardPoint() {
    const pointDisplay = document.querySelector("#points");
    pointDisplay.innerHTML = ++points;
}

let moving=false;
let maxXPosition, maxYPosition;
let mouseOffsetX, mouseOffsetY;
function wolfMoveStart(e) {
    moving=true;

    // Getting cursor position
    let initialCursorX, initialCursorY;
    if (e.type === "touchstart") {
        initialCursorX = e.touches[0].clientX;
        initialCursorY = e.touches[0].clientY;
    }
    else {
        initialCursorX = e.clientX;
        initialCursorY = e.clientY;
    }

    // Get maximum value the div should go to (left and top)
    maxXPosition = gameWindow.clientWidth - wolf.clientWidth;
    maxYPosition = gameWindow.clientHeight - wolf.clientHeight;

    // Get how far inside the wolf the cursor is (cursorPosition - top left corner of wolf)
    mouseOffsetX = initialCursorX - wolf.getBoundingClientRect().left;
    mouseOffsetY = initialCursorY - wolf.getBoundingClientRect().top;
}

function wolfMoveStop(e) {
    moving=false;
}

function wolfMoveTick(e) {
    if (!moving) return;

    let newCursorX, newCursorY;
    if (e.type === "touchmove") {
        newCursorX = e.touches[0].clientX;
        newCursorY = e.touches[0].clientY;
    }
    else {
        newCursorX = e.clientX;
        newCursorY = e.clientY;
    }
    
    // Get X and Y position for the wolf
    let x, y;
    x = newCursorX - mouseOffsetX;
    y = newCursorY - mouseOffsetY;

    // Limit the X and Y values to the range of 0..maxPosition
    x = Math.min(Math.max(0, x), maxXPosition);
    y = Math.min(Math.max(0, y), maxYPosition);

    // Load the values to the actual wolf
    wolf.style.left = x + "px";
    wolf.style.top = y + "px";
}

function wolfMovementLogic() {
    // When dragging on screen, move the wolf accordingly, not allowing it to go off bounds
    gameWindow.addEventListener("mousedown", wolfMoveStart);
    gameWindow.addEventListener("touchstart", wolfMoveStart);
    gameWindow.addEventListener("mouseup", wolfMoveStop);
    gameWindow.addEventListener("touchend", wolfMoveStop);
    gameWindow.addEventListener("touchmove", wolfMoveTick);
    gameWindow.addEventListener("mousemove", wolfMoveTick);
}

function restart() {
    // Reset Points
    const pointDisplay = document.querySelector("#points");
    points = 0;
    pointDisplay.innerHTML = points;

    // Reset Positions
    randomizePosition(deer);
    randomizePosition(hunter1);
    randomizePosition(hunter2);
    wolf.style.left = 0 + "px";
    wolf.style.top = 0 + "px";

    // Stop drag
    wolfMoveStop();
}

function tick() {
    // If player catches deer, win point
    if (checkColision(wolf, deer)) {
        awardPoint();
        randomizePosition(deer);

        // Litte quirk I decided to put in
        if (points % 25 === 0) {
            randomizePosition(hunter1);
            randomizePosition(hunter2);
        }
    }

    // If player touches hunter, lose and reset
    if (checkColision(wolf, hunter1) || checkColision(wolf, hunter2)) {
        restart();
    }

    // If hunter touches deer, reset deer but don't award point
    if (checkColision(deer, hunter1) || checkColision(deer, hunter2)) {
        randomizePosition(deer);
    }
}

function load() {
    // Set entity positions
    randomizePosition(deer);
    randomizePosition(hunter1);
    randomizePosition(hunter2);
    wolfMovementLogic();

    // Load buttons
    const btnRestart = document.querySelector("#restart");
    const btnHelp = document.querySelector("#help");

    btnRestart.addEventListener("click", restart);

    // Loop run
    const TICK_DELAY = 100; // in ms
    setInterval(tick, TICK_DELAY); 
}

load();
