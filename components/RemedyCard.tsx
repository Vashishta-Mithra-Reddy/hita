import { Badge } from "./ui/badge";
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
    <Link href={`/remedies/${remedy.slug}`}>
    <div className="p-6 border-2 border-dashed rounded-xl space-y-2 transition-all hover:scale-105 duration-300 hover:border-foreground/20">
      <h2 className="text-xl font-bold">{remedy.name}</h2>
      <p className="text-foreground/60 text-sm">{remedy.description}</p>
      
      {remedy.issues && remedy.issues.length > 0 && (
        <p className="text-sm text-foreground/80">For issues: {remedy.issues.join(', ')}</p>
      )}
      
      <div className="text-xs flex items-center gap-2">
        <Badge variant="outline" className="px-2 py-2 bg-green-500/10 border-green-500/30">✅ Effectiveness ({remedy.successCount}/5)</Badge>
        {/* <Link href={`/remedies/${remedy.slug}`}>
          <Button variant="outline" size="sm">View Details</Button>
        </Link> */}
      </div>
      
      {/* <p className="text-xs text-yellow-600">Warning: Consult a doctor for serious issues.</p> */}
      
    </div>
    </Link>
  );
}
