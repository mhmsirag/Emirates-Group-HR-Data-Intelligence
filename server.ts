import 'dotenv/config';
import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import {
  SAMPLE_CORE_HR,
  SAMPLE_PAYROLL,
  SAMPLE_ACCESS_DIRECTORY,
  SAMPLE_LEARNING,
} from './src/data/sample_datasets';
import { runReconciliationEngine } from './src/services/reconciliationEngine';
import { synthesizeLeadershipAdvisory } from './src/services/leadershipAdvisory';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// In-memory or file-backed audit log
const AUDIT_LOG_FILE = path.join(__dirname, 'data', 'audit_log.json');
let auditLogs: any[] = [];

try {
  if (fs.existsSync(AUDIT_LOG_FILE)) {
    const raw = fs.readFileSync(AUDIT_LOG_FILE, 'utf-8');
    auditLogs = JSON.parse(raw);
  }
} catch (e) {
  console.error('Error reading audit_log.json:', e);
}

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (apiKey) {
  aiClient = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// API Routes
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    gemini_enabled: Boolean(aiClient),
    app: 'Emirates Group HR Data Intelligence & Trust Engine',
  });
});

app.get('/api/audit-log', (_req: Request, res: Response) => {
  res.json({ audit_logs: auditLogs });
});

app.post('/api/audit-log', (req: Request, res: Response) => {
  const newEntry = {
    ...req.body,
    timestamp: new Date().toISOString(),
  };
  auditLogs.unshift(newEntry);
  try {
    fs.writeFileSync(AUDIT_LOG_FILE, JSON.stringify(auditLogs, null, 2));
  } catch (err) {
    console.error('Failed to write to audit_log.json:', err);
  }
  res.json({ success: true, entry: newEntry });
});

app.post('/api/reconcile', (req: Request, res: Response) => {
  try {
    const data = {
      coreHR: req.body?.coreHR || SAMPLE_CORE_HR,
      payroll: req.body?.payroll || SAMPLE_PAYROLL,
      accessDirectory: req.body?.accessDirectory || SAMPLE_ACCESS_DIRECTORY,
      learning: req.body?.learning || SAMPLE_LEARNING,
    };
    const issues = runReconciliationEngine(data);
    res.json({ success: true, count: issues.length, issues });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Reconciliation failed' });
  }
});

// Plain language leadership queries grounded in Emirates HR data
app.post('/api/query', async (req: Request, res: Response) => {
  const { question, issuesContext, locale } = req.body;
  if (!question) {
    return res.status(400).json({ error: 'Question is required' });
  }

  // Detect Arabic in query or requested locale
  const hasArabicChar = /[\u0600-\u06FF]/.test(question);
  const isArabic = locale === 'ar' || hasArabicChar;

  // Pre-calculate baseline issues if not provided
  const issues = issuesContext || runReconciliationEngine({
    coreHR: SAMPLE_CORE_HR,
    payroll: SAMPLE_PAYROLL,
    accessDirectory: SAMPLE_ACCESS_DIRECTORY,
    learning: SAMPLE_LEARNING,
  });

  const trustHierarchySummary = `
SOURCE TRUST HIERARCHY:
1. core_hr: Primary authority for Personal Identification, Demographics, Employment Dates, Official Contract Status.
2. payroll: Primary authority for Financials, Grade Levels, IBAN/Banking, Allowance Codes, Salary Structure.
3. access_directory: Primary authority for IT Access Status, Active Directory Usernames, Physical Building Access.
4. learning: Auxiliary authority for Training Records, Certifications, Competencies.
Tie-Breaker: Most recent last_modified_timestamp.
`;

  const prompt = `
You are the Emirates Group HR Data Intelligence & Trust Engine leadership advisor.
Answer the following executive inquiry with strict data grounding and source trust transparency.

EXECUTIVE INQUIRY: "${question}"
TARGET LANGUAGE: ${isArabic ? 'Professional Executive Arabic (العربية الفصحى القيادية)' : 'English'}

CURRENT ACTIVE DISPARITIES DATASET:
${JSON.stringify(issues, null, 2)}

${trustHierarchySummary}

INSTRUCTIONS FOR YOUR RESPONSE:
1. Provide a direct, executive-ready executive summary ${isArabic ? 'in fluent Arabic' : 'in English'}.
2. Disclose the deterministic source trust rationale (primary source authority vs conflicting source).
3. Explicitly cite exact source files (core_hr.csv, payroll.csv, access_directory.csv, learning.csv), GEIDs, and record IDs.
4. Highlight financial exposure (in AED) and regulatory / flight safety criticality where relevant.
5. Emphasize that all recommended actions require Human-in-the-Loop Steward approval.
6. Provide a concise bulleted list of prioritized action steps.
Format your answer clearly with readable markdown headers, bullet points, and high clarity.
`;

  if (aiClient) {
    try {
      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });
      return res.json({
        answer: response.text,
        source: 'gemini-3.8-flash',
        timestamp: new Date().toISOString(),
      });
    } catch (apiError: any) {
      console.error('Gemini API call error, falling back to deterministic synthesis:', apiError);
    }
  }

  // Deterministic grounded response fallback
  const synthesized = synthesizeLeadershipAdvisory(question, issues, isArabic ? 'ar' : 'en');

  return res.json({
    answer: synthesized,
    source: 'deterministic-rules-engine',
    timestamp: new Date().toISOString(),
  });
});

// Mounting Vite in development or serving static in production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, () => {
    console.log(`Emirates Group HR Trust Engine running on http://localhost:${PORT}`);
  });
}

// In Vercel serverless environments, Vercel invokes the exported app directly
if (!process.env.VERCEL) {
  startServer();
}

export default app;
