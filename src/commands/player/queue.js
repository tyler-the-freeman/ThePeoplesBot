import { SlashCommandBuilder, MessageFlags } from "discord.js";
import { AudioPlayerService } from "../../services/AudioPlayerService.js";

export const command = new SlashCommandBuilder()
    .setName('queue')
    .setDescription('View and manage the audio player queue.')
    .addSubcommand(subcommand =>
        subcommand
            .setName('view')
            .setDescription('View the current audio player queue. Use /list instead for a hidden version.'))
    .addSubcommand(subcommand =>
        subcommand
            .setName('add')
            .setDescription('Add a track to the audio player queue.')
            .addStringOption(option =>
                option
                    .setName('youtube-url')
                    .setDescription('Youtube URL (video or playlist)'))
                )
    .addSubcommand(subcommand =>
        subcommand
            .setName('skip')
            .setDescription('Skip to the next track in the queue.'))
    .addSubcommand(subcommand =>
        subcommand
            .setName('pop')
            .setDescription('Remove the specified track from the queue.')
            .addIntegerOption(option =>
                option
                    .setName('index')
                    .setDescription('The index of the track to remove from the queue.')));

export async function execute(interaction) {

    try {
        const subcommand = interaction.options.getSubcommand();
        const audioPlayerService = new AudioPlayerService();

        if (subcommand === 'view') {
            const response = await audioPlayerService.viewQueue(interaction);
            if (response.success) {
                await interaction.reply(response.message);
            } else {
                await interaction.reply({ content: response.message, flags: MessageFlags.Ephemeral });
            }
        }

        if (subcommand === 'add') {
            await interaction.deferReply();
            const url = await interaction.options.get('youtube-url').value;
            await audioPlayerService.addToQueue(interaction, url);
        }

        if (subcommand === 'skip') {
            const result = await audioPlayerService.skip(interaction);
            if (result.success) {
                await interaction.reply(result.message);
            } else {
                await interaction.reply({ content: result.message, flags: MessageFlags.Ephemeral });
            }
        }

        if (subcommand === 'pop') {
            const index = await interaction.options.get('index').value - 1; // User input is 1-based, convert to 0-based

            const response = await audioPlayerService.pop(interaction, index);
            if (response.success) {
                await interaction.reply(response.message);
            } else {
                await interaction.reply({ content: response.message, flags: MessageFlags.Ephemeral });
            }
        }
    } catch (error) {
        console.error(`Error executing command: ${error}`);
        await interaction.reply({content: `There was an error trying to execute that command: ${error.message}`, ephemeral: true});
    }
}
