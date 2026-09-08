import 'dotenv/config';
import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

async function main() {
  const result = await generateText({
    model: google("gemini-3.6-flash"),
    prompt: 'Choose a number between 1 to 30',
  });

  console.log('Output:', result.text);
  console.log('finishReason:', result.finishReason);
  console.log('usage:', result.usage);
  console.log('warnings:', result.warnings);
  console.log('google metadata:', result.providerMetadata?.google);
}

main().catch((err) => {
  console.error('name:', err.name);
  console.error('message:', err.message);
  process.exit(1);
});