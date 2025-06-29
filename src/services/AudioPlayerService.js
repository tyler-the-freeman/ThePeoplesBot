import { joinVoiceChannel, createAudioPlayer, createAudioResource, NoSubscriberBehavior } from "@discordjs/voice";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, TextDisplayBuilder } from "discord.js";
import { AudioSourceFactory } from "./AudioSourceFactory.js";
import { URL } from "url";
import { YouTubeSearchService } from "./YouTubeSearchService.js";


export class AudioPlayerService {
    static #instance;

    #connections = new Map();
    #players = new Map();
    #queues = new Map();
    #nowPlayingMessages = new Map();

    constructor() {
        if (AudioPlayerService.#instance) {
            return AudioPlayerService.#instance;
        }
        AudioPlayerService.#instance = this;
    }

    async play(interaction, query) {
        const guildId = interaction.guild.id;
        const commandChannelId = interaction.channelId;
        const commandChannel = interaction.guild.channels.cache.get(commandChannelId);
        let url;

        // Check if the query is a valid URL
        try {
            url = new URL(query);
            url = url.toString();
        } catch (error) {
            // If not a valid URL, treat it as a search query
            const youtubeSearchService = new YouTubeSearchService();
            const searchResult = await youtubeSearchService.search(query, { maxResults: 1 });
            url = `https://www.youtube.com/watch?v=${searchResult[0].id.videoId}`;
        }

        let channel = interaction.member.voice.channel;
        if (!channel) {
            const botMember = interaction.guild.members.me; // Try to get the bot's voice channel
            channel = botMember && botMember.voice.channel;
        }
        if (!channel) {
            await interaction.editReply('You need to be in a voice channel or the bot must already be in one.');
            return;
        }

        //If there is already audio playing, add to the queue instead
        if (this.#players.has(guildId) && this.#players.get(guildId).state.status === 'playing') {
            await this.addToQueue(interaction, url);
            return;
        }

        const connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: guildId,
            adapterCreator: channel.guild.voiceAdapterCreator
        });

        const player = createAudioPlayer();

        player.on('error', async (error) => {
            console.error(error);
            if (error.message == 'Status code: 403'){
                await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1s before retrying
                try {
                    console.log('Retrying to play track after 403 error...');
                    await this.#playTrack(guildId, this.#queues.get(guildId)[0], commandChannel);
                }  catch (retryError) {
                    commandChannel.send(`There was an error playing the audio data. Skipping track. Error: ${retryError.message}`);
                    if (this.#queues.get(guildId).length > 1) {
                        this.#queues.get(guildId).shift();
                        const nextTrack = this.#queues.get(guildId)[0];
                        await this.#playTrack(guildId, nextTrack, commandChannel);
                    }
                }
            } else {
                commandChannel.send(`There was an error playing the audio data. Skipping track. Error: ${error.message}`);
                if (this.#queues.get(guildId).length > 1) {
                    this.#queues.get(guildId).shift();
                    const nextTrack = this.#queues.get(guildId)[0];
                    await this.#playTrack(guildId, nextTrack, commandChannel);
                }
            }
        });

        // Handles moving to the next track in the queue
        player.on('idle', async () => {
            console.log('Player is idle, moving to the next track...');
            if (this.#queues.get(guildId).length > 0) {
                this.#queues.get(guildId).shift(); //Remove the first track from the queue
            }
            if (this.#queues.get(guildId).length > 0) {
                const nextTrack = this.#queues.get(guildId)[0];
                await this.#playTrack(guildId, nextTrack, commandChannel); //play the "new" first track
            }
        });

        this.#connections.set(guildId, connection);
        this.#players.set(guildId, player);

        if (!this.#queues.has(guildId)) {
            this.#queues.set(guildId, []);
        }

        connection.subscribe(player);

        
        await this.#processUrl(guildId, url, commandChannel, interaction);
    }


    async addToQueue(interaction, url) {
        const guildId = interaction.guild.id;
        if (!this.#queues.has(guildId)) {
            this.#queues.set(guildId, []);
        }
        const queue = this.#queues.get(guildId);
        const audioSource = AudioSourceFactory.createSource(url);
        if (await audioSource.isPlaylist()) {
            const tracks = await audioSource.getPlaylistTracks();
            queue.push(...tracks);
        } else {
            const track = await audioSource.getTrack();
            queue.push(track);
        }

        await interaction.editReply(`Added to queue: \n${queue[queue.length - 1].title}`);

        if (!(this.#players.get(guildId))) {
            await interaction.followUp({ content: 'No audio is currently playing. Please use `/start` to start playback.', ephemeral: true });
        }
    }

    async viewQueue(interaction) {
        const guildId = interaction.guild.id;
        const queue = this.#queues.get(guildId);
        if (!queue || queue.length === 0) {
            return { success: false, message: 'The queue is empty.' };
        }
        const queueList = queue.map((track, index) => `${index + 1}. ${track.title}`).join('\n');
        return { success: true, message: `Current Queue:\n${queueList}`};
    }

    async clearQueue(interaction) {
        const guildId = interaction.guild.id;
        if (this.#queues.has(guildId)) {
            this.#queues.set(guildId, []);
            return { success: true, message: 'Cleared the audio player queue.' };
        } else {
            return { success: false, message: 'The queue is already empty.' };
        }
    }

    async skip(interaction) {
        const guildId = interaction.guild.id;
        const player = this.#players.get(guildId);

        if (!player || !this.#queues.get(guildId).length > 0) {
            return { success: false, message: 'No audio is currently playing.' };
        }
        player.stop();
        return { success: true, message: 'Skipped to the next track.' };
    }

    async pop(interaction, index) {
        const guildId = interaction.guild.id;
        const queue = this.#queues.get(guildId);
        if (!queue || queue.length === 0) {
            return { success: false, message: 'The queue is empty.'};
        }
        if (index < 0 || index >= queue.length) {
            return { success: false, message: 'Invalid index. Please provide a valid index.'};
        }
        const removedTrack = queue.splice(index, 1);
        return { success: true, message: `Removed track: ${removedTrack[0].title}`};
    }

    async stop(interaction) {
        const guildId = interaction.guild.id;
        const connection = this.#connections.get(guildId);

        this.clearQueue(guildId); // Always clear the queue when stopping

        if (connection) {
            connection.destroy();
            this.#connections.delete(guildId);
            this.#players.delete(guildId);
            await interaction.editReply('Stopped playing audio and left the voice channel.');
        } else {
            await interaction.editReply('Not currently connected to a voice channel.');
        }
    }

    async startPlayer(interaction) {
        const guildId = interaction.guild.id;
        const player = this.#players.get(guildId);
        const channel = interaction.member.voice.channel;

        if (!channel) {
            return { success: false, message:  'You need to be in a voice channel to start playback.'};
        }

        if (!player) {
            await this.#createAudioPlayer(interaction);   
        }

        const connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: guildId,
            adapterCreator: channel.guild.voiceAdapterCreator
        });

        

        connection.subscribe(player);
        
        await this.#playTrack(guildId, this.#queues.get(guildId)[0], interaction);
        return { success: true, message: 'Audio player started.'};
    }

    async playLocalFile(interaction) {
        const guildId = interaction.guild.id;
        let channel = interaction.member.voice.channel;
        const filePath = './src/file.mp3'
        if (!channel) {
            await interaction.editReply('You need to be in a voice channel.');
            return;
        }
        
        // Create connection if needed
        if (!this.#connections.has(guildId)) {
            const connection = joinVoiceChannel({
                channelId: channel.id,
                guildId: guildId,
                adapterCreator: channel.guild.voiceAdapterCreator,
                selfDeaf: false // Try setting this to false for testing
            });
            
            this.#connections.set(guildId, connection);
        }
        
        // Create player if needed
        if (!this.#players.has(guildId)) {
            const player = createAudioPlayer({
                behaviors: {
                    noSubscriber: NoSubscriberBehavior.Play
                }
            });
            
            player.on('error', error => {
                console.error(`Player error: ${error.message}`);
                interaction.followUp('Balatro is kill\nno');
            });
            
            player.on('idle', () => {
                console.log('Local file playback finished');
                interaction.followUp('Local file playback complete');
            });
            
            this.#players.set(guildId, player);
            this.#connections.get(guildId).subscribe(player);
        }
        
        try {
            // Create a resource from the local file
            const resource = createAudioResource(filePath, {
                inputType: 'file',
                inlineVolume: true
            });
            
            resource.volume.setVolume(0.5);
            const player = this.#players.get(guildId);
            player.play(resource);
            
            await interaction.editReply(`Playing Balatro - Complete Original Soundtrack (Official)`);
        } catch (error) {
            console.error(`Error playing Balatro - Complete Original Soundtrack (Official)`);
            await interaction.editReply(`Failed to play local file: ${error.message}`);
        }
    }
        
    async #createAudioPlayer(interaction) {
        const guildId = interaction.guild.id;
        const commandChannelId = interaction.channelId;
        const commandChannel = interaction.guild.channels.cache.get(commandChannelId);

        const player = createAudioPlayer({
            behaviors: {
                noSubscriber: NoSubscriberBehavior.Play
            }
        });

        player.on('error', error => {
            commandChannel.send(`There was an error playing the audio data. Disconnecting...`);
            console.error(`Error: ${error.message}`);
            connection.destroy();
        });

        // Handles moving to the next track in the queue or disconnecting
        player.on('idle', async () => {
            //console.log('Player is idle, moving to the next track...');
            if (this.#queues.get(guildId).length > 0) {
                this.#queues.get(guildId).shift(); // Remove the first track from the queue
            }
            if (this.#queues.get(guildId).length > 0) {
                const nextTrack = this.#queues.get(guildId)[0];
                await this.#playTrack(guildId, nextTrack, commandChannel);
            } else {
                // interaction.followUp('Finished playlist. Disconnecting...');
                // connection.destroy();
            }
            // interaction.followUp('Finished playing audio. Disconnecting...');
            // connection.destroy();
        });

        this.#players.set(guildId, player);
    }



    async #processUrl(guildId, url, commandChannel, interaction) {
        const audioSource = AudioSourceFactory.createSource(url);
        if (await audioSource.isPlaylist()) {
            const tracks = await audioSource.getPlaylistTracks();
            this.#queues.get(guildId).push(...tracks);
        } else {    
            const track = await audioSource.getTrack();
            this.#queues.get(guildId).push(track);
        }
        const track = this.#queues.get(guildId)[0]
        await this.#playTrack(guildId, track, commandChannel, interaction);
    }

    /**
     * Plays a track in the specified guild's audio player.
     * @param {string} guildId - The ID of the guild.
     * @param {Object} track - The track to play.
     * @param {Object} commandChannel - The channel to send the now playing message.
     * @param {Object} [interaction] - The interaction object for replying if the queue is empty.
     */
    async #playTrack(guildId, track, commandChannel, interaction) {
        let stream;
        try {
            stream = await track.createStream(); // This is a method from the YoutubeAudioSource class
        } catch (error) {
            console.error(track)
        }
        const resource = createAudioResource(stream, {
            inputType: stream.type,
            inlineVolume: true,
            silencePaddingFrames: 5
        });
        resource.volume.setVolume(0.5); // Set volume to 50%
        const player = this.#players.get(guildId);
        player.play(resource);
        //await interaction.editReply(`Now playing: \n${track.title}`);
        if (interaction) {
            await interaction.editReply(`Now playing: \n${track.title}`);
        } else {
            if (this.#nowPlayingMessages.has(guildId)) {
                const message = this.#nowPlayingMessages.get(guildId);
                message.delete();
            }
            const message = await commandChannel.send(`Now playing: \n${track.title}`);
            //message.suppressEmbeds = true; // Suppress embeds to avoid clutter
            this.#nowPlayingMessages.set(guildId, message);
        }
    }

    async #getInteractivePlayerMessage(guildId) {
        const currentTrack = this.#queues.get(guildId)[0];

        const rows = [];
        const buttons = [
            new ButtonBuilder()
                .setCustomId('stop')
                .setLabel('Stop')
                .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
                .setCustomId('skip')
                .setLabel('Skip')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('queue')
                .setLabel('View Queue')
                .setStyle(ButtonStyle.Secondary)
        ]

        const statusRow = new ActionRowBuilder()
            .addComponents(
                new TextDisplayBuilder()
                    .setContent('Now Playing: ' + currentTrack.title)
            )

        const buttonRow = new ActionRowBuilder()
            .addComponents(buttons);

        rows.push(statusRow);
        rows.push(buttonRow);

        const message = {
            content: 'Audio Player Controls',
            components: rows,
            flags: 64 // Suppress embeds
        };
    }
    
}