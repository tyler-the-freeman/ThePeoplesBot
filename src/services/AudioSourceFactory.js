import { YouTubeAudioSource } from './sources/YouTubeAudioSource.js';


export class AudioSourceFactory {
    static createSource(url) {
        return new YouTubeAudioSource(url);
    }
}