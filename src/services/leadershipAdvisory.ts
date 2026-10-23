import { DisparityIssue } from '../types';

export function synthesizeLeadershipAdvisory(
  question: string,
  issues: DisparityIssue[],
  locale: string = 'en'
): string {
  const hasArabicChar = /[\u0600-\u06FF]/.test(question);
  const isArabic = locale === 'ar' || hasArabicChar;

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
    filteredIssues = issues.filter((i) => i.category === 'SECURITY_GHOST');
  } else if (
    qLower.includes('payroll') ||
    qLower.includes('salary') ||
    qLower.includes('grade') ||
    question.includes('رواتب') ||
    question.includes('درجة') ||
    question.includes('أجور')
  ) {
    filteredIssues = issues.filter(
      (i) => i.category === 'CROSS_SYSTEM_MISMATCH' || (i.impact_factors?.financial_exposure ?? 0) > 5
    );
  } else if (
    qLower.includes('emiratisation') ||
    qLower.includes('tawteen') ||
    qLower.includes('pension') ||
    question.includes('توطين') ||
    question.includes('معاشات')
  ) {
    filteredIssues = issues.filter((i) => (i.impact_factors?.regulatory_criticality ?? 0) >= 8);
  } else if (
    qLower.includes('duplicate') ||
    question.includes('مكرر') ||
    question.includes('تكرار')
  ) {
    filteredIssues = issues.filter((i) => i.category === 'DUPLICATE');
  } else if (
    qLower.includes('critical') ||
    qLower.includes('high') ||
    question.includes('حرج') ||
    question.includes('عالي')
  ) {
    filteredIssues = issues.filter((i) => i.priority === 'CRITICAL' || i.priority === 'HIGH');
  }

  if (filteredIssues.length === 0) {
    filteredIssues = issues.slice(0, 5);
  }

  if (isArabic) {
    return `### الإحاطة الاستشارية والتنفيذية لبيانات الموارد البشرية

**تحليل الاستفسار القيادي:** *${question}*

تم إجراء التقييم الحتمي للمطابقة والمصالحة البيانية عبر ملفات **core_hr.csv** و **payroll.csv** و **access_directory.csv** و **learning.csv**.

#### 1. أهم النتائج والتناقضات المرصودة
تم رصد **${filteredIssues.length} حالة تناقض سجلات نشطة** مرتبطة بموضوع الاستفسار:

${filteredIssues.slice(0, 4).map((iss, idx) => `
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
- لا يتم إرسال أي تعديل للأنظمة الحية تلقائياً التزاماً بقواعد حوكمة الذكاء الاصطناعي المسؤول.`;
  }

  return `### Executive Summary & Trust Intelligence Briefing

**Inquiry Analysis:** *${question}*

We evaluated the current multi-system reconciliation across **core_hr.csv**, **payroll.csv**, **access_directory.csv**, and **learning.csv**.

#### 1. Key Findings & Identified Disparities
Found **${filteredIssues.length} relevant record disparities** matching your query criteria:

${filteredIssues.slice(0, 4).map((iss, idx) => `
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
}
