import { Events } from "discord.js";

export const event = {
    name: Events.MessageCreate
}

export async function execute(triggerMessage) {
    try {
    console.log(triggerMessage);
    let socialCredit = 10;
    // if(triggerMessage.author.id == '189940657740185601') {
    //     await messageTrigger.reply('Ugly ^^^');
    // }

    if(triggerMessage.author.id == '189940657740185601') {
        socialCredit--;
        await triggerMessage.reply('-1 social credit score for ' + triggerMessage.author.globalName + '\nSocial Credit Score: ' + socialCredit);
    }
    } catch (error) {
        console.error(`Message Create Event Error: ${error}`);
    }
}