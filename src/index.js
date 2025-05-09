import * as fs from 'node:fs';
import * as path from 'node:path';
import * as tokenJSON from '../config.json' with { type: 'json' };
import { loadCommands } from './loaders/loadCommands.js';
import { Client, Collection, Events, GatewayIntentBits } from 'discord.js';
import { eventListener } from './loaders/loadEvents.js';

// Sets bot token
const token = tokenJSON.default.token;

let clientIntents = [
    GatewayIntentBits.Guilds, 
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent
];

const client = new Client({ intents: clientIntents });
client.commands = new Collection();

await loadCommands(client); // Import commands from the commands folder
await eventListener(client); // Append event listeners from events folder to client.listeners array. Note client intents

client.login(token);