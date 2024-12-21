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
let rotationEnabled = false;
let scaleFactor = 1;

// --- Load Image and Slice ---
loadImageButton.addEventListener('click', () => {
    loadPuzzleImage('./cake-1850011_1920.jpg');
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
    const pieceWidth = Math.floor(scaledWidth / cols);
    const pieceHeight = Math.floor(scaledHeight / rows);

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const pieceCanvas = document.createElement('canvas');
            pieceCanvas.width = pieceWidth;
            pieceCanvas.height = pieceHeight;

            const pieceCtx = pieceCanvas.getContext('2d');
            pieceCtx.drawImage(
                image,
                col * (imageWidth / cols), row * (imageHeight / rows),
                imageWidth / cols, imageHeight / rows,
                0, 0,
                pieceWidth, pieceHeight
            );

            pieceCanvas.classList.add('puzzle-piece');
            pieceCanvas.style.position = 'absolute';
            // pieceCanvas.style.left = `${Math.random() * 80}%`;
            // pieceCanvas.style.top = `${Math.random() * 80}%`;
            pieceCanvas.style.left = `${col * pieceWidth}px`;
            pieceCanvas.style.top = `${row * pieceHeight}px`;
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

        // Update piece position
        piece.style.position = 'absolute';
        piece.style.left = `${x}px`;
        piece.style.top = `${y}px`;
    });

    // --- Mouse Up: Stop Dragging ---
    document.addEventListener('mouseup', (e) => {
        if (isDragging) {
            isDragging = false;
            piece.classList.remove('dragging');
        }
    });
}

// --- Enable Rotation ---
enableRotationCheckbox.addEventListener('change', (e) => {
    rotationEnabled = e.target.checked;
});

// --- Snapping Logic ---
function checkSnap() {
    // Implement snapping detection and sound effect logic
}