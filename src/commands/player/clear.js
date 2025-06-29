import { SlashCommandBuilder, MessageFlags } from 'discord.js';
// import { AudioPlayerService } from '../../services/AudioPlayerService.js';
// import { content } from 'googleapis/build/src/apis/content/index.js';

export const command = new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Empty the audio player queue.')


export async function execute(interaction) {

    await interaction.reply("Not Implemented yet");
//     try {
//         const audioPlayerService = new AudioPlayerService();
//         const result = await audioPlayerService.clearQueue(interaction);

//         if (result.success) {
//             await interaction.reply(result.message);
//         } else {
//             await interaction.reply({ content: result.message, flags: MessageFlags.Ephemeral });
//         }
//     } catch (error) {
//         console.error(`Error executing command: ${error}`);
//         await interaction.reply({content: `There was an error trying to execute that command: ${error.message}`, ephemeral: true});
//     }
}