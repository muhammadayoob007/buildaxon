import { BaseProvider } from '~/lib/modules/llm/base-provider';
import type { ModelInfo } from '~/lib/modules/llm/types';
import type { IProviderSetting } from '~/types/model';
import type { LanguageModelV1 } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';

export default class GroqProvider extends BaseProvider {
  name = 'Groq';
  getApiKeyLink = 'https://console.groq.com/keys';

  config = {
    apiTokenKey: 'GROQ_API_KEY',
  };

  /*
   * Fallback list used only if the live model fetch (getDynamicModels) fails.
   * Groq's lineup changes over time, so this is kept to current, stable model IDs
   * rather than older preview models that Groq has since removed.
   */
  staticModels: ModelInfo[] = [
    { name: 'openai/gpt-oss-120b', label: 'GPT OSS 120b (Groq)', provider: 'Groq', maxTokenAllowed: 131072 },
    { name: 'openai/gpt-oss-20b', label: 'GPT OSS 20b (Groq)', provider: 'Groq', maxTokenAllowed: 131072 },
    { name: 'llama-3.3-70b-versatile', label: 'Llama 3.3 70b (Groq)', provider: 'Groq', maxTokenAllowed: 131072 },
    { name: 'qwen3-32b', label: 'Qwen3 32b (Groq)', provider: 'Groq', maxTokenAllowed: 131072 },
    { name: 'llama-3.1-8b-instant', label: 'Llama 3.1 8b Instant (Groq)', provider: 'Groq', maxTokenAllowed: 131072 },
    {
      name: 'deepseek-r1-distill-llama-70b',
      label: 'Deepseek R1 Distill Llama 70b (Groq)',
      provider: 'Groq',
      maxTokenAllowed: 131072,
    },
  ];

  async getDynamicModels(
    apiKeys?: Record<string, string>,
    settings?: IProviderSetting,
    serverEnv?: Record<string, string>,
  ): Promise<ModelInfo[]> {
    const { apiKey } = this.getProviderBaseUrlAndKey({
      apiKeys,
      providerSettings: settings,
      serverEnv: serverEnv as any,
      defaultBaseUrlKey: '',
      defaultApiTokenKey: 'GROQ_API_KEY',
    });

    if (!apiKey) {
      throw `Missing Api Key configuration for ${this.name} provider`;
    }

    const response = await fetch(`https://api.groq.com/openai/v1/models`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    const res = (await response.json()) as any;

    const data = res.data.filter(
      (model: any) => model.object === 'model' && model.active && model.context_window > 8000,
    );

    return data.map((m: any) => ({
      name: m.id,
      label: `${m.id} - context ${m.context_window ? Math.floor(m.context_window / 1000) + 'k' : 'N/A'} [ by ${m.owned_by}]`,
      provider: this.name,
      maxTokenAllowed: m.context_window || 8000,
    }));
  }

  getModelInstance(options: {
    model: string;
    serverEnv: Env;
    apiKeys?: Record<string, string>;
    providerSettings?: Record<string, IProviderSetting>;
  }): LanguageModelV1 {
    const { model, serverEnv, apiKeys, providerSettings } = options;

    const { apiKey } = this.getProviderBaseUrlAndKey({
      apiKeys,
      providerSettings: providerSettings?.[this.name],
      serverEnv: serverEnv as any,
      defaultBaseUrlKey: '',
      defaultApiTokenKey: 'GROQ_API_KEY',
    });

    if (!apiKey) {
      throw new Error(`Missing API key for ${this.name} provider`);
    }

    const openai = createOpenAI({
      baseURL: 'https://api.groq.com/openai/v1',
      apiKey,
    });

    return openai(model);
  }
}
