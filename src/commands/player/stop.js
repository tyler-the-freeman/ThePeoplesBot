import { SlashCommandBuilder } from "discord.js";
import { getVoiceConnection } from "@discordjs/voice";

export const command = new SlashCommandBuilder()
    .setName('stop')
    .setDescription('Stops any audio currently playing in the voice channel. Does not clear the queue.');

export async function execute(interaction) {

    try {
        const connection = getVoiceConnection(interaction.guild.id);
        if (connection) {
            connection.destroy();
            await interaction.reply('Stopped playing audio and left the voice channel.');
        } else {
            await interaction.reply({content: 'Not currently connected to a voice channel.', ephemeral: true});
        }
    } catch (error) {
        console.error(`Error executing command: ${error}`);
        await interaction.reply({content: `There was an error trying to execute that command: ${error.message}`, ephemeral: true});
    }
}