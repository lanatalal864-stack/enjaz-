// Extracts each page component from src/AppCore.tsx into src/pages/<Page>.tsx
// Run: node scripts/extract-pages.mjs
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(process.cwd());
const src = fs.readFileSync(path.join(root, "src/AppCore.tsx"), "utf8");
const lines = src.replace(/\r/g, "").split("\n");

// Find exact start of each top-level component by `export function Name(` declaration.
const decls = [
  { name: "LandingPage",       prefix: "export function LandingPage(" },
  { name: "AuthPage",          prefix: "export function AuthPage(" },
  { name: "SetupSubjectPage",  prefix: "export function SetupSubjectPage(" },
  { name: "StudentDashboard",  prefix: "export function StudentDashboard(" },
  { name: "RevisionDashboard", prefix: "export function RevisionDashboard(" },
  { name: "BooksPage",         prefix: "export function BooksPage(" },
  { name: "StudyDashboard",    prefix: "export function StudyDashboard(" },
  { name: "ScheduleDashboard", prefix: "export function ScheduleDashboard(" },
  { name: "WikiWikiBot",       prefix: "export function WikiWikiBot(" },
];

// Locate every export function (top-level), in order, so we can compute precise non-overlapping ranges.
const allExports = [];
for (let i = 0; i < lines.length; i++) {
  if (/^export function [A-Z]/.test(lines[i])) allExports.push({ line: i, decl: lines[i] });
  else if (/^function [A-Z]/.test(lines[i])) allExports.push({ line: i, decl: lines[i], internal: true });
}

for (const t of decls) {
  const idx = allExports.findIndex((e) => !e.internal && e.decl.startsWith(t.prefix));
  if (idx < 0) throw new Error(`Missing start for ${t.name}`);
  t.startLine = allExports[idx].line;
  // End = line before the next top-level function (export or non-export), so we don't bleed.
  const nextIdx = allExports
    .slice(idx + 1)
    .find((e) => /^(export function|function) [A-Z]/.test(e.decl));
  t.endLine = nextIdx ? nextIdx.line - 1 : lines.length - 1;
}

// Walk back over blank lines and leading companion const block (BOOKS_2009, MINISTERIAL_SUBJECTS_2008).
function expandUpForCompanion(start) {
  let s = start;
  // skip immediate blank line
  while (s > 0 && lines[s - 1] === "") s -= 1;
  // include a preceding `const NAME...] | ];` block (companion data) if it ends right above
  // Pattern: end of array: `];`
  if (s > 0 && /^];?$/.test(lines[s - 1])) {
    // Walk up to the matching `const NAME` line at column 0
    let k = s - 1;
    while (k > 0 && !/^(const|export const) [A-Z_]/.test(lines[k])) k -= 1;
    if (k > 0) {
      // Include a preceding `// --- ...` comment if any
      while (k > 0 && lines[k - 1].trim() === "") k -= 1;
      if (k > 0 && /^\/\/ ---/.test(lines[k - 1])) k -= 1;
      return k;
    }
  }
  return start;
}
for (const t of decls) t.startLine = expandUpForCompanion(t.startLine);

// Dependency inference for imports.
const lucideAll = [
  "Settings","User","Languages","Play","Pause","RotateCcw","Plus","CheckCircle2","Circle",
  "MessageCircle","X","Send","Calendar","Palette","Check","ChevronLeft","ChevronDown","ChevronRight",
  "Instagram","Facebook","Clock","Coffee","Moon","Layers","Repeat","Trash2","Pencil","Sparkles",
  "Book","Activity","ArrowRight","Monitor","CalendarDays","LogOut",
];
const dateFnsAll = ["format","startOfMonth","endOfMonth","eachDayOfInterval","isSameDay","addMonths","subMonths"];
const reactHooks = ["useState","useEffect","useRef","useMemo","useCallback"];

