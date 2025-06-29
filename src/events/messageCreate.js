import { Events } from "discord.js";

export const event = {
    name: Events.MessageCreate
}
let socialCredit = {};

export async function execute(triggerMessage) {
    try {
    if(triggerMessage.author.id == '189940657740185601' && triggerMessage.content.includes(('house').toLowerCase())){
        socialCredit[triggerMessage.author.globalName] = (socialCredit[triggerMessage.author.globalName] || 2) - 1;
        await triggerMessage.reply('Ooh i bought a house\nSomebody shut this guy up.\nSocial Credit Reduced for ' + triggerMessage.author.globalName + '\nSocial Credit Remaining: ' + socialCredit[triggerMessage.author.globalName]);
        if (socialCredit[triggerMessage.author.globalName] <= 0){
            await triggerMessage.reply('No Social Credit Remaining. Gulag.');
            await triggerMessage.member.voice.setChannel('1134283087925231657');
        }
    }
    if(triggerMessage.author.id == '188187909218631680' && triggerMessage.content.includes(('gun').toLowerCase())){
        socialCredit[triggerMessage.author.globalName] = (socialCredit[triggerMessage.author.globalName] || 2) - 1;
        await triggerMessage.reply('Guns this, guns that\nSomebody shut this guy up.\nSocial Credit Reduced for ' + triggerMessage.author.globalName + '\nSocial Credit Remaining: ' + socialCredit[triggerMessage.author.globalName]);
        if (socialCredit[triggerMessage.author.globalName] <= 0){
            await triggerMessage.reply('No Social Credit Remaining. Gulag.');
            await triggerMessage.member.voice.setChannel('1134283087925231657');
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