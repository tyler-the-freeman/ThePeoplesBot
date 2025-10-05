import ytdl from "@distube/ytdl-core";
import { google } from "googleapis";
import 'dotenv/config';
import { Innertube, UniversalCache, Utils } from 'youtubei.js';

export class YouTubeAudioSource {
    #url;
    #youtube;
    #innertube;

    constructor(url) {
        this.#url = url;
        this.#youtube = google.youtube({
            version: 'v3',
            auth: process.env.YOUTUBE_API_KEY
        });
        this.#innertube = Innertube.create({ cache: new UniversalCache(false), generate_session_locally: true, player_id: '0004de42' });
    }

    async isPlaylist() {
        return this.#url.includes('list');
    }


    // createStream 
    async getTrack() {
        const info = await ytdl.getBasicInfo(this.#url);
        const yt = await this.#innertube;

        const streamingData = await yt.getStreamingData(info.videoDetails.videoId, { format: 'mp4a', quality: 'best' });
        const track = {
            title: info.videoDetails.title,
            url: this.#url,
            createStream: async () => {
                const response = await fetch(streamingData.url);
                return response.body;
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
                    const yt = await this.#innertube;
                    const streamingData = await yt.getStreamingData(videoId, {
                        format: 'mp4a',
                        quality: 'best',
                    });

                    let track = {
                        title: item.snippet.title,
                        url: videoUrl,
                        createStream: async () => {
                            const response = await fetch(streamingData.url);
                            return response.body;
                        }
                    }
                    tracks.push(track);
                }
            return tracks;
        } catch (error) {
            console.error(`Error fetching playlist tracks: ${error}`);
            return [];
        }
    }
}