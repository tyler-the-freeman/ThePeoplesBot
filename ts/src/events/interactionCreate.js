import { Events } from "discord.js";

export const event = {
    name: Events.InteractionCreate
}

export async function execute(interaction) {
    if (!interaction.isChatInputCommand()){
        console.log('Command Interaction Recieved: ' + interaction);
        return;
    } 

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(`Error executing ${interaction.commandName}`);
        console.error(error);
    }
}