export type Sentiment = 'Positive' | 'Negative' | 'Neutral';

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  allergens?: string[];
}

export interface NlpResult {
  originalText: string;
  tokens: string[];
  sentiment: Sentiment;
  sentimentScore: number;
  keywords: string[];
  intent: string;
  entities: string[];
}

export interface ChatRecord {
  id: string;
  userMessage: string;
  botResponse: string;
  nlp: NlpResult;
  createdAt: string;
}

const positiveWords = new Set([
  'good', 'great', 'best', 'love', 'like', 'awesome', 'nice', 'delicious',
  'happy', 'thanks', 'thank', 'excellent', 'affordable', 'clean', 'fast',
  'sarap', 'masarap', 'okay', 'helpful', 'fresh', 'yummy', 'perfect',
  'recommended', 'recommend', 'available', 'ready', 'smooth', 'convenient'
]);

const negativeWords = new Set([
  'bad', 'hate', 'worst', 'sad', 'angry', 'slow', 'expensive', 'cold',
  'dirty', 'late', 'complaint', 'problem', 'issue', 'allergy', 'allergic',
  'awful', 'poor', 'wrong', 'hindi', 'mahal', 'tastes', 'taste', 'burnt',
  'salty', 'bland', 'sour', 'spoiled', 'raw', 'undercooked', 'overpriced',
  'delay', 'delayed', 'queue', 'long', 'missing'
]);

const stopWords = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'but', 'by', 'can', 'do',
  'does', 'for', 'from', 'how', 'i', 'in', 'is', 'it', 'me', 'my', 'of',
  'on', 'or', 'please', 'show', 'tell', 'the', 'this', 'to', 'what',
  'with', 'you', 'your', 'po', 'ako', 'ang', 'ng', 'sa', 'may', 'mga',
  'there', 'have', 'has', 'had', 'will', 'would', 'should', 'could'
]);

const allergenWords = ['peanut', 'peanuts', 'dairy', 'soy', 'egg', 'eggs', 'gluten', 'shellfish'];

const categoryAliases: Record<string, string[]> = {
  'Main Dishes': ['main', 'ulam', 'dish', 'dishes', 'viand'],
  'Rice Meals': ['rice', 'silog', 'meal', 'meals'],
  'Noodles & Soups': ['noodle', 'noodles', 'soup', 'soups', 'lomi', 'mami', 'lugaw', 'pancit'],
  Snacks: ['snack', 'snacks', 'bread', 'chips'],
  Desserts: ['dessert', 'desserts', 'sweet', 'sweets'],
  Beverages: ['drink', 'drinks', 'beverage', 'beverages', 'water', 'soda'],
  'Street Food': ['street', 'kwek', 'fishball', 'fishballs', 'kikiam'],
  'Add-ons': ['extra', 'extras', 'add', 'addon', 'addons', 'add-on', 'add-ons', 'rice refill']
};

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .match(/[a-z0-9]+(?:'[a-z]+)?|php\s*\d+|p\s*\d+|\d+(?:\.\d+)?/gi)
    ?.map(token => token.toLowerCase().replace(/\s+/g, '')) || [];
}

function normalizeText(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s-]/g, ' ').replace(/\s+/g, ' ').trim();
}

function editDistance(a: string, b: string): number {
  const rows = Array.from({ length: a.length + 1 }, (_, index) => [index]);
  for (let col = 1; col <= b.length; col += 1) rows[0][col] = col;
  for (let row = 1; row <= a.length; row += 1) {
    for (let col = 1; col <= b.length; col += 1) {
      const cost = a[row - 1] === b[col - 1] ? 0 : 1;
      rows[row][col] = Math.min(
        rows[row - 1][col] + 1,
        rows[row][col - 1] + 1,
        rows[row - 1][col - 1] + cost
      );
    }
  }
  return rows[a.length][b.length];
}

function isCloseMatch(nameWord: string, textWord: string): boolean {
  if (nameWord.length < 5 || textWord.length < 4) return false;
  return editDistance(nameWord, textWord) <= 1;
}

function findMenuItemMentions(text: string, menuItems: MenuItem[]): MenuItem[] {
  const normalizedText = normalizeText(text);
  const textWords = normalizedText.split(' ').filter(Boolean);

  return menuItems.filter(item => {
    const normalizedName = normalizeText(item.name);
    const nameWords = normalizedName.split(' ');
    if (normalizedText.includes(normalizedName)) return true;
    if (nameWords.every(word => textWords.includes(word))) return true;
    return nameWords.some(nameWord =>
      textWords.some(textWord => isCloseMatch(nameWord, textWord))
    );
  });
}

function findCategoryMention(text: string): string | undefined {
  const normalizedText = normalizeText(text);
  return Object.keys(categoryAliases).find(category => {
    const normalizedCategory = normalizeText(category);
    const aliases = categoryAliases[category] || [];
    return normalizedText.includes(normalizedCategory) ||
      aliases.some(alias => normalizedText.includes(normalizeText(alias)));
  });
}

