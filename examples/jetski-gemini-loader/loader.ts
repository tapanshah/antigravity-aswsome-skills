import fs from "fs";
import path from "path";

export type SkillMeta = {
  id: string;
  path: string;
  name: string;
  description?: string;
  category?: string;
  risk?: string;
};

export type Message = {
  role: "system" | "user" | "assistant";
  content: string;
};

const SKILL_ID_REGEX = /@([a-zA-Z0-9-_./]+)/g;

function collectReferencedSkillIds(
  messages: Message[],
  index: Map<string, SkillMeta>
): string[] {
  const found = new Set<string>();

  for (const msg of messages) {
    SKILL_ID_REGEX.lastIndex = 0;

    let match: RegExpExecArray | null;
    while ((match = SKILL_ID_REGEX.exec(msg.content)) !== null) {
      const id = match[1];
      if (index.has(id)) {
        found.add(id);
      }
    }
  }

  return [...found];
}

function normalizeMaxSkills(maxSkills: number): number {
  if (!Number.isInteger(maxSkills) || maxSkills < 1) {
    throw new Error("maxSkills must be a positive integer.");
  }

  return maxSkills;
}

export function loadSkillIndex(indexPath: string): Map<string, SkillMeta> {
  const raw = fs.readFileSync(indexPath, "utf8");
  const arr = JSON.parse(raw) as SkillMeta[];
  const map = new Map<string, SkillMeta>();

  for (const meta of arr) {
    map.set(meta.id, meta);
  }

  return map;
}

export function resolveSkillsFromMessages(
  messages: Message[],
  index: Map<string, SkillMeta>,
  maxSkills: number
): SkillMeta[] {
  const skillLimit = normalizeMaxSkills(maxSkills);
  const found = collectReferencedSkillIds(messages, index);

  const metas: SkillMeta[] = [];
  for (const id of found) {
    const meta = index.get(id);
    if (meta) {
      metas.push(meta);
    }
    if (metas.length >= skillLimit) {
      break;
    }
  }

  return metas;
}

export async function loadSkillBodies(
  skillsRoot: string,
  metas: SkillMeta[]
): Promise<string[]> {
  const bodies: string[] = [];
  const rootPath = path.resolve(skillsRoot);

  for (const meta of metas) {
    const fullPath = path.resolve(rootPath, meta.path, "SKILL.md");
    const relativePath = path.relative(rootPath, fullPath);

    if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
      throw new Error(`Skill path escapes skills root: ${meta.id}`);
    }

    const text = await fs.promises.readFile(fullPath, "utf8");
    bodies.push(text);
  }

  return bodies;
}

export async function buildModelMessages(options: {
  baseSystemMessages: Message[];
  trajectory: Message[];
  skillIndex: Map<string, SkillMeta>;
  skillsRoot: string;
  maxSkillsPerTurn?: number;
  overflowBehavior?: "truncate" | "error";
}): Promise<Message[]> {
  const {
    baseSystemMessages,
    trajectory,
    skillIndex,
    skillsRoot,
    maxSkillsPerTurn = 8,
    overflowBehavior = "truncate",
  } = options;
  const skillLimit = normalizeMaxSkills(maxSkillsPerTurn);
  const referencedSkillIds = collectReferencedSkillIds(trajectory, skillIndex);

  if (
    overflowBehavior === "error" &&
    referencedSkillIds.length > skillLimit
  ) {
    throw new Error(
      `Too many skills requested in a single turn. Reduce @skill-id usage to ${skillLimit} or fewer.`
    );
  }

  const selectedMetas = resolveSkillsFromMessages(
    trajectory,
    skillIndex,
    skillLimit
  );

  if (selectedMetas.length === 0) {
    return [...baseSystemMessages, ...trajectory];
  }

  const skillBodies = await loadSkillBodies(skillsRoot, selectedMetas);

  const skillMessages: Message[] = skillBodies.map((body) => ({
    role: "system",
    content: body,
  }));

  return [...baseSystemMessages, ...skillMessages, ...trajectory];
}
