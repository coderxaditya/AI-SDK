import "dotenv/config";
import { google } from "@ai-sdk/google";
import { streamText } from "ai";

async function main() {
  const start = Date.now();
  let firstChunkAt: number | undefined;

  // no await — this returns immediately
  const result = streamText({
    model: google("gemini-3.6-flash"),
    instructions: "You are terse. No preamble.",
    prompt: "Explain HTTP streaming in about 150 words.",
    providerOptions: {
      google: {
        thinkingConfig: { thinkingLevel: "minimal" },
      },
    },
    onError({ error }) {
      console.error("\n[stream error]", error);
    },
  });

  for await (const delta of result.textStream) {
    firstChunkAt ??= Date.now();

    process.stdout.write(delta);
  }
  console.log("\n---");
  console.log(
    "time to first chunk:",
    firstChunkAt ? `${firstChunkAt - start} ms` : "never — no chunks received",
  );
  console.log("total time:", Date.now() - start, "ms");
  console.log("finishReason:", await result.finishReason);
  console.log("usage:", await result.usage);
  console.log("warnings:", await result.warnings);
}

main().catch(console.error);
