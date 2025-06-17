# Development Environment Setup

This guide outlines how to configure a local development environment for the Intelligent Standards Assistant project.

## Prerequisites
- **Node.js** 18 or later
- **npm** 9+
- **Firebase CLI** (`npm install -g firebase-tools`)
- **Git**
- **VS Code** (recommended)

## Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/GS1Ned/studio.git
   cd studio
   ```

2. **Run the setup script**
   ```bash
   ./scripts/setup.sh
   ```
   This installs dependencies, creates a `.env` file from `.env.example`, and builds the project.

3. **Sign in to Firebase**
   ```bash
   firebase login
   ```
   Make sure you have access to the appropriate Firebase project.
   After signing in you can set the active project using the helper script:
   ```bash
   ./scripts/configure_firebase.sh
4. **Initialize the Firebase emulators**
   ```bash
   firebase emulators:start
   ```
   This launches local emulators for Firestore and other services as configured in `firebase.json`.

5. **Open the project in VS Code**
   ```bash
   code .
   ```
   Recommended extensions:
   - ESLint
   - Tailwind CSS IntelliSense
   - Firebase Explorer

6. **Roocode integration**
   Roocode can execute tasks in this repository by running the setup script and using `npm run dev` for the local server. Ensure any environment secrets are available in `.env` so Roocode can access them.

## Next Steps
- Run `npm run dev` to start the Next.js development server on port 9002.
- Visit `http://localhost:9002` in your browser.
- For Genkit flows, run `npm run genkit:dev` and open `http://localhost:4000/dev`.

