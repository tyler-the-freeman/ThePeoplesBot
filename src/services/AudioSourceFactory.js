import { YouTubeAudioSource } from './sources/YouTubeAudioSource.js';


export class AudioSourceFactory {
    static createSource(url) {
        // if (url.includes('youtube.com') || url.includes('youtu.be')) {
        //     return new YouTubeAudioSource(url);
        // }

        // throw new Error('Unsupported audio source');
        return new YouTubeAudioSource(url);
    }
}