import path from 'path';
import fs from 'fs/promises';
import chokidar from 'chokidar';
import { deployCommands } from '../deployCommands.js';
import { CommandEnabledClient } from '../interfaces/ExtendedClient.js';

const __dirname = path.dirname(new URL(import.meta.url).pathname);

export class CommandLoader {
    async importCommand(filePath: string) {
        try {
            const module = await import(filePath);
            if (module.command) { // Check for the 'command' property
                return module;
            } else {
                console.log(`[WARNING] The command at ${filePath} is missing a 'command' property.`);
                return null;
            }
        } catch (error: any) {
            console.error(`Error importing command from ${filePath}: ${error.message}`);
            return null;
        }
    }

    async loadCommands(client: CommandEnabledClient){
        const foldersPath = path.join(__dirname, '../commands');
        const commandFolders = await fs.readdir(foldersPath);
        
        for (const folder of commandFolders) {
            const commandsPath = path.join(foldersPath, folder);
            const commandFiles = (await fs.readdir(commandsPath)).filter(file => file.endsWith('.js'));
            for (const file of commandFiles) {
                const filePath = path.join(commandsPath, file);
                const commandModule = await this.importCommand(filePath);
                if (commandModule) {
                    client.commands.set(commandModule.command.name, commandModule); // Add the command to the Collection
                }
            }
        }


        const watcher = chokidar.watch(foldersPath);

        watcher.on('change', async (filePath) => {
            console.log("Change in commands folder")
            if (filePath.endsWith('.js')) {
                try {                
                    const updatedCommandModule = await importCommand(`${filePath}?version=${Number((new Date()))}`);
                    if (updatedCommandModule.command) {
                        let commandName = updatedCommandModule.command.name;
                        if (client.commands.has(commandName)) {
                            //updates an existing command.
                            client.commands.set(commandName, updatedCommandModule);
                            console.log(`Updated command: ${commandName}`);
                        } else {
                            client.commands.set(commandName, updatedCommandModule);
                            console.log(`Added new command: ${commandName}`);
                        }
                        await deployCommands();
                    }
                } catch (error: any) {
                    console.error(`Error updating/adding command from ${filePath}: ${error.message}`);
                }
            }
        });
    }
}