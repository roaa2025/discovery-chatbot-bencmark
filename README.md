# Discovery Chatbot UI

A React-based UI for interacting with the n8n discovery chatbot webhook.

## Features

- Chat interface to send messages to the n8n webhook
- Displays final response from the chatbot
- Shows which branch executed (Intent, NL2SQL, Conversation, Summary)
- Displays the complete output contract (metadata)
- Automatically saves all responses to localStorage

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## Usage

1. Enter a user ID (default: 1)
2. Type your message in the input field
3. Click "Send" to submit
4. View the response, branch information, and output contract in the right panel

## API Configuration

The webhook URL is configured in `src/api/chatService.ts`. Update the `WEBHOOK_URL` constant if needed.

