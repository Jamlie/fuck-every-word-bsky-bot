import { AtpAgent } from "@atproto/api";
import * as dotenv from "dotenv";
import { CronJob } from "cron";
import * as process from "process";
import * as fs from "fs/promises";
import * as path from "path";
import express from "express";

dotenv.config();

const agent = new AtpAgent({
    service: "https://bsky.social",
});

async function getRandomWord() {
    try {
        const file = await fs.readFile(path.join(".", "src", "words.txt"));
        const words = file.toString("utf8").split("\r\n");

        const randomIndex = Math.floor(Math.random() * words.length);
        const randomWord = words[randomIndex];

        return randomWord;
    } catch (error) {
        console.error("Error reading file:", error);
    }
}

async function main() {
    await agent.login({
        identifier: process.env.BSKY_USERNAME!,
        password: process.env.BSKY_PASSWORD!,
    });

    let word: string | undefined = "you";
    try {
        word = await getRandomWord();
    } catch {
        console.error("couldn't get a word");
    }

    if (!word) {
        word = "you";
    }

    if (word) {
        await agent.post({
            text: `fuck ${word}`,
            createdAt: new Date().toISOString(),
        });
        console.log("just posted!");
    } else {
        console.error("Could not post. No word available.");
    }
}

const scheduleExpressionEveryHour = "0 */3 * * *";

const job = new CronJob(scheduleExpressionEveryHour, main);

job.start();

const app = express();

app.get("/", (_req, res) => {
    res.send("Server is running! Cron job is active.");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
