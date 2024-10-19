var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
function getRandomWord() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const file = yield fs.readFile(path.join(".", "src", "words.txt"));
            const words = file.toString("utf8").split("\r\n");
            const randomIndex = Math.floor(Math.random() * words.length);
            const randomWord = words[randomIndex];
            return randomWord;
        }
        catch (error) {
            console.error("Error reading file:", error);
        }
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        yield agent.login({
            identifier: process.env.BSKY_USERNAME,
            password: process.env.BSKY_PASSWORD,
        });
        let word = "you";
        try {
            word = yield getRandomWord();
        }
        catch (_a) {
            console.error("couldn't get a word");
        }
        if (!word) {
            word = "you";
        }
        if (word) {
            yield agent.post({
                text: `fuck ${word}`,
                createdAt: new Date().toISOString(),
            });
            console.log("just posted!");
        }
        else {
            console.error("Could not post. No word available.");
        }
    });
}
const scheduleExpressionEveryHour = "* * * * *";
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
