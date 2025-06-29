import { REST, Routes } from 'discord.js';
import { importCommand } from './loaders/CommandLoader.js'
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs/promises';

dotenv.config();
const token = process.env.BOT_TOKEN as string;
const clientId = process.env.BOT_CLIENT_ID as string;
const GuildId = process.env.GUILD_ID as string;



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
                commands.push(commandModule.command); // Add the command to the Collection
            }
        }
    }
    
    const rest = new REST().setToken(token);

    try{
        console.log(`Started refreshing ${commands.length} application (/) commands:\t${commands.map(command => command.name)}`);
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

await deployComands();