import { getGroqChatCompletion } from "./groq.service"

interface ResultObject {
    event: string,
    message: string,
    messageForLongAFK: string
}

export default async function getAction(gameHistory: string[], score: number) {

    try {
        let result = await getGroqChatCompletion(gameHistory, score)
        const resultString = await result.choices[0]?.message?.content
        if(!resultString){
            throw new Error("The AI ​​generated incorrect data.")
        }
        const resultArray = await resultString.match(/\{.+\}/s)
        if(!resultArray){
            throw new Error("The AI ​​generated incorrect data.")
        }
        const resultObject = await JSON.parse(resultArray[0]) as ResultObject
        if (!resultObject.event || resultObject.message == undefined || resultObject.messageForLongAFK == undefined) {
            console.log(resultObject)
            throw new Error("The AI ​​generated incorrect data.")
        }
        return resultObject;
    } catch(err: any) {
        console.log(err.message)
        return getActionWithoutGroq(score)
    }

}

function getActionWithoutGroq(score: number) {
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