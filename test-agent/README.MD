Readme.MD file
Overview
Welcome to the Zangoh AI Agent Supervisor Workstation Challenge! In this challenge, you will build a workstation interface that allows human supervisors to monitor, intervene, and improve AI customer service agents.
Zangoh is developing autonomous AI agents for enterprise customer service. These agents handle routine customer inquiries, but human supervisors need to monitor their performance, step in when necessary, and continuously improve the system. Your task is to build the supervisor workstation that makes this human-in-the-loop workflow possible.
Challenge Duration
You have 3 hours to complete this challenge. Please manage your time accordingly.
Note: You may receive an additional requirement during the challenge. Be prepared to adapt your solution.
Tech Stack
The challenge uses the following technologies:
Backend
Node.js with Express
MongoDB (provided via Docker)
WebSockets for real-time updates
Mock LLM API (for simulating AI responses)
Qdrant Vector Database (for knowledge retrieval)
Frontend
React with hooks
Chakra UI component library
WebSocket client for real-time updates
Recharts for data visualization
Environment Setup
Prerequisites
Docker and Docker Compose
Node.js (v16 or later)
npm or yarn
Git
A modern web browser (Chrome or Firefox recommended)
Setup Steps
Clone the starter repository

 git clone https://github.com/zangoh/supervisor-challenge.git
cd supervisor-challenge


Start the Docker environment

 The challenge environment is containerized to ensure consistency. Start the Docker containers:

 docker-compose up -d
 This will start:


MongoDB database
Qdrant vector database
Backend API server
Frontend development server
Mock LLM API
Conversation simulator
Verify services are running

 Check that all services are up and running:

 docker ps
 You should see containers for backend, frontend, mongodb, qdrant, and simulator.


Access the application


Frontend: http://localhost:3000
Backend API: http://localhost:8080
API Documentation: http://localhost:8080/api-docs
Initialize test data (if needed)

 The environment comes pre-loaded with test data, but if you need to reset it:

 docker-compose exec backend npm run seed


Project Structure
The starter code is organized as follows:
supervisor-challenge/
├── backend/                    # Backend API server
│   ├── data/                   # Sample data
│   ├── middleware/             # Express middleware
│   ├── models/                 # MongoDB models
│   ├── routes/                 # API routes
│   ├── websocket/              # WebSocket handlers
│   ├── utils/                  # Utility functions
│   └── server.js               # Main server file
├── frontend/                   # React frontend
│   ├── public/                 # Static assets
│   ├── src/
│   │   ├── api/                # API client
│   │   ├── components/         # React components
│   │   ├── context/            # React context providers
│   │   ├── pages/              # Page components
│   │   ├── utils/              # Utility functions
│   │   └── App.js              # Main App component
├── docker/                     # Docker configuration
├── mockups/                    # UI design screenshots
├── docker-compose.yml          # Docker Compose configuration
└── README.md                   # This file

UI Design Reference
All UI designs are provided in Figma and as static images in the mockups folder. Your implementation should follow these designs.
Figma Link: [FIGMA_LINK_HERE]
The designs include:
Dashboard/Overview Screen: Showing key metrics and conversation lists
Conversation Detail/Intervention Screen: For monitoring and intervening in conversations
Agent Configuration Screen: For adjusting AI agent parameters and capabilities
Focus on implementing the functionality according to these designs. Pixel-perfect reproduction is not required, but your implementation should closely match the overall layout and user experience.
Available APIs
The backend provides the following API endpoints:
Conversations
GET /api/conversations: Get all conversations with filtering
GET /api/conversations/:id: Get a specific conversation
POST /api/conversations/:id/messages: Add a message to a conversation
PATCH /api/conversations/:id/status: Update conversation status
POST /api/conversations/:id/tags: Add tags to a conversation
Agents
GET /api/agents: Get all agents
GET /api/agents/:id: Get a specific agent
PATCH /api/agents/:id/config: Update agent configuration
GET /api/agents/:id/metrics: Get agent performance metrics
Intervention
POST /api/intervene: Intervene in a conversation
POST /api/intervene/release: End intervention and return to agent
Knowledge Base
GET /api/knowledge-base: Get all knowledge bases
LLM Mock API
POST /api/llm/generate: Generate LLM response
POST /api/llm/sentiment: Analyze text sentiment
WebSocket API
The WebSocket server provides real-time updates for:
New conversations
Message updates
Metrics changes
Agent status changes
Refer to the API documentation at http://localhost:8080/api-docs for detailed information.
Testing Your Implementation
A testing script is provided to help you validate your implementation. Run it with:
cd testing
npm install
node test-runner.js

