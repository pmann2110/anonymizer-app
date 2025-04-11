'use client';

import { useState, useEffect } from 'react';
import { anonymizeText, defaultRules, type AnonymizationRule, loadRules, saveRules, parseBulkRules } from '../utils/anonymizer';

export default function AnonymizerForm() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [rules, setRules] = useState<AnonymizationRule[]>(defaultRules);
  const [showRules, setShowRules] = useState(false);
  const [bulkRulesInput, setBulkRulesInput] = useState('');
  const [newRule, setNewRule] = useState<AnonymizationRule>({
    name: '',
    pattern: '',
    replacement: '',
    enabled: true
  });

  useEffect(() => {
    setMounted(true);
    const savedRules = loadRules();
    setRules(savedRules);
  }, []);

  useEffect(() => {
    if (mounted) {
      saveRules(rules);
    }
  }, [rules, mounted]);

  const handleAnonymize = () => {
    const result = anonymizeText(inputText, rules);
    setOutputText(result);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(outputText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleClear = () => {
    setInputText('');
    setOutputText('');
    setCopied(false);
  };

  const addNewRule = () => {
    if (newRule.name && newRule.pattern && newRule.replacement) {
      const updatedRules = [...rules, { ...newRule }];
      setRules(updatedRules);
      saveRules(updatedRules);
      setNewRule({
        name: '',
        pattern: '',
        replacement: '',
        enabled: true
      });
    }
  };

  const handleBulkImport = () => {
    if (!bulkRulesInput.trim()) return;
    
    console.log('Attempting to parse bulk rules:', bulkRulesInput);
    const newRules = parseBulkRules(bulkRulesInput);
    console.log('Parsed rules:', newRules);
    
    if (newRules.length > 0) {
      const updatedRules = [...rules, ...newRules];
      console.log('Updated rules:', updatedRules);
      setRules(updatedRules);
      setBulkRulesInput('');
      
      // Save to localStorage immediately
      saveRules(updatedRules);
    }
  };

  const handleRuleRemove = (index: number) => {
    const updatedRules = rules.filter((_, i) => i !== index);
    setRules(updatedRules);
    saveRules(updatedRules);
  };

  const handleRuleToggle = (index: number) => {
    const updatedRules = [...rules];
    updatedRules[index].enabled = !updatedRules[index].enabled;
    setRules(updatedRules);
    saveRules(updatedRules);
  };

  const handleResetToDefaults = () => {
    setRules(defaultRules);
    saveRules(defaultRules);
  };

  if (!mounted) {
    return null;
  }

  return (
    <div suppressHydrationWarning className="w-full max-w-4xl mx-auto p-4 space-y-4">
      <div className="space-y-2">
        <label htmlFor="input" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          Enter text to anonymize:
        </label>
        <textarea
          id="input"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="w-full h-40 p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          placeholder="Enter your text here..."
          suppressHydrationWarning
        />
      </div>

      <div className="flex space-x-2">
        <button
          onClick={handleAnonymize}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          suppressHydrationWarning
        >
          Anonymize
        </button>
        <button
          onClick={handleClear}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
          suppressHydrationWarning
        >
          Clear
        </button>
        <button
          onClick={() => setShowRules(!showRules)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
          suppressHydrationWarning
        >
          {showRules ? 'Hide Rules' : 'Show Rules'}
        </button>
      </div>

      {showRules && (
        <div className="space-y-4 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Anonymization Rules</h3>
            <button
              onClick={handleResetToDefaults}
              className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Reset to Defaults
            </button>
          </div>
          
          <div className="space-y-4">
            {rules.map((rule, index) => (
              <div key={index} className="flex items-center space-x-4 p-2 bg-white dark:bg-gray-700 rounded-lg">
                <input
                  type="checkbox"
                  checked={rule.enabled}
                  onChange={() => handleRuleToggle(index)}
                  className="h-4 w-4 text-blue-600"
                />
                <span className="flex-1 text-sm font-medium">{rule.name}</span>
                <button
                  onClick={() => handleRuleRemove(index)}
                  className="text-red-500 hover:text-red-700"
                  title="Remove rule"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <div className="space-y-2 border-t pt-4 dark:border-gray-600">
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">Add New Rule</h4>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <input
                type="text"
                value={newRule.name}
                onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                placeholder="Rule name"
                className="p-2 border rounded dark:bg-gray-800 dark:border-gray-600"
              />
              <input
                type="text"
                value={newRule.pattern}
                onChange={(e) => setNewRule({ ...newRule, pattern: e.target.value })}
                placeholder="Regex pattern"
                className="p-2 border rounded dark:bg-gray-800 dark:border-gray-600"
              />
              <input
                type="text"
                value={newRule.replacement}
                onChange={(e) => setNewRule({ ...newRule, replacement: e.target.value })}
                placeholder="Replacement text"
                className="p-2 border rounded dark:bg-gray-800 dark:border-gray-600"
              />
            </div>
            <button
              onClick={addNewRule}
              className="mt-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
            >
              Add Rule
            </button>
          </div>

          <div className="space-y-2 border-t pt-4 dark:border-gray-600">
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">Bulk Import Rules</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Format: one rule per line, each line format: Name|Pattern|Replacement
            </p>
            <textarea
              value={bulkRulesInput}
              onChange={(e) => setBulkRulesInput(e.target.value)}
              placeholder="Example:&#10;Company Name|\\bABC\\b|[Company]"
              className="w-full h-32 p-2 border rounded dark:bg-gray-800 dark:border-gray-600"
            />
            <button
              onClick={handleBulkImport}
              className="mt-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors"
            >
              Import Rules
            </button>
          </div>
        </div>
      )}

      {outputText && (
        <div className="space-y-2">
          <label htmlFor="output" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Anonymized text:
          </label>
          <div className="relative">
            <textarea
              id="output"
              value={outputText}
              readOnly
              className="w-full h-40 p-3 border rounded-lg shadow-sm bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              suppressHydrationWarning
            />
            <button
              onClick={handleCopy}
              className="absolute top-2 right-2 px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors dark:bg-gray-700 dark:text-gray-200"
              suppressHydrationWarning
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
