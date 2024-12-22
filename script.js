const puzzleContainer = document.getElementById('puzzle-container');
const puzzleBoard = document.getElementById('puzzle-board');
const piecesContainer = document.getElementById('pieces-container');
const mobileScrollBar = document.getElementById('mobile-scroll-bar');
const loadImageButton = document.getElementById('load-image');
const enableRotationCheckbox = document.getElementById('enable-rotation');
const zoomInButton = document.getElementById('zoom-in');
const zoomOutButton = document.getElementById('zoom-out');

const ctx = puzzleBoard.getContext('2d');
let image = new Image();
let pieces = [];
// Groups is used to group pieces that are connected.
// Each piece has a `group` attribute which is the key in this obejct.
// The value is an array of pieces that are connected and should be moved together.
let groups = {};
let nextGroupID = 1;
let rotationEnabled = false;
let scaleFactor = 0.7;
let pieceWidth, pieceHeight;

// --- Load Image and Slice ---
loadImageButton.addEventListener('click', () => {
    loadPuzzleImage('./cake-1850011_1920.jpg');
    applyZoom();
});

zoomInButton.addEventListener('click', () => {
    scaleFactor *= 1.1;
    applyZoom();
});

zoomOutButton.addEventListener('click', () => {
    scaleFactor /= 1.1;
    applyZoom();
});

function applyZoom() {
    puzzleContainer.style.transform = `scale(${scaleFactor})`;
    puzzleContainer.style.transformOrigin = '0 0'; // Ensure scaling from top-left corner
}

function loadPuzzleImage(src) {
    image.src = src;
    console.log("creating image");
    image.onload = () => {
        console.log("image loaded");
        initializePuzzle();
    };
}

function initializePuzzle() {
    const boardWidth = puzzleBoard.clientWidth;
    const boardHeight = puzzleBoard.clientHeight;
    const imageWidth = image.width;
    const imageHeight = image.height;

    // Calculate scaling factor to fit the image within the puzzleBoard
    const widthScale = boardWidth / imageWidth;
    const heightScale = boardHeight / imageHeight;
    const fitScale = Math.min(widthScale, heightScale);

    const scaledWidth = Math.floor(imageWidth * fitScale);
    const scaledHeight = Math.floor(imageHeight * fitScale);

    puzzleBoard.style.width = scaledWidth+'px';
    puzzleBoard.style.height = scaledHeight+'px';

    console.log("image size: ", image.width, image.height);
    console.log("puzzle board size: ", puzzleBoard.width, puzzleBoard.height);
    console.log("scaled size: ", scaledWidth, scaledHeight);

    // Clear previous pieces
    pieces = [];
    piecesContainer.innerHTML = '';
    mobileScrollBar.innerHTML = '';

    // Slice the image into pieces
    const rows = 4; // Define rows and cols dynamically later
    const cols = 4;
    pieceWidth = Math.floor(scaledWidth / cols);
    pieceHeight = Math.floor(scaledHeight / rows);

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const pieceCanvas = document.createElement('canvas');
            pieceCanvas.row = row;
            pieceCanvas.col = col;
            pieceCanvas.allowDragging = true;
            pieceCanvas.width = pieceWidth;
            pieceCanvas.height = pieceHeight;
            pieceCanvas.group = 0;
            pieceCanvas.x = 0;
            pieceCanvas.y = 0;

            const pieceCtx = pieceCanvas.getContext('2d');
            pieceCtx.drawImage(
                image,
                col * (imageWidth / cols), row * (imageHeight / rows),
                imageWidth / cols, imageHeight / rows,
                0, 0,
                pieceWidth, pieceHeight
            );
            pieceCtx.fillStyle = 'rgba(0, 0, 0, 0.25)';
            pieceCtx.fillRect(0, 0, pieceWidth, 1);
            pieceCtx.fillRect(0, 1, 1, pieceHeight);
            pieceCtx.fillRect(pieceWidth-1, 1, 1, pieceHeight);
            pieceCtx.fillRect(1, pieceHeight-1, pieceWidth-2, 1);

            pieceCanvas.classList.add('puzzle-piece');
            pieceCanvas.style.position = 'absolute';
            let randomX, randomY;
            while (true) { 
                randomX = Math.random() * (scaledWidth / scaleFactor - pieceWidth);
                randomY = Math.random() * (scaledHeight / scaleFactor - pieceHeight);
                if (randomX > scaledWidth || randomY > scaledHeight) {
                    break
                }
            }
            movePiece(pieceCanvas, randomX, randomY);
            // pieceCanvas.style.left = `${col * pieceWidth}px`;
            // pieceCanvas.style.top = `${row * pieceHeight}px`;
            pieceCanvas.setAttribute('draggable', false);

            // Add event listeners
            addDragAndDropListeners(pieceCanvas);

            pieces.push(pieceCanvas);
            piecesContainer.appendChild(pieceCanvas);
            mobileScrollBar.appendChild(pieceCanvas.cloneNode(true)); // For mobile
        }
    }
}

