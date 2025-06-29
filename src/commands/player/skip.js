import { SlashCommandBuilder, MessageFlags } from 'discord.js';
import { AudioPlayerService } from '../../services/AudioPlayerService.js';

export const command = new SlashCommandBuilder()
    .setName('skip')
    .setDescription('Skips to the next track in the queue.')

export async function execute(interaction) {
    try {
        const audioPlayerService = new AudioPlayerService();
        const result = await audioPlayerService.skip(interaction);

        if (result.success) {
            await interaction.reply(result.message);
        } else {
            await interaction.reply({ content: result.message, flags: MessageFlags.Ephemeral });
        }
    } catch (error) {
        console.error(`Error executing command: ${error}`);
        await interaction.reply({content: `There was an error trying to execute that command: ${error.message}`, ephemeral: true});
    }
}