# split21nodeServer

Server for the [split21react](https://github.com/Kront2000/split21react) project. The server is built with Express to learn Node.js. 
1. It proxies requests to the GROQ API and returns the response.
2. It handles basic authorization.

## Endpoints

### 1. **Authorization Routes** (`/auth`)
- **POST** `/auth/login`
  - Description: User login and authentication
  - Parameters: `login`, `password` (in request body)
  - Response: Sets HTTP-only cookie with JWT token `accessToken`
  - Status codes: 200 (success), 400 (incorrect data), 500 (server error)

### 2. **User Routes** (`/user`)
- **GET** `/user/`
  - Description: Get current user information
  - Requirements: Valid JWT token in `accessToken` cookie
  - Response: User data extracted from the token
  - Status codes: 200 (success), 401 (not authorized), 500 (server error)

### 3. **Enemy Routes** (`/enemy`)
- **POST** `/enemy/`
  - Description: Get enemy action
  - Parameters (in request body):
    - `historyOfGame` - game history
    - `historyOfVictories` - victory history
    - `score` - current score
  - Response: Enemy action as JSON
  - Status codes: 200 (success), 400 (missing parameters), 500 (server error)

## Launch

1. Clone the repository
 ```
 git clone https://github.com/Kront2000/split21nodeServer
 ```
2. install dependencies
 ```
 npm install
 ```
3. Set environment variables
```
GROQ_API_KEY=
SECRET_KEY=RANDOM_KEY
```
You can get the GROQ_API_KEY on the website: [GROQ](https://console.groq.com/keys)

4. Run
   
```
npm run dev
```
