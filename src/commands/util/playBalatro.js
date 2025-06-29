import { SlashCommandBuilder } from 'discord.js';
import { AudioPlayerService } from '../../services/AudioPlayerService.js';

export const command = new SlashCommandBuilder()
    .setName('balatro')
    .setDescription('Plays Balatro - Complete Original Soundtrack (Official)');


export async function execute(interaction) {

    await interaction.deferReply();

    const audioPlayerService = new AudioPlayerService();
    await audioPlayerService.playLocalFile(interaction);

    //await interaction.editReply('Playing local file');

}