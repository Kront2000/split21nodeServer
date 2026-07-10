import crypto, { verify } from 'crypto'
import dotenv from 'dotenv';
dotenv.config()

export function getToken(login){
    const header = { alg: 'HS256', typ: 'JWT' }
    const payload = login
    let signature = `${encode(header)}.${encode(payload)}`
    const hashedSignature = crypto.createHmac("sha256", process.env.SECRET_KEY).update(signature).digest("base64url")
    return `${encode(header)}.${encode(payload)}.${hashedSignature}`
}

export function verifyToken(token){
    if(typeof token !== "string"){
        console.log("de")
        return false
    } 
    let parts = token.split('.')
    if(parts.length !== 3){
        return false
    }
    if(crypto.createHmac("sha256", process.env.SECRET_KEY).update(`${parts[0]}.${parts[1]}`).digest("base64url") !== parts[2]){
        return false
    } else {
        return decode(parts[1])
    }
}

function encode(data){
    let jsonData = JSON.stringify(data)
    const buffer = Buffer.from(jsonData)
    return buffer.toString("base64url")
}

function decode(string){
    let buffer = Buffer.from(string, "base64url")
    return buffer.toString()
}

