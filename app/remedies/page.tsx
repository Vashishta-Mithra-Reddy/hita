"use client";

import { RemedyCard } from "@/components/RemedyCard"
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';


const dummyRemedies = [
  {
    id: "1",
    name: "Turmeric Milk",
    description: "Known for reducing inflammation and aiding sleep.",
    issues: ["cold", "joint pain"],
    verifiedBy: ["admin", "community"],
    successCount: 45,
    failCount: 2,
  },
  {
    id: "2",
    name: "Ginger Tea",
    description: "Used for nausea, digestion, and sore throat.",
    issues: ["nausea", "sore throat"],
    verifiedBy: ["community"],
    successCount: 28,
    failCount: 3,
  },
]


export default function RemediesPage() {
  const [search, setSearch] = useState('');

  // Filter by issue (integrate Supabase later)
  const filteredRemedies = dummyRemedies.filter(r => 
    r.issues.some(issue => issue.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-semibold mb-4">Verified Remedies</h1>
      <Input 
        placeholder="Search by issue (e.g., sore throat)" 
        value={search} 
        onChange={(e) => setSearch(e.target.value)} 
        className="mb-6 max-w-md"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRemedies.map((remedy) => (
          <RemedyCard key={remedy.id} remedy={remedy} />
        ))}
      </div>
      {filteredRemedies.length === 0 && <p className="text-muted-foreground">No remedies found for this issue. Submit one?</p>}
    </div>
  );
}
