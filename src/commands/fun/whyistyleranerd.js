import { SlashCommandBuilder } from "discord.js";

export const command = new SlashCommandBuilder()
    .setName('whyistyleranerd')
    .setDescription('Call Tyler a Nerd.');

export async function execute(interaction) {
    await interaction.reply(`Gulag for ${interaction.user.username} due to homosexuality ☭`);
}