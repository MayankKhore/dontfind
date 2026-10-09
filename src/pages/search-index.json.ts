/**
 * search-index.json.ts — static search index.
 *
 * Generated once at build time so the global ⌘K overlay can search every
 * lesson, lab, quiz, tool, question, scenario and term from any page
 * without shipping the index on every document.
 */
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { buildSearchIndex } from '../lib/content.js';

export const prerender = true;

export const GET: APIRoute = async () => {
  const [labs, lessons, quizzes, tools, interview, incidents, glossary, articles] =
    await Promise.all([
      getCollection('labs'),
      getCollection('lessons'),
      getCollection('quizzes'),
      getCollection('tools'),
      getCollection('interview'),
      getCollection('incidents'),
      getCollection('glossary'),
      getCollection('articles'),
    ]);

  const index = buildSearchIndex({
    labs,
    lessons,
    quizzes,
    tools,
    interview,
    incidents,
    glossary,
    articles,
  });

  return new Response(JSON.stringify(index), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};