const gameWindow = document.querySelector(".game-window");
const entity = {
    wolf: document.querySelector("#wolf"),
    deer: document.querySelector("#deer"),
    hunter1: document.querySelector("#hunter1"),
    hunter2: document.querySelector("#hunter2")
}
const gameState = {
    points: 0,
    maxPoints: 0,
    deathCount: 0
}

function randomizeDivPosition(div) {
    const gameWindowWidth = gameWindow.clientWidth;
    const gameWindowHeight = gameWindow.clientHeight;
    const divWidth = div.clientWidth;
    const divHeight = div.clientHeight;

    const divX = getRandomNumber(divWidth, gameWindowWidth) - divWidth;
    const divY = getRandomNumber(divHeight, gameWindowHeight) - divHeight;

    div.style.left = divX + "px";
    div.style.top = divY + "px";
}

function checkRectColision(rect1, rect2) {
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
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

let moving = false;
let maxPlayerPos = [];
let mouseOffset = [];

function getCursorPosition(e) {
    // The name of this function should tell you what it does
    let cursorX, cursorY;
    if (e.type === "touchmove" ||
        e.type === "touchstart") 
    {
        cursorX = e.touches[0].clientX;
        cursorY = e.touches[0].clientY;
    }
    else {
        cursorX = e.clientX;
        cursorY = e.clientY;
    }

    return [cursorX, cursorY];
}

function getCursorPositionRelativeToGameWindow(e) {
    // The name of this function should tell you what it does
    let cursorPos = getCursorPosition(e);
    cursorPos[0] -= gameWindow.getBoundingClientRect().left;
    cursorPos[1] -= gameWindow.getBoundingClientRect().top;
    return cursorPos;
}

function getMouseOffset(cursorPos) {
    // Calculates how far away the mouse is from the top left corner of the player
    let mouseOffsetX, mouseOffsetY;
    mouseOffsetX = cursorPos[0] - entity.wolf.offsetLeft;
    mouseOffsetY = cursorPos[1] - entity.wolf.offsetTop;
    return [mouseOffsetX, mouseOffsetY];
}

function getPlayerMaximumPosition() {
    // Calculates the maximum X and Y positions the player
    // can move to within the game window without going outside of it.
    let maxXPos, maxYPos;
    maxXPos = gameWindow.clientWidth - entity.wolf.clientWidth;
    maxYPos = gameWindow.clientHeight - entity.wolf.clientHeight;
    return [maxXPos, maxYPos];
}

function playerMoveStart(e) {
    let cursorPos;
    cursorPos = getCursorPositionRelativeToGameWindow(e);
    maxPlayerPos = getPlayerMaximumPosition();
    mouseOffset = getMouseOffset(cursorPos);
    moving = true;
}

function playerMoveStop(e) {
    moving = false;
}

function playerMoveTick(e) {
    if (!moving) return;

    let cursorPos = getCursorPositionRelativeToGameWindow(e);

    // Get X and Y position for the wolf
    let x, y;
    x = cursorPos[0] - mouseOffset[0];
    y = cursorPos[1] - mouseOffset[1];

    // Limit the X and Y values to the range of 0..maxPosition
    x = Math.min(Math.max(0, x), maxPlayerPos[0]);
    y = Math.min(Math.max(0, y), maxPlayerPos[1]);

    // Load the values to the actual wolf
    entity.wolf.style.left = x + "px";
    entity.wolf.style.top = y + "px";

    // Check if colisions have happened after the wolf moved
    checkGameStatus();
}

function checkGameStatus() {
    // If player catches deer, win point
    if (checkRectColision(entity.wolf, entity.deer)) {
        awardPoint();
        randomizeDivPosition(entity.deer);

        // Litte quirk I decided to put in 
        if (gameState.points % 25 === 0) {
            randomizeDivPosition(entity.hunter1);
            randomizeDivPosition(entity.hunter2);
        }
    }

    // If player touches hunter, lose and reset
    if (checkRectColision(entity.wolf, entity.hunter1) || checkRectColision(entity.wolf, entity.hunter2)) {
        restartGame();
    }

    // If hunter touches deer, reset deer but don't award point
    if (checkRectColision(entity.deer, entity.hunter1) || checkRectColision(entity.deer, entity.hunter2)) {
        randomizeDivPosition(entity.deer);
    }
}

function loadPlayerMovement() {
    // When dragging on screen, move the wolf accordingly, not allowing it to go off bounds
    gameWindow.addEventListener("mousedown", playerMoveStart);
    gameWindow.addEventListener("touchstart", playerMoveStart);
    gameWindow.addEventListener("mouseup", playerMoveStop);
    gameWindow.addEventListener("touchend", playerMoveStop);
    gameWindow.addEventListener("touchmove", playerMoveTick);
    gameWindow.addEventListener("mousemove", playerMoveTick);
}

function awardPoint() {
    const pointDisplay = document.querySelector("#points");
    pointDisplay.innerHTML = ++gameState.points;
}

function resetPoints() {
    const pointDisplay = document.querySelector("#points");
    gameState.points = 0;
    pointDisplay.innerHTML = gameState.points;
}

function resetEntities() {
    // Reset Positions
    randomizeDivPosition(entity.deer);
    randomizeDivPosition(entity.hunter1);
    randomizeDivPosition(entity.hunter2);
    entity.wolf.style.left = "0px";
    entity.wolf.style.top = "0px";
}

function restartGame() {
    resetPoints();
    resetEntities();
    playerMoveStop();
}

function load() {
    // Load Entities
    resetEntities();
    loadPlayerMovement();

    // Load button
    const btnRestart = document.querySelector("#restart");
    btnRestart.addEventListener("click", restartGame);
}

load();
