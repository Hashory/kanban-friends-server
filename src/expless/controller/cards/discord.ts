import { Request, Response } from 'express';
// import { Client } from 'discord.js';
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;

// const client = new Client();

// client.login(DISCORD_TOKEN);

export async function getDiscordStatus(req: Request, res: Response) {
  try {

    res.status(200);
    res.send({status: "online"});
  } catch (error) {
    console.error(error);
    res.status(500).send('500-サーバーエラー');
  }
}





