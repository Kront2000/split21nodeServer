# split21nodeServer

Server for the [split21react](https://github.com/Kront2000/split21react) project. Built with Express and TypeScript to learn Node.js development.

## Features

1. **JWT Authentication** - Secure player authentication with JWT tokens
2. **GROQ API Proxy** - Proxies requests to the GROQ API and returns responses
3. **Game Logic** - Server-side game logic for the split21 game
4. **Prisma ORM** - Database management with Prisma ORM
5. **WebSocket Support** - Real-time game communication

## Tech Stack

- **Language**: TypeScript
- **Framework**: Express.js 5.2.1
- **Database**: PostgreSQL with Prisma ORM
- **Real-time**: WebSocket (ws 8.21.0)
- **AI Integration**: Groq SDK for opponent AI
- **Development**: Nodemon, tsx, TypeScript 5.5.4

##  Architecture

```
split21nodeServer/
├── app/
│   ├── main.ts                          # Application entry point
│   ├── prisma.config.ts                 # Prisma configuration
│   │
│   ├── routes/                          # API route handlers
│   │   ├── authorization.route.ts       # Auth endpoints (register, login)
│   │   ├── user.route.ts                # User endpoints (profile)
│   │   ├── userScore.route.ts           # Score management endpoints
│   │   ├── enemy.route.ts               # AI opponent endpoints
│   │   └── webSocket.ts                 # WebSocket connection handler
│   │
│   ├── services/                        # Business logic
│   │   ├── authorization/
│   │   │   └── jwt.service.ts           # JWT token generation & verification
│   │   ├── user/
│   │   │   └── user.service.ts          # User CRUD operations
│   │   ├── game/
│   │   │   ├── game.service.ts          # Game session management
│   │   │   ├── GameRoom.ts              # Game logic & state management
│   │   │   └── gameConsts.ts            # Card deck constants
│   │   ├── groq.service.ts              # Groq API integration
│   │   └── getAction.service.ts         # AI decision logic
│   │
│   ├── utils/                           # Utility functions
│   │   └── randomaizer.ts               # Random number generator
│   │
│   └── lib/
│       └── prisma.ts                    # Prisma client instance
│
├── prisma/
│   ├── schema.prisma                    # Database schema
│   └── migrations/                      # Database migrations
│
├── package.json
├── tsconfig.json
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- PostgreSQL database

### Installation

```bash
# Clone the repository
git clone https://github.com/Kront2000/split21nodeServer.git
cd split21nodeServer

# Install dependencies
npm install

# Create .env file with your configuration
# DATABASE_URL=your_database_url
# GROQ_API_KEY=your_groq_api_key
#You can get your key at https://console.groq.com/keys
# SECRET_KEY=your_secret_key

# Run database migrations
npx prisma migrate dev
```

### Development

```bash
npm run dev
```

Server will start on `http://localhost:8080`

## 📡 API Endpoints

### Authentication (`/auth`)

#### POST `/auth/register`
Register a new user account.

**Request Body:**
```json
{
  "login": "username",
  "password": "password"
}
```

**Response:** `200 OK`
- Sets HTTP-only cookie `accessToken` with JWT token
- Returns: `"Registration was successful."`

**Error Responses:**
- `400` - Missing login or password
- `400` - User already exists
- `500` - Server error

#### POST `/auth/login`
Login to an existing account.

**Request Body:**
```json
{
  "login": "username",
  "password": "password"
}
```

**Response:** `200 OK`
- Sets HTTP-only cookie `accessToken` with JWT token
- Returns: `"Login was successful."`

**Error Responses:**
- `400` - Invalid username or password
- `400` - Incorrect data
- `500` - Server error

### User (`/user`)

#### GET `/user/`
Get current authenticated user information.

**Requirements:** Valid JWT token in `accessToken` cookie

**Response:** `200 OK`
```json
{
  "id": 1,
  "login": "username"
}
```

**Error Responses:**
- `401` - Not authorized
- `500` - Server error

#### GET `/user/score/:id`
Get user's current score (consecutive wins streak).

**Parameters:**
- `id` (URL parameter): User ID

**Response:** `200 OK`
```json
{
  "score": 5
}
```

**Error Responses:**
- `400` - Incorrect data
- `404` - User not found
- `500` - Server error

#### PUT `/user/score/add/:id`
Increment user's score (add a win).

**Parameters:**
- `id` (URL parameter): User ID

**Response:** `200 OK`
- Returns: `"succesful"`

**Error Responses:**
- `400` - Incorrect data
- `404` - User not found
- `500` - Server error

#### PUT `/user/score/clear/:id`
Clear user's score (reset streak to 0).

**Parameters:**
- `id` (URL parameter): User ID

**Response:** `200 OK`
- Returns: `"succesful"`

**Error Responses:**
- `400` - Incorrect data
- `404` - User not found
- `500` - Server error

#### GET `/user/score/`
Get top 10 users by score.

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "login": "player1",
    "score": 15
  },
  {
    "id": 2,
    "login": "player2",
    "score": 12
  }
]
```

**Error Responses:**
- `404` - Users not found
- `500` - Server error

### Enemy AI (`/enemy`)

#### POST `/enemy/`
Get AI opponent's next action based on game state.

**Request Body:**
```json
{
  "historyOfGame": ["Game started", "Player took card", "Enemy passed"],
  "historyOfVictories": [true, false, true],
  "score": 18
}
```

**Response:** `200 OK`
```json
{
  "action": "take",
  "reasoning": "AI analysis from Groq"
}
```

**Error Responses:**
- `400` - Missing required parameters
- `500` - Server error

## 🔌 WebSocket Connection

Connect to the WebSocket server at `ws://localhost:8080`

