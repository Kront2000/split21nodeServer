import http from 'http'
import { getGroqChatCompletion } from './grok.js'

const server = http.createServer(async (req, res) => {
    try {
        res.setHeader("Access-Control-Allow-Origin", "*")
        let data = []
        req.on("data", (chunk) => {
            data.push(chunk)
        })
        req.on("end", async () => {
            data = await Buffer.concat(data).toString()
            data = await JSON.parse(data)
            console.log(data)
            let message = await getGroqChatCompletion(data.historyOfGame, data.historyOfVictories, data.score);
            if (message) {
                res.write(message.choices[0]?.message?.content || "");
                res.end()
            } else {
                res.write("error");
                res.end()
            }

        })
    } catch (err) {
        console.log('error: ', err + '\n\n' + req.headers + '\n\n' + req.body);
    }
}).listen(8080)

