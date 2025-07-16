CREATE TABLE remedies (
  id UUID PRIMARY KEY,
  name TEXT,
  description TEXT,
  issues TEXT[],
  success_count INT,
  fail_count INT,
  verified_by TEXT[]
);
// Add tables for products, submissions, reports