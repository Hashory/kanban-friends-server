import { Request, Response } from 'express';
import axios from "axios";
import jsdom from "jsdom";

export async function getGithubStatus(req: Request, res: Response) {
  try {
    const username = req.query.githubUser?.toString() ? req.query.githubUser.toString() : "";
    
    const data = await axios.get(`https://github.com/${username}`);
    const dataText = data.data;

    const dom = new jsdom.JSDOM(dataText);
    const response = dom.window.document.querySelector('div.user-status-message-wrapper')!.textContent!.trim();

    res.status(200).send(response);
  } catch (error) {
    console.error(error);
    res.status(500).send('500-サーバーエラー');
  }
}