import { SlashCommandBuilder, MessageFlags } from "discord.js";
import { AudioPlayerService } from "../../services/AudioPlayerService.js";

export const command = new SlashCommandBuilder()
    .setName('pause')
    .setDescription('Pause the currently playing track.');

export async function execute(interaction) {
    try {
        const audioPlayerService = new AudioPlayerService();
        const result = await audioPlayerService.pause(interaction);

        await interaction.reply({ content: result.message, flags: MessageFlags.Ephemeral });
    } catch (error) {
        console.error(`Error executing command: ${error}`);
        await interaction.reply({content: `There was an error trying to execute that command: ${error.message}`, flags: MessageFlags.Ephemeral});
    }
}
