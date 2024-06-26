import { SlashCommandBuilder, ChannelType } from "discord.js";
import 'node:timers/promises';
import { setTimeout } from "node:timers/promises";


export const command = new SlashCommandBuilder()
    .setName('echo')
    .setDescription('Replies with your input.')
    .addStringOption( option =>
        option.setName('input')
        .setDescription('The input to echo back')
        .setRequired(true))
    .addChannelOption(option => 
        option.setName('channel')
        .setDescription('The channel to post the echo into')
        .addChannelTypes(ChannelType.GuildText));

export async function execute(interaction) {
    let reply = interaction.options.getString('input');
    if (interaction.options.getChannel('channel')){
        //  await (interaction.options.getChannel('channel').send(reply));
        await interaction.reply('Success - should delete after 3 seconds');
        await setTimeout(3000);
        await interaction.deleteReply();
    }
    else {
        await interaction.reply(`${reply} -- no channel input param`);
    }
}