### Connection

**URL Format:**
```
ws://localhost:8080?token=YOUR_JWT_TOKEN
```

The token parameter is optional. Include your JWT token to authenticate as a specific player.

**Initial Response:**
```json
{
  "whoseTurn": "start"
}
```

### Client → Server Messages

#### Start Game
Initialize a new game session.

```json
{
  "event": "start"
}
```

#### Player Take Card
Player takes a card from the deck.

```json
{
  "event": "take"
}
```

#### Player Pass Turn
Player passes and ends their turn.

```json
{
  "event": "pass"
}
```

### Server → Client Messages

#### Game Started
Sent when the game is initialized.

```json
{
  "takeCard": {
    "id": 1,
    "name": "6",
    "suit": "♠",
    "value": 6
  },
  "whoseTurn": "user",
  "userDeck": [
    {"id": 1, "name": "6", "suit": "♠", "value": 6}
  ],
  "countOfDeckEnemy": 1
}
```

#### Player Action Response
Sent after player takes action.

```json
{
  "whoseTurn": "enemy",
  "takeCard": {
    "id": 2,
    "name": "K",
    "suit": "♥",
    "value": 10
  },
  "userDeck": [
    {"id": 1, "name": "6", "suit": "♠", "value": 6},
    {"id": 2, "name": "K", "suit": "♥", "value": 10}
  ],
  "countOfDeckEnemy": 2
}
```

#### Enemy Action
Sent when the AI opponent takes their turn.

```json
{
  "enemyEvent": "take",
  "enemyMessage": "Opponent takes a card",
  "countOfDeckEnemy": 3,
  "whoseTurn": "user"
}
```

#### Game Result
Sent when the game ends.

```json
{
  "win": "user",
  "winMessage": "You won! Enemy busted!",
  "enemyMessage": "AI commentary from Groq"
}
```

**Possible win values:**
- `"user"` - Player wins
- `"enemy"` - AI wins
- `"none"` - Draw

### Connection Management

**Auto Cleanup:**
When a WebSocket connection closes, the associated game session is automatically removed from memory.

**Error Handling:**
Invalid JSON or missing required event fields will be logged but won't disconnect the client.
