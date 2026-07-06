import { getGroqChatCompletion } from "./groq.js"

export default async function getAction(gameHistory, historyOfVictories, score) {

    try {
        let result = await getGroqChatCompletion(gameHistory, historyOfVictories, score)
        result = await result.choices[0]?.message?.content
        result = await result.match(/\{.+\}/s)
        result = await JSON.parse(result)
        if (!result.event || result.message == undefined || result.messageForLongAFK == undefined) {
            throw new Error("The AI ​​generated incorrect data.")
        }
        return result;
    } catch(err) {
        console.log(err.message)
        return getActionWithoutGroq(score)
    }

}

function getActionWithoutGroq(score) {
    if (score >= 17) {
        return {
            event: "pass",
            message: "",
            messageForLongAFK: ""
        }
    } else {
        return {
            event: 'take',
            message: "",
            messageForLongAFK: ""
        }
    }
}