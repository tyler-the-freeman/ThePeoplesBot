import { SlashCommandBuilder } from "discord.js";

export const command = new SlashCommandBuilder()
    .setName('penis')
    .setDescription('Grow up.');

export async function execute(interaction) {
    await interaction.reply('PENIS!');
}