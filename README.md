# 🧩 Pair 'Em Up

<img width="1920" height="919" alt="image" src="https://github.com/user-attachments/assets/03869e65-c287-45b4-aa9e-239c6264776c" />

🎮 [Play the game](https://fiercesloth.github.io/pair-em-up/)

**Pair 'Em Up** is a logic puzzle game developed as the **Final Task of [RS School](https://rs.school/) Stage\#1**.
It is a strategic number-matching puzzle game where players must clear a grid by finding and removing valid pairs of numbers.
The goal is to score points by strategically matching number pairs while managing limited assist tools and resources. 
Players win by reaching or exceeding the target score of 100 points before running out of valid moves and available assists. 
The project is built using **Vanilla JavaScript, SCSS, and Vite**, strictly following a component-based architecture without any JS frameworks.

> 📋 **Task Description & Rules:** \> You can find the detailed technical requirements and game rules here:
> [RS School Pair 'Em Up Task](https://github.com/rolling-scopes-school/tasks/tree/master/stage1/tasks/pair-em-up)

-----

## 🏗️ Technical Architecture

The project adheres to strict architectural constraints:

  * **100% Dynamic Rendering:** The HTML `<body>` is initially empty. The entire UI is generated programmatically via JavaScript.
  * **Component-Based:** Built on a base `Component` class, ensuring modularity and reusability of DOM elements.
  * **Event-Driven:** Implemented a custom `EventEmitter` class to handle communication between components (loosely coupled architecture).
  * **State Management:** A dedicated `GameStorage` class manages persistence using `localStorage`, saving game progress, settings, and history.
  * **SPA Experience:** Seamless navigation between the Menu, Settings, and Game screens without page reloads.
  * **Code Quality:** Enforced by **ESLint**, **Prettier**, and **Husky** (pre-commit hooks).

-----

## 🎮 Game Modes

The game features three distinct modes, logic for which is handled dynamically:

1. **Classic mode:** Sequential numbers from 1-19 (excluding 0) arranged in order
2. **Random mode:** Numbers from 1-19 (excluding 0) placed in random order
3. **Chaotic mode:** Exactly 27 random numbers using only digits 1-9

-----

## 🏅 Win/Lose Conditions
- Win condition: Reach or exceed the target score of 100 points
- Lose condition (either of the following must be true):
  - no valid moves remain and all assist tools have been used
  - the 50-line grid limit has been reached

-----

## 🛠️ Tools & Mechanics

To help the player clear the field, 6 specific tools were implemented:

  - **Moves:** Tracks and displays the number of currently available pairs on the grid.
  - **Revert:** Undoes the last action (restoring grid state, score, and tool count).
  - **Add:** Adds new rows of numbers based on the current mode's generation rules.
  - **Hints:** Highlights a valid pair of matching cells for a short time.
  - **Shuffle:** Randomly rearranges all remaining numbers on the grid.
  - **Eraser:** Allows the user to remove any single specific cell (enabled only when a cell is selected).

-----

## ✨ Features

  - **Smart Matching Logic:** Algorithms calculate matches based on values (equal or sum to 10) and coordinates (adjacent or connected by empty space).
  - **Save/Load System:** The game state is automatically serialized via `GameStorage`, allowing players to continue where they left off.
  - **Theming Engine:** Supports 5 visual themes:
      - *Light 🌞, Dark 🌙, Pastel Light 🌸, Abstract Dark 🌌, Abstract Neon 💠*
  - **Audio System:** Custom `AudioManager` handles background music and distinct UI sound effects (clicks, matches, errors, wins/losses) with separate volume controls.
  - **Responsive Design:** Fully responsive layout adapted for various screen sizes.
