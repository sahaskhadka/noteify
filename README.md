# Noteify - Smart Notes App

A beautiful, modern notes application built with React, TypeScript, and Firebase.

## Features

-  Create, edit, and delete notes
-  Search notes by title or content
-  Dark/Light mode toggle
-  Cloud sync with Firebase
-  Google Authentication
-  Set reminders with browser notifications
-  Responsive design (Grid/List view)
-  Real-time updates

## Tech Stack

- React 18
- TypeScript
- Tailwind CSS
- Vite
- Firebase (Auth, Firestore)
- Lucide React Icons
- React Hot Toast

## Installation

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/noteify.git
cd noteify

2. Install dependencies:

bash

npm install

    Create a .env file with your Firebase config:

env

VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

    Start the development server:

bash

npm run dev

    Open http://localhost:3000

Build for Production
bash

npm run build

Firebase Setup

    Create a Firebase project

    Enable Google Authentication

    Create a Firestore database

    Add your Firebase config to .env

License

MIT
Live Demo

[Add your deployed link here]
text


## Step 2: Create GitHub Repository

### Create `.gitignore` file (if not exists)

```gitignore
# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

node_modules
dist
dist-ssr
*.local

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# Environment files
.env
.env.local
.env.*.local

# TypeScript cache
*.tsbuildinfo
