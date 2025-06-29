import * as fs from 'node:fs';
import * as path from 'node:path';
//import * as tokenJSON from '../config.json';
import dotenv from 'dotenv';
import { loadCommands } from './loaders/CommandLoader.js';
import { Client, Collection, GatewayIntentBits } from 'discord.js';
import { eventListener } from './loaders/loadEvents.js';
import { CommandEnabledClient } from './interfaces/ExtendedClient.js';


dotenv.config();
// Sets bot token
const token = process.env.BOT_TOKEN;

let clientIntents = [
    GatewayIntentBits.Guilds, 
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildModeration
];

const client = new Client({ intents: clientIntents }) as CommandEnabledClient
client.commands = new Collection();

await loadCommands(client); // Import commands from the commands folder
await eventListener(client); // Append event listeners from events folder to client.listeners array. Note client intents

client.login(token);