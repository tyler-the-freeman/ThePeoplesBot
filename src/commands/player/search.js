import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } from 'discord.js';
import { AudioPlayerService } from '../../services/AudioPlayerService.js';
import { YouTubeSearchService } from '../../services/YouTubeSearchService.js';
import { decode } from 'html-entities';

export const command = new SlashCommandBuilder()
    .setName('search')
    .setDescription('Search for a YouTube video')
    .addStringOption(option =>
        option.setName('query')
            .setDescription('Search query')
            .setRequired(true));


export async function execute(interaction) {
    try {
        const query = await interaction.options.get('query').value;
        await interaction.deferReply();

        await interaction.editReply('Searching for ' + query + '...');

        const youtubeSearchService = new YouTubeSearchService();
        const searchResponse = await youtubeSearchService.getDiscordSearchResponse(query);

        await interaction.editReply(searchResponse.message);

        const selectionResponse = await youtubeSearchService.getSearchSelectionResponse(interaction);
        const selectedButtonId = selectionResponse.value;

        await interaction.editReply(selectionResponse.message);
  
        const audioPlayerService = new AudioPlayerService();
        const url = `https://www.youtube.com/watch?v=${selectedButtonId}`;

        await audioPlayerService.play(interaction, url)     
    } catch (error) {
        console.error(`Error executing search command: ${error}`);
        await interaction.editReply('An error occurred while searching.');
    }
}