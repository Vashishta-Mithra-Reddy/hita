"use client";

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function SubmitPage() {
  const [type, setType] = useState('remedy');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [issue, setIssue] = useState(''); 
  const [remedyDetails, setRemedyDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const supabase = createClient();

  const user = supabase.auth.getUser(); // This might need to be adjusted for client-side
  if (!user) {
    router.push('/auth/login');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!name || !description) {
      setError('Please fill in all required fields.');
      setLoading(false);
      return;
    }

    const submission = {
      user_id: (await user).data.user?.id,
      type,
      name,
      description,
      ...(type === 'product' && { category }),
      ...(type === 'remedy' && { issue, remedy_details: remedyDetails }),
      status: 'pending',
    };

    const supabase = createClient();
    const { error } = await supabase.from('submissions').insert(submission);

    setLoading(false);
    if (error) {
      setError('Submission failed: ' + error.message);
      toast.error('Failed to submit. Please try again.');
    } else {
      toast.success('Your submission is pending review.');
      // Reset form
      setName('');
      setDescription('');
      setCategory('');
      setIssue('');
      setRemedyDetails('');
    }
  };

  return (
    <div className="max-w-5xl mx-auto font-satoshi wrapperx">
      <h1 className="text-3xl font-bold mb-6">Submit Remedy or Product</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="type">Submission Type</Label>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="remedy">Remedy</SelectItem>
              <SelectItem value="product">Product</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter name" required />
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Provide details" required />
        </div>
        {type === 'product' && (
          <div>
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="chocolates">Chocolates</SelectItem>
                <SelectItem value="healthy-snacks">Healthy Snacks</SelectItem>
                <SelectItem value="spices">Spices</SelectItem>
                <SelectItem value="supplements">Supplements</SelectItem>
                {/* Add more categories as needed */}
              </SelectContent>
            </Select>
          </div>
        )}
        {type === 'remedy' && (
          <>
            <div>
              <Label htmlFor="issue">Issue/Problem</Label>
              <Input id="issue" value={issue} onChange={(e) => setIssue(e.target.value)} placeholder="e.g., Headache" required />
            </div>
            <div>
              <Label htmlFor="remedyDetails">Remedy Details</Label>
              <Textarea id="remedyDetails" value={remedyDetails} onChange={(e) => setRemedyDetails(e.target.value)} placeholder="Describe the remedy" required />
            </div>
          </>
        )}
        {error && <p className="text-red-500">{error}</p>}
        <Button type="submit" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit for Review'}
        </Button>
      </form>
    </div>
  );
}