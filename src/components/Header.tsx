import React from 'react';
import {
  ShieldAlert,
  Layers,
  Sparkles,
  GitFork,
  FileCheck2,
  BookOpen,
  Download,
  RefreshCw,
  Languages,
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  pendingCount: number;
  onExportAuditLog: () => void;
  onResetData: () => void;
  isReconciling: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  pendingCount,
  onExportAuditLog,
  onResetData,
  isReconciling,
}) => {
  const { t, locale, toggleLocale, isRtl } = useLanguage();

  const navItems = [
    { id: 'overview', label: t.navOverview, icon: Layers },
    { id: 'triage', label: t.navTriage, count: pendingCount, icon: ShieldAlert },
    { id: 'security_ghosts', label: t.navSecurityGhosts, icon: ShieldAlert },
    { id: 'duplicates', label: t.navDuplicates, icon: GitFork },
    { id: 'lineage', label: t.navLineage, icon: GitFork },
    { id: 'steward', label: t.navSteward, icon: FileCheck2 },
    { id: 'query', label: t.navQuery, icon: Sparkles },
    { id: 'dictionary', label: t.navDictionary, icon: BookOpen },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 lg:gap-8 h-16">
          {/* Zone 1: Single-element Brand Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center font-bold text-white text-base tracking-wider shadow-sm shadow-red-950 shrink-0">
              EK
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight text-white whitespace-nowrap">
                {t.brandName}
              </span>
              <span className="text-[11px] font-medium text-slate-400 whitespace-nowrap hidden sm:inline">
                {t.brandSubtitle}
              </span>
            </div>
          </div>

          {/* Zone 2: Clean single-line text navigation links */}
          <nav className="hidden xl:flex items-center gap-1 text-xs font-medium text-slate-400">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-2 rounded-md transition-colors whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-slate-900 text-white font-semibold shadow-inner border border-slate-800'
                      : 'hover:text-slate-200 hover:bg-slate-900/50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 opacity-80" />
                  <span>{item.label}</span>
                  {typeof item.count === 'number' && item.count > 0 && (
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-red-950/80 text-red-300 border border-red-800/40 tabular-nums">
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: 1 primary action & utilities */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Bilingual Toggle Button */}
            <button
              onClick={toggleLocale}
              title={locale === 'en' ? 'التحويل إلى اللغة العربية' : 'Switch to English'}
              className="px-2.5 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-850 rounded-md border border-slate-800 hover:border-slate-700 transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 font-medium"
            >
              <Languages className="w-3.5 h-3.5 text-red-400" />
              <span>{t.languageToggle}</span>
            </button>

            <button
              onClick={onResetData}
              disabled={isReconciling}
              title={locale === 'ar' ? 'إعادة مطابقة البيانات' : 'Re-run reconciliation across 50+ HR source datasets'}
              className="px-2.5 py-1.5 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded-md border border-slate-800 transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <RefreshCw className={`w-3 h-3 ${isReconciling ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{t.refreshSync}</span>
            </button>

            <button
              onClick={onExportAuditLog}
              className="px-3 py-1.5 text-xs font-medium text-white bg-red-700 hover:bg-red-600 rounded-md transition-colors flex items-center gap-1.5 shadow-sm whitespace-nowrap shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t.exportAudit}</span>
            </button>
          </div>
        </div>

        {/* Mobile/Tablet Secondary Nav Strip */}
        <div className="flex xl:hidden overflow-x-auto py-2 gap-1 border-t border-slate-850 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-slate-900 text-white font-semibold border border-slate-800'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5 opacity-80" />
                <span>{item.label}</span>
                {typeof item.count === 'number' && item.count > 0 && (
                  <span className="text-[10px] font-mono px-1 rounded bg-red-950 text-red-300">
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
