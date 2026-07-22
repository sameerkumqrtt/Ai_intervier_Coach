# AWS & Container Deployment Guide 🚀

This full-stack AI application is fully containerized and ready for deployment on **AWS Cloud Infrastructure** (App Runner, ECS, EC2) or container-friendly platforms (Render, Railway).

---

## 🛠️ Architecture Overview

- **Frontend**: React + Vite + Tailwind CSS (bundled statically into `dist/`)
- **Backend Server**: Express.js proxying requests securely to LLM APIs (in `dist/server.cjs`)
- **LLM Engine**: Groq API (`llama-3.3-70b-versatile`)
- **Containerization**: Multi-stage `Dockerfile` running Node 20 Alpine Linux

---

## 🐳 Local Container Execution (Docker)

To test the container locally before deploying to AWS:

```bash
# 1. Build the Docker image
docker build -t ai-interview-coach .

# 2. Run the Docker container passing your Groq API Key
docker run -p 3000:3000 \
  -e GROQ_API_KEY="your_groq_api_key_here" \
  ai-interview-coach
```

Or using Docker Compose:

```bash
docker-compose up --build
```

Access the app at: `http://localhost:3000`

---

## ☁️ Deployment Option 1: AWS App Runner (Recommended for AWS)

**AWS App Runner** is the fastest, fully-managed way to deploy containerized web applications on AWS.

### Steps:
1. **Push Container to AWS ECR (Elastic Container Registry)**:
   ```bash
   aws ecr create-repository --repository-name ai-interview-coach
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <YOUR_AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com
   docker tag ai-interview-coach:latest <YOUR_AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/ai-interview-coach:latest
   docker push <YOUR_AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/ai-interview-coach:latest
   ```

2. **Create App Runner Service**:
   - Go to **AWS Console -> App Runner -> Create Service**.
   - Select **Container registry -> Amazon ECR**.
   - Select image: `ai-interview-coach:latest`.
   - Set Port: `3000`.
   - Add Environment Variables:
     - `GROQ_API_KEY`: Your Groq API key
   - Click **Deploy**. App Runner will output a live HTTPS public URL!

---

## ☁️ Deployment Option 2: Netlify / Vercel vs Render

- **Netlify**: Best suited for purely static sites. For full-stack Express API backends with Node servers, Netlify requires refactoring endpoints into Netlify Serverless Functions.
- **Render / Railway / Render Docker**: You can directly connect your GitHub repo to **Render** or **Railway**, choose "Docker", enter your `GROQ_API_KEY`, and deploy in 1 click!

---

## 💾 Data Persistence & Storage

- **Current State Handling**: Session records, resume analysis, and interview scores are managed dynamically in memory / client state.
- **Scaling Persistence**: For permanent cross-session storage on AWS, you can easily connect AWS DynamoDB or AWS RDS (PostgreSQL) inside `/server.ts`.