function inferImports(name, chunk, isShared = false) {
  const sharedPath = isShared ? ".." : "../shared";
  const uiPath = isShared ? "." : "../shared/ui";
  // Lucide
  const lucide = lucideAll.filter((ic) => {
    if (ic === "Calendar") return /\bCalendarIcon\b/.test(chunk);
    if (ic === "MessageCircle") return /\bWhatsAppIcon\b/.test(chunk) || /<MessageCircle\s/.test(chunk);
    return new RegExp(`(<|\\{|=\\s*)${ic}\\b`).test(chunk);
  });
  const lucideSpec = lucide.map((ic) => {
    if (ic === "Calendar") return "Calendar as CalendarIcon";
    if (ic === "MessageCircle" && /\bWhatsAppIcon\b/.test(chunk)) return "MessageCircle as WhatsAppIcon";
    return ic;
  });

  const dateFns = dateFnsAll.filter((fn) => new RegExp(`\\b${fn}\\(`).test(chunk));
  const hooks = reactHooks.filter((h) => new RegExp(`\\b${h}\\b\\s*[(<]`).test(chunk));

  const usesMotion = /<motion\.[a-zA-Z]/.test(chunk) || /\bmotion\(/.test(chunk);
  const usesAP = /<AnimatePresence/.test(chunk);
  const usesMarkdown = /<Markdown\b/.test(chunk);
  const usesGenAI = /\bGoogleGenAI\b/.test(chunk);

  const out = [];
  if (hooks.length) out.push(`import { ${hooks.join(", ")} } from "react";`);
  // React import needed for React types & ReactNode etc.
  if (/React\./.test(chunk) || /React\.ReactNode/.test(chunk) || /React\.FormEvent/.test(chunk) || /React\.MouseEvent/.test(chunk)) {
    out.push(`import React from "react";`);
  }
  if (lucideSpec.length) out.push(`import { ${lucideSpec.join(", ")} } from "lucide-react";`);
  const motionParts = [];
  if (usesMotion) motionParts.push("motion");
  if (usesAP) motionParts.push("AnimatePresence");
  if (motionParts.length) out.push(`import { ${motionParts.join(", ")} } from "motion/react";`);
  if (dateFns.length) out.push(`import { ${dateFns.join(", ")} } from "date-fns";`);
  if (usesMarkdown) out.push(`import Markdown from "react-markdown";`);
  if (usesGenAI) out.push(`import { GoogleGenAI } from "@google/genai";`);

  // Shared imports
  const types = [];
  if (/\bUserProfile\b/.test(chunk)) types.push("UserProfile");
  if (/\bScheduleEvent\b/.test(chunk)) types.push("ScheduleEvent");
  if (/\bStructuredSchedule\b/.test(chunk)) types.push("StructuredSchedule");
  if (/\bSubjectConfig\b/.test(chunk)) types.push("SubjectConfig");
  if (/\bTask\b/.test(chunk)) types.push("Task");
  if (/\bTimerSettings\b/.test(chunk)) types.push("TimerSettings");
  if (/\bStudyHistoryEntry\b/.test(chunk)) types.push("StudyHistoryEntry");
  if (types.length) out.push(`import type { ${types.join(", ")} } from "${sharedPath}/types";`);

  const constants = [];
  if (/\bPRIMARY_BLUE\b/.test(chunk)) constants.push("PRIMARY_BLUE");
  if (/\bMAIN_LOGO\b/.test(chunk)) constants.push("MAIN_LOGO");
  if (/\bSECONDARY_LOGO\b/.test(chunk)) constants.push("SECONDARY_LOGO");
  if (/\bWIKI_WIKI_IMG\b/.test(chunk)) constants.push("WIKI_WIKI_IMG");
  if (/\bSIDEBAR_LOGO\b/.test(chunk)) constants.push("SIDEBAR_LOGO");
  if (constants.length) out.push(`import { ${constants.join(", ")} } from "${sharedPath}/constants";`);

  const utils = [];
  if (/\bcn\(/.test(chunk)) utils.push("cn");
  if (/\bplayDingSound\(/.test(chunk)) utils.push("playDingSound");
  if (utils.length) out.push(`import { ${utils.join(", ")} } from "${sharedPath}/utils";`);

  if (/\bgetSubjectsForGeneration\b/.test(chunk)) {
    out.push(`import { getSubjectsForGeneration } from "${sharedPath}/subjects";`);
  }

  const sub = [
    "Button","ThemeSelector","CircularProgress","Modal","SettingRow","CalendarGrid",
    "DaySummaryWidget","TaskManagerModal","ScheduleView",
  ];
  for (const n of sub) {
    if (new RegExp(`<${n}\\b`).test(chunk)) out.push(`import { ${n} } from "${uiPath}/${n}";`);
  }

  return out.join("\n");
}

fs.mkdirSync(path.join(root, "src/pages"), { recursive: true });
fs.mkdirSync(path.join(root, "src/shared/ui"), { recursive: true });

const header = `/**\n * @license\n * SPDX-License-Identifier: Apache-2.0\n */\n\n`;

for (const t of decls) {
  const chunk = lines.slice(t.startLine, t.endLine + 1).join("\n");
  const isShared = t.name === "WikiWikiBot";
  const imports = inferImports(t.name, chunk, isShared);
  const out = header + imports + "\n\n" + chunk + "\n";
  const outPath = isShared
    ? path.join(root, "src/shared/ui/WikiWikiBot.tsx")
    : path.join(root, `src/pages/${t.name}.tsx`);
  fs.writeFileSync(outPath, out, "utf8");
  console.log(`wrote ${outPath} (lines ${t.startLine + 1}-${t.endLine + 1})`);
}
console.log("done");
