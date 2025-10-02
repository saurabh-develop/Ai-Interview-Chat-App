# AI Interview Chat App

**AI Interview Chat App** is a full-stack MERN web application designed to automate and enhance the technical interview process using the power of Google's Gemini AI. The platform allows candidates to take automated, timed interviews and provides a comprehensive dashboard for interviewers to review performance, scores, and detailed feedback.



![AI Interview App Banner](https://ik.imagekit.io/kcekezhkm/Gemini_Generated_Image_swskd0swskd0swsk.png?updatedAt=1759398032277)

---

## ✨ Key Features

This application is split into two main roles: Candidate and Interviewer, accessible via a tabbed interface after login.

For Candidates (Interviewee View):

- 📝 AI-Powered Resume Parsing: Upload a resume (PDF or DOCX). The application uses Gemini AI to automatically parse and extract key contact information.
- 🤖 Interactive AI Interview: Engage in a real-time, chat-based interview with an AI powered by Google Gemini.
- ⏱️ Timed & Adaptive Questions: Each question is timed based on its difficulty (Easy, Medium, Hard) to simulate a real interview environment. The question flow is structured to test a breadth of knowledge.
- 💾 Session Persistence: If a candidate leaves and returns, they are prompted to either resume their unfinished interview or start a new one.
- 📊 Instant Feedback & Results: Receive an overall score, a qualitative summary of your performance, and question-by-question feedback immediately upon completion.
- 📱 **Responsive UI** — Optimized for desktop (dark/glassmorphic theme)
- - Interview History: Candidates can review their past interview scores and feedback from their dashboard.
 
For Interviewers (Interviewer View):

- 📈 Comprehensive Dashboard: Get a high-level overview of all interviews with key stats like total interviews conducted, completion rates, and average candidate scores.
- Candidate Management: View a filterable and searchable table of all candidates.
- In-Depth Analysis: Click on any candidate to open a detailed modal view. This view includes:
    Candidate's contact information and a link to their resume.
    Overall score and AI-generated performance summary.
    A full breakdown of each question, the candidate's answer, the model answer, the AI-generated score, and specific feedback.
- Role-Based Access: The dashboard provides a holistic view of all candidates for the interviewer role, while candidates can only see their own data.

---

## 🛠 Tech Stack

  | Frontend       | Backend             | AI & Cloud        | Auth        |
  |----------------|---------------------|-------------------|-------------|
  | React          | Node.js + Express   | gemini-2.5-flash  | JWT, bcrypt |
  | Tailwind CSS   | MongoDB (Mongoose)  | Vertex AI         |             |
  | Redux Toolkit  |                     |                   |             |

---

## 🧩 Workflow

1.  A user registers/logs in, receiving a JWT for session management.
2.  The candidate uploads their resume. The backend parses it, saves the file, stores metadata in MongoDB, and uses Gemini to extract contact info.
3.  The candidate starts an interview. The backend calls Gemini to generate a set of technical questions based on predefined topics and difficulties.
4.  The candidate submits answers one by one.
5.  Upon completion, the backend sends the entire Q&A set to Gemini for evaluation.
6.  Gemini returns scores, feedback, and a summary. The backend saves this complete interview record to MongoDB.
7.  The results are displayed to the candidate and become available on the interviewer's dashboard.

---

## 📸 Screenshots

| Login Page  | Game Lobby | In-Game UI |
|-------------|------------|------------|
| ![login](https://ik.imagekit.io/kcekezhkm/Screenshot%202025-10-02%20at%203.21.49%E2%80%AFPM.png?updatedAt=1759398718878) | ![Interviewee Page](https://ik.imagekit.io/kcekezhkm/Screenshot%202025-10-02%20at%203.23.02%E2%80%AFPM.png?updatedAt=1759398792010) | ![Interviewer Page](https://ik.imagekit.io/kcekezhkm/Screenshot%202025-10-02%20at%203.24.20%E2%80%AFPM.png?updatedAt=1759398869709) |

---

##  🔐 API Endpoints

The backend exposes the following RESTful API endpoints under the /api prefix.

| Method         | Endpoint                 | Description                                            |
|----------------|--------------------------|--------------------------------------------------------|
| POST           | /auth/register           | Registers a new user (candidate or interviewer).       |
| POST           | /auth/login              | Authenticates a user and returns a JWT.                |
| GET            | /api/health              | Health check endpoint to verify server status.         |
| POST           | /api/upload-resume       | Uploads and parses a resume file.                      |
| POST           | /api/generate-questions  | Generates a new set of interview questions via AI.     |
| POST           | /api/evaluate-answers    | Submits all answers for AI evaluation and scoring.     |
| POST           | /api/get-all-interview   | Fetches all interview data (role-dependent).           |

---

## 📂 Folder Structure
```bash

/
├── backend/
│   ├── config/           # Gemini AI configuration
│   ├── controllers/      # Route handlers and business logic
│   ├── models/           # Mongoose schemas (User, Interview, Resume)
│   ├── routes/           # API routes for Express
│   ├── services/         # AI services and resume parsing logic
│   ├── uploads/          # Directory for storing uploaded resumes
│   ├── index.js          # Backend server entry point
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/     # Reusable React components (Auth, Chat, Dashboard)
    │   ├── pages/          # Main page components
    │   ├── services/       # API and AI service clients
    │   ├── store/          # Redux Toolkit state management (slices, store)
    │   ├── App.jsx         # Main application component with routing
    │   └── main.jsx        # Frontend entry point
    └── package.json

```

---

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine.

**Prerequisites**

- Node.js (v18.x or higher)
- npm or yarn
- MongoDB instance (local or a cloud service like MongoDB Atlas)
- A Google Cloud Platform account with the Vertex AI API enabled.
- Google Cloud SDK installed and configured for Application Default Credentials (ADC).

**Installation & Setup**

1.  Clone the Repository:
```bash

git clone [https://github.com/your-username/ai-interview-chat-app.git](https://github.com/your-username/ai-interview-chat-app.git)
cd ai-interview-chat-app

```
2.  Backend Setup:
   
   - Navigate to the backend directory: cd backend
   - Install dependencies: npm install
   - Create a .env file and populate it with your credentials:
```bash

PORT=8000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
FRONTEND_URL=http://localhost:5173
GOOGLE_CLOUD_PROJECT_ID=your_gcp_project_id

```
   - Authenticate with Google Cloud for local development:
```bash

gcloud auth application-default login

```
3.  Frontend Setup:

   - Navigate to the frontend directory: cd ../frontend
   - Install dependencies: npm install
   - Create a .env.local file with the backend API URL:
```bash

VITE_API_BASE_URL=http://localhost:8000/api

```

---

##Running the Application

**Start the Backend Server**

1.  Navigate to the backend directory.
2.  Run the start command:

```bash

# From the /backend directory
npm start

```

3.  The server will be available at http://localhost:8000.

**Start the Frontend Development Server**

1.  Navigate to the frontend directory.
2.  Run the development command:

```bash

# From the /frontend directory
npm run dev

```

3.  Open your browser and navigate to http://localhost:5173.
