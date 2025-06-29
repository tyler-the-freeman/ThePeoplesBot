import { Events } from "discord.js";

export const event = {
    name: Events.MessageCreate
}
let socialCredit = 5;
let botSocialCredit = 10;
export async function execute(triggerMessage) {
    try {
    if(triggerMessage.author.id == '171082644010827778' || '178315160430182400') {
        socialCredit--;
        console.log(triggerMessage.author);
        console.log('test')
        await triggerMessage.reply('Somebody shut this guy up.\nSocial Credit Reduced for ' + triggerMessage.author.globalName + '\nSocial Credit Remaining: ' + nathanSocialCredit);
        if (nathanSocialCredit <= 0){
            await triggerMessage.member.timeout(1 * 60 * 100, 'No Social Credit Remaining. Gulag.');
        }
    }

    // if(triggerMessage.author.id == '159110406219104256') {
    //     let user = await triggerMessage.guild.members.fetch('159110406219104256');
    //     console.log(user.user);
    //     console.log(await user.send('testing GM'));
    //     console.log(await user.user.send('testing USR'));
    // }

    } catch (error) {
        console.error(`Message Create Event Error: ${error}`);
    }
    
}