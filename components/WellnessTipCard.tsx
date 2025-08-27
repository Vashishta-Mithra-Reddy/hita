import { WellnessTip } from "@/lib/supabase/wellness";
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function WellnessTipCard({wellnesstip}:{wellnesstip : WellnessTip}){
    return(
        <Card
          key={wellnesstip.id}
          className="overflow-hidden shadow-none border-2 border-dashed"
        >
          <CardHeader className='mb-0 pb-2'>
            {wellnesstip.category && (
              <Badge variant="secondary" className="w-fit opacity-75 mb-1">
                {wellnesstip.category}
              </Badge>
            )}
            <CardTitle className="text-lg ml-1">{wellnesstip.title}</CardTitle>
            
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-line text-balance ml-1">{wellnesstip.content}</p>
          </CardContent>
        </Card>
    );
}