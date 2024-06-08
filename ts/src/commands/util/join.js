import { SlashCommandBuilder, ChannelType } from "discord.js";
import { joinVoiceChannel } from "@discordjs/voice";

export const command = new SlashCommandBuilder()
    .setName('join')
    .setDescription('Join the bot to your current voice channel, or a specified voice channel.')
    .addChannelOption(option => 
        option.setName('channel')
            .setDescription('Channel for the bot to join.')
            .addChannelTypes(ChannelType.GuildVoice)
            .setRequired(false));
            
export async function execute(interaction) {
    let channel = (interaction.options.getChannel('channel')) || interaction.member.voice.channel;
    try {
        const connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: interaction.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator
        });
        await interaction.reply(`Joined ${channel.name}`);
    } catch (error) {
        console.error(`Error Joining Voice Channel: ${error}`);
    }
}