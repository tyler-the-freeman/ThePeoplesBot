## Overview

A basic Discord bot created with Discordjs to play music playlists created via YouTube URLs and searches. Supports multiple servers.
### Prerequisites
Google Cloud API Key with access to the YouTube Data API v3

### Getting Started

1. Follow the [intructions](https://developers.google.com/youtube/registering_an_application) to get an API key.

2. Create a discord bot via the [Developer Portal](https://discord.com/developers/applications) and add it to a server via an OAuth2 link.

3. Clone the repo
   ```sh
   git clone https://github.com/tyler-the-freeman/ThePeoplesBot
   ```
4. Install NPM packages
   ```sh
   npm install
   ```
5. Create a `.env` file for your API key:
   ```ini
   YOUTUBE_API_KEY=''
   ```
   and `config.json` for the bot credentials:
   ```json
    {
    "token": "",
    "clientId": "",
    "guildIds": [""]
    }
   ```
6. Start the bot
   ```sh
   npm start
   ```