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
  const qLower = question.toLowerCase();
  let filteredIssues = issues;
  if (
    qLower.includes('ghost') ||
    qLower.includes('terminated') ||
    qLower.includes('access') ||
    question.includes('أشباح') ||
    question.includes('مفصول') ||
    question.includes('تصاريح')
  ) {
    filteredIssues = issues.filter((i: any) => i.category === 'SECURITY_GHOST');
  } else if (
    qLower.includes('payroll') ||
    qLower.includes('salary') ||
    qLower.includes('grade') ||
    question.includes('رواتب') ||
    question.includes('درجة') ||
    question.includes('أجور')
  ) {
    filteredIssues = issues.filter((i: any) => i.category === 'CROSS_SYSTEM_MISMATCH' || i.impact_factors?.financial_exposure > 5);
  } else if (
    qLower.includes('emiratisation') ||
    qLower.includes('tawteen') ||
    qLower.includes('pension') ||
    question.includes('توطين') ||
    question.includes('معاشات')
  ) {
    filteredIssues = issues.filter((i: any) => i.impact_factors?.regulatory_criticality >= 8);
  } else if (
    qLower.includes('duplicate') ||
    question.includes('مكرر') ||
    question.includes('تكرار')
  ) {
    filteredIssues = issues.filter((i: any) => i.category === 'DUPLICATE');
  } else if (
    qLower.includes('critical') ||
    qLower.includes('high') ||
    question.includes('حرج') ||
    question.includes('عالي')
  ) {
    filteredIssues = issues.filter((i: any) => i.priority === 'CRITICAL' || i.priority === 'HIGH');
  }

  const synthesized = isArabic
    ? `### الإحاطة الاستشارية والتنفيذية لبيانات الموارد البشرية

**تحليل الاستفسار القيادي:** *${question}*

تم إجراء التقييم الحتمي للمطابقة والمصالحة البيانية عبر ملفات **core_hr.csv** و **payroll.csv** و **access_directory.csv** و **learning.csv**.

#### 1. أهم النتائج والتناقضات المرصودة
تم رصد **${filteredIssues.length} حالة تناقض سجلات نشطة** مرتبطة بموضوع الاستفسار:

${filteredIssues.slice(0, 4).map((iss: any, idx: number) => `
**${idx + 1}. ${iss.employee_name} (${iss.geid}) — ${iss.category} [الأولوية: ${iss.priority} / درجة الأثر: ${iss.impact_score}]**
- **التناقض:** ${iss.explanation}
- **المرجع المعتمد (هرمية المصادر):** ${iss.suggested_fix.governing_source}
- **الحل الحتمي المقترح:** تعديل حقل \`${iss.suggested_fix.target_field}\` إلى \`${iss.suggested_fix.proposed_value}\` (نسبة الثقة: ${(iss.suggested_fix.confidence_score * 100).toFixed(0)}%)
- **الأنظمة والتقارير المتأثرة:** ${iss.downstream_impact.affected_systems.slice(0, 2).join('، ')} و ${iss.downstream_impact.affected_reports.slice(0, 2).join('، ')}
- **معاينة الأثر الرقمي:** ${iss.downstream_impact.metric_delta_preview}
`).join('\n')}

#### 2. شفافية هرمية مصداقية المصادر وأولويات الحسم
- **core_hr.csv:** المصدر المرجعي الحصري لحالة العقد والتوظيف والهوية الوطنية وتواريخ الخدمة.
- **payroll.csv:** المرجع الحصري لهيكل الرواتب والمخصصات والدرجات والتحويلات المصرفية.
- **access_directory.csv:** يجب إلغاء تصاريح الدخول فوراً لمن انتهت خدمتهم التزاماً بلوائح الهيئة العامة للطيران المدني (GCAA) وأمن ساحة المطار.

#### 3. إجراءات الإشراف الموصى بها (إلزامية الحوكمة البشرية)
- يتعين على مشرف بيانات الموارد البشرية المعتمد مراجعة واعتماد التوصيات في شاشة إشراف البيانات.
- لا يتم إرسال أي تعديل للأنظمة الحية تلقائياً التزاماً بقواعد حوكمة الذكاء الاصطناعي المسؤول.`
    : `### Executive Summary & Trust Intelligence Briefing

**Inquiry Analysis:** *${question}*

We evaluated the current multi-system reconciliation across **core_hr.csv**, **payroll.csv**, **access_directory.csv**, and **learning.csv**.

#### 1. Key Findings & Identified Disparities
Found **${filteredIssues.length} relevant record disparities** matching your query criteria:

${filteredIssues.slice(0, 4).map((iss: any, idx: number) => `
**${idx + 1}. ${iss.employee_name} (${iss.geid}) — ${iss.category} [${iss.priority} / Score: ${iss.impact_score}]**
- **Disparity:** ${iss.explanation}
- **Primary Source Authority:** ${iss.suggested_fix.governing_source} (Trust Rank)
- **Deterministic Fix:** Set \`${iss.suggested_fix.target_field}\` to \`${iss.suggested_fix.proposed_value}\` (Confidence: ${(iss.suggested_fix.confidence_score * 100).toFixed(0)}%)
- **Downstream Lineage:** Affects ${iss.downstream_impact.affected_systems.slice(0, 2).join(', ')} and ${iss.downstream_impact.affected_reports.slice(0, 2).join(', ')}
- **Delta Preview:** ${iss.downstream_impact.metric_delta_preview}
`).join('\n')}

#### 2. Source Trust Transparency & Hierarchy Grounding
- **core_hr.csv** remains the non-negotiable single source of truth for contract status, employment dates, and national identity.
- **payroll.csv** dictates grade level compensation bands and direct banking disbursement.
- **access_directory.csv** permissions must be immediately decommissioned for all terminated personnel to satisfy GCAA airside security mandates.

#### 3. Recommended Steward Actions (Human-in-the-Loop)
- Authorized HR Data Stewards should review and approve the pending fixes in the Steward Review workspace.
- High-priority security ghosts should have physical airside turnstile access revoked synchronously via Nedap APIs.`;

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

startServer();
