const puzzleBoard = document.getElementById('puzzle-board');
const piecesContainer = document.getElementById('pieces-container');
const mobileScrollBar = document.getElementById('mobile-scroll-bar');
const loadImageButton = document.getElementById('load-image');
const enableRotationCheckbox = document.getElementById('enable-rotation');

const ctx = puzzleBoard.getContext('2d');
let image = new Image();
let pieces = [];
let rotationEnabled = false;

// --- Load Image and Slice ---
loadImageButton.addEventListener('click', () => {
    // const imgSrc = prompt('Enter the image URL:');
    // if (imgSrc) {
    //     loadPuzzleImage(imgSrc);
    // }
    loadPuzzleImage('./cake-1850011_1920.jpg');
});

function loadPuzzleImage(src) {
    image.src = src;
    console.log("creating image")
    image.onload = () => {
        console.log("image loaded")
        initializePuzzle();
    };
}

function initializePuzzle() {
    puzzleBoard.width = image.width;
    puzzleBoard.height = image.height;

    // Clear previous pieces
    pieces = [];
    piecesContainer.innerHTML = '';
    mobileScrollBar.innerHTML = '';

    // Slice the image into pieces
    const rows = 4; // Define rows and cols dynamically later
    const cols = 4;
    const pieceWidth = image.width / cols;
    const pieceHeight = image.height / rows;

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const pieceCanvas = document.createElement('canvas');
            pieceCanvas.width = pieceWidth;
            pieceCanvas.height = pieceHeight;

            const pieceCtx = pieceCanvas.getContext('2d');
            pieceCtx.drawImage(
                image,
                col * pieceWidth, row * pieceHeight,
                pieceWidth, pieceHeight,
                0, 0,
                pieceWidth, pieceHeight
            );

            pieceCanvas.classList.add('puzzle-piece');
            pieceCanvas.style.position = 'absolute';
            pieceCanvas.style.left = `${Math.random() * 80}%`;
            pieceCanvas.style.top = `${Math.random() * 80}%`;
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
        const containerRect = document.getElementById('puzzle-container').getBoundingClientRect();
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
