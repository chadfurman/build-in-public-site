import * as fs from "fs";
import * as path from "path";
import * as os from "os";

const SKILL_DIR = path.dirname(new URL(import.meta.url).pathname);
const CONFIG_FILE = path.join(SKILL_DIR, "config.json");

interface Config {
  chatsDir: string;
  claudeProjectsDir: string;
  relevancePatterns: string[];
}

const DEFAULT_CONFIG: Config = {
  chatsDir: "",
  claudeProjectsDir: path.join(os.homedir(), ".claude", "projects"),
  relevancePatterns: ["business-brainstorm"],
};

function loadConfig(): Config {
  if (fs.existsSync(CONFIG_FILE)) {
    const stored = JSON.parse(fs.readFileSync(CONFIG_FILE, "utf-8"));
    return { ...DEFAULT_CONFIG, ...stored };
  }
  return DEFAULT_CONFIG;
}

function saveConfig(config: Config): void {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2) + "\n");
}

function resolveConfig(): Config {
  const config = loadConfig();
  if (!config.chatsDir) {
    // Auto-detect: walk up from skill dir to find claude-chats
    let dir = path.resolve(SKILL_DIR, "..", "..", "..");
    while (dir !== path.dirname(dir)) {
      const candidate = path.join(path.dirname(dir), "claude-chats");
      if (fs.existsSync(candidate)) {
        config.chatsDir = candidate;
        break;
      }
      dir = path.dirname(dir);
    }
    if (!config.chatsDir) {
      console.error(
        "Could not auto-detect chatsDir. Run --setup to configure."
      );
      process.exit(1);
    }
  }
  return config;
}

const config = resolveConfig();
const CHATS_DIR = config.chatsDir;
const CURSORS_FILE = path.join(CHATS_DIR, "cursors.json");
const CLAUDE_PROJECTS_DIR = config.claudeProjectsDir;
const RELEVANCE_PATTERNS = config.relevancePatterns;

interface Cursor {
  lastByteOffset: number;
  lastChecked: string;
}

interface CursorsData {
  version: number;
  cursors: Record<string, Cursor>;
}

function loadCursors(): CursorsData {
  if (fs.existsSync(CURSORS_FILE)) {
    return JSON.parse(fs.readFileSync(CURSORS_FILE, "utf-8"));
  }
  return { version: 1, cursors: {} };
}

function saveCursors(data: CursorsData): void {
  fs.writeFileSync(CURSORS_FILE, JSON.stringify(data, null, 2) + "\n");
}

function getJsonlFiles(): string[] {
  return fs
    .readdirSync(CHATS_DIR)
    .filter((f) => f.endsWith(".jsonl"))
    .sort();
}

function resolveFileSize(filename: string): number {
  const filepath = path.join(CHATS_DIR, filename);
  const realPath = fs.realpathSync(filepath);
  return fs.statSync(realPath).size;
}

interface ContentBlock {
  type: string;
  text?: string;
  name?: string;
  id?: string;
  tool_use_id?: string;
  input?: { questions?: AskQuestion[] };
  content?: string;
}

interface AskQuestion {
  question: string;
  options?: { label: string; description?: string }[];
}

function extractText(content: string | ContentBlock[]): string {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "";
  return content
    .filter((b) => b.type === "text" && b.text)
    .map((b) => b.text!)
    .join("\n");
}

function extractAskQuestions(
  content: ContentBlock[]
): { toolUseId: string; questions: AskQuestion[] }[] {
  const results: { toolUseId: string; questions: AskQuestion[] }[] = [];
  for (const block of content) {
    if (
      block.type === "tool_use" &&
      block.name === "AskUserQuestion" &&
      block.id &&
      block.input?.questions
    ) {
      results.push({ toolUseId: block.id, questions: block.input.questions });
    }
  }
  return results;
}

function extractToolResults(
  content: ContentBlock[]
): Map<string, string> {
  const results = new Map<string, string>();
  for (const block of content) {
    if (block.type === "tool_result" && block.tool_use_id) {
      const text =
        typeof block.content === "string" ? block.content : "";
      results.set(block.tool_use_id, text);
    }
  }
  return results;
}

interface Message {
  role: "user" | "assistant" | "qa";
  text: string;
}

interface ReadResult {
  messages: Message[];
  userCount: number;
  assistantCount: number;
  newBytes: number;
}

