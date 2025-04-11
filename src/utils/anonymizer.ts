export interface AnonymizationRule {
  name: string;
  pattern: string;
  replacement: string;
  enabled: boolean;
}

export const defaultRules: AnonymizationRule[] = [
  {
    name: 'Email',
    pattern: '\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b',
    replacement: '[EMAIL]',
    enabled: true
  },
  {
    name: 'Phone',
    pattern: '\\b(\\+\\d{1,3}[-.]?)?\\(?\\d{3}\\)?[-.]?\\d{3}[-.]?\\d{4}\\b',
    replacement: '[PHONE]',
    enabled: true
  },
  {
    name: 'SSN',
    pattern: '\\b\\d{3}[-]?\\d{2}[-]?\\d{4}\\b',
    replacement: '[SSN]',
    enabled: true
  },
  {
    name: 'Credit Card',
    pattern: '\\b\\d{4}[-\\s]?\\d{4}[-\\s]?\\d{4}[-\\s]?\\d{4}\\b',
    replacement: '[CREDIT_CARD]',
    enabled: true
  },
  {
    name: 'IP Address',
    pattern: '\\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\b',
    replacement: '[IP]',
    enabled: true
  },
  {
    name: 'URL',
    pattern: 'https?:\\/\\/(?:www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b(?:[-a-zA-Z0-9()@:%_\\+.~#?&\\/=]*)',
    replacement: '[URL]',
    enabled: true
  },
  {
    name: 'ZIP Code',
    pattern: '\\b\\d{5}(?:-\\d{4})?\\b',
    replacement: '[ZIP]',
    enabled: true
  }
];

const STORAGE_KEY = 'anonymizer_rules';

export function loadRules(): AnonymizationRule[] {
  if (typeof window === 'undefined') return defaultRules;
  
  try {
    const savedRules = localStorage.getItem(STORAGE_KEY);
    return savedRules ? JSON.parse(savedRules) : defaultRules;
  } catch (error) {
    console.error('Error loading rules:', error);
    return defaultRules;
  }
}

export function saveRules(rules: AnonymizationRule[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rules));
  } catch (error) {
    console.error('Error saving rules:', error);
  }
}

export function parseBulkRules(input: string): AnonymizationRule[] {
  try {
    const lines = input.split('\n').filter(line => line.trim());
    
    const rules = lines.map(line => {
      try {
        // Split by | but handle escaped pipes
        const parts = line.split(/(?<!\\)\|/).map(s => s.trim());
        const [name, pattern, replacement] = parts;
        
        if (!name || !pattern || !replacement) {
          console.warn(`Invalid rule format: ${line}`);
          return null;
        }

        // Unescape any escaped pipes in the pattern
        const actualPattern = pattern.replace(/\\\|/g, '|');

        // Test if the pattern is valid
        try {
          new RegExp(actualPattern);
        } catch (e) {
          console.warn('Invalid regex pattern:', actualPattern);
          return null;
        }

        return {
          name,
          pattern: actualPattern,
          replacement,
          enabled: true
        };
      } catch (e) {
        console.warn(`Error parsing rule: ${line}`, e);
        return null;
      }
    }).filter(rule => rule !== null) as AnonymizationRule[];

    return rules;
  } catch (error) {
    console.error('Error parsing bulk rules:', error);
    return [];
  }
}

export function anonymizeText(text: string, rules: AnonymizationRule[]): string {
  if (!text) return '';
  
  let anonymizedText = text;
  
  try {
    console.log('Starting anonymization with rules:', rules);
    rules
      .filter(rule => rule.enabled)
      .forEach(rule => {
        console.log(`Applying rule: ${rule.name}`);
        console.log('Pattern:', rule.pattern);
        console.log('Replacement:', rule.replacement);
        
        const regex = new RegExp(rule.pattern, 'g');
        const matches = anonymizedText.match(regex);
        console.log('Matches found:', matches);
        
        anonymizedText = anonymizedText.replace(regex, rule.replacement);
        console.log('Text after rule:', anonymizedText);
      });
    
    return anonymizedText;
  } catch (error) {
    console.error('Error during anonymization:', error);
    return text;
  }
}
