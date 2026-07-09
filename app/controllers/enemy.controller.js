import getAction from '../services/getAction.service.js'

export async function get(req, res){
    try {
        if (req.body && req.body.historyOfGame && req.body.historyOfVictories != undefined && req.body.score) {
            let result = await getAction(req.body.historyOfGame, req.body.historyOfVictories, req.body.score);
            result = JSON.stringify(result)
            res.send(result)
        } else {
            console.log(req.body)
            res.status(400)
            res.send("Not all parameters are specified in the request.")
        }
    } catch(err) {
        console.log(err)
        res.status(500).end()
    }
    
}