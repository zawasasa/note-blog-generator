
import { GoogleGenAI, Type, Chat, GenerateContentResponse } from "@google/genai";
import { ArticleSection, LengthSuggestion } from '../types';
import { SYSTEM_PROMPT } from '../constants';

// 環境変数のチェックを一時的に無効化（開発用）
const apiKey = import.meta.env.VITE_API_KEY || import.meta.env.GEMINI_API_KEY || 'dummy_key_for_development';
if (!apiKey || apiKey === 'dummy_key_for_development') {
    console.warn("API key is not set. Some features may not work properly.");
}

const ai = new GoogleGenAI({ apiKey });
let chat: Chat | null = null;

const titleSuggestionSchema = {
  type: Type.OBJECT,
  properties: {
    titles: {
      type: Type.ARRAY,
      description: 'キャッチーでSEOに強いタイトル5つ。「〇〇した話」で終わる必要があります。',
      items: { type: Type.STRING }
    }
  },
  required: ['titles']
};

const lengthSuggestionSchema = {
  type: Type.OBJECT,
  properties: {
    suggestions: {
      type: Type.ARRAY,
      description: 'テープ起こしの内容に基づいて適切な文字数の提案',
      items: {
        type: Type.OBJECT,
        properties: {
          length: { type: Type.NUMBER, description: '提案する文字数' },
          description: { type: Type.STRING, description: '文字数の説明（例：1500字程度）' },
          reason: { type: Type.STRING, description: 'この文字数を提案する理由' }
        },
        required: ['length', 'description', 'reason']
      }
    }
  },
  required: ['suggestions']
};

export async function getInitialSuggestions(transcript: string): Promise<{ titles: string[], lengthSuggestions: LengthSuggestion[] }> {
    // APIキーが無効な場合のモックデータ
    const apiKey = import.meta.env.VITE_API_KEY || import.meta.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'dummy_key_for_development') {
        console.warn("Using mock data due to missing API key");
        return {
            titles: [
                "テープ起こしからnote記事を書いた話",
                "AIを使ってブログ記事を生成した話", 
                "音声をテキストに変換して記事にした話",
                "自動でnote記事を作成した話",
                "テープ起こしを活用して記事を書いた話"
            ],
            lengthSuggestions: [
                { length: 1500, description: "1500字程度", reason: "コンパクトに要点をまとめる" },
                { length: 2000, description: "2000字程度", reason: "標準的な長さ" },
                { length: 3000, description: "3000字程度", reason: "詳細に展開" },
                { length: 5000, description: "5000字程度", reason: "ボリューミーに展開" }
            ]
        };
    }
    const prompt = `あなたはプロのブログライターです。テープ起こしを提供しますので、それを分析してブログ記事の構成を提案してください。

1. テープ起こしを注意深く読み、主要なテーマと内容の豊富さを理解してください。
2. SEOを意識したキャッチーなタイトルを5つ提案してください。各タイトルは必ず「〇〇した話」で終わるようにしてください。
3. テープ起こしの内容を分析し、適切な文字数を4つの選択肢で提案してください：
   - 1500字程度（コンパクトに要点をまとめる）
   - 2000字程度（標準的な長さ）
   - 3000字程度（詳細に展開）
   - 5000字程度（ボリューミーに展開）

各文字数提案には、なぜその文字数が適切かを説明してください。

テープ起こし:
---
${transcript}
---

指定されたJSON形式で応答を提供してください。`;

    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    titles: titleSuggestionSchema.properties.titles,
                    lengthSuggestions: lengthSuggestionSchema.properties.suggestions
                },
                required: ['titles', 'lengthSuggestions']
            },
        },
    });

    try {
        const jsonText = response.text.trim();
        const suggestions = JSON.parse(jsonText);
        // Basic validation
        if (!suggestions.titles || !suggestions.lengthSuggestions) {
            throw new Error("AIから返されたJSONの構造が無効です。");
        }
        return suggestions;
    } catch (e) {
        console.error("AIの応答の解析に失敗しました:", response.text);
        throw new Error("AIからの提案を解析できませんでした。");
    }
}

function initializeChat() {
    if (chat) return;
    chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: SYSTEM_PROMPT,
        },
    });
}

export async function* continueChatStream(message: string): AsyncGenerator<string, void, undefined> {
    // APIキーが無効な場合のモックデータ
    const apiKey = import.meta.env.VITE_API_KEY || import.meta.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'dummy_key_for_development') {
        console.warn("Using mock article due to missing API key");
        const mockArticle = `# テープ起こしからnote記事を書いた話

これはAPIキーが設定されていない場合のモック記事です。実際に使用するには、有効なGemini APIキーを設定してください。

## はじめに

テープ起こしからnote記事を自動生成するアプリケーションについて説明します。

## 主な機能

- テキストファイルのアップロード
- AIによる記事タイトルの提案
- 文字数の選択
- 自動記事生成

## まとめ

このアプリケーションを使えば、誰でも簡単にnote記事を作成できます。`;

        for (const char of mockArticle) {
            yield char;
            // リアルタイム感を出すために少し待機
            await new Promise(resolve => setTimeout(resolve, 10));
        }
        return;
    }

    if (!chat) {
        initializeChat();
    }
    
    if (chat) {
        const response = await chat.sendMessageStream({ message });
        for await (const chunk of response) {
            yield chunk.text;
        }
    } else {
        throw new Error("チャットが初期化されていません。");
    }
}