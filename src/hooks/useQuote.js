import { useContext } from 'react';
import { QuoteContext } from '../context/QuoteContext';
export const useQuote = () => useContext(QuoteContext);
