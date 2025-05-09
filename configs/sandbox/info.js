import { google } from "googleapis";
import path from 'path'
import 'dotenv/config';

const youtube = google.youtube({
    version: "v3",
    auth: process.env.YOUTUBE_API_KEY || "AIzaSyC33CIxlOjc-e1lLgssPb2JorpIWhp_moA",
});

let url = "https://www.youtube.com/watch?v=VQRLujxTm3c&list=PLrV33OeSoDfXCvtNlexK9WuBEQzfL0L8M";
const playlistId = url.split("list=")[1].split("&")[0];



export async function getPlaylistItems(playlistId) {
    const res = await youtube.playlistItems.list({
        part: "snippet",
        id: playlistId,
    });
}
