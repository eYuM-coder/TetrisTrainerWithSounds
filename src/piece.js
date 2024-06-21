import { NUM_ROW, NUM_COLUMN, VACANT, COLOR_PALETTE } from "./constants.js";
import { createSounds, playSoundFromArray } from "./sounds.js";
import { TriggerGameOver, disableSounds } from "."
import NES_move from "../docs/sounds/NES_move.wav";
import NES_rotate from "../docs/sounds/NES_rotate.wav";
import { Audio } from "./audio.js";

const audio = Audio().getInstance();

async function initAudio() {
    audio.setSFXVolume(0.5);
    audio.setMusicVolume(0.5);

    audio.loadSFX('piece_move', 'sounds/NES_move.wav');
    audio.loadSFX('piece_rotate', 'sounds/NES_rotate.wav');
}

/** 
 * Piece object, responsible for moving and rotating itself within the board.
 * @param {[
 *      rotationList: list<4x4 matrix>,
 *      colorId: number,
 *      id: string (piece letter names)
 * ]} pieceData
 * @param {int[][]} board
*/

export function Piece(pieceData, board) {
    this.rotationList = pieceData[0];
    this.colorId = pieceData[1];
    this.id = pieceData[2];
    this.board = board;

    this.rotationIndex = 0;
    this.activeTetromino = this.rotationList[this.rotationIndex];

    this.x = 3;
    this.y = this.id == "I" ? -2 : -1;
}

Piece.prototype.equals = function (otherPiece) {
    return this.id === otherPiece.id;
};

// Get the haight of the lowest row that the piece occupies
Piece.prototype.getHeightFromBottom = function () {
    let maxY = 0;
    for (let r = 0; r < this.activeTetromino.length; r++) {
        for (let c = 0; c < this.activeTetromino[r].length; c++) {
            // If the square is occupied by the piece, update the max
            if (this.activeTetromino[r][c]) {
                maxY = Math.max(maxY, this.y + r);
            }
        }
    }
    return NUM_ROW - maxY;
};

Piece.prototype.shouldLock = function () {
    return this.collision(0, 1, this.activeTetromino);
};

// move Down the piece
Piece.prototype.moveDown = function () {
    this.y++;
};

/**
 * Attempt to move the piece right.
 * @returns true if the piece moved */
Piece.prototype.moveRight = function () {
    if (this.collision(1, 0, this.activeTetromino)) {
        return false;
    } else {
        // No collision, move the piece
        this.x++;
        if (disableSounds() === false) {
            audio.playSFX('piece_move');
        }
        return true;
    }
};

/**
 * Attempt to move the piece left.
 * @returns true if the piece moved */
Piece.prototype.moveLeft = function () {
    if (this.collision(-1, 0, this.activeTetromino)) {
        return false;
    } else {
        // No collision, move the piece
        this.x--;
        if (disableSounds() === false) {
            audio.playSFX('piece_move');
        }
        return true;
    }
}

// rotate the piece
Piece.prototype.rotate = function (isClockwise) {
    const offset = isClockwise ? 1 : -1;
    const nextIndex =
        (this.rotationIndex + offset + this.rotationList.length) %
        this.rotationList.length;
    const nextPattern = this.rotationList[nextIndex];

    // Rotate as long as the new orientation doesn't collide with the board
    if (!this.collision(0, 0, nextPattern)) {
        this.rotationIndex = nextIndex;
        if (disableSounds() === false) {
            audio.playSFX('piece_rotate');
        }
        this.activeTetromino = this.rotationList[this.rotationIndex];
    }
};

// Lock the piece in place
Piece.prototype.lock = function () {
    for (let r = 0; r < this.activeTetromino.length; r++) {
        for (let c = 0; c < this.activeTetromino[r].length; c++) {
            // we skip the vacant squares
            if (!this.activeTetromino[r][c]) {
                continue;
            }

            // we lock the piece
            const newY = this.y + r;
            const newX = this.x + c;
            if (newY >= 0 && newY < NUM_ROW && newX >= 0 && newX < NUM_COLUMN) {
                this.board[this.y + r][this.x + c] = this.colorId;
            }
        }
    }
};

// Collision function
Piece.prototype.collision = function (x, y, piece) {
    for (let r = 0; r < piece.length; r++) {
        for (let c = 0; c < piece[r].length; c++) {
            // if the square is empty, we skip it
            if (!piece[r][c]) {
                continue;
            }
            // coordinates of the piece after movement
            let newX = this.x + c + x;
            let newY = this.y + r + y;

            // conditions
            if (newX < 0 || newX >= NUM_COLUMN || newY >= NUM_ROW) {
                return true;
            }
            // skip newY < 0; board[-1] will crush our game
            if (newY < 0) {
                continue;
            }
            // check if there is a locked piece already in place
            if (this.board[newY][newX] != 0) {
                return true;
            }
        }
    }
    return false;
};