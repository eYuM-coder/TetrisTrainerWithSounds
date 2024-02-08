import audioFilePath from "./sounds/NES_move.wav"

export function playSound(sound) {
    let audio = new Audio(sound);
    audio.currentTime = 0;
    audio.play();
}