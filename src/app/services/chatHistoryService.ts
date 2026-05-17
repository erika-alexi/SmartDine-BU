import { supabase } from '../lib/supabase';
import type { ChatRecord } from '../utils/nlp';

export async function saveNlpChatMessage(record: ChatRecord, userId?: string) {
  if (!supabase || !userId) return;

  const { error } = await supabase.from('nlp_chat_messages').insert({
    id: record.id,
    user_id: userId,
    user_message: record.userMessage,
    bot_response: record.botResponse,
    sentiment: record.nlp.sentiment,
    sentiment_score: record.nlp.sentimentScore,
    intent: record.nlp.intent,
    tokens: record.nlp.tokens,
    keywords: record.nlp.keywords,
    entities: record.nlp.entities,
    nlp_payload: record.nlp
  });

  if (error) {
    console.warn('NLP chat was kept locally because Supabase storage failed:', error.message);
  }
}