function extractAllergen(text: string): string | undefined {
  return allergenWords.find(allergen => normalizeText(text).includes(allergen));
}

function extractBudget(text: string): number | undefined {
  const match = normalizeText(text).match(/(?:under|below|budget|php|p|less than|max|maximum)\s*(\d+)/);
  return match ? Number(match[1]) : undefined;
}

function wantsWithout(text: string): boolean {
  return /\b(without|no|avoid|allergy|allergic|free)\b/i.test(text);
}

function latestMentionedItem(history: ChatRecord[], menuItems: MenuItem[]): MenuItem | undefined {
  for (const record of [...history].reverse()) {
    const matches = findMenuItemMentions(`${record.userMessage} ${record.botResponse}`, menuItems);
    if (matches[0]) return matches[0];
  }
  return undefined;
}

function formatItems(items: MenuItem[]): string {
  if (items.length === 0) return '- No matching items';
  return items.map(item => `- ${item.name} (PHP ${item.price})`).join('\n');
}

function formatAllergenItems(items: MenuItem[]): string {
  if (items.length === 0) return '- No allergen-tagged items found';
  return items
    .map(item => `- ${item.name}: ${(item.allergens || []).join(', ')} (PHP ${item.price})`)
    .join('\n');
}

function getHealthyRecommendations(menuItems: MenuItem[]): MenuItem[] {
  const preferredCategories = new Set(['Main Dishes', 'Rice Meals', 'Noodles & Soups', 'Street Food', 'Add-ons']);

  return [...menuItems]
    .filter(item => preferredCategories.has(item.category))
    .sort((first, second) => {
      const firstAllergenPenalty = (first.allergens?.length || 0) * 20;
      const secondAllergenPenalty = (second.allergens?.length || 0) * 20;
      const firstPriceScore = first.price;
      const secondPriceScore = second.price;
      return (firstAllergenPenalty + firstPriceScore) - (secondAllergenPenalty + secondPriceScore);
    })
    .slice(0, 6);
}

export function extractKeywords(tokens: string[]): string[] {
  const counts = new Map<string, number>();
  tokens
    .filter(token => token.length > 2 && !stopWords.has(token))
    .forEach(token => counts.set(token, (counts.get(token) || 0) + 1));

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 8)
    .map(([token]) => token);
}

export function analyzeText(text: string, menuItems: MenuItem[]): NlpResult {
  const tokens = tokenize(text);
  const { sentiment, score } = analyzeSentiment(tokens);
  const itemEntities = findMenuItemMentions(text, menuItems).map(item => item.name);
  const category = findCategoryMention(text);
  const allergen = extractAllergen(text);

  return {
    originalText: text,
    tokens,
    sentiment,
    sentimentScore: score,
    keywords: extractKeywords(tokens),
    intent: classifyIntent(tokens, text),
    entities: [...itemEntities, ...(category ? [category] : []), ...(allergen ? [allergen] : [])]
  };
}

export function analyzeSentiment(tokens: string[]): { sentiment: Sentiment; score: number } {
  let score = 0;
  tokens.forEach((token) => {
    if (positiveWords.has(token)) score += 1;
    if (negativeWords.has(token)) score -= 1;
  });
  if (score > 0) return { sentiment: 'Positive', score };
  if (score < 0) return { sentiment: 'Negative', score };
  return { sentiment: 'Neutral', score };
}

export function classifyIntent(tokens: string[], originalText: string): string {
  const text = normalizeText(originalText);
  if (tokens.some(t => ['hi', 'hello', 'hey', 'hoy', 'oy', 'kumusta', 'kamusta'].includes(t))) return 'Greeting';
  if (/(budget|under|below|less than|max|maximum|cheap|affordable)/.test(text)) return 'Budget Inquiry';
  if (/(allergen|allergy|allergic|without|avoid|no soy|no peanut|no dairy|no egg|no gluten)/.test(text)) return 'Allergen Inquiry';
  if (/(healthy|healthiest|light|balanced|nutritious|low calorie|less oily|not oily)/.test(text)) return 'Healthy Recommendation';
  if (/(order|checkout|preorder|pre-order|buy|cart|place)/.test(text)) return 'Ordering Help';
  if (/(status|queue|track|ready|pickup|pick up|waiting|wait|late|delay)/.test(text)) return 'Queue Status Inquiry';
  if (/(gcash|cash on delivery|cod|payment|pay)/.test(text)) return 'Payment Inquiry';
  if (/(complaint|bad|wrong|late|cold|dirty|problem|issue|refund)/.test(text)) return 'Complaint';
  if (/(feedback|suggest|rate|review|love|like|great|good)/.test(text)) return 'Feedback';
  if (/(menu|food|meal|drink|price|how much|cost|available|recommend)/.test(text)) return 'Menu Inquiry';
  return 'General Inquiry';
}

