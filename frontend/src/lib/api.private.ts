// lib/api.private.ts
// This file decides which API to use for Private Q&A

// ============================================
// IMPORTANT: CHANGE THIS FLAG TO SWITCH BACKENDS
// ============================================
// Set to true for JSON Server (development)
// Set to false for Real Backend (production)
const USE_MOCK_FOR_PRIVATE_QA = true;
// ============================================

let privateQaApi: any;

if (USE_MOCK_FOR_PRIVATE_QA) {
  // Use JSON Server mock
  console.log('📦 Private Q&A: Using JSON Server Mock (http://localhost:5000)');
  privateQaApi = await import('./api.mock').then(module => module.privateQaApi);
} else {
  // Use real backend - will be created later
  console.log('🔗 Private Q&A: Using Real Backend');
  // When backend is ready, you'll import from api.private.real.ts
  // For now, fallback to api.real.ts which has placeholders
  privateQaApi = await import('./api.real').then(module => module.api);
}

export { privateQaApi };