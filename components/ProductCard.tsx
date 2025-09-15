// "use client"

import Link from "next/link"

interface Product {
  id: string
  name: string
  slug: string
  description: string
  main_image_url: string
  // availableAt: {
  //   amazon: string
  //   local?: string[]
  // }
  verified?: boolean
}

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/products/${product.slug}`} className="block group">
      <div className="rounded-2xl transition-all duration-300 p-6 w-full max-w-md border-2 border-foreground/20 border-dashed hover:border-foreground/40 hover:-translate-y-1">
        {/* Content */}
        <div className="space-y-3">
          {/* <div className="flex flex-row items-start justify-start gap-6"> */}
            <div className="flex flex-row items-center md:items-start justify-start gap-6">

            <div className="relative overflow-hidden rounded-2xl bg-foreground/5 aspect-square w-[100px] h-[100px] flex-shrink-0">
              <img
                src={product.main_image_url || "/placeholder.svg"}
                alt={product.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                className="object-cover rounded-xl group-hover:scale-105 transition-transform duration-300 bg-foreground/10 dark:bg-white dark:brightness-[0.85]"
              />
            </div>
            
            <div className="flex flex-col items-start justify-start text-left flex-1 min-w-0">
              <h2 className="text-xl md:text-2xl font-semibold text-foreground/80 leading-tight line-clamp-2 text-pretty mb-1 w-full">
                {product.name}
              </h2>
              <p className="text-foreground/60 text-sm leading-relaxed line-clamp-1 w-full">
                {product.description}
              </p>
            </div>
            
            {/* {product.verified && (
              <span className="ml-2 inline-flex items-center gap-1 bg-green-100 text-green-800 text-xs font-medium px-3 py-1 rounded-full shrink-0">
                ✅ Verified
              </span>
            )} */}
          </div>
                    
          {/* Action Buttons */}
          {/* <div className="pt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm">
            <button
              className="inline-block text-white bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl transition-all duration-200 text-center font-medium hover:shadow-md transform hover:scale-105"
              onClick={(e) => {
                e.preventDefault()
                window.open(product.availableAt.amazon, "_blank")
              }}
            >
              Buy on Amazon
            </button>
            
            {product.availableAt.local && product.availableAt.local.length > 0 && (
              <div className="text-foreground/50 text-xs sm:text-sm bg-foreground/5 px-3 py-2 rounded-lg">
                <span className="font-medium text-foreground/70">Local:</span> {product.availableAt.local.join(", ")}
              </div>
            )}
          </div> */}
        </div>
      </div>
    </Link>
  )
}