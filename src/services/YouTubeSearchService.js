import { google, youtube_v3 } from 'googleapis';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import 'dotenv/config';
import { decode } from 'html-entities';

export class YouTubeSearchService {
    #youtube;

    constructor() {
        this.#youtube = google.youtube({
            version: 'v3',
            auth: process.env.YOUTUBE_API_KEY,
        });
    }

    /**
     * Get search results from YouTube based on a query.
     * @param {string} query The search query to use.
     *  @param searchOptions Additional options for the search.
     * @returns Promise<youtube_v3.Schema$SearchListResponse> A list of search result items. Defaults to 5 results.
     */
    async search(query, searchOptions = {}) {
        try {
            /** @type {youtube_v3.Params$Resource$Search$List} */
            const options = {
                part: 'snippet',
                q: query,
                type: 'video',
                maxResults: searchOptions.maxResults || 5,
                regionCode: 'US',
                topicId: '/m/04rlf'
            };

            const response = await this.#youtube.search.list(options);

            if (response.data.items.length > 0) {
                return response.data.items
            } else {
                throw new Error('No results found');
            }
        } catch (error) {
            console.error(`Error searching YouTube: ${error}`);
            throw error;
        }
    }

    async getDiscordSearchResponse(query){
        const results = await this.search(query);

        const rows = [];
        const buttons = results.map((video, i) => {
            return new ButtonBuilder()
                .setCustomId(`${video.id.videoId}`)
                .setLabel(`${i+1}. ${decode(video.snippet.title)}`.substring(0, 80))
                .setStyle(ButtonStyle.Secondary);
        });

        buttons.forEach(button => {
            rows.push(
                new ActionRowBuilder()
                    .addComponents(button)
            );
        });
        
        const response = {
            success: true,
            message: {
                content: 'Select a Result:\n',
                components: rows,
            }
        };

        return response;
    }

    async getSearchSelectionResponse(interaction) {
        const message = await interaction.fetchReply();
        const selected = await message.awaitMessageComponent({
            filter: i => true, //i.user.id === interaction.user.id,
            time: 60_000
        })

        const selectedButtonId = selected.customId;

        return {
            success: true,
            message: {
                content: `You selected: ${selected.component.label}`,
                videoId: selectedButtonId,
                components: []
            },
            value: selectedButtonId
        }
    }
}