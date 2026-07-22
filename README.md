# split21nodeServer

Server for the [split21react](https://github.com/Kront2000/split21react) project. Built with Express and TypeScript to learn Node.js development.

## Features

1. **JWT Authentication** - Secure player authentication with JWT tokens
2. **GROQ API Proxy** - Proxies requests to the GROQ API and returns responses
3. **Game Logic** - Server-side game logic for the split21 game
4. **Prisma ORM** - Database management with Prisma ORM
5. **WebSocket Support** - Real-time game communication

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

### 4. **WebSocket Connection** (`ws://localhost:8080`)
- **Connection**: Establish WebSocket connection with optional JWT token
  - URL: `ws://localhost:8080?token=YOUR_JWT_TOKEN` (optional)
  - Initial Response: `{ whoseTurn: "start" }`

#### WebSocket Events:

**Client → Server:**
- **"start"**: Initialize new game
  ```json
  { "event": "start" }
  ```
  
- **"take"**: Player takes a card
  ```json
  { "event": "take" }
  ```
  
- **"pass"**: Player passes turn
  ```json
  { "event": "pass" }
  ```

**Server → Client:**
- **Game Start Response**:
  ```json
  {
    "takeCard": { "name": "6", "suit": "♠", "value": 6 },
    "whoseTurn": "user",
    "userDeck": [ /* player's cards */ ],
    "countOfDeckEnemy": 1
  }
  ```

- **After Player Action**:
  ```json
  {
    "whoseTurn": "enemy",
    "takeCard": { /* new card */ },
    "userDeck": [ /* updated deck */ ],
    "countOfDeckEnemy": 2
  }
  ```

- **Enemy Action**:
  ```json
  {
    "enemyEvent": "take",
    "enemyMessage": "Enemy takes a card",
    "countOfDeckEnemy": 3,
    "whoseTurn": "user"
  }
  ```

- **Game Result**:
  ```json
  {
    "win": "user",
    "winMessage": "You won! Enemy busted!",
    "enemyMessage": "Message from AI"
  }
  ```

**Connection Close**:
When WebSocket connection is closed, the game session is automatically cleaned up.

## Setup & Launch

1. Clone the repository
```bash
git clone https://github.com/Kront2000/split21nodeServer
```

2. Install dependencies
```bash
npm install
```

3. Set environment variables
```
GROQ_API_KEY=your_groq_api_key
SECRET_KEY=your_random_secret_key
DATABASE_URL=your_database_url
```
You can get the GROQ_API_KEY on the website: [GROQ Console](https://console.groq.com/keys)

4. Setup Prisma (if not already initialized)
```bash
npx prisma migrate dev
```

5. Run the development server
```bash
npm run dev
```

## Tech Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Database ORM**: Prisma
- **Authentication**: JWT (JSON Web Tokens)
- **Real-time Communication**: WebSocket (ws library)
- **API Integration**: GROQ API
