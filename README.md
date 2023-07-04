Twitch-Notice-Bot

Twitch-Notice-Bot is a Discord bot built using discord.js v12 that provides Twitch stream notifications in a Discord channel.
Instructions

    Create a new Discord bot application:
        Go to the Discord Developer Portal.
        Click on "New Application" and give it a name.
        Go to the "Bot" section in the left sidebar and click "Add Bot".
        Copy the bot token (located under the "TOKEN" section). This token will be used in the config.json file.

    Create a new Twitch bot application:
        Go to the Twitch Developer Console.
        Click on "Register Your Application" and fill in the required information to create a new application.
        Once the application is created, copy the "Client ID" and "Client Secret". These will be used in the config.json file.

    Populate the config.json file:
        Rename config.example.json to config.json.
        Replace the placeholders in config.json with your actual Discord bot token, Twitch client ID, and Twitch client secret obtained in the previous steps.

    Install required node modules:

    Run the following command to install the necessary node modules:

npm install

(Optional) Install PM2 for process management:

PM2 is a process manager that keeps your bot running even after closing the terminal. If you prefer to use PM2, install it globally using:

npm install pm2 -g

Run the bot:

    Run the bot using Node.js:

node Twitch2.js

Alternatively, if you installed PM2, you can use it to run the bot as a background process:


        pm2 start Twitch2.js

The bot should now be up and running, providing Twitch stream notifications in the specified Discord channel.


MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
