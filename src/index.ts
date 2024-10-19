import { AtpAgent } from "@atproto/api";
import * as dotenv from "dotenv";
import { CronJob } from "cron";
import * as process from "process";
import * as fs from "fs/promises";
import * as path from "path";

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

    const word = await getRandomWord();

    await agent.post({
        text: `fuck ${word}`,
        createdAt: new Date().toISOString(),
    });

    console.log("just posted!");
}
main();

const scheduleExpressionEveryHour = "0 */1 * * *";

const job = new CronJob(scheduleExpressionEveryHour, main);

job.start();
