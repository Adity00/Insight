# Frontend Components Missing Backend Integration

This document serves as a detailed audit of all UI elements, features, and interactions present in the Next.js frontend (V4 Dashboard design) that are currently either completely mocked, static, or lack backend API support.

## 1. Sidebar & Navigation (`page.tsx`)
- **Workspace Switcher**: "Acme Corp" and "Admin" roles are hardcoded. 
  - *Missing*: Endpoints to fetch user profiles, available workspaces, and roles.
- **New Chat Button**: The button is prominent but currently has no attached `onClick` handler.
  - *Missing*: Logic to wipe current chat state or `POST /api/sessions/new`.
- **Search Conversations**: The search input field lacks an `onChange` handler and state.
  - *Missing*: Backend API to query and filter past chat histories (`GET /api/chats/search`).
- **Pinned Chats**: "Q3 Fraud Report" is hardcoded in the UI.
  - *Missing*: Endpoints to fetch user's pinned chats (`GET /api/chats/pinned`) and to handle pin/unpin actions (`POST /api/chats/{id}/pin`).
- **Recent Chats**: "Demographics Analysis" and "Peak Hours Q2" are hardcoded stubs.
  - *Missing*: API to fetch the user's conversation history (`GET /api/chats/recent`).
- **Settings Button**: Clicking the settings gear performs no action.
  - *Missing*: A dedicated settings view/modal and user preferences API.
- **System Status Sidebar Indicators**: The API Operational and API Calls (88%) progress bars in the header are static HTML elements.
  - *Missing*: `GET /api/health` or `GET /api/metrics` to supply real load and status numbers.

## 2. Header & Top Bar (`page.tsx`)
- **Theme Toggle**: The light/dark mode switch changes local state but does not persist.
  - *Missing*: API to store user UI preferences if cross-device persistence is desired.
- **Notifications Bell**: Toggles a hardcoded dropdown ("Weekly Report Generated").
  - *Missing*: Event-driven WebSocket connection for real-time alerts or `GET /api/notifications` polling.
- **User Profile Avatar ("A")**: Hardcoded avatar character.
  - *Missing*: Authentication context and endpoint to fetch user display name/avatar.

## 3. Chat Input & Action Utilities (`ChatWindow.tsx`)
- **Slash Commands Menu**: Typing `/` opens a menu with commands like `/compare`, `/trend`, `/forecast`. Clicking them just inserts the text into the input field.
  - *Missing*: Distinct handling in the backend to process these commands systematically (e.g., using different specialized LLM agents or specific pre-engineered prompts).
- **Database Context Selector**: Shows a hardcoded "UWP Transactions DB" button next to attachments.
  - *Missing*: `GET /api/connections` to list available datasets and allow the user to switch databases smoothly.
- **Attachments (Paperclip)**: Button does nothing. 
  - *Missing*: `POST /api/upload` file ingestion logic to allow users to ask questions over ad-hoc CSVs.
- **Audio/Voice Input (Mic)**: Button does nothing.
  - *Missing*: Integration with Web Speech API or an audio endpoint (like OpenAI Whisper) to transcribe queries.

## 4. Message Actions & Interactions (`ChatWindow.tsx`)
- **User Message - Edit Note**: Icon exists but has no click handler.
  - *Missing*: Ability to edit a previous prompt and regenerate the thread.
- **Insight Action Row**: All action buttons beneath a generated insight are purely visual.
  - **Save**: Missing `POST /api/saved-insights`.
  - **Result as PDF (Download)**: Missing a frontend or backend PDF generation utility.
  - **Pin to Dash**: Missing layout state endpoint to pin a specific chart to the KPI dashboard.
  - **Share (Link)**: Missing an endpoint to generate a shareable, public, or internal URL for a specific chat message.
- **Feedback (Thumbs Up / Down)**: Visually present but non-interactive.
  - *Missing*: `POST /api/chat/feedback` to log RLHF (Reinforcement Learning from Human Feedback) data to improve backend prompts.

## 5. Right Context Drawer / Stack Execution Panel (`ChatWindow.tsx`)
- **Execution Profile Data**: The metrics showing "Latency: ~420ms", "Compute Tier: GPT-4.5-Turbo", and "Accuracy Confidence: 98%" are entirely hardcoded.
  - *Missing*: The backend needs to compute and return actual execution metadata within the `ChatMessage` schema.
- **Verified Origin Sources**: Reads "upidata_live_production.db" as a static string.
  - *Missing*: Backend needs to return the specific tables/schemas used by the LLM for that query.

## 6. Dashboard View (`page.tsx`)
- **Customize Layout Button**: Does nothing.
  - *Missing*: Drag-and-drop frontend grid layout interactions and backend storage to remember the user's custom layout preferences.
