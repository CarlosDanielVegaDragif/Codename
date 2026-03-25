Codenames Online (React + TypeScript)

A simple online multiplayer clone of Codenames, built with React, TypeScript, and Vite.
Designed as a portfolio project to demonstrate real-time communication, client-server architecture, and game state management.
🎮 Game Overview

This is a browser-based implementation of the classic Codenames party game:

    Two teams compete against each other

    Each team has:

        🧠 Spymaster — gives one-word clues

        🎯 Guesser — selects cards based on the clue

    The objective is to uncover all cards belonging to your team before the opponent does

🧩 Rules Summary

    The Spymaster provides a single-word clue

    The Guesser selects a card on the board

    Cards can be:

        🔵 Blue team

        🔴 Red team

        ⚪ Neutral

        💀 Assassin (instant loss)

    The first team to reveal all their cards wins

⚙️ Tech Stack

    Frontend

        React

        TypeScript

        Vite

    Backend

        Node.js

        TypeScript

        WebSockets (real-time communication)

🚀 Getting Started
1. Clone the repository

git clone https://github.com/your-username/your-repo.git
cd codename

2. Install dependencies
Client

cd client
npm install

Server

cd ../server
npm install

3. Run the project
Start the server

cd server
npx tsx src/index.ts

Start the client

cd client
npm run dev

4. Open in browser

By default, Vite will provide a local URL (e.g. http://localhost:5173).
🌐 Features

    Real-time multiplayer using WebSockets

    Room creation and joining system

    Role-based gameplay (Spymaster / Guesser)

    Turn-based logic

    Dynamic game board

    Clean and minimal UI

🧠 What This Project Demonstrates

    Full-stack TypeScript architecture

    Real-time state synchronization

    Client-server communication patterns

    Game logic implementation

    React component design and state handling

📌 Notes

    This is a local multiplayer prototype (not deployed)

    Requires manual server startup

    Intended for learning and portfolio purposes

📷 Future Improvements

    Online deployment (e.g. VPS or cloud hosting)

    Player authentication

    Spectator mode

    Chat system

    Better UI/UX polish

    Mobile responsiveness

📄 License

This project is open-source and available under the MIT License.
