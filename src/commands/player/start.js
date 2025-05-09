import { Message, SlashCommandBuilder, MessageFlags } from 'discord.js';
import { AudioPlayerService } from '../../services/AudioPlayerService.js';
import { content } from 'googleapis/build/src/apis/content/index.js';

export const command = new SlashCommandBuilder()
    .setName('start')
    .setDescription('Starts playing audio from the queue.')

export async function execute(interaction) {
    try {
        const audioPlayerService = new AudioPlayerService();

        await interaction.deferReply();
        const result = await audioPlayerService.startPlayer(interaction);

        if (result.success) {
            await interaction.editReply(result.message);
        } else {
            await interaction.editReply(result.message);
        }
    } catch (error) {
        console.error(`Error executing command: ${error}`);
        await interaction.editReply({content: `There was an error trying to execute that command: ${error.message}`, ephemeral: true});
    }
}