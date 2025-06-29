import { Events } from "discord.js";

export const event = {
    name: Events.ClientReady,
    once: true
}

export async function execute(client) {
    console.log(`Ready! Logged in as ${client.user.tag}`);
}