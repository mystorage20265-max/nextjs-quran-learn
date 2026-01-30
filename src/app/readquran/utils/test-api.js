// Quick test script to check API response
const testUrl = 'https://api.quran.com/api/v4/verses/by_page/1?words=true&word_fields=text_uthmani,line_number,page_number&per_page=1&language=en';

console.log('Testing API URL:', testUrl);
console.log('\nIf line_number is NOT supported, it will be silently ignored.');
console.log('Check the actual response to see what fields are returned.\n');

// The issue might be that line_number is NOT a standard field in Quran.com API
// Let me check the actual API documentation
