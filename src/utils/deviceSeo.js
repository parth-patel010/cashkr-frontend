import { formatCurrency } from './formatCurrency';

export function getDevicePriceRange(device) {
  if (!device?.variants?.length) return { minPrice: null, maxPrice: null };
  const prices = device.variants.map((v) => v.basePrice);
  return { minPrice: Math.min(...prices), maxPrice: Math.max(...prices) };
}

export function getDeviceSeoMeta(device, { brand, pathPrefix, categoryLabel = 'device' }) {
  const brandName = brand.charAt(0).toUpperCase() + brand.slice(1);
  const { minPrice, maxPrice } = getDevicePriceRange(device);
  const priceText = maxPrice ? ` — Get Up to ${formatCurrency(maxPrice)}` : '';

  return {
    title: `Sell ${device.modelName} Online${priceText}`,
    description: `Sell your used ${device.modelName} online with DeviceKart. Instant quote, free doorstep pickup across India, and secure payment via UPI or bank transfer after verification.`,
    path: `${pathPrefix}/${brand}/${device.slug}`,
    image: device.imageUrl || undefined,
    brandName,
    minPrice,
    maxPrice,
    categoryLabel,
  };
}

export function getModelSeoContent(device, brandName) {
  const { minPrice, maxPrice } = getDevicePriceRange(device);
  const priceRange =
    minPrice != null && maxPrice != null
      ? `Prices typically range from ${formatCurrency(minPrice)} to ${formatCurrency(maxPrice)} depending on storage variant and condition.`
      : '';

  return {
    paragraph: `Looking to sell your ${device.modelName}? DeviceKart offers a hassle-free way to convert your used ${brandName} ${device.modelName} into instant cash. ${priceRange} Simply select your storage variant, answer a few condition questions, and schedule free doorstep pickup anywhere in India.`,
    faqs: [
      {
        q: `How much can I get for my ${device.modelName}?`,
        a: `Your ${device.modelName} price depends on storage capacity and condition. Use DeviceKart's instant quote tool to get an accurate estimate in seconds.`,
      },
      {
        q: `How do I sell my ${device.modelName} on DeviceKart?`,
        a: `Select your ${device.modelName} variant, verify your pincode, complete the condition quiz, and schedule free pickup. Payment is processed after verification.`,
      },
      {
        q: `Does DeviceKart offer free pickup for ${device.modelName}?`,
        a: `Yes, DeviceKart provides free doorstep pickup for ${device.modelName} across 2,000+ cities in India with no hidden charges.`,
      },
    ],
  };
}