export function generateSmartDineResponse(
  input: string,
  menuItems: MenuItem[],
  nlp: NlpResult,
  history: ChatRecord[] = []
): string {
  const text = normalizeText(input);
  const mentionedItems = findMenuItemMentions(input, menuItems);
  const item = mentionedItems[0] || (/(how much|price|cost|ingredients|available)/.test(text) && nlp.intent !== 'Allergen Inquiry'
    ? latestMentionedItem(history, menuItems)
    : undefined);
  const budget = extractBudget(input);
  const category = findCategoryMention(input);
  const allergen = extractAllergen(input);

  if (nlp.intent === 'Greeting') {
    return 'Hello! I am your SmartDine BU chatbot. Ask me about menu items, prices, allergens, ordering, COD, GCash, or queue status.';
  }

  if (nlp.intent === 'Ordering Help') {
    return 'To pre-order: log in with your BU email, open Menu, add food to your cart, choose a pickup time, select COD or GCash, then place the order. Track it in My Orders.';
  }

  if (nlp.intent === 'Payment Inquiry') {
    return 'SmartDine BU supports Cash on Delivery and GCash. COD is paid when you pick up the meal. GCash asks for proof of payment before confirming the order.';
  }

  if (nlp.intent === 'Queue Status Inquiry') {
    return 'You can monitor the queue in My Orders. Status moves from Order Received to Preparing, Ready for Pickup, and Completed. The pickup schedule is shown on the order details page.';
  }

  if (nlp.intent === 'Complaint') {
    return 'I recorded this as a complaint. Please include the order number, food item, and issue so canteen staff can review it quickly.';
  }

  if (nlp.intent === 'Healthy Recommendation') {
    return `Healthier SmartDine options based on lighter categories, lower price, and fewer listed allergens:\n${formatItems(getHealthyRecommendations(menuItems))}\n\nPlease still check the red allergen indicator if you have a food allergy.`;
  }

  if (allergen) {
    const safeItems = menuItems
      .filter(menuItem => !(menuItem.allergens || []).some(a => a.toLowerCase().includes(allergen.replace(/s$/, ''))))
      .slice(0, 6);
    const unsafeItems = menuItems
      .filter(menuItem => (menuItem.allergens || []).some(a => a.toLowerCase().includes(allergen.replace(/s$/, ''))))
      .slice(0, 4);

    return wantsWithout(input)
      ? `Items without ${allergen}:\n${formatItems(safeItems)}`
      : `Items that may contain ${allergen}:\n${formatItems(unsafeItems)}`;
  }

  if (nlp.intent === 'Allergen Inquiry') {
    const allergenItems = menuItems
      .filter(menuItem => (menuItem.allergens || []).length > 0)
      .slice(0, 10);

    return `Foods with listed allergens:\n${formatAllergenItems(allergenItems)}\n\nUse the red warning icon on each menu card before ordering.`;
  }

  if (item) {
    const allergenText = item.allergens?.length ? ` Allergens: ${item.allergens.join(', ')}.` : ' No listed allergens.';
    return `${item.name} costs PHP ${item.price}.${allergenText}`;
  }

  if (budget) {
    const affordable = menuItems.filter(i => i.price <= budget).sort((a, b) => a.price - b.price).slice(0, 6);
    return `Items under PHP ${budget}:\n${formatItems(affordable)}`;
  }

  if (category) {
    const catItems = menuItems.filter(i => i.category === category).slice(0, 6);
    return `Here are some ${category}:\n${formatItems(catItems)}`;
  }

  if (nlp.intent === 'Feedback') {
    return `Thanks for the feedback. Sentiment detected: ${nlp.sentiment}.`;
  }

  return "I can help with SmartDine BU menu details, prices, allergens, ordering steps, COD/GCash payment, and queue status. Try asking: 'Meals under PHP 60' or 'Food without soy'.";
}

export function createChatRecord(userMessage: string, liveMenu: MenuItem[]): ChatRecord {
  const history = getStoredChatHistory();
  const nlp = analyzeText(userMessage, liveMenu);
  return {
    id: `chat-${Date.now()}`,
    userMessage,
    botResponse: generateSmartDineResponse(userMessage, liveMenu, nlp, history),
    nlp,
    createdAt: new Date().toISOString()
  };
}

export function getStoredChatHistory(): ChatRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem('smartdine_nlp_chats') || '[]');
  } catch {
    return [];
  }
}

export function saveChatRecord(record: ChatRecord): ChatRecord[] {
  const history = [...getStoredChatHistory(), record].slice(-50);
  localStorage.setItem('smartdine_nlp_chats', JSON.stringify(history));
  return history;
}