This will check the core functionality of your implementation and provide feedback on what's working and what needs attention.
Implementation Requirements
Your implementation should include:
1. Agent Monitoring Dashboard
Real-time view of active customer conversations with AI agents
Key metrics display (resolution rate, average response time, customer satisfaction)
Alert system for potentially problematic conversations
Filtering options (by agent, status, alert level)
2. Intervention Interface
Ability to view full conversation history for any active session
"Take over" functionality to assume control from the AI agent
Agent performance feedback mechanism
Option to return control to the AI with notes/guidance
3. Agent Configuration
Adjust AI parameters (temperature, max tokens, etc.)
Enable/disable specific capabilities or knowledge domains
Configure automatic escalation thresholds
Save and load configuration presets
Tips for Success
Start with core functionality: Implement the basic features first before adding polish
Use the provided components: The starter code includes basic components you can build upon
Test incrementally: Use the testing script to validate your progress
Manage your time: Allocate time for each major feature, leaving time for integration and testing
Read the API docs: Understand the available endpoints before implementation
Study the designs: Familiarize yourself with all screens before starting to understand the complete system
Submission
When you're done, submit your solution as follows:
Ensure all code is committed:

 git add .
git commit -m "Final submission"


Create a zip file of your solution:

 # From the project root
zip -r submission.zip . -x "node_modules/*" "*/node_modules/*" ".git/*"


Upload your submission to the platform or provide a GitHub repository link as instructed


Include in your submission:


Complete source code
Setup instructions if you've modified the environment
Brief description of your implementation, challenges faced, and solutions
Any notes for the evaluator
Evaluation Criteria
Your solution will be evaluated based on:
Functionality (40%): Does it fulfill all the requirements?
Code Quality (25%): Is the code well-structured, maintainable, and efficient?
Design Implementation (15%): How well does it match the provided designs?
Technical Decisions (20%): Are the technical choices appropriate and efficient?
Need Help?
If you encounter any issues with the environment setup:
Check the Docker logs: docker-compose logs <service-name>
Ensure all services are running: docker ps
Restart the environment if needed: docker-compose down && docker-compose up -d
Good luck!

## Implementation Notes

This repository now implements the AI Agent Supervisor Workstation as a functional React and Express application:

- **Monitoring dashboard:** Supervisors can review conversation health, active alerts, key metrics, and agent performance from the dashboard.
- **Intervention workflow:** Conversation detail pages show complete message history, customer context, live quality signals, supervisor takeover, supervisor messaging, and return-to-AI controls with notes.
- **Agent configuration:** The AI Agent screen supports model parameter tuning, capability toggles, knowledge-base access controls, escalation thresholds, and in-session configuration presets.
- **Template feature:** The Templates screen supports template search/filtering, creation/editing, deletion, copy-to-conversation behavior, and explicit `{{variableName}}` substitution indicators. Conversation intervention includes a template usage interface that detects variables and asks supervisors to fill them before sending.

### Local setup

```bash
cd test-agent
npm install
cd backend-starter && npm install
cd ../frontend-starter && npm install
```

Run with Docker when MongoDB and Qdrant are needed:

```bash
cd test-agent
docker-compose up -d
```

Or run services manually in separate terminals:

```bash
cd test-agent/backend-starter
npm start
```

```bash
cd test-agent/frontend-starter
npm start
```

### Architecture overview

- `backend-starter/server.js` mounts REST APIs for conversations, agents, interventions, knowledge bases, analytics, and response templates.
- `backend-starter/routes/templates.js` provides CRUD endpoints for response templates and seeds sensible default templates if the database is empty.
- `frontend-starter/src/context/AppDataContext.js` centralizes shared app state, API loading, WebSocket updates, and template fallback data.
- `frontend-starter/src/pages/ConversationView.js` implements human-in-the-loop intervention and template usage.
- `frontend-starter/src/pages/AgentConfig.js` implements runtime agent tuning and presets.
- `frontend-starter/src/pages/Templates.js` implements template management.

### Challenges and solutions

- **Figma access:** The linked Figma design requires external access, so the implementation follows the provided challenge screen descriptions and uses the existing Chakra UI design system to reproduce the intended supervisor workstation layout.
- **Template variable clarity:** Variable substitution is represented with double braces, for example `{{customerName}}`, and the UI detects and labels every variable before supervisors use a template.
- **Offline API resilience:** The frontend provides template fallback data and optimistic local updates so the interface remains usable while backend services or MongoDB are unavailable during local evaluation.

## How to Run This Code

### Recommended: run the full Docker environment

Use this when you want MongoDB, Qdrant, backend, frontend, and supporting services started together.

```bash
cd test-agent
docker-compose up -d
```

Then open:

- Frontend: http://localhost:3000
- Backend health check: http://localhost:8080/health
- API docs: http://localhost:8080/api-docs

If you need to reset sample data:

```bash
cd test-agent
docker-compose exec backend npm run seed
```

To stop everything:

```bash
cd test-agent
docker-compose down
```

### Manual local development

Use this if MongoDB is already running locally or you only want to work on one service at a time.

Terminal 1 — backend:

