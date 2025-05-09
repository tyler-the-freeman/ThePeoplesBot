import { Message, SlashCommandBuilder, MessageFlags } from "discord.js";
import { AudioPlayerService } from "../../services/AudioPlayerService.js";

export const command = new SlashCommandBuilder()
    .setName('play')
    .setDescription('Play audio from a YouTube video or playlist')
	.addStringOption(option =>
		option.setName('youtube-url')
			.setDescription('Youtube URL (video or playlist)')
            .setRequired(true));

export async function execute(interaction) {
    try {
        const url = await interaction.options.get('youtube-url').value;

        await interaction.deferReply();

        const audioPlayerService = new AudioPlayerService();
        await audioPlayerService.play(interaction, url);

    } catch (error) {
        console.error(`Error executing command: ${error}`);
        await interaction.editReply(`There was an error trying to execute that command: ${error.message}`);
    }
}