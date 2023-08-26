import { REST, Routes } from 'discord.js';
import { importCommand } from './loaders/loadCommands.js'
import * as tokenJSON from '../config.json' assert { type: 'json' };
import path from 'path';
import fs from 'fs/promises';

const token = tokenJSON.default.token;
const clientId = tokenJSON.default.clientId;
const GuildId = tokenJSON.default.guildId;



const __dirname = path.dirname(new URL(import.meta.url).pathname);

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = await fs.readdir(foldersPath);

export async function deployComands(){
    let commands = [];
    for (const folder of commandFolders) {
        const commandsPath = path.join(foldersPath, folder);
        const commandFiles = (await fs.readdir(commandsPath)).filter(file => file.endsWith('.js'));
        for (const file of commandFiles) {
            const filePath = path.join(commandsPath, file);
            const commandModule = await importCommand(filePath);
            if (commandModule) {
                console.log(commandModule.command);
                commands.push(commandModule.command); // Add the command to the Collection
            }
        }
    }

    const rest = new REST().setToken(token);

    try{
        console.log(`Started refreshing ${commands.length} application (/) commands.`);
        const data = await rest.put(
            Routes.applicationGuildCommands(clientId, GuildId),
            { body: commands }
        );

        console.log(`Successfully reloaded ${commands.length} application (/) commands.`);
        
    } catch (error) {
        console.error(error);
    }

    // (async () => {
    //     try{
    //         console.log(`Started refreshing ${commands.length} application (/) commands.`);
    //         console.log(commands);
    //         const data = await rest.put(
    //             Routes.applicationGuildCommands(clientId, GuildId),
    //             { body: commands }
    //         );

    //         console.log(`Successfully reloaded ${commands.length} application (/) commands.`);
    //     } catch (error) {
    //         console.error(error);
    //     }
    // })();
}

// if (require.main === module) {
//     deployComands();
// }

deployComands();