function readNewContent(filename: string, fromOffset: number): ReadResult {
  const filepath = path.join(CHATS_DIR, filename);
  const realPath = fs.realpathSync(filepath);
  const fileSize = fs.statSync(realPath).size;

  if (fromOffset >= fileSize) {
    return { messages: [], userCount: 0, assistantCount: 0, newBytes: 0 };
  }

  const buffer = Buffer.alloc(fileSize - fromOffset);
  const fd = fs.openSync(realPath, "r");
  fs.readSync(fd, buffer, 0, buffer.length, fromOffset);
  fs.closeSync(fd);

  const text = buffer.toString("utf-8");
  const lines = text.split("\n").filter((l) => l.trim());

  const messages: Message[] = [];
  let userCount = 0;
  let assistantCount = 0;

  // Pending AskUserQuestion tool_use_ids -> formatted question text
  const pendingQuestions = new Map<string, string>();

  for (const line of lines) {
    try {
      const obj = JSON.parse(line);
      if (obj.type === "user" && obj.message) {
        const content = obj.message.content;

        // Check for tool_result answers to pending questions
        if (Array.isArray(content)) {
          const toolResults = extractToolResults(content as ContentBlock[]);
          for (const [toolUseId, answerText] of toolResults) {
            const questionText = pendingQuestions.get(toolUseId);
            if (questionText) {
              messages.push({
                role: "qa",
                text: `${questionText}\n  → ${answerText}`,
              });
              pendingQuestions.delete(toolUseId);
              continue;
            }
          }
        }

        const txt = extractText(content);
        if (txt && !txt.startsWith("[Request interrupted")) {
          messages.push({ role: "user", text: txt });
          userCount++;
        }
      } else if (obj.type === "assistant" && obj.message) {
        const content = obj.message.content;

        // Check for AskUserQuestion tool_use blocks
        if (Array.isArray(content)) {
          const asks = extractAskQuestions(content as ContentBlock[]);
          for (const ask of asks) {
            const formatted = ask.questions
              .map((q) => {
                const opts = q.options
                  ? q.options.map((o) => o.label).join(" | ")
                  : "";
                return opts ? `Q: ${q.question} [${opts}]` : `Q: ${q.question}`;
              })
              .join("; ");
            pendingQuestions.set(ask.toolUseId, formatted);
          }
        }

        const txt = extractText(content);
        if (txt) {
          messages.push({ role: "assistant", text: txt });
          assistantCount++;
        }
      }
    } catch {
      // skip unparseable lines (partial reads, etc.)
    }
  }

  return { messages, userCount, assistantCount, newBytes: fileSize - fromOffset };
}

function truncate(s: string, max: number): string {
  if (s.length <= max) return s;
  return s.slice(0, max) + "...";
}

// --- Modes ---

function scanMode(): void {
  const cursors = loadCursors();
  const files = getJsonlFiles();

  let anyNew = false;

  for (const file of files) {
    const size = resolveFileSize(file);
    const cursor = cursors.cursors[file];
    const lastOffset = cursor?.lastByteOffset ?? 0;
    const delta = size - lastOffset;

    if (delta <= 0) continue;

    anyNew = true;
    const { messages, userCount, assistantCount } = readNewContent(
      file,
      lastOffset
    );

    console.log(`\n=== ${file} ===`);
    console.log(
      `  ${delta.toLocaleString()} new bytes (${lastOffset.toLocaleString()} -> ${size.toLocaleString()})`
    );
    console.log(
      `  ${userCount} user messages, ${assistantCount} assistant messages`
    );

    const userMessages = messages.filter((m) => m.role === "user");
    if (userMessages.length > 0) {
      console.log("  User message snippets:");
      for (const msg of userMessages.slice(0, 10)) {
        console.log(`    - ${truncate(msg.text.replace(/\n/g, " "), 200)}`);
      }
      if (userMessages.length > 10) {
        console.log(`    ... and ${userMessages.length - 10} more`);
      }
    }
  }

  if (!anyNew) {
    console.log("No new content since last cursor update.");
  }
}

function updateMode(): void {
  const cursors = loadCursors();
  const files = getJsonlFiles();

  for (const file of files) {
    const size = resolveFileSize(file);
    cursors.cursors[file] = {
      lastByteOffset: size,
      lastChecked: new Date().toISOString(),
    };
  }

  // Remove cursors for files that no longer exist
  for (const key of Object.keys(cursors.cursors)) {
    if (!files.includes(key)) {
      delete cursors.cursors[key];
    }
  }

  saveCursors(cursors);
  console.log(`Updated cursors for ${files.length} files.`);
}

function summaryMode(targetFile: string): void {
  const cursors = loadCursors();
  const cursor = cursors.cursors[targetFile];
  const lastOffset = cursor?.lastByteOffset ?? 0;

  const { messages, userCount, assistantCount } = readNewContent(
    targetFile,
    lastOffset
  );

  if (messages.length === 0) {
    console.log(`No new messages in ${targetFile}.`);
    return;
  }

  console.log(`\n=== Summary: ${targetFile} ===`);
  console.log(
    `${userCount} user + ${assistantCount} assistant messages:\n`
  );

  for (const msg of messages) {
    if (msg.role === "qa") {
      console.log(`[Q&A] ${truncate(msg.text.replace(/\n/g, " "), 500)}`);
    } else {
      const label = msg.role === "user" ? "[USER]" : "[ASSISTANT]";
      console.log(`${label} ${truncate(msg.text.replace(/\n/g, " "), 500)}`);
    }
  }
}