function addDragAndDropListeners(piece) {
    let isDragging = false;
    let startX, startY;
    let offsetX, offsetY;

    // --- Mouse Down: Start Dragging ---
    piece.addEventListener('mousedown', (e) => {
        if (!piece.allowDragging) return;

        // console.log("mousedown", e.target.col, e.target.row);
        isDragging = true;
        piece.classList.add('dragging');
        piecesContainer.appendChild(piece); // Bring to front

        // Get starting position
        startX = e.clientX;
        startY = e.clientY;

        // Get the offset within the piece
        const rect = piece.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;
    });

    // --- Mouse Move: Dragging ---
    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;

        // Calculate new position
        const containerRect = puzzleContainer.getBoundingClientRect();
        const x = e.clientX - containerRect.left - offsetX;
        const y = e.clientY - containerRect.top - offsetY;
        // console.log("mousemove", e.clientX, e.clientY, "containerRect", containerRect.left, containerRect.top, "offset", offsetX, offsetY, "new pos", x, y);

        // Update piece position
        piece.style.position = 'absolute';
        movePiece(piece, x/scaleFactor, y/scaleFactor);
    });

    // --- Mouse Up: Stop Dragging ---
    document.addEventListener('mouseup', (e) => {
        if (isDragging) {
            isDragging = false;
            piece.classList.remove('dragging');
            checkSnap(e.target);
        }
    });
}

// --- Enable Rotation ---
enableRotationCheckbox.addEventListener('change', (e) => {
    rotationEnabled = e.target.checked;
});

// --- Snapping Logic ---
function checkSnap(piece) {
    const x = parseFloat(piece.style.left);
    const y = parseFloat(piece.style.top);

    const expectedX = piece.col * pieceWidth;
    const expectedY = piece.row * pieceHeight;

    const distanceX = Math.abs(x - expectedX);
    const distanceY = Math.abs(y - expectedY);

    // console.log("checkSnap", piece.col, piece.row, x, y, expectedX, expectedY, distanceX, distanceY);
    if (distanceX < pieceWidth * 0.15 && distanceY < pieceHeight * 0.15) {
        movePiece(piece, expectedX, expectedY);
        console.log("snapped");
        piece.allowDragging = false;
        piece.classList.add('unmovable');
        if (piece.group) {
            for (let p of groups[piece.group]) {
                p.allowDragging = false;
                p.classList.add('unmovable');
            }
        }
        
        return;
    }

    // check if piece is near a matching piece
    for (let other of pieces) {
        if (other === piece || !other.allowDragging || (piece.group > 0 && piece.group === other.group)) continue;

        const otherX = parseFloat(other.style.left);
        const otherY = parseFloat(other.style.top);

        const distanceX = Math.abs(x - otherX);
        const distanceY = Math.abs(y - otherY);

        const isHorizontallyAdjacent = distanceX > 0.85 * pieceWidth && distanceX < 1.15 * pieceWidth && distanceY < 0.15 * pieceHeight;
        const isVerticallyAdjacent = distanceY > 0.85 * pieceHeight && distanceY < 1.15 * pieceHeight && distanceX < 0.15 * pieceWidth;
        // move the `other` piece to be aligned with the current `piece` if adjacent
        if (isHorizontallyAdjacent) {
            console.log('horizontally adjacent', piece.group, other.group);
            if (x < otherX) {
                if (piece.col == other.col - 1 && piece.row == other.row) {
                    movePiece(other, x + pieceWidth, y);
                    groupPieces(piece, other);
                }
             } else {
                if (piece.col - 1 == other.col && piece.row == other.row) {
                    movePiece(other, x - pieceWidth, y);
                    groupPieces(piece, other);
                }
            }
        }
        if (isVerticallyAdjacent) {
            console.log('vertically adjacent', piece.group, other.group);
            if (y < otherY) {
                if (piece.row == other.row - 1 && piece.col == other.col) {
                    movePiece(other, x, y + pieceHeight);
                    groupPieces(piece, other);
                }
            } else {    
                if (piece.row - 1 == other.row && piece.col == other.col) {
                    movePiece(other, x, y - pieceHeight);
                    groupPieces(piece, other);
                }
            }
        }
    }
}

function groupPieces(piece1, piece2) {
    if (piece1.group && piece2.group && piece1.group != piece2.group) { // Merge the two groups
        const piece2group = piece2.group; // store the group id before it gets overwritten in the loop
        const group1 = groups[piece1.group]; 
        const group2 = groups[piece2.group];
        for (let piece of group2) {
            piece.group = piece1.group;
            if (!group1.includes(piece)) {
                group1.push(piece);
            }
        }
        delete groups[piece2group];
    } else if (piece1.group) { // Add piece2 to group of piece1
        piece2.group = piece1.group;
        if (!groups[piece1.group].includes(piece2)) {
            groups[piece1.group].push(piece2);
        }
    } else if (piece2.group) { // Add piece1 to group of piece2
        piece1.group = piece2.group;
        if (!groups[piece2.group].includes(piece1)) {
            groups[piece2.group].push(piece1);
        }
    } else { // Create a new group with the two pieces
        piece1.group = piece2.group = nextGroupID;
        groups[nextGroupID] = [piece1, piece2];
        nextGroupID++;
    }
}

function movePiece(piece, x, y) {
    let dx = x - piece.x;
    let dy = y - piece.y;
    if (piece.group) {
        for (let p of groups[piece.group]) {
            p.style.left = `${p.x + dx}px`;
            p.style.top = `${p.y + dy}px`;
            p.x += dx;
            p.y += dy;
        }
    } else {
        piece.style.left = `${x}px`;
        piece.style.top = `${y}px`;
        piece.x = x;
        piece.y = y;
    }
    // console.log('movePiece', piece.col, piece.row, "to", x, y, "but got", piece.style.left, piece.style.top, "group", piece.group);
}