export function Audio() {
    let instance;
    let currentSoundSource = null;

    function init() {
        let sfxVolume = 0.5;
        let musicVolume = 0.5;

        let context = new (window.AudioContext || window.webkitAudioContext)();
        let sfxGainNode = context.createGain();
        sfxGainNode.gain.value = sfxVolume;
        sfxGainNode.connect(context.destination);

        let musicGainNode = context.createGain();
        musicGainNode.gain.value = musicVolume;
        musicGainNode.connect(context.destination);

        let sfxBufferMap = new Map();
        let musicBufferMap = new Map();

        async function loadSound(url) {
            try {
                let response = await fetch(url);
                let arrayBuffer = await response.arrayBuffer();
                let audioBuffer = await context.decodeAudioData(arrayBuffer);
                return audioBuffer;
            } catch (error) {
                console.error(`Failed to load sound ${url}:`, error);
                return null;
            }
        }

        async function playSound(audioBuffer, gainNode) {
            if (!audioBuffer) return;

            if(currentSoundSource) {
                currentSoundSource.stop();
                currentSoundSource = null;
            }

            let source = context.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(gainNode);
            source.start();
            
            currentSoundSource = source;

            source.onended = () => {
                currentSoundSource = null;
            }
        }

        return {
            async loadSFX(name, url) {
                let audioBuffer = await loadSound(url);
                if (audioBuffer) {
                    sfxBufferMap.set(name, audioBuffer);
                }
            },

            async loadMusic(name, url) {
                let audioBuffer = await loadSound(url);
                if (audioBuffer) {
                    musicBufferMap.set(name, audioBuffer);
                }
            },

            async playSFX(name) {
                let audioBuffer = sfxBufferMap.get(name);
                if (audioBuffer) {
                    await playSound(audioBuffer, sfxGainNode);
                }
            },

            async playMusic(name) {
                let audioBuffer = musicBufferMap.get(name);
                if (audioBuffer) {
                    await playSound(audioBuffer, musicGainNode);
                }
            },

            setSFXVolume(volume) {
                sfxGainNode.gain.value = volume;
                sfxVolume = volume;
            },

            setMusicVolume(volume) {
                musicGainNode.gain.value = volume;
                musicVolume = volume;
            }
        };
    }

    return {
        getInstance: function() {
            if (!instance) {
                instance = init();
            }
            return instance;
        }
    }
};