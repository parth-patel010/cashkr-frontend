import { createContext, useState } from 'react';

export const QuoteContext = createContext(null);

export function QuoteProvider({ children }) {
  const [quote, setQuote] = useState({
    device: null,
    storage: null,
    condition: null,
    screenCondition: null,
    functionalIssues: [],
    accessories: null,
    priceBreakdown: null,
    // Laptop-specific fields
    ram: null,
    storageType: null,
    yearBracket: null,
  });

  const updateQuote = (updates) => {
    setQuote(prev => ({ ...prev, ...updates }));
  };

  const resetQuote = () => {
    setQuote({
      device: null, storage: null, condition: null,
      screenCondition: null, functionalIssues: [],
      accessories: null, priceBreakdown: null,
      ram: null, storageType: null, yearBracket: null,
    });
  };

  return (
    <QuoteContext.Provider value={{ quote, updateQuote, resetQuote }}>
      {children}
    </QuoteContext.Provider>
  );
}
