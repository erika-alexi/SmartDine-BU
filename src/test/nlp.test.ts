import { describe, expect, it } from 'vitest';
import { analyzeText, createChatRecord, generateSmartDineResponse, tokenize, type ChatRecord } from '../app/utils/nlp';
import { menuItems } from '../app/data/menuData';

describe('SmartDine NLP module', () => {
  it('tokenizes user input for display', () => {
    expect(tokenize('Meals under PHP 60, please!')).toEqual(['meals', 'under', 'php', '60', 'please']);
  });

  it('extracts keywords and classifies budget requests', () => {
    const result = analyzeText('Recommend budget meals under 60', menuItems);

    expect(result.intent).toBe('Budget Inquiry');
    expect(result.keywords).toContain('recommend');
    expect(result.keywords).toContain('budget');
  });

  it('answers allergen exclusion questions', () => {
    const nlp = analyzeText('Food without soy', menuItems);
    const response = generateSmartDineResponse('Food without soy', menuItems, nlp);

    expect(nlp.intent).toBe('Allergen Inquiry');
    expect(response).toContain('Items without soy');
    expect(response).not.toContain('Adobo');
  });

  it('lists allergen-tagged foods for broad allergen questions', () => {
    const first = createChatRecord('Adobo?', menuItems);
    const history: ChatRecord[] = [first];
    const nlp = analyzeText('foods with allergens', menuItems);
    const response = generateSmartDineResponse('foods with allergens', menuItems, nlp, history);

    expect(nlp.intent).toBe('Allergen Inquiry');
    expect(response).toContain('Foods with listed allergens');
    expect(response).toContain('Adobo: Soy');
    expect(response).toContain('Kare-Kare: Peanuts');
  });

  it('does not reuse the previous item for a broad allergen question', () => {
    const first = createChatRecord('Adobo?', menuItems);
    const history: ChatRecord[] = [first];
    const nlp = analyzeText('allergens', menuItems);
    const response = generateSmartDineResponse('allergens', menuItems, nlp, history);

    expect(response).not.toBe('Adobo costs PHP 75. Allergens: Soy.');
    expect(response).toContain('Foods with listed allergens');
  });

  it('answers healthy recommendation questions', () => {
    const nlp = analyzeText('What are the healthiest options?', menuItems);
    const response = generateSmartDineResponse('What are the healthiest options?', menuItems, nlp);

    expect(nlp.intent).toBe('Healthy Recommendation');
    expect(response).toContain('Healthier SmartDine options');
  });

  it('uses chat history for follow-up price questions', () => {
    const first = createChatRecord('Adobo?', menuItems);
    const history: ChatRecord[] = [first];
    const nlp = analyzeText('How much?', menuItems);
    const response = generateSmartDineResponse('How much?', menuItems, nlp, history);

    expect(response).toContain('Adobo costs PHP 75');
  });
});
