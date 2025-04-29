import {REST} from "@discordjs/rest"
import {Client, Events, GatewayIntentBits, Routes} from "discord.js"
import "dotenv/config"
import {GatewayDispatchEvents, InteractionType, MessageFlags} from '@discordjs/core';
import { SlashCommandBuilder } from "discord.js";
import { Configuration, OpenAIApi } from "openai";

const token = process.env.TOKEN
const clientID = process.env.CLIENT_ID 
const OPENAIAPI_KEY = process.env.OPENAIAPI_KEY
const ORG_KEY = process.env.ORG_KEY

const configuration = new Configuration({
    organization: ORG_KEY,
    apiKey: OPENAIAPI_KEY
})

const openai = new OpenAIApi(configuration)

const gptQuery = async(input) => {
    const completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
            {
                role: "user",
                content: `${input}`
            }
        ]
    })
    console.log("response is " + completion.data.choices[0].message)
    return completion.data.choices[0].message;
    return "GPT response"
}

const rest = new REST({version: "10"}).setToken(token)

const client = new Client({intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildMessages]})
client.once(Events.ClientReady, c => {
    console.log("ready, logged in as " + c.user.tag)

    const ping = new SlashCommandBuilder()
        .setName("ping")
        .setDescription("pong")

    const gpt = new SlashCommandBuilder()
        .setName('gpt')
        .setDescription('query from open AIs')
        .addStringOption(option => 
            option.setName("query")
            .setDescription("Ask chatGPT"))
    
    client.application.commands.create(ping)
    client.application.commands.create(gpt)
})

client.on(Events.InteractionCreate, async interaction => {
    if(!interaction.isChatInputCommand()) {
        return
    }

    if(interaction.commandName === "ping") {
        await interaction.reply({content: "pong", ephemeral: true})
    }
    if(interaction.commandName === "gpt") {
        const userInput = interaction.options.getString("query")
        console.log(userInput)
        await interaction.reply("Working on it...")
        const result = await gptQuery(userInput)
        await interaction.editReply(result)
    }
})

client.login(token)