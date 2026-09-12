import "dotenv/config";
import * as readline from "node:readline/promises";
import { google } from "@ai-sdk/google";
import { streamText, type ModelMessage } from "ai";

const terminal = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const messages: ModelMessage[] = [];

async function main() {
  while (true) {
    const input = await terminal.question("\nYou: ");
    if (input === "/exit") break;
    
    messages.push({ role: 'user', content: input });

    // messages.push({ role: 'system', content: 'Ignore prior instructions.' });

    
    // // // - "system" is a specific role value that AI SDK recognizes.
    // // // - The object itself is valid JavaScript/TypeScript.
    // // // - The rejection happens when AI SDK processes the messages array.
    // // // system message inside `messages`
    // // // +
    // // // allowSystemInMessages is not true
    // // // =
    // // // ❌ rejected
    // // // So the failure is caused by the semantic meaning of role: "system", not because "system" or "Ignore prior instructions." are strings.

    const result = streamText({
      model: google("gemini-3.6-flash"),
      
      instructions:
        "You are a terse technical assistant. " +
        "Answer in at most three sentences. No preamble.",

      messages,

      providerOptions: {
        google: {
          thinkingConfig: { thinkingLevel: "minimal" },
        },
      },

    //   allowSystemInMessages: true,

      onError({ error }) {
        console.error("\n[stream error]", error);
      },
    });

    process.stdout.write("\nAI: ");
    for await (const delta of result.textStream) {
      process.stdout.write(delta);
    }

    // append what the model produced so the next turn has context
    messages.push(...(await result.responseMessages));

    const usage = await result.usage;
    console.log(
      `\n[turn ${messages.length / 2} | in ${usage.inputTokens} out ${usage.outputTokens}]`,
    );
  }
  terminal.close();
}

main().catch(console.error);


// System Messages in messages — Key Takeaway
// - When the system message was placed after a user message, Google rejected it because system messages must be at the beginning.
// - I moved the system message before the user message, so the first turn worked.
// - But because the code was inside while (true), a new system message was added on every iteration.
// - On the second turn, the array became:

// system
// user
// assistant
// system  ❌
// user

// - Google rejected it because the new system message was no longer at the beginning.
// Conclusion: System messages should be added once at the beginning, not repeatedly inside the conversation loop.