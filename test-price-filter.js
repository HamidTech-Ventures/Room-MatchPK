// Test script to debug price filtering issue
console.log('Testing price range filter...');

// Simulate the filter logic
function testPriceFilter(minPrice, maxPrice) {
  console.log('\n=== TESTING PRICE FILTER ===');
  console.log(`minPrice: ${minPrice}, maxPrice: ${maxPrice}`);
  
  if (minPrice && maxPrice) {
    const min = parseInt(minPrice);
    const max = parseInt(maxPrice);
    
    console.log(`Parsed min: ${min}, max: ${max}`);
    
    // Check if it's considered wide open range
    const isWideOpenRange = (min === 0 && max === 999999);
    console.log(`Is wide open range: ${isWideOpenRange}`);
    
    if (!isWideOpenRange) {
      const filter = {
        $and: [{
          $or: [
            { 'pricing.pricePerBed': { $gte: min, $lte: max } },
            { 'pricePerBed': { $gte: min, $lte: max } },
            { 'monthlyRent': { $gte: min, $lte: max } }
          ]
        }]
      };
      console.log('Generated filter:', JSON.stringify(filter, null, 2));
      return filter;
    } else {
      console.log('No filter applied (wide open range)');
      return {};
    }
  } else {
    console.log('No price parameters provided');
    return {};
  }
}

// Test with your actual values
testPriceFilter('21500', '50000');

// Test with properties that should match
const sampleProperties = [
  { title: 'Property 1', pricing: { pricePerBed: 25000 } },
  { title: 'Property 2', pricing: { pricePerBed: 10000 } }, // Should be filtered out
  { title: 'Property 3', pricing: { pricePerBed: 30000 } },
  { title: 'Property 4', pricePerBed: 22000 }, // Old structure
  { title: 'Property 5', monthlyRent: 35000 }  // House/apartment
];

console.log('\n=== TESTING PROPERTY MATCHES ===');
const min = 21500, max = 50000;

sampleProperties.forEach(prop => {
  const pricingPrice = prop.pricing?.pricePerBed;
  const rootPrice = prop.pricePerBed;
  const monthlyPrice = prop.monthlyRent;
  
  const matches = (
    (pricingPrice && pricingPrice >= min && pricingPrice <= max) ||
    (rootPrice && rootPrice >= min && rootPrice <= max) ||
    (monthlyPrice && monthlyPrice >= min && monthlyPrice <= max)
  );
  
  console.log(`${prop.title}: pricing.pricePerBed=${pricingPrice}, pricePerBed=${rootPrice}, monthlyRent=${monthlyPrice} -> Match: ${matches}`);
});
