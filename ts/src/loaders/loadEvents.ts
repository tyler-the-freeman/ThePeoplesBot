import path from 'path';
import fs from 'fs/promises';
import chokidar from 'chokidar';
import { CommandEnabledClient } from '../interfaces/ExtendedClient.js';

const __dirname = path.dirname(new URL(import.meta.url).pathname);

async function importEvent(filePath: string) {
    try {
        const module = await import(filePath);
        if (module.event) { // Check for the 'event' property
            console.log(`Importing event: ${module.event.name}`);
            return module;
        } else {
            console.log(`[WARNING] The event at ${filePath} is missing an 'event' property.`);
            return null;
        }
    } catch (error: any) {
        console.error(`Error importing event from ${filePath}: ${error.message}`);
        return null;
    }
}

export async function eventListener(client: CommandEnabledClient){
    const eventsPath = path.join(__dirname, '../events');
    const eventFiles = (await fs.readdir(eventsPath)).filter(file => file.endsWith('.js'));
    for (const file of eventFiles) {
        const eventPath = path.join(eventsPath, file);
        const eventModule = await importEvent(eventPath);
        const eventName = eventModule.event.name;
        if (eventModule.event.once) {
            client.once(eventName, (...args) => eventModule.execute(...args));
        } else {
            client.on(eventName, (...args) => eventModule.execute(...args));
        }
    }

    const watcher = chokidar.watch(eventsPath);

    watcher.on('change', async (filePath) => {
        if (filePath.endsWith('.js')) {
            try {
                    const updatedEventModule = await importEvent(`${filePath}?version=${Number(new Date())}`);
                    if (updatedEventModule.event) {
                        const eventName = updatedEventModule.event.name;
                        if (updatedEventModule.event.once) {
                            client.once(eventName, (...args) => updatedEventModule.execute(...args));
                        } else {
                            client.on(eventName, (...args) => updatedEventModule.execute(...args));
                        }
                        console.log(`Added new ${(updatedEventModule.event.once) ? 'once' : 'on'} event listener: ${eventName}`);
                    }
                }
            catch (error: any) {
                console.error(`Error updating/adding command from ${filePath}: ${error.message}`);
            }
        }
    });
}