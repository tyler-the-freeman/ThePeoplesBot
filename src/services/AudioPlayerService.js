import { joinVoiceChannel, createAudioPlayer, createAudioResource, NoSubscriberBehavior } from "@discordjs/voice";
import { AudioSourceFactory } from "./AudioSourceFactory.js";

export class AudioPlayerService {
    static #instance;

    #connections = new Map();
    #players = new Map();
    #queues = new Map();

    constructor() {
        if (AudioPlayerService.#instance) {
            return AudioPlayerService.#instance;
        }
        AudioPlayerService.#instance = this;
    }

    async play(interaction, url) {
        const guildId = interaction.guild.id;
        const channel = interaction.member.voice.channel;

        // If there is already audio playing, add to the queue instead
        if (this.#players.has(guildId) && this.#players.get(guildId).state.status === 'playing') {
            await this.addToQueue(interaction, url);
            return;
        }

        const connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: guildId,
            adapterCreator: channel.guild.voiceAdapterCreator
        });

        const player = createAudioPlayer({
            behaviors: {
                noSubscriber: NoSubscriberBehavior.Play
            }
        });

        player.on('error', error => {
            interaction.followUp(`There was an error playing the audio data. Disconnecting...`);
            console.error(`Error: ${error.message}`);
            connection.destroy();
        });

        // Handles moving to the next track in the queue or disconnecting
        player.on('idle', async () => {
            console.log('Player is idle, moving to the next track...');
            if (this.#queues.get(guildId).length > 0) {
                this.#queues.get(guildId).shift(); // Remove the first track from the queue
            }
            if (this.#queues.get(guildId).length > 0) {
                const nextTrack = this.#queues.get(guildId)[0];
                await this.#playTrack(guildId, nextTrack, interaction);
            } else {
                // interaction.followUp('Finished playlist. Disconnecting...');
                // connection.destroy();
            }
            // interaction.followUp('Finished playing audio. Disconnecting...');
            // connection.destroy();
        });

        this.#connections.set(guildId, connection);
        this.#players.set(guildId, player);

        if (!this.#queues.has(guildId)) {
            this.#queues.set(guildId, []);
        }

        connection.subscribe(player);
        
        await this.#processUrl(guildId, url, interaction);
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

        this.#clearQueue(guildId); // Always clear the queue when stopping

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
        
    async #createAudioPlayer(interaction) {
        const guildId = interaction.guild.id;
        const player = createAudioPlayer({
            behaviors: {
                noSubscriber: NoSubscriberBehavior.Play
            }
        });

        player.on('error', error => {
            interaction.followUp(`There was an error playing the audio data. Disconnecting...`);
            console.error(`Error: ${error.message}`);
            connection.destroy();
        });

        // Handles moving to the next track in the queue or disconnecting
        player.on('idle', async () => {
            console.log('Player is idle, moving to the next track...');
            if (this.#queues.get(guildId).length > 0) {
                this.#queues.get(guildId).shift(); // Remove the first track from the queue
            }
            if (this.#queues.get(guildId).length > 0) {
                const nextTrack = this.#queues.get(guildId)[0];
                await this.#playTrack(guildId, nextTrack, interaction);
            } else {
                // interaction.followUp('Finished playlist. Disconnecting...');
                // connection.destroy();
            }
            // interaction.followUp('Finished playing audio. Disconnecting...');
            // connection.destroy();
        });

        this.#players.set(guildId, player);
    }



    async #processUrl(guildId, url, interaction) {
        const audioSource = AudioSourceFactory.createSource(url);
        if (await audioSource.isPlaylist()) {
            const tracks = await audioSource.getPlaylistTracks();
            this.#queues.get(guildId).push(...tracks);
        } else {    
            const track = await audioSource.getTrack();
            this.#queues.get(guildId).push(track);
        }
        const track = this.#queues.get(guildId)[0]
        await this.#playTrack(guildId, track, interaction);
    }

    async #playTrack(guildId, track, interaction) {
        console.log(track);
        const stream = await track.createStream(); // This is a method from the YoutubeAudioSource class
        const resource = createAudioResource(stream, {
            inputType: stream.type,
            inlineVolume: true 
        });
        resource.volume.setVolume(0.5); // Set volume to 50%
        const player = this.#players.get(guildId);
        player.play(resource);
        await interaction.followUp(`Now playing: \n${track.title}`);
    }

    async #clearQueue(guildId) {
        if (this.#queues.has(guildId)) {
            this.#queues.get(guildId).length = 0;
        }
    }
}