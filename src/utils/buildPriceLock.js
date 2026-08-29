export function buildPriceLock(quote = {}) {
  const lockedPrice = Number(
    quote.priceLock?.lockedPrice
    ?? quote.priceBreakdown?.quotedFinalPrice
    ?? quote.priceBreakdown?.finalPrice
    ?? quote.price
    ?? 0,
  );

  if (!Number.isFinite(lockedPrice) || lockedPrice <= 0) {
    return null;
  }

  return {
    lockedPrice,
    valuationRecordId: quote.priceLock?.valuationRecordId || quote.priceBreakdown?.valuationRecordId || '',
    quizHash: quote.priceLock?.quizHash || quote.priceBreakdown?.quizHash || '',
  };
}

export function buildAgentPriceLock(offerPrice, { valuationRecordId, quizHash } = {}) {
  const lockedPrice = Number(offerPrice);
  if (!Number.isFinite(lockedPrice) || lockedPrice <= 0) return null;

  return {
    lockedPrice,
    valuationRecordId: valuationRecordId || '',
    quizHash: quizHash || '',
  };
}
