import { SlashCommandBuilder } from "discord.js";
import { escape } from "node:querystring";
import { setTimeout } from "node:timers/promises";

export const command = new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with Pong!');

export async function execute(interaction) {
    await interaction.deferReply();
    await setTimeout(300);
    await interaction.editReply('Pong!');
    await setTimeout(300);
    await interaction.followUp('follow up message test');
    await interaction.followUp(`Initial reply: ${await interaction.fetchReply()}`);
}