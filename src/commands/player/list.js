import { SlashCommandBuilder, MessageFlags } from "discord.js";
import { AudioPlayerService } from "../../services/AudioPlayerService.js";

export const command = new SlashCommandBuilder()
    .setName('list')
    .setDescription('View the current audio player queue. Only visible to you.');


export async function execute(interaction) {
    try {
        const audioPlayerService = new AudioPlayerService();
        const result = await audioPlayerService.viewQueue(interaction);

        await interaction.reply({ content: result.message, flags: MessageFlags.Ephemeral });

    } catch (error) {
        console.error(`Error executing command: ${error}`);
        await interaction.reply({content: `There was an error trying to execute that command: ${error.message}`, flags: MessageFlags.Ephemeral});
    }
}