```bash
cd test-agent/backend-starter
npm install
npm start
```

Terminal 2 — frontend:

```bash
cd test-agent/frontend-starter
npm install
npm start
```

Useful validation commands:

```bash
cd test-agent/frontend-starter
npm run build
```

```bash
cd test-agent/backend-starter
node -e "require('./routes/templates'); console.log('templates route ok')"
```

## Figma UI Frames to Code Workflow

Do not treat Figma-to-code output as final production code. The fastest reliable workflow is to use Figma for structure, measurements, tokens, and assets, then map the generated output into this app's existing React + Chakra UI components.

### Recommended workflow for this project

1. **Open the provided Figma file and inspect the target frame**
   - Use the frame URL or node ID from the challenge.
   - Confirm desktop width, spacing, typography, colors, icons, and component states.
2. **Prepare the Figma frame before generating code**
   - Name layers clearly, for example `Sidebar`, `MetricCard`, `ConversationRow`, `TemplateModal`.
   - Use Auto Layout for rows, cards, sidebars, and modal content.
   - Convert repeated UI into Figma components so generated code is less duplicated.
   - Export icons/images as SVG or PNG only when they are real assets; recreate ordinary layout with Chakra components.
3. **Use Figma Dev Mode first**
   - Inspect spacing, colors, font sizes, border radii, shadows, and assets.
   - Copy values into `frontend-starter/src/theme.js` or directly into Chakra props when they are screen-specific.
4. **Use a design-to-code extension only for a first draft**
   - Good options to try: Figma Dev Mode MCP/Code Connect, Anima, Locofy, Builder.io Visual Copilot, or Figma-to-Code style plugins.
   - Export React when available, otherwise export HTML/CSS and manually translate to Chakra UI.
5. **Convert generated markup into project components**
   - Put page-level screens in `frontend-starter/src/pages`.
   - Put reusable UI in `frontend-starter/src/components`.
   - Replace generated `<div>` trees with Chakra primitives such as `Box`, `Flex`, `Grid`, `Stack`, `Card`, `Button`, `Input`, `Select`, `Tabs`, and `Modal`.
6. **Wire real data and actions**
   - Use `frontend-starter/src/api/index.js` for backend calls.
   - Use `frontend-starter/src/context/AppDataContext.js` for shared conversations, agents, knowledge bases, and templates.
   - Keep generated placeholder data out of production components once API data exists.
7. **Validate and iterate**
   - Run `npm run build` from `frontend-starter`.
   - Compare the browser screen against Figma and adjust Chakra spacing/color props.

### Extension/tool guidance

- **Figma Dev Mode + MCP + Code Connect:** Best for teams that already have React components. It helps AI coding tools understand the selected Figma frame and how design components map to code components.
- **Anima:** Useful for exporting React/HTML/CSS/Tailwind from polished frames. Good for quick static screen drafts.
- **Locofy:** Useful for generating React/Next/Vue-style responsive code and reviewing a generated component structure before export.
- **Builder.io Visual Copilot:** Useful for converting Figma designs into code drafts and then refining in your app.
- **Figma-to-Code community plugins:** Useful for rough HTML/Tailwind/React structure, but expect manual cleanup.

### Example conversion prompt for an AI coding tool

```text
Convert the selected Figma frame into React using Chakra UI for this repository.
Reuse existing components from frontend-starter/src/components where possible.
Use AppDataContext for conversations, agents, and templates.
Do not hardcode API data unless it is fallback/demo data.
Use {{variableName}} formatting for template substitutions and show editable fields for each variable.
```

## What Else Should Be Done Before Final Submission

- **Design polish:** Compare each route against the Figma frames and tune spacing, colors, typography, icon choices, and responsive behavior.
- **Backend integration check:** Run the Docker environment and verify template CRUD, intervention, release, and supervisor messages against MongoDB-backed APIs.
- **End-to-end smoke test:** Open Dashboard, Conversation Detail, Agent Configuration, Templates, and Analytics in the browser and confirm no console errors.
- **Seed data quality:** Add more sample conversations/templates if evaluators need richer dashboard states.
- **Automated tests:** Add unit/integration tests for template CRUD and critical React interactions if time allows.
- **Security/auth note:** The challenge has no authentication, but a production workstation should add supervisor authentication and audit logging.

### Urgent response-template and real-time additions

The latest implementation also covers the mid-session urgent requirements:

- Response templates support `{{variable_name}}` placeholders, categories, and team sharing.
- Supervisors can open the template library from a conversation, insert a template, fill variables, preview the completed message, and send it after takeover.
- Dashboard metrics subscribe to `GET /api/analytics/stream`, an SSE endpoint that emits refreshed metrics every 2 seconds.
- The dashboard uses responsive metric cards and mobile conversation cards so it is usable on small screens.
- Conversation replies can be composed by typing or by voice through the browser Web Speech API; recognized speech is appended to the response composer.
