import { Brand } from "@/lib/supabase/products";
import Link from "next/link";

export default function BrandCard({ brand }: { brand: Brand }) {
    return (
        <Link key={brand.id} href={`/brands/${brand.slug}`} className="block">
          <div className="rounded-2xl border-dashed duration-300 p-6 h-full border-2 hover:scale-105 border-foreground/20 hover:border-foreground/40">
            <div className="flex items-center gap-4 mb-4">
              {brand.logo_url ? (
                <img 
                  src={brand.logo_url} 
                  alt={brand.name} 
                  className="w-16 h-16 px-2 object-contain bg-white rounded-xl"
                />
              ) : (
                <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
                  <span className="text-3xl font-semibold">{brand.name.charAt(0)}</span>
                </div>
              )}
              <h2 className="text-2xl font-semibold text-foreground/85">{brand.name}</h2>
            </div>
            
            {brand.description && (
              <p className="text-foreground/70 font-medium text-md mb-4 line-clamp-1">{brand.description}</p>
            )}
            
            <div className="flex flex-wrap gap-2">
              {brand.is_certified_organic && (
                <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                  Certified Organic
                </span>
              )}
            </div>
          </div>
        </Link>
    );
}