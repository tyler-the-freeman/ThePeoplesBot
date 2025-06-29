import { Events } from "discord.js";

export const event = {
    name: Events.MessageCreate
}
let socialCredit = {};


export async function execute(triggerMessage) {
    try {
        // Skip processing messages from bots
        if (triggerMessage.author.bot) return;
        
        // Check user specific messages
        const userId = triggerMessage.author.id;
        const messageContent = triggerMessage.content.toLowerCase();

        let drugs = [];
        drugs.push('weed', 'marijuana', 'pot', 'cannabis', 'meth', 'crack', 'cocaine', 'heroin', 'lsd', 'mdma', 'mushrooms', 'ecstasy', 'dmt', 'psilocybin', 'ketamine', 'xanax', 'adderall', 'vicodin', 'oxycontin');

        // Check for drug mentions
        for (const drug of drugs) {
            if (messageContent.includes(drug)) {
            socialCredit[triggerMessage.author.globalName] = (socialCredit[triggerMessage.author.globalName] || 2) - 1;
            await triggerMessage.reply('Illegal substance mentioned.\nSocial Credit Reduced for ' + triggerMessage.author.globalName + '\nSocial Credit Remaining: ' + socialCredit[triggerMessage.author.globalName]);
            
            if (socialCredit[triggerMessage.author.globalName] <= 0) {
                await triggerMessage.reply('No Social Credit Remaining. Gulag.');
                await triggerMessage.member.voice.setChannel('1134283087925231657');
            }
        }
    }
        
        // User ID: 189940657740185601 - house check
        // if (userId === '189940657740185601') {
        //     socialCredit[triggerMessage.author.globalName] = (socialCredit[triggerMessage.author.globalName] || 2) - 1;
        //     await triggerMessage.reply('^^^ Has a small penis.\nSocial Credit Reduced for ' + triggerMessage.author.globalName + '\nSocial Credit Remaining: ' + socialCredit[triggerMessage.author.globalName]);
            
        //     if (socialCredit[triggerMessage.author.globalName] <= 0) {
        //         await triggerMessage.reply('No Social Credit Remaining. Gulag.');
        //         await triggerMessage.member.voice.setChannel('1134283087925231657');
        //     }
        // }
        
        // User ID: 188187909218631680 - gun check
        if (userId === '188187909218631680' && messageContent.includes('gun')) {
            socialCredit[triggerMessage.author.globalName] = (socialCredit[triggerMessage.author.globalName] || 2) - 1;
            await triggerMessage.reply(`Guns kill people, not people.\nSocial Credit Reduced for ` + triggerMessage.author.globalName + '\nSocial Credit Remaining: ' + socialCredit[triggerMessage.author.globalName]);
            
            if (socialCredit[triggerMessage.author.globalName] <= 0) {
                await triggerMessage.reply('No Social Credit Remaining. Gulag.');
                await triggerMessage.member.voice.setChannel('1134283087925231657');
            }
        }
        
        // Testing block
        // if (userId === '159110406219104256') {
        //     let user = await triggerMessage.guild.members.fetch('159110406219104256');
        //     console.log(triggerMessage);
        //     // console.log(user.user);
        //     console.log(await triggerMessage.reply(triggerMessage)); // Fixed typo: replay → reply
        // }
    } catch (error) {
        console.error(`Message Create Event Error: ${error}`);
    }
} 