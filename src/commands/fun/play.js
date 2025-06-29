import { SlashCommandBuilder, ChannelType } from "discord.js";
import { joinVoiceChannel, createAudioPlayer, createAudioResource } from '@discordjs/voice';
import ytdl from 'ytdl-core';

export const command = new SlashCommandBuilder()
    .setName('play')
    .setDescription('Plays audio from a YouTube URL, unlike the other trash bots.')
	.addStringOption(option =>
		option.setName('youtube-url')
			.setDescription('Youtube URL (video or playlist)'));

export async function execute(interaction) {


    try {
        let channel = interaction.member.voice.channel;
        let connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: interaction.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator
        });
       
        
    
        // if (!connection) {
        //     await interaction.reply('Join a channel first');
        //     return;
        // }
    
        const url = await interaction.options.get('youtube-url').value;
    
        // Check if the URL is valid
        // if (!/^https?:\/\/(www\.)?youtube\.com\/watch\?v=.+$/.test(url)) {
        //     await interaction.reply('Invalid YouTube URL');
        //     return;
        // }
    
        let stream;
        try {
            stream = ytdl(url, { filter: 'audioonly' });
            
        } catch (error) {
            console.error(`Error creating audio stream: ${error}`);
            await interaction.reply('There was an error trying to play the audio');
            return;
        }


        const player = createAudioPlayer();
        const resource = createAudioResource(stream, { inlineVolume: true });
        resource.volume.setVolume(0.01);
        player.play(resource);
    
        // Subscribe the audio player to the voice connection
        connection.subscribe(player);
    
        await interaction.reply('Playing audio...');
    } catch (error) {
        console.error(`Error executing command: ${error}`);
        await interaction.reply(`There was an error trying to execute that command: ${error.message}`);
    }
}