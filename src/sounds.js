export function playSound(sound) {
    let audio = new Audio(sound);
    audio.currentTime = 0;
    audio.play().then(() => {
        audio.remove();
    });
}

export function createSounds(sound) {
    let audioArray = new Array(10);

    for(let i = 0; i < audioArray.length; i++) {
        audioArray[i] = new Audio(sound);
    }

    return audioArray;
}

export function playSoundFromArray(index, arr) {
    let audio = arr[index];

    audio.currentTime = 0;
    audio.play();
}