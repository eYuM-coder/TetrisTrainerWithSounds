export function playSound(sound) {
    let audio = new Audio(sound);
    audio.currentTime = 0;
    audio.play();
}