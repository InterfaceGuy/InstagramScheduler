export interface Post {
  id: string;
  title: string;
  image: string;
  caption: string;
  published: boolean;
  publishedAt?: string;
  createdAt: string;
}

export interface GeminiResponse {
  caption: string;
  suggestedTitle: string;
}
