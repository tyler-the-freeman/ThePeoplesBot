import { Message, SlashCommandBuilder, MessageFlags } from "discord.js";
import { AudioPlayerService } from "../../services/AudioPlayerService.js";

export const command = new SlashCommandBuilder()
    .setName('play')
    .setDescription('Play audio from a YouTube video/playlist URL or a search query.')
	.addStringOption(option =>
		option.setName('query')
			.setDescription('Youtube URL or search query.')
            .setRequired(true));

export async function execute(interaction) {
    try {
        const query = await interaction.options.get('query').value;

        await interaction.deferReply();

        const audioPlayerService = new AudioPlayerService();
        await audioPlayerService.play(interaction, query);
    } catch (error) {
        console.error(`Error executing command: ${error}`);
        await interaction.editReply(`There was an error trying to execute that command: ${error.message}`);
    }
}