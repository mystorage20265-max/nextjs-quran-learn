/**
 * Debug: Test line grouping with sample API data
 */

const sampleApiWord = {
  id: 1,
  position: 1,
  text_uthmani: 'بِسْمِ',
  verse_key: '1:1',
  location: '1:1:1',
  char_type_name: 'word',
  line_number: 1,  // Check if this exists in real API
  page_number: 1,
  hizb_number: 1
};

console.log('Sample word structure:', sampleApiWord);
console.log('Has line_number?', 'line_number' in sampleApiWord);
