# DevArena

DevArena is a unified 3‑in‑1 platform for developers, esports talent and competitive teams. It combines a GitHub‑powered portfolio builder (DevProof), a hiring/services marketplace (QuickHire) and a team & scrim finder (ScrimLink) into a single cohesive web application.

## Features

- **Single account with shared profile** across all modules
- **DevProof**: connect your GitHub account, import repositories and showcase your projects with descriptions and screenshots
- **QuickHire**: advertise your skills, categories, pricing and availability; upload proof of work; browse and hire other users
- **ScrimLink**: create teams, manage rosters and find scrim partners by posting scrim requests
- **Messaging**: internal inbox for private conversations between users
- **Admin panel**: basic user management and report moderation

## Technology Stack

- Node.js with Express.js
- MongoDB with Mongoose ODM
- EJS templating engine with Tailwind CSS for a modern dark interface
- Cloudinary for media storage (avatars, banners, screenshots, proofs)
- GitHub API via `@octokit/rest` for repository import
- express‑session with connect‑mongo for secure session storage
- bcrypt for password hashing
- Helmet, CSRF protection and rate limiting for security

## Installation

1. **Clone the repository** and navigate into the project directory:

   ```bash
   git clone <repository-url>
   cd unified-esports-dev-platform
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Build the CSS** (optional if you modify Tailwind styles):

   ```bash
   npm run build:css
   ```

4. **Create an environment file** by copying `.env.example` to `.env` and filling in the values:

   ```bash
   cp .env.example .env
   # edit .env with your editor
   ```

   The following variables are required:

   - `MONGODB_URI` – MongoDB connection string
   - `SESSION_SECRET` – a long random string for session signing
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` – Cloudinary credentials
   - `GITHUB_TOKEN` – (optional) GitHub personal access token to increase API rate limits

5. **Seed the database** with sample data (optional):

   ```bash
   npm run seed
   ```

6. **Start the application**:

   ```bash
   npm start
   ```

   The server will start on the port defined in `.env` (default 3000). Navigate to `http://localhost:3000` in your browser.

## Security Considerations

DevArena has been built with security best practices in mind:

- Passwords are hashed with bcrypt
- Sessions are stored in MongoDB with httpOnly, sameSite and secure cookies
- Helmet sets various HTTP headers and `X‑Powered‑By` is disabled
- CSRF protection is enabled on all state‑changing requests
- Input is validated and sanitised using express‑validator
- Rate limiting is applied to authentication and messaging routes
- File uploads are restricted to images and stored off‑database in Cloudinary

## Development

The project is structured as follows:

```
/src
  /config       # Cloudinary and GitHub configuration
  /models       # Mongoose models (User, Profile, Project, etc.)
  /controllers  # Route controllers containing business logic
  /routes       # Express route definitions
  /middleware   # Custom middleware (auth, error handlers)
  /services     # External service integrations
  /utils        # Helper utilities
  /views        # EJS templates for pages and components
  /public       # Compiled CSS and static assets
```

Feel free to extend the functionality or improve the UI by editing the controllers, models and views. Remember to run `npm run build:css` after modifying Tailwind styles.

## License

This project is provided for educational purposes and does not include a specific license.