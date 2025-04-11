interface AnonymizationRules {
  [key: string]: {
    pattern: RegExp;
    replacement: string;
  }
}

const anonymizationRules: AnonymizationRules = {
  email: {
    pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    replacement: '[EMAIL]'
  },
  phone: {
    pattern: /\b(\+\d{1,3}[-.]?)?\(?\d{3}\)?[-.]?\d{3}[-.]?\d{4}\b/g,
    replacement: '[PHONE]'
  },
  date: {
    pattern: /\b\d{1,2}[-/]\d{1,2}[-/]\d{2,4}\b/g,
    replacement: '[DATE]'
  },
  name: {
    pattern: /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g,
    replacement: '[NAME]'
  },
  ssn: {
    pattern: /\b\d{3}[-]?\d{2}[-]?\d{4}\b/g,
    replacement: '[SSN]'
  },
  creditCard: {
    pattern: /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g,
    replacement: '[CREDIT_CARD]'
  }
};

export function anonymizeText(text: string): string {
  if (!text) return '';
  
  let anonymizedText = text;
  
  try {
    Object.entries(anonymizationRules).forEach(([_, rule]) => {
      anonymizedText = anonymizedText.replace(rule.pattern, rule.replacement);
    });
    
    return anonymizedText;
  } catch (error) {
    console.error('Error during anonymization:', error);
    return text;
  }
}
