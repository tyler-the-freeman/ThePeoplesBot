import ytdl from "@distube/ytdl-core";
import { google } from "googleapis";
import 'dotenv/config';

export class YouTubeAudioSource {
    #url;
    #youtube;

    #dlOptions = {
        filter: 'audioonly',
        quality: 'highestaudio',
        highWaterMark: 1024 * 1024 * 32, // 32MB
        dlChunkSize: 262144 // 256KB
    }

    constructor(url) {
        this.#url = url;
        this.#youtube = google.youtube({
            version: 'v3',
            auth: process.env.YOUTUBE_API_KEY
        });
    }

    // Checks if the URL has 'list' parameter
    async isPlaylist() {
        return this.#url.includes('list');
    }


    // createStream 
    async getTrack() {
        const info = await ytdl.getBasicInfo(this.#url);
        const track = {
            title: info.videoDetails.title,
            url: this.#url,
            createStream: async () => {
                const stream = ytdl(this.#url, {
                    //filter: 'audioonly',
                    quality: 'highestaudio',
                    highWaterMark: 1024 * 32,
                    //dlChunkSize: 1024 * 32,
                });
                return stream;
            }
        }
        console.log(track.title, track.url);
        return track;
    }


    async getPlaylistTracks() {
        const playlistId = this.#url.split('list=')[1].split('&')[0];
        try {
            let tracks = [];
                const response = await this.#youtube.playlistItems.list({
                    part: 'snippet',
                    playlistId: playlistId,
                });                

                const items = response.data.items;
                for (const item of items) {
                    const videoId = item.snippet.resourceId.videoId;
                    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
                    let track = {
                        title: item.snippet.title,
                        url: videoUrl,
                        createStream: async () => {
                            const stream = ytdl(videoUrl, {
                                //filter: 'audioonly',
                                quality: 'highestaudio',
                                highWaterMark: 1024 * 2,
                                //dlChunkSize: 1024 * 32,
                            });

                            return stream;
                        }
                    };
                    tracks.push(track);
                }
            return tracks;
        } catch (error) {
            console.error(`Error fetching playlist tracks: ${error}`);
            return [];
        }
    }
}