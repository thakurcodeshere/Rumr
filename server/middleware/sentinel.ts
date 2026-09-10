export interface ModerationResult {
  allowed: boolean;
  reason?: string;
  category?: 'constraint' | 'doxxing' | 'toxicity' | 'policy';
  suggestedAlternative?: string;
}

// 1. Hard constraint validator: Topic title must be <= 3 words
export function validateTopicTitle(title: string): ModerationResult {
  const clean = title.trim();
  if (!clean) {
    return {
      allowed: false,
      reason: 'Topic title cannot be empty.',
      category: 'constraint'
    };
  }

  const words = clean.split(/\s+/);
  if (words.length > 3) {
    return {
      allowed: false,
      reason: 'Hard Constraint: Maximum 3 words allowed. Rumr forces extreme focus on debate nodes.',
      category: 'constraint',
      suggestedAlternative: words.slice(0, 3).join(' ')
    };
  }

  // Defamation and personal accusation intercept
  const lower = clean.toLowerCase();
  const personalTargetingPatterns = [
    /\b(rahul|priya|amit|sneha|rohit|ananya|john|sarah)\b/,
    /\b(cheated|cheating|stole|steals|thief|fraud|fired|scammed)\b/,
    /\b(boss steals|manager is|vp is|director is)\b/
  ];

  for (const pattern of personalTargetingPatterns) {
    if (pattern.test(lower)) {
      return {
        allowed: false,
        reason: 'AI Policy Intercept: Personal accusations/targeting not permitted under DPDP Act & Safety Guardrails.',
        category: 'policy',
        suggestedAlternative: 'Convert to systemic debate: e.g. "Why People Cheat" or "Workplace Drama".'
      };
    }
  }

  return { allowed: true };
}

// 2. Chat and rumor content moderation: Intercepts ad-hominem, doxxing, PII
export function moderateContent(text: string): ModerationResult {
  const clean = text.trim();
  if (!clean) {
    return { allowed: false, reason: 'Content cannot be empty.', category: 'constraint' };
  }

  // PII & Doxxing detection: phone numbers, emails, addresses
  const phonePattern = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
  const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  
  if (phonePattern.test(clean)) {
    return {
      allowed: false,
      reason: 'AI Sentinel Alert: Phone numbers and cleartext contact coordinates are strictly quarantined.',
      category: 'doxxing'
    };
  }

  if (emailPattern.test(clean)) {
    return {
      allowed: false,
      reason: 'AI Sentinel Alert: Personal email addresses cannot be broadcast in unencrypted channels.',
      category: 'doxxing'
    };
  }

  // Hostility, harassment, ad-hominem patterns
  const lower = clean.toLowerCase();
  const hostileKeywords = [
    'stupid', 'idiot', 'moron', 'dumb', 'loser', 'hate you', 'doxx', 'dox',
    'kill yourself', 'shut up', 'ugly', 'scumbag', 'worthless'
  ];

  for (const kw of hostileKeywords) {
    if (lower.includes(kw)) {
      return {
        allowed: false,
        reason: 'AI Moderation Sentinel detected hostile or ad-hominem patterns. Rumr emphasizes intellectual friction over personal attacks.',
        category: 'toxicity'
      };
    }
  }

  return { allowed: true };
}
