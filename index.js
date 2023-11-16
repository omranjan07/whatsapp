const express = require("express");
const app = express();
const PORT = process.env.PORT || 3030;

const { Client , LocalAuth} = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const axios = require('axios');
const client = new Client({
    authStrategy: new LocalAuth()
});

client.on('qr', (qr) => {
    console.log('QR RECEIVED', qr);
    qrcode.generate(qr, {small: true});
});

client.on('ready', () => {
    console.log('Client is ready!');
});
client.on('message',  async message => {
    const content = message.body
	if(content == "pls joke") {
        const joke = await axios ("https://v2.jokeapi.dev/joke/Any?safe-mode")
        .then(res => res.data)

        const jokeMsg = await client. sendMessage (message. from, joke.setup|| joke.joke)
        if(joke.delivery) setTimeout(function() {jokeMsg.reply(joke.delivery) }, 5000)
    }
    if(content === 'tagall') {
        const chat = await message.getChat();
        
        let text = "";
        let mentions = [];

        for(let participant of chat.participants) {
            const contact = await client.getContactById(participant.id._serialized);
            
            mentions.push(contact);
            text += `@${participant.id.user} `;
        }

        await chat.sendMessage(text, { mentions });
    }if(content === '!everyone') {
        const chat = await message.getChat();
        
        let text = "";
        let mentions = [];

        for(let participant of chat.participants) {
            const contact = await client.getContactById(participant.id._serialized);
            
            mentions.push(contact);
            text += `@${participant.id.user} `;
        }

        await chat.sendMessage(text, { mentions });
    }
    if(content === '!help') {
		message.reply('here are the papa commands\n !everyone = mention all participants \n tagall= same kaam \n pls joke - ghatiya joke somewhere from internet \n !help= help taw help hai');
	}

    if (content.startsWith('!adduser ')) {
        const chat = await message.getChat();
        const phoneNumber = content.substring(9); // Extract the phone number from the message content
    
        if (!chat.isGroup) {
        await client.sendMessage(message.from, 'This command can only be used in a group.');
        return;
        }
    
        if (!chat.isAdmin) {
        await client.sendMessage(message.from, 'You need to be an admin to add a user.');
        return;
        }

        try {
            await chat.addParticipants([phoneNumber]);
            await client.sendMessage(message.from, `User ${phoneNumber} has been added to the group.`);
        } catch (error) {
            console.error('Failed to add user:', error);
            await client.sendMessage(message.from, 'Failed to add the user to the group. Please check the phone number and try again.');
        }
        }
    
});




client.initialize();

app.listen(PORT, () => {
console.log(`server started on port ${PORT}`);
});
