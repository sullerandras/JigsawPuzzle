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
            pieceCanvas.setAttribute('draggable', true);

            // Add event listeners
            addDragAndDropListeners(pieceCanvas);

            pieces.push(pieceCanvas);
            piecesContainer.appendChild(pieceCanvas);
            mobileScrollBar.appendChild(pieceCanvas.cloneNode(true)); // For mobile
        }
    }
}

function addDragAndDropListeners(piece) {
    console.log("adding drag and drop listeners")
    piece.addEventListener('dragstart', dragStart);
    piece.addEventListener('dragend', dragEnd);
    piece.addEventListener('drag', drag);

    let dragStartX, dragStartY, offsetX, offsetY;

    function dragStart(e) {
        console.log('drag start', e.clientX, e.clientY, e.offsetX, e.offsetY)
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        offsetX = e.offsetX;
        offsetY = e.offsetY;
        e.dataTransfer.setData('text/plain', 'dragging');
        e.target.classList.add('dragging');
    }

    function drag(e) {
        if (e.clientX === 0 && e.clientY === 0) return; // Ignore invalid drag events
        console.log('drag', e.clientX, e.clientY, e.offsetX, e.offsetY)
        const x = e.clientX - offsetX;
        const y = e.clientY - offsetY;
        e.target.style.position = 'absolute';
        e.target.style.left = `${x}px`;
        e.target.style.top = `${y}px`;
    }

    function dragEnd(e) {
        console.log('drag end', e.clientX, e.clientY, e.offsetX, e.offsetY)
        e.target.classList.remove('dragging');
        // Snapping logic to be added here
    }
}

// --- Enable Rotation ---
enableRotationCheckbox.addEventListener('change', (e) => {
    rotationEnabled = e.target.checked;
});

// --- Snapping Logic ---
function checkSnap() {
    // Implement snapping detection and sound effect logic
}
