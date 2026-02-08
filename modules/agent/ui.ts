import fs from "fs";
import pathMod from "path";
import process from "process";
import "colors";

const INDENT = "  ";
const CONTEXT = 2;
const MAX_DIFF = 15;
const MAX_PREVIEW = 4;
const MAX_CMD_OUTPUT = 30;

// --- Box primitives ---

function stripAnsi(str: string): string {
  // deno-lint-ignore no-control-regex
  return str.replace(/\x1b\[[0-9;]*m/g, "");
}

function boxWidth(): number {
  return Math.min((process.stdout.columns || 80) - INDENT.length - 2, 90);
}

function rule(n: number): string {
  return "─".repeat(Math.max(0, n));
}

function boxTop(title?: string): void {
  const w = boxWidth();
  if (title) {
    const visLen = stripAnsi(title).length;
    const rest = w - visLen - 3;
    console.log(`${INDENT}╭─ ${title} ${rule(Math.max(0, rest))}╮`);
  } else {
    console.log(`${INDENT}╭${rule(w)}╮`);
  }
}

function boxLine(text: string): void {
  console.log(`${INDENT}│ ${text}`);
}

function boxBottom(): void {
  const w = boxWidth();
  console.log(`${INDENT}╰${rule(w)}╯`);
}

function boxGap(label: string): void {
  boxLine(`${"⋮".gray} ${label.gray}`);
}

// --- Tool header ---

export function displayToolHeader(
  name: string,
  detail: string,
  needsApproval: boolean,
): void {
  const bullet = needsApproval ? "●".yellow : "●".gray;
  const label = needsApproval ? name.yellow : name.gray;
  console.log(`\n${INDENT}${bullet} ${label} ${detail}`);
}

// --- Edit file diff with context ---

export function displayEditDiff(
  filePath: string,
  oldString: string,
  newString: string,
): void {
  const oldLines = oldString.split("\n");
  const newLines = newString.split("\n");

  let ctxBefore: string[] = [];
  let ctxAfter: string[] = [];
  let matchStart = 0;

  try {
    const content = fs.readFileSync(pathMod.resolve(filePath), "utf-8");
    const allLines = content.split("\n");
    const idx = content.indexOf(oldString);
    if (idx >= 0) {
      matchStart = content.slice(0, idx).split("\n").length - 1;
      ctxBefore = allLines.slice(
        Math.max(0, matchStart - CONTEXT),
        matchStart,
      );
      const matchEnd = matchStart + oldLines.length;
      ctxAfter = allLines.slice(matchEnd, matchEnd + CONTEXT);
    }
  } catch {
    // Can't read file for context — show diff without it
  }

  boxTop();

  const lastNum =
    matchStart +
    CONTEXT +
    Math.max(oldLines.length, newLines.length) +
    CONTEXT;
  const nw = Math.max(String(lastNum).length, 3);
  let ln = Math.max(1, matchStart - ctxBefore.length + 1);

  // Context before
  for (const line of ctxBefore) {
    boxLine(`${String(ln++).padStart(nw).gray}   ${line.gray}`);
  }

  // Removed lines
  const showOld =
    oldLines.length > MAX_DIFF ? oldLines.slice(0, MAX_DIFF) : oldLines;
  for (const line of showOld) {
    boxLine(`${String(ln++).padStart(nw).gray} ${"−".red} ${line.red}`);
  }
  if (oldLines.length > MAX_DIFF) {
    boxLine(
      `${" ".repeat(nw)}   ${"⋮".gray} ${`${oldLines.length - MAX_DIFF} more removed`.gray}`,
    );
    ln += oldLines.length - MAX_DIFF;
  }

  // Added lines (no line numbers — they don't exist in the original)
  const showNew =
    newLines.length > MAX_DIFF ? newLines.slice(0, MAX_DIFF) : newLines;
  for (const line of showNew) {
    boxLine(`${" ".repeat(nw)} ${"+".green} ${line.green}`);
  }
  if (newLines.length > MAX_DIFF) {
    boxLine(
      `${" ".repeat(nw)}   ${"⋮".gray} ${`${newLines.length - MAX_DIFF} more added`.gray}`,
    );
  }

  // Context after (shifted line numbers)
  const shift = newLines.length - oldLines.length;
  for (const line of ctxAfter) {
    boxLine(`${String(ln + shift).padStart(nw).gray}   ${line.gray}`);
    ln++;
  }

  boxBottom();
}

// --- Write file preview ---

export function displayWritePreview(
  filePath: string,
  content: string,
): void {
  const lines = content.split("\n");
  const exists = fs.existsSync(pathMod.resolve(filePath));
  const tag = exists ? "overwrite" : "new";
  const title = `${tag} · ${lines.length} lines`;

  boxTop(title);

  const nw = String(lines.length).length;

  if (lines.length <= MAX_PREVIEW * 2 + 1) {
    for (let i = 0; i < lines.length; i++) {
      boxLine(`${String(i + 1).padStart(nw).gray}  ${lines[i].green}`);
    }
  } else {
    for (let i = 0; i < MAX_PREVIEW; i++) {
      boxLine(`${String(i + 1).padStart(nw).gray}  ${lines[i].green}`);
    }
    boxGap(`${lines.length - MAX_PREVIEW * 2} more lines`);
    for (let i = lines.length - MAX_PREVIEW; i < lines.length; i++) {
      boxLine(`${String(i + 1).padStart(nw).gray}  ${lines[i].green}`);
    }
  }

  boxBottom();
}

// --- Command result ---

export function displayCommandResult(
  output: string,
  exitCode: number,
): void {
  const trimmed = output.replace(/\n+$/, "");

  if (trimmed && trimmed !== "(no output)") {
    const lines = trimmed.split("\n");
    boxTop();
    if (lines.length <= MAX_CMD_OUTPUT) {
      for (const line of lines) {
        boxLine(line);
      }
    } else {
      for (const line of lines.slice(0, MAX_CMD_OUTPUT)) {
        boxLine(line);
      }
      boxGap(`${lines.length - MAX_CMD_OUTPUT} more lines`);
    }
    boxBottom();
  }

  if (exitCode === 0) {
    console.log(`${INDENT}${"✓".green} ${"exit 0".green}`);
  } else {
    console.log(`${INDENT}${"✗".red} ${`exit ${exitCode}`.red}`);
  }
}

// --- Result indicators ---

export function displaySuccess(msg: string): void {
  console.log(`${INDENT}${"✓".green} ${msg.gray}`);
}

export function displayError(msg: string): void {
  console.log(`${INDENT}${"✗".red} ${msg}`);
}

// --- Message boxes ---

export function messageBoxTop(role: "you" | "agent"): void {
  const title = role === "you" ? "you".green : "agent".cyan;
  boxTop(title);
}

export function messageBoxPrefix(): string {
  return `${INDENT}│ `;
}

export function messageBoxBottom(): void {
  boxBottom();
}

/** Available text width inside a message box line (between │ borders). */
function messageTextWidth(): number {
  return boxWidth() - 2; // " text " between the two │ chars
}

/** Word-wrap a single line into multiple lines of at most `maxW` visible chars. */
function wrapLine(line: string, maxW: number): string[] {
  if (line.length === 0) return [""];
  if (line.length <= maxW) return [line];

  const result: string[] = [];
  let cur = "";
  for (const word of line.split(/(\s+)/)) {
    if (cur.length + word.length <= maxW) {
      cur += word;
    } else if (cur.length === 0) {
      // Single word longer than maxW — hard break
      for (let i = 0; i < word.length; i += maxW) {
        result.push(word.slice(i, i + maxW));
      }
      cur = result.pop() ?? "";
    } else {
      result.push(cur);
      cur = word.replace(/^\s+/, ""); // trim leading spaces on wrapped line
    }
  }
  if (cur.length > 0) result.push(cur);
  return result;
}

/** Print a full text block inside a message box with word-wrapping and right border. */
export function messageBoxText(text: string): void {
  const maxW = messageTextWidth();
  const lines = text.split("\n");
  for (const line of lines) {
    for (const wrapped of wrapLine(line, maxW)) {
      const pad = " ".repeat(Math.max(0, maxW - wrapped.length));
      console.log(`${INDENT}│ ${wrapped}${pad} │`);
    }
  }
}

/**
 * Create a stream writer that word-wraps streaming text within a message box.
 * Call `.write(chunk)` for each streamed delta and `.finish()` at the end.
 */
export function createStreamWriter(): {
  write: (chunk: string) => void;
  finish: () => void;
  hasContent: () => boolean;
} {
  const maxW = messageTextWidth();
  const prefix = `${INDENT}│ `;
  const suffix = () => {
    const pad = " ".repeat(Math.max(0, maxW - col));
    return `${pad} │`;
  };
  let col = 0;
  let started = false;
  let buf = "";

  function flushWord() {
    if (!buf) return;
    // Would this word overflow?
    if (col > 0 && col + buf.length > maxW) {
      // Pad current line and close border, then start new line
      process.stdout.write(suffix() + "\n" + prefix);
      col = 0;
    }
    // Hard-break words longer than maxW
    while (buf.length > maxW - col && buf.length > 0) {
      const take = Math.max(1, maxW - col);
      process.stdout.write(buf.slice(0, take));
      buf = buf.slice(take);
      col += take;
      if (buf.length > 0) {
        process.stdout.write(suffix() + "\n" + prefix);
        col = 0;
      }
    }
    if (buf.length > 0) {
      process.stdout.write(buf);
      col += buf.length;
    }
    buf = "";
  }

  return {
    write(chunk: string) {
      started = true;
      for (const ch of chunk) {
        if (ch === "\n") {
          flushWord();
          process.stdout.write(suffix() + "\n" + prefix);
          col = 0;
        } else if (ch === " " || ch === "\t") {
          flushWord();
          if (col < maxW) {
            process.stdout.write(ch);
            col++;
          }
        } else {
          buf += ch;
        }
      }
    },
    finish() {
      flushWord();
      if (col > 0 || started) {
        process.stdout.write(suffix() + "\n");
      }
    },
    hasContent() {
      return started;
    },
  };
}
