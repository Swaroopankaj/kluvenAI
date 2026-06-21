export interface LanguageModel {
  id: string;
  name: string;
  model_name: string;
  display_name: string;
  provider: string;
  category?: string;
}

export const models: LanguageModel[] = [
  { id: 'openrouter/openrouter/free', name: 'OpenRouter Free', model_name: 'openrouter/openrouter/free', display_name: 'OpenRouter Free', provider: 'openrouter', category: 'free' },
];

export const getModels = async (): Promise<LanguageModel[]> => models;

export const getCategories = (): string[] => ['free'];
