import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import type {
  Language,
  LectureNote,
  NotesDepth,
  ProjectPlan,
  SubjectCategory,
} from './src/types/study';
import { computeWindowMinutes, fitTasksIntoWindow } from './src/utils/studyLogic';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const PRIMARY_MODEL = 'gemini-4-hydrogen';
const FALLBACK_MODELS = ['gemini-3.1-flash-lite', 'gemini-2.5-flash'];
const TRANSCRIBE_MODEL = 'gemini-3.5-transcribe';

function createGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function isRetryableModelError(err: unknown): boolean {
  const msg = (err instanceof Error ? err.message : String(err)).toLowerCase();
  return (
    msg.includes('404') ||
    msg.includes('not found') ||
    msg.includes('503') ||
    msg.includes('unavailable') ||
    msg.includes('high demand') ||
    msg.includes('overloaded') ||
    msg.includes('429') ||
    msg.includes('resource_exhausted')
  );
}

async function generateWithFallbackModel(
  ai: GoogleGenAI,
  params: Omit<Parameters<GoogleGenAI['models']['generateContent']>[0], 'model'>,
  preferredModel = PRIMARY_MODEL
) {
  const candidates = Array.from(
    new Set([preferredModel, PRIMARY_MODEL, ...FALLBACK_MODELS])
  );
  let lastError: unknown;

  for (const model of candidates) {
    try {
      return await ai.models.generateContent({
        ...params,
        model,
      });
    } catch (err: unknown) {
      lastError = err;
      if (!isRetryableModelError(err)) {
        throw err;
      }
    }
  }

  throw lastError;
}

