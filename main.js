import http from 'http'
import getAction from './getAction.js'

const server = http.createServer(async (req, res) => {
    try {
        res.setHeader("Access-Control-Allow-Origin", "*")
        let data = []
        req.on("data", (chunk) => {
            data.push(chunk)
        })
        req.on("end", async () => {
            try {
                data = await Buffer.concat(data).toString()
                data = await JSON.parse(data)
                if (!data.historyOfGame || data.historyOfVictories == undefined || !data.score) {
                    throw new Error("Not all parameters are specified in the request.")
                }
                let result = await getAction(data.historyOfGame, data.historyOfVictories, data.score);
                result = await JSON.stringify(result)
                res.write(result);
                res.end()
            } catch (err) {
                res.statusCode = 400;
                console.log("Bad request " + err.message)
                res.statusMessage = "Bad request " + err.message
                res.end()
            }
        })
    } catch (err) {
        res.statusCode = 500;
        res.statusMessage = err.message
        res.end
    }
}).listen(8080)

