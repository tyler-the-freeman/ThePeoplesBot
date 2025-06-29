import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } from "discord.js";
import { escape } from "node:querystring";
import { setTimeout } from "node:timers/promises";

export const command = new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Play ping pong with someone.');

export async function execute(interaction) {
    const ping = new ButtonBuilder()
        .setCustomId('Ping!')
        .setLabel('🏓')
        .setStyle(ButtonStyle.Success);

    const pong = new ButtonBuilder()
        .setCustomId('Pong!')
        .setLabel('🏓')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(true);
        


    const row = new ActionRowBuilder()
        .addComponents(ping, pong);
        

    const response = await interaction.reply({
        content: `${interaction.user.globalName}'s Serve!`,
        components: [row],
        withResponse: true
    });
    
    // Only allow original author to interact.
    const collectorFilter = () => true//i => i.user.id === interaction.user.id;

    const collector = response.resource.message.createMessageComponentCollector({ componentType: ComponentType.Button, time: 33600000, filter: collectorFilter });
    let host = interaction.user.id;
    let playerTwo = null;
    let currentPlayer = null;


    collector.on('collect', async i => {
        try {
            if (i.user.id !== host && !playerTwo){
                playerTwo = i.user.id;
            }

           if (![host, playerTwo].includes(i.user.id)){
                await i.reply({ content: 'You are not the host of this game!', ephemeral: true });
                return;
            }

            if (i.user.id === currentPlayer){
                await i.reply({ content: 'It is not your turn!', ephemeral: true });
                return;
            }
            
            
            const selectedButton = i
            ping.setDisabled(selectedButton.customId === 'Ping!');
            pong.setDisabled(selectedButton.customId === 'Pong!');
            [ping, pong].forEach(button => {                
                button.setLabel(button.data.custom_id === selectedButton.customId ? button.data.custom_id : `🏓`)
            })

            currentPlayer = i.user.id == host ? host : playerTwo;
            console.log(`Player: ${currentPlayer}`);

            await i.update({ content: null, components: [row] });
        } catch (error) {
            console.error(`Error handling button interaction: ${error}`);
            await i.reply({ content: 'An error occurred while processing your request.', ephemeral: true });
        }
    });

    // try {
    //     let confirmation = await response.resource.message.awaitMessageComponent({ filter: collectorFilter, time: 60_000 });
        
    //     //await confirmation.deferUpdate();

    //     ping.setDisabled(confirmation.customId === 'ping');
    //     pong.setDisabled(confirmation.customId === 'pong');

    //     await confirmation.editReply({ components: [row] });
    // } catch {
    //     await interaction.editReply({ content: 'Confirmation not received within 1 minute, cancelling', components: [] });
    // }

}