function languageInstruction(lang: Language): string {
  if (lang === 'kk') {
    return 'Write all headings, summaries, key points, questions, answers, explanations, and flashcards in natural academic Kazakh (Қазақ тілі). Keep standard technical terms clear.';
  }
  if (lang === 'ru') {
    return 'Write all headings, summaries, key points, questions, answers, explanations, and flashcards in natural academic Russian (Русский язык).';
  }
  return 'Write all headings, summaries, key points, questions, answers, explanations, and flashcards in clear academic English.';
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '25mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, service: 'SynapseStudy AI' });
  });

  app.get('/api/ai/status', (_req, res) => {
    const client = createGeminiClient();
    res.json({
      hasServerKey: Boolean(client),
      model: PRIMARY_MODEL,
      transcribeModel: TRANSCRIBE_MODEL,
      defaultLanguage: 'kk',
    });
  });

  app.post('/api/ai/transcribe', async (req, res) => {
    try {
      const { audioBase64 = '', mimeType = 'audio/mpeg', language = 'kk' } = req.body as {
        audioBase64?: string;
        mimeType?: string;
        language?: Language;
      };

      if (!audioBase64 || audioBase64.length < 16) {
        return res.status(400).json({
          error: 'No valid audio recording or file payload was provided for transcription.',
        });
      }

      const ai = createGeminiClient();
      if (!ai) {
        return res.status(400).json({
          error:
            'GEMINI_API_KEY is not configured in Settings > Secrets. Add your Gemini API key to transcribe real audio.',
        });
      }

      const langHint =
        language === 'kk'
          ? 'Transcribe the spoken audio accurately in Kazakh (or the exact language spoken in the audio) with natural punctuation and paragraph breaks. Include rough [MM:SS] timestamps at major topic transitions. Do not invent content not present in the audio.'
          : language === 'ru'
            ? 'Transcribe the spoken audio accurately in Russian (or the exact language spoken in the audio) with natural punctuation and [MM:SS] timestamps at topic shifts. Do not invent content.'
            : 'Transcribe the spoken audio verbatim with clean punctuation and [MM:SS] timestamps at topic shifts. Do not invent content.';

      const response = await generateWithFallbackModel(
        ai,
        {
          contents: {
            parts: [
              {
                inlineData: {
                  mimeType: mimeType || 'audio/mpeg',
                  data: audioBase64,
                },
              },
              {
                text: langHint,
              },
            ],
          },
        },
        TRANSCRIBE_MODEL
      );

      const transcript = (response.text ?? '').trim();
      if (!transcript) {
        return res.status(502).json({
          error: 'Transcription returned empty text. Please verify the audio contains clear speech.',
        });
      }

      return res.json({ transcript, model: TRANSCRIBE_MODEL });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Audio transcription failed.';
      return res.status(502).json({ error: msg });
    }
  });

  app.post('/api/ai/notes', async (req, res) => {
    try {
      const {
        title = '',
        transcript = '',
        subject = 'Programming',
        depth = 'deep',
        language = 'kk',
        durationMinutes = 1,
      } = req.body as {
        title?: string;
        transcript?: string;
        subject?: SubjectCategory;
        depth?: NotesDepth;
        language?: Language;
        durationMinutes?: number;
      };

      if (!transcript || transcript.trim().length < 5) {
        return res.status(400).json({
          error: 'Transcript text is required before generating AI notes.',
        });
      }

      const ai = createGeminiClient();
      if (!ai) {
        return res.status(400).json({
          error:
            'GEMINI_API_KEY is not configured in Settings > Secrets. Configure GEMINI_API_KEY to generate real Gemini study notes.',
        });
      }

      const depthGuide =
        depth === 'concise'
          ? 'Produce a tight cheat-sheet with 2-3 high-signal sections and concise bullet points.'
          : depth === 'exam'
            ? 'Optimize for university exam preparation: highlight definitions, edge cases, complexity/formulas, and tricky exam pitfalls.'
            : 'Produce comprehensive, hierarchical academic notes with clear definitions, structured bullet points, and callout insights.';

      const response = await generateWithFallbackModel(ai, {
        contents: `Transform ONLY the following raw lecture transcript into clean, structured study materials.
Do NOT invent external facts or unrelated topics — ground every section, practice question, and flashcard strictly in the transcript text below.
Remove conversational filler words, hesitations, and off-topic remarks.
${depthGuide}
${languageInstruction(language)}

Lecture Title: ${title || 'Lecture Study Notes'}
Subject: ${subject}

Transcript:
${transcript}`,
        config: {
          systemInstruction:
            'You are an elite academic intelligence engine. Output strictly valid JSON matching the provided schema. Ground all notes, 5 practice questions, and flashcards strictly in the supplied transcript text.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              executiveSummary: { type: Type.STRING },
              keyTakeaways: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              sections: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    heading: { type: Type.STRING },
                    summary: { type: Type.STRING },
                    keyPoints: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                    calloutTitle: { type: Type.STRING },
                    calloutContent: { type: Type.STRING },
                  },
                  required: ['heading', 'summary', 'keyPoints'],
                },
              },
              practiceQuestions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    question: { type: Type.STRING },
                    difficulty: { type: Type.STRING },
                    hint: { type: Type.STRING },
                    answer: { type: Type.STRING },
                    explanation: { type: Type.STRING },
                  },
                  required: ['question', 'difficulty', 'hint', 'answer', 'explanation'],
                },
              },
              flashcards: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    term: { type: Type.STRING },
                    definition: { type: Type.STRING },
                    example: { type: Type.STRING },
                  },
                  required: ['term', 'definition', 'example'],
                },
              },
            },
            required: [
              'title',
              'executiveSummary',
              'keyTakeaways',
              'sections',
              'practiceQuestions',
              'flashcards',
            ],
          },
        },
      });

      const parsed = JSON.parse((response.text ?? '{}').trim());
      const nowId = Date.now();
      const note: LectureNote = {
        id: `note-${nowId}`,
        title: parsed.title || title || 'Lecture Study Notes',
        subject,
        durationMinutes: Math.max(1, durationMinutes),
        createdAt: new Date().toISOString().slice(0, 10),
        language,
        depth,
        engine: 'gemini',
        rawTranscript: transcript.trim(),
        executiveSummary: parsed.executiveSummary || '',
        keyTakeaways: Array.isArray(parsed.keyTakeaways) ? parsed.keyTakeaways : [],
        sections: (Array.isArray(parsed.sections) ? parsed.sections : []).map(
          (
            s: {
              heading: string;
              summary: string;
              keyPoints: string[];
              calloutTitle?: string;
              calloutContent?: string;
            },
            idx: number
          ) => ({
            id: `sec-${nowId}-${idx + 1}`,
            heading: s.heading,
            summary: s.summary,
            keyPoints: Array.isArray(s.keyPoints) ? s.keyPoints : [],
            callout:
              s.calloutTitle && s.calloutContent
                ? { title: s.calloutTitle, content: s.calloutContent }
                : undefined,
          })
        ),
        practiceQuestions: (
          Array.isArray(parsed.practiceQuestions) ? parsed.practiceQuestions : []
        )
          .slice(0, 5)
          .map(
            (
              q: {
                question: string;
                difficulty?: string;
                hint: string;
                answer: string;
                explanation: string;
              },
              idx: number
            ) => ({
              id: `q-${nowId}-${idx + 1}`,
              question: q.question,
              difficulty:
                q.difficulty === 'Challenge' || q.difficulty === 'Applied'
                  ? q.difficulty
                  : 'Core',
              hint: q.hint || '',
              answer: q.answer,
              explanation: q.explanation,
            })
          ),
        flashcards: (Array.isArray(parsed.flashcards) ? parsed.flashcards : []).map(
          (c: { term: string; definition: string; example: string }, idx: number) => ({
            id: `fc-${nowId}-${idx + 1}`,
            term: c.term,
            definition: c.definition,
            example: c.example || '',
            mastered: false,
          })
        ),
      };

      return res.json({ note, engine: 'gemini' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to generate AI notes.';
      return res.status(502).json({ error: msg });
    }
  });

  app.post('/api/ai/tasks', async (req, res) => {
    try {
      const {
        title = '',
        transcript = '',
        subject = 'Programming',
        language = 'kk',
      } = req.body as {
        title?: string;
        transcript?: string;
        subject?: SubjectCategory;
        language?: Language;
      };

      if (!transcript || transcript.trim().length < 5) {
        return res.status(400).json({
          error: 'Transcript text is required before generating practical tasks.',
        });
      }

      const ai = createGeminiClient();
      if (!ai) {
        return res.status(400).json({
          error:
            'GEMINI_API_KEY is not configured in Settings > Secrets. Add your Gemini API key to generate practical tasks.',
        });
      }

      const response = await generateWithFallbackModel(ai, {
        contents: `Create practical hands-on exercises, self-test problems, and active recall flashcards based STRICTLY on the following lecture transcript.
Do NOT invent unrelated concepts. Every exercise and flashcard must test comprehension or practical application of the concepts discussed in the transcript.
${languageInstruction(language)}

Lecture Title: ${title || 'Lecture Study Session'}
Subject: ${subject}

Transcript:
${transcript}`,
        config: {
          systemInstruction:
            'You are an expert academic tutor creating practical tasks, coding/analytical exercises, self-test questions, and flashcards. Output strictly valid JSON matching the schema.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              practiceQuestions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    question: { type: Type.STRING },
                    difficulty: { type: Type.STRING },
                    hint: { type: Type.STRING },
                    answer: { type: Type.STRING },
                    explanation: { type: Type.STRING },
                  },
                  required: ['question', 'difficulty', 'hint', 'answer', 'explanation'],
                },
              },
              flashcards: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    term: { type: Type.STRING },
                    definition: { type: Type.STRING },
                    example: { type: Type.STRING },
                  },
                  required: ['term', 'definition', 'example'],
                },
              },
            },
            required: ['practiceQuestions', 'flashcards'],
          },
        },
      });

      const parsed = JSON.parse((response.text ?? '{}').trim());
      const nowId = Date.now();
      const practiceQuestions = (
        Array.isArray(parsed.practiceQuestions) ? parsed.practiceQuestions : []
      )
        .slice(0, 6)
        .map(
          (
            q: {
              question: string;
              difficulty?: string;
              hint: string;
              answer: string;
              explanation: string;
            },
            idx: number
          ) => ({
            id: `tq-${nowId}-${idx + 1}`,
            question: q.question,
            difficulty:
              q.difficulty === 'Challenge' || q.difficulty === 'Applied'
                ? q.difficulty
                : 'Core',
            hint: q.hint || '',
            answer: q.answer,
            explanation: q.explanation,
          })
        );

      const flashcards = (
        Array.isArray(parsed.flashcards) ? parsed.flashcards : []
      ).map((c: { term: string; definition: string; example: string }, idx: number) => ({
        id: `tfc-${nowId}-${idx + 1}`,
        term: c.term,
        definition: c.definition,
        example: c.example || '',
        mastered: false,
      }));

      return res.json({ practiceQuestions, flashcards, engine: 'gemini' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to generate practical tasks.';
      return res.status(502).json({ error: msg });
    }
  });

  app.post('/api/ai/project-plan', async (req, res) => {
    try {
      const {
        title = '',
        description = '',
        subject = 'Programming',
        deadlineDays = 5,
        dailyHours = 2.5,
        startTimeWindow = '18:30',
        endTimeWindow = '21:00',
        goalMode = 'deep_learning',
        language = 'kk',
      } = req.body as {
        title?: string;
        description?: string;
        subject?: SubjectCategory;
        deadlineDays?: number;
        dailyHours?: number;
        startTimeWindow?: string;
        endTimeWindow?: string;
        goalMode?: 'finish' | 'deep_learning';
        language?: Language;
      };

      if (!title.trim() || !description.trim()) {
        return res.status(400).json({
          error: 'Project title and detailed description are required.',
        });
      }

      const windowMins = computeWindowMinutes(startTimeWindow, endTimeWindow);
      if (windowMins < 30) {
        return res.status(400).json({
          error: 'Daily time window must be at least 30 minutes.',
        });
      }

      const ai = createGeminiClient();
      if (!ai) {
        return res.status(400).json({
          error:
            'GEMINI_API_KEY is not configured in Settings > Secrets. Add your Gemini API key to generate a real project roadmap.',
        });
      }

      const cappedDays = Math.max(1, Math.min(30, Math.round(deadlineDays)));
      const effectiveDailyMins = Math.min(windowMins, Math.round(dailyHours * 60));

      const response = await generateWithFallbackModel(ai, {
        contents: `Design a strictly time-boxed, day-by-day execution roadmap for the following student project.
Project Title: ${title}
Description & Tech Stack: ${description}
Total Days: ${cappedDays}
Daily Time Window: ${startTimeWindow} to ${endTimeWindow} (${effectiveDailyMins} minutes max per day)
Goal Mode: ${
          goalMode === 'deep_learning'
            ? 'Deep Learning Mode — student must both finish the project AND 100% master every underlying concept with dedicated review & checkpoint quiz each day.'
            : 'Execution Focus — ship the complete working project cleanly by the deadline.'
        }
${languageInstruction(language)}

For each day (1..${cappedDays}), provide 3-4 concrete time-boxed tasks whose total estimatedMinutes fit within ${effectiveDailyMins} minutes, plus 2 daily checkpoint quiz questions.`,
        config: {
          systemInstruction:
            'You are a precision academic project planner. Output valid JSON strictly adhering to the schema. Keep days count realistic (up to 14 detailed days if deadline > 14, or exact days if <= 14).',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              days: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    dayNumber: { type: Type.INTEGER },
                    theme: { type: Type.STRING },
                    tasks: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          title: { type: Type.STRING },
                          focusArea: { type: Type.STRING },
                          estimatedMinutes: { type: Type.INTEGER },
                          keyConcepts: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                          },
                          type: { type: Type.STRING },
                        },
                        required: [
                          'title',
                          'focusArea',
                          'estimatedMinutes',
                          'keyConcepts',
                          'type',
                        ],
                      },
                    },
                    checkpointQuiz: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          prompt: { type: Type.STRING },
                          options: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                          },
                          correctIndex: { type: Type.INTEGER },
                          explanation: { type: Type.STRING },
                        },
                        required: ['prompt', 'options', 'correctIndex', 'explanation'],
                      },
                    },
                  },
                  required: ['dayNumber', 'theme', 'tasks', 'checkpointQuiz'],
                },
              },
            },
            required: ['days'],
          },
        },
      });

      const parsed = JSON.parse((response.text ?? '{}').trim());
      const nowId = Date.now();
      const today = new Date();
      const rawDays = Array.isArray(parsed.days) ? parsed.days : [];

      const days = rawDays.map(
        (
          d: {
            dayNumber?: number;
            theme: string;
            tasks: Array<{
              title: string;
              focusArea: string;
              estimatedMinutes: number;
              keyConcepts: string[];
              type: 'setup' | 'core' | 'learning' | 'review';
            }>;
            checkpointQuiz: Array<{
              prompt: string;
              options: string[];
              correctIndex: number;
              explanation: string;
            }>;
          },
          idx: number
        ) => {
          const dayNumber = d.dayNumber || idx + 1;
          const dateObj = new Date(today);
          dateObj.setDate(today.getDate() + idx);
          const packedTasks = fitTasksIntoWindow(
            Array.isArray(d.tasks) ? d.tasks : [],
            startTimeWindow,
            endTimeWindow,
            effectiveDailyMins
          ).map((t, tIdx) => ({
            ...t,
            id: `p-${nowId}-d${dayNumber}-t${tIdx + 1}`,
          }));

          return {
            dayNumber,
            dateLabel: dateObj.toISOString().slice(0, 10),
            theme: d.theme,
            totalMinutes: packedTasks.reduce((s, t) => s + t.estimatedMinutes, 0),
            tasks: packedTasks,
            checkpointQuiz: (Array.isArray(d.checkpointQuiz) ? d.checkpointQuiz : []).map(
              (q, qIdx) => ({
                id: `cp-${nowId}-${dayNumber}-${qIdx + 1}`,
                prompt: q.prompt,
                options: Array.isArray(q.options) ? q.options : [],
                correctIndex: typeof q.correctIndex === 'number' ? q.correctIndex : 0,
                explanation: q.explanation || '',
              })
            ),
            checkpointCompleted: false,
          };
        }
      );

      const plan: ProjectPlan = {
        id: `proj-${nowId}`,
        title: title.trim(),
        description: description.trim(),
        subject,
        deadlineDays: cappedDays,
        dailyHours,
        startTimeWindow,
        endTimeWindow,
        goalMode,
        language,
        engine: 'gemini',
        createdAt: today.toISOString().slice(0, 10),
        days,
      };

      return res.json({ plan, engine: 'gemini' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to generate project plan.';
      return res.status(502).json({ error: msg });
    }
  });

  app.use('/api', (_req, res) => {
    res.status(404).json({ error: 'API endpoint not found.' });
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SynapseStudy AI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
