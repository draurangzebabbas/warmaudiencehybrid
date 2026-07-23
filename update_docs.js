const fs = require('fs');
let content = fs.readFileSync('Current condition.md', 'utf8');

// 1. Update High Level Architecture
content = content.replace(
  '          Backend (Render Server)',
  '          Backend (Render for queues / Vercel Next.js APIs)'
);

// 2. Update Database section
content = content.replace(
  'Everything users collect is stored here.',
  'Everything users collect is stored here.\n\nUsage tracking is also stored here via the `user_usage` table to prevent limit-reset loopholes (deleting leads does not reset the monthly extracted limit).'
);

// 3. Add Usage Limits section before Plans
content = content.replace(
  '# Plans',
  '# Usage Limits & Scraping Quotas\n\nTo prevent abuse (e.g., the "scam loophole" where users delete leads to regain limits), WarmAudience tracks all lead extractions permanently in a Supabase `user_usage` table.\n- **Limits are enforced at the point of scraping**, not by counting the number of leads currently in the dashboard.\n- When an Apify Actor runs, it increments the user\\'s `extracted_leads` count.\n- Free and premium tiers have specific monthly limits.\n\n---\n\n# Plans'
);

// 4. Update Downloads section
content = content.replace(
  'Downloads are generated from the leads stored inside Supabase.',
  'Downloads are generated from the leads stored inside Supabase.\n- Exports are processed in **chunks (e.g., batches of 200)** to prevent \'414 URI Too Long\' errors when downloading massive datasets.\n- CSV Exports **respect the exact filters** applied by the user on the frontend.'
);

// 5. Update Filters section
content = content.replace(
  '- Location',
  '- Location\n- Tags (supports fuzzy, case-insensitive partial matching via a `tags_text` computed column)\n- Min/Max Reviews & Rating (Google Maps)'
);

// 6. Update Render section
content = content.replace(
  'Apify integration\n \nDatabase writes\n \nValidation',
  'Apify integration\n \nDatabase writes\n \nValidation\n\n*(Note: Some backend API routes, like CSV export and frontend filtering, run on Vercel via Next.js Serverless Functions)*'
);

// 7. Update AI Assistant Instructions
content = content.replace(
  '- Polar manages subscriptions and payments.',
  '- Polar manages subscriptions and payments.\n- Vercel hosts the Next.js frontend and Serverless API routes (like CSV exports).\n- Lead extraction limits are tracked in the Supabase `user_usage` table to permanently record usage, fixing the delete-to-reset loophole.'
);

fs.writeFileSync('Current condition.md', content);
console.log('Updated Current condition.md successfully!');
