import crypto from 'crypto'
import dotenv from 'dotenv';
dotenv.config()

interface PayLoad {
    id: string,
    login: string,
}

export function getToken(payloadBody: PayLoad) {
    if (!process.env.SECRET_KEY) {
        throw new Error("The SECRET_KEY environment variable is not set.")
    }
    const header = { alg: 'HS256', typ: 'JWT' }
    const payload = JSON.stringify(payloadBody)
    let signature = `${encode(header)}.${encode(payload)}`
    const hashedSignature = crypto.createHmac("sha256", process.env.SECRET_KEY).update(signature).digest("base64url")
    return `${encode(header)}.${encode(payload)}.${hashedSignature}`
}

export function verifyToken(token: string) {
    if (!process.env.SECRET_KEY) {
        throw new Error("The SECRET_KEY environment variable is not set.")
    }
    if (typeof token !== "string") {
        console.log("de")
        return false
    }
    let parts = token.split('.')
    if (parts.length !== 3) {
        return false
    }
    if (crypto.createHmac("sha256", process.env.SECRET_KEY).update(`${parts[0]}.${parts[1]}`).digest("base64url") !== parts[2]) {
        return false
    } else {
        return decode(parts[1])
    }
}

export function hashPassword(password: string) {
    return crypto.createHash("sha256").update(password).digest("base64url")
}

function encode(data: any): string {
    let jsonData = JSON.stringify(data)
    const buffer = Buffer.from(jsonData)
    return buffer.toString("base64url")
}

function decode(string: string): string {
    let buffer = Buffer.from(string, "base64url")
    return JSON.parse(buffer.toString())
}
