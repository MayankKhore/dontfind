/**
 * content.config.ts — Astro Content Collections (Content Layer API).
 *
 * Every collection is validated with zod so malformed content fails the
 * build instead of shipping. All collections share a common "base" set of
 * metadata fields (category, difficulty, tags, status, related, resources)
 * so templates and the search index can treat them uniformly.
 *
 * Markdown (`articles`) gets a rendered `body`; the rest are structured JSON.
 */
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const difficulty = z.enum(['beginner', 'intermediate', 'advanced']);
const status = z.enum(['draft', 'published']);

const relatedRef = z.object({
  collection: z.enum([
    'labs',
    'lessons',
    'quizzes',
    'tools',
    'interview',
    'incidents',
    'glossary',
    'articles',
  ]),
  slug: z.string(),
});

const resourceRef = z.object({
  label: z.string(),
  href: z.string(),
});

/** Fields every content type shares. */
const base = {
  title: z.string().min(3),
  description: z.string().optional(),
  category: z.string().default('general'),
  difficulty: difficulty.default('beginner'),
  tags: z.array(z.string()).default([]),
  status: status.default('published'),
  order: z.number().optional(),
  updated: z.string().optional(),
  icon: z.string().optional(),
  related: z.array(relatedRef).default([]),
  resources: z.array(resourceRef).default([]),
};

const labs = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/labs' }),
  schema: z.object({
    ...base,
    scenario: z.string(),
    duration: z.string().optional(),
    stage: z.number().optional(),
    stageName: z.string().optional(),
    allowedCommands: z.array(z.string()).default([]),
    objectives: z
      .array(z.object({ text: z.string(), cmd: z.string() }))
      .default([]),
    concepts: z
      .array(z.object({ title: z.string(), body: z.string(), code: z.string().optional() }))
      .default([]),
    topology: z
      .object({
        devices: z.array(z.any()).default([]),
        links: z.array(z.any()).default([]),
        table: z.array(z.any()).default([]),
      })
      .optional(),
    /**
     * Per-lab UI config — which lab-bench visuals and devices this lab
     * needs. Drives conditional rendering in `labs/[slug].astro` via
     * `src/lib/lab-ui.js`. Optional so older/other labs keep the
     * pre-existing behaviour (show whatever content they carry).
     */
    ui: z
      .object({
        showTopology: z.boolean().default(true),
        showPortMap: z.boolean().default(true),
        showTerminal: z.boolean().default(true),
        requiredDevices: z.array(z.string()).default([]),
        focus: z.boolean().default(false),
        /**
         * CLI mode the terminal boots into (`Switch>` vs `SW1#`).
         * Lets a lesson start where its exercises actually run.
         */
        initialMode: z.enum(['user', 'privileged', 'config']).optional(),
        /**
         * Silent seed commands run through the unrestricted engine at
         * session start (e.g. pre-fill an interface description so
         * `show running-config` has data worth saving). Never graded.
         */
        setup: z
          .array(
            z.object({
              device: z.string().optional(),
              commands: z.array(z.string()).default([]),
            }),
          )
          .default([]),
      })
      .optional(),
    /**
     * Optional Duolingo-style guided flow: an ordered list of locked steps
     * rendered by GuidedLesson.astro and enforced by guided-lesson.js.
     * `type: 'command'` steps advance when the learner successfully runs
     * `cmd` in the terminal; `type: 'action'` steps advance through a page
     * control (e.g. the topology Add button). Every other command is vetoed
     * with the step's `hint` until the current step completes.
     */
    guided: z
      .object({
        steps: z
          .array(
            z.object({
              type: z.enum(['command', 'action']),
              /** Expected terminal command for `command` steps. */
              cmd: z.string().optional(),
              /** Extra accepted spellings/abbreviations for `cmd`. */
              accepts: z.array(z.string()).default([]),
              /** Identifier for `action` steps (e.g. 'topology-add'). */
              action: z.string().optional(),
              /** Label for the action step's button. */
              buttonLabel: z.string().optional(),
              /** Scripted commands an action step runs on the device. */
              commands: z.array(z.string()).default([]),
              /** Tab to activate when the step becomes current. */
              tab: z.string().optional(),
              title: z.string(),
              instruction: z.string(),
              /** Message shown when a non-matching command is vetoed. */
              hint: z.string().optional(),
            }),
          )
          .min(2),
      })
      .optional(),
  }),
});

const lessons = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/lessons' }),
  schema: z.object({
    ...base,
    tagline: z.string().optional(),
    duration: z.string().optional(),
    stage: z.number().optional(),
    stageName: z.string().optional(),
    sections: z
      .array(
        z.object({
          title: z.string(),
          body: z.string().optional(),
          icon: z.string().optional(),
          points: z.array(z.string()).default([]),
          code: z.string().optional(),
          tip: z.string().optional(),
          table: z
            .object({ head: z.array(z.string()), rows: z.array(z.array(z.string())) })
            .optional(),
        }),
      )
      .default([]),
  }),
});

const quizzes = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/quizzes' }),
  schema: z.object({
    ...base,
    questions: z
      .array(
        z.object({
          id: z.string(),
          prompt: z.string(),
          options: z.array(z.object({ value: z.string(), text: z.string() })).min(2),
          answer: z.string(),
          explanation: z.string().optional(),
        }),
      )
      .min(1),
  }),
});

const tools = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/tools' }),
  schema: z.object({
    ...base,
    toolType: z.enum(['subnet', 'mask', 'none']).default('none'),
  }),
});

const interview = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/interview' }),
  schema: z.object({
    ...base,
    question: z.string(),
    answer: z.string(),
    followUps: z.array(z.string()).default([]),
  }),
});

const incidents = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/incidents' }),
  schema: z.object({
    ...base,
    symptom: z.string(),
    diagnosis: z.array(z.string()).default([]),
    resolution: z.string(),
    commands: z.array(z.string()).default([]),
  }),
});

const glossary = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/glossary' }),
  schema: z.object({
    ...base,
    term: z.string(),
    acronymFor: z.string().optional(),
    definition: z.string(),
  }),
});

const articles = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/articles' }),
  schema: z.object({
    ...base,
    excerpt: z.string().optional(),
    publishedAt: z.string().optional(),
  }),
});

export const collections = {
  labs,
  lessons,
  quizzes,
  tools,
  interview,
  incidents,
  glossary,
  articles,
};
