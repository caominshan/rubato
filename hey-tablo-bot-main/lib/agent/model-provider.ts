import { OpenAIProvider } from "@openai/agents";

export type ModelProviderName = "openai" | "qwen";

export type ModelRuntimeConfig = {
  providerName: ModelProviderName;
  model: string;
  apiKey: string | undefined;
  missingKeyName: "OPENAI_API_KEY" | "DASHSCOPE_API_KEY";
  modelProvider?: OpenAIProvider;
  tracingDisabled: boolean;
};

const QWEN_BASE_URL = "https://dashscope.aliyuncs.com/compatible-mode/v1";

export function getModelRuntimeConfig(): ModelRuntimeConfig {
  const providerName = normalizeProvider(process.env.MODEL_PROVIDER);

  if (providerName === "qwen") {
    const apiKey = process.env.DASHSCOPE_API_KEY;

    return {
      providerName,
      model: process.env.QWEN_MODEL || "qwen-plus",
      apiKey,
      missingKeyName: "DASHSCOPE_API_KEY",
      modelProvider: apiKey
        ? new OpenAIProvider({
            apiKey,
            baseURL: process.env.QWEN_BASE_URL || QWEN_BASE_URL,
            useResponses: false,
          })
        : undefined,
      // OpenAI's hosted trace exporter uses an OpenAI credential. The app still
      // records its own trace id, tool calls, statuses, and duration for Qwen.
      tracingDisabled: true,
    };
  }

  return {
    providerName,
    model: process.env.OPENAI_MODEL || "gpt-5-mini",
    apiKey: process.env.OPENAI_API_KEY,
    missingKeyName: "OPENAI_API_KEY",
    tracingDisabled: process.env.OPENAI_AGENTS_DISABLE_TRACING === "1",
  };
}

function normalizeProvider(value: string | undefined): ModelProviderName {
  return value?.trim().toLowerCase() === "qwen" ? "qwen" : "openai";
}
