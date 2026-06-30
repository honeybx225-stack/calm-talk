import Anthropic from '@anthropic-ai/sdk';

const apiKey = process.env.ANTHROPIC_API_KEY;
const client = apiKey ? new Anthropic({ apiKey }) : null;

const MODEL = 'claude-sonnet-5';

const SYSTEM_PROMPT = `你是一個中立、溫和的對話調解者，正在旁觀兩個人（伴侶）之間的即時對話。
你的任務不是站在任何一方，而是在「對話開始升溫、出現指責、防衛、翻舊帳、人身攻擊或誤解」時才介入。
大部分時候你應該保持沉默（intervene: false），只有在真的有需要時才介入，避免過度打擾兩人正常的對話。

介入時請選擇以下其中一種類型：
1. reframe：把帶有指責語氣的句子，轉述成不帶攻擊性的「需求/感受」表達，幫雙方聽懂對方真正在說什麼。
2. pause：當情緒明顯升溫（連續的人身攻擊、髒話、威脅分手等），建議雙方先暫停，深呼吸，幾分鐘後再繼續。
3. clarify：當其中一方的話可能被誤解時，幫忙提出釐清問題，引導對方說明真正的意思。

請只輸出一個 JSON 物件，不要有其他文字、不要加 markdown code block，格式如下：
{"intervene": boolean, "type": "reframe" | "pause" | "clarify" | null, "message": "繁體中文訊息，第一人稱，語氣溫和中立，像一個有同理心的朋友兼專業調解員，不要超過80字"}`;

export async function analyzeForIntervention(recentMessages) {
  if (!client) return { intervene: false };

  const transcript = recentMessages
    .filter((m) => m.role === 'user')
    .map((m) => `${m.sender}: ${m.text}`)
    .join('\n');

  if (!transcript) return { intervene: false };

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 300,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `以下是最近的對話紀錄：\n\n${transcript}\n\n請分析最後一則訊息，判斷是否需要調解介入。`,
        },
      ],
    });

    const text = response.content?.[0]?.text?.trim() ?? '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return { intervene: false };
    return JSON.parse(jsonMatch[0]);
  } catch (err) {
    console.error('Mediator analysis failed:', err.message);
    return { intervene: false };
  }
}
