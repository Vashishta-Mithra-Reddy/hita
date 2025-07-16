"use client";

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function SubmitPage() {
  const [submission, setSubmission] = useState({ type: 'remedy', details: '' });

  const handleSubmit = async () => {
    const supabase = createClient();
    await supabase.from('submissions').insert({ ...submission, status: 'pending' });
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-semibold mb-4">Submit Remedy or Product</h1>
      <form onSubmit={handleSubmit}>
        // Form fields for type, details, etc.
        <button type="submit">Submit for Review</button>
      </form>
    </div>
  );
}