function isRelevant(textToCheck: string): boolean {
  return RELEVANCE_PATTERNS.some((pattern) => textToCheck.includes(pattern));
}

function discoverMode(): void {
  // Collect real paths of all already-symlinked files
  const linkedTargets = new Set<string>();
  for (const file of getJsonlFiles()) {
    const filepath = path.join(CHATS_DIR, file);
    linkedTargets.add(fs.realpathSync(filepath));
  }

  // Scan all Claude project directories for .jsonl files
  let projectDirs: string[];
  try {
    projectDirs = fs
      .readdirSync(CLAUDE_PROJECTS_DIR)
      .map((d) => path.join(CLAUDE_PROJECTS_DIR, d))
      .filter((d) => fs.statSync(d).isDirectory());
  } catch {
    console.error(`Cannot read ${CLAUDE_PROJECTS_DIR}`);
    process.exit(1);
  }

  const found: { file: string; cwd: string; firstUserMsg: string }[] = [];

  for (const dir of projectDirs) {
    let files: string[];
    try {
      files = fs.readdirSync(dir).filter((f) => f.endsWith(".jsonl"));
    } catch {
      continue;
    }

    for (const file of files) {
      const fullPath = path.join(dir, file);

      // Skip if already symlinked
      if (linkedTargets.has(fullPath)) continue;

      // Read first chunk to find cwd and first user message
      const fd = fs.openSync(fullPath, "r");
      const buf = Buffer.alloc(Math.min(fs.statSync(fullPath).size, 65536));
      fs.readSync(fd, buf, 0, buf.length, 0);
      fs.closeSync(fd);

      const chunk = buf.toString("utf-8");
      const lines = chunk.split("\n").filter((l) => l.trim());

      let cwd = "";
      let firstUserMsg = "";

      for (const line of lines) {
        try {
          const obj = JSON.parse(line);
          if (obj.cwd && !cwd) cwd = obj.cwd;
          if (
            obj.type === "user" &&
            obj.message &&
            !firstUserMsg
          ) {
            const txt = extractText(
              typeof obj.message.content === "string"
                ? obj.message.content
                : obj.message.content
            );
            if (txt && !txt.startsWith("[Request interrupted")) {
              firstUserMsg = txt;
            }
          }
          if (cwd && firstUserMsg) break;
        } catch {
          // partial line at end of buffer
        }
      }

      // Check relevance: cwd, project dir name, OR file paths in content
      const relevant =
        isRelevant(cwd) ||
        isRelevant(dir) ||
        isRelevant(chunk);

      if (relevant) {
        found.push({ file: fullPath, cwd, firstUserMsg });
      }
    }
  }

  if (found.length === 0) {
    console.log("No new relevant sessions found.");
    return;
  }

  // Figure out next symlink number
  const existing = getJsonlFiles();
  let nextNum = 0;
  for (const f of existing) {
    const match = f.match(/^(\d+)/);
    if (match) nextNum = Math.max(nextNum, parseInt(match[1]) + 1);
  }

  console.log(`Found ${found.length} unlinked session(s):\n`);
  for (const entry of found) {
    const padded = String(nextNum).padStart(2, "0");
    console.log(`  ${entry.file}`);
    console.log(`  cwd: ${entry.cwd}`);
    console.log(
      `  first message: ${truncate(entry.firstUserMsg.replace(/\n/g, " "), 200)}`
    );
    console.log(
      `  suggested: ln -s "${entry.file}" "${path.join(CHATS_DIR, `${padded}-DESCRIBE-ME.jsonl`)}"`
    );
    console.log();
    nextNum++;
  }
}

function setupMode(): void {
  const existing = loadConfig();
  const config: Config = { ...DEFAULT_CONFIG, ...existing };

  // Auto-detect chatsDir from git repo
  if (!config.chatsDir) {
    const candidate = path.resolve(SKILL_DIR, "..", "..", "..", "..", "claude-chats");
    if (fs.existsSync(candidate)) {
      config.chatsDir = candidate;
    }
  }

  // Auto-detect claudeProjectsDir
  if (!config.claudeProjectsDir) {
    config.claudeProjectsDir = path.join(os.homedir(), ".claude", "projects");
  }

  saveConfig(config);
  console.log("Config saved to:", CONFIG_FILE);
  console.log(JSON.stringify(config, null, 2));
  console.log(
    "\nEdit this file to add relevance patterns or change directories."
  );
  console.log(
    'Example: add "my-project" to relevancePatterns to discover sessions working on that project.'
  );
}

// --- CLI ---

const args = process.argv.slice(2);

if (args.includes("--setup")) {
  setupMode();
} else if (args.includes("--update")) {
  updateMode();
} else if (args.includes("--summary")) {
  const idx = args.indexOf("--summary");
  const file = args[idx + 1];
  if (!file) {
    console.error("Usage: --summary <filename.jsonl>");
    process.exit(1);
  }
  summaryMode(file);
} else if (args.includes("--discover")) {
  discoverMode();
} else {
  scanMode();
}
