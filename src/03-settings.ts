import 'dotenv/config';
import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

const model = google('gemini-3.6-flash');
const prompt = 'Name three sci-fi novels. One line each, no commentary.';

// label = human-readable name identifying which experiment/settings produced that output.
// "The settings parameter must be an object/dictionary whose keys are strings and whose values can be of any type."
async function run(label: string, settings: Record<string, unknown>) {
  const t = Date.now();
  const r = await generateText({ model, prompt, reasoning: 'minimal', ...settings });
  console.log(`\n=== ${label} (${Date.now() - t}ms) ===`);
  console.log(r.text);
  console.log('finishReason:', r.finishReason, '| out:', r.usage.outputTokens);
  if (r.warnings?.length) console.log('WARNINGS:', r.warnings);
}

async function main() {
  await run('baseline', {});
  await run('temp 0 (a)', { temperature: 0 });
  await run('temp 0 (b)', { temperature: 0 });
  await run('temp 2', { temperature: 2 });
  await run('capped', { maxOutputTokens: 20 });
  await run('stop seq', { stopSequences: ['2.'] });
  await run('seeded', { temperature: 1, seed: 42 });
  await run('bogus', { topK: 5, presencePenalty: 1.5, frequencyPenalty: 1.5 });
}

main().catch(console.error);