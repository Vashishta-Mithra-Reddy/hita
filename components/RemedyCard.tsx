import { Button } from "./ui/button";
import Link from "next/link";

interface Remedy {
  id: string;
  name: string;
  slug: string;
  description: string;
  issues: string[];
  successCount: number;
  failCount: number;
  verifiedBy: string[];
}

export function RemedyCard({ remedy }: { remedy: Remedy }) {
  return (
    <div className="p-6 border-2 border-dashed rounded-xl space-y-2 transition-shadow">
      <h2 className="text-xl font-bold">{remedy.name}</h2>
      <p className="text-foreground/60 text-sm">{remedy.description}</p>
      
      {remedy.issues && remedy.issues.length > 0 && (
        <p className="text-sm text-foreground/80">For issues: {remedy.issues.join(', ')}</p>
      )}
      
      <div className="text-xs flex items-center gap-2">
        <Button variant="outline" size="sm">✅ Effectiveness ({remedy.successCount}/5)</Button>
        <Link href={`/remedies/${remedy.slug}`}>
          <Button variant="outline" size="sm">View Details</Button>
        </Link>
      </div>
      
      {remedy.verifiedBy && remedy.verifiedBy.includes('admin') && (
        <span className="inline-block bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs">Expert Verified</span>
      )}
      
      {/* <p className="text-xs text-yellow-600">Warning: Consult a doctor for serious issues.</p> */}
      <p className="text-xs text-muted-foreground italic">Based on genuine user experiences.</p>
    </div>
  );
}
