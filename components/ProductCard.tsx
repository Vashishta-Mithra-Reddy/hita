"use client"

import Link from "next/link"
import Image from "next/image"

interface Product {
  id: string
  name: string
  slug: string
  description: string
  main_image: string
  availableAt: {
    amazon: string
    local?: string[]
  }
  verified?: boolean
}

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/products/${product.slug}`} className="block group">
      <div className="rounded-2xl transition-all duration-300 p-6 w-full max-w-md border-2 border-foreground/20 border-dashed hover:border-foreground/40 hover:-translate-y-1">
        {/* Image Container */}
        {/* <div className="flex items-start justify-start mb-6">
          <div className="relative overflow-hidden rounded-2xl bg-foreground/5 p-4 w-full aspect-square max-w-[200px]">
            <Image
              src={product.main_image || "/placeholder.svg"}
              alt={product.name}
              fill
              className="object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        </div> */}

        {/* Content */}
        <div className="space-y-3">
          <div className="flex flex-col md:flex-row items-center md:items-start justify-center">
            <div className="relative overflow-hidden rounded-2xl bg-foreground/5 p-4 w-full aspect-square max-w-[100px] mr-0 md:mr-6 mb-6 md:mb-0">
                <Image
                  src={product.main_image || "/placeholder.svg"}
                  alt={product.name}
                  fill
                  className="object-cover rounded-xl group-hover:scale-105 transition-transform duration-300 bg-foreground/10 dark:bg-white"
                />
              </div>
            <div className="flex flex-col items-center md:items-start justify-center">
            <h2 className="text-2xl font-semibold text-foreground/80 leading-tight text-center md:text-start line-clamp-2 text-pretty mb-2">{product.name}</h2>
            <p className="text-foreground/60 text-sm leading-relaxed md:text-start text-center line-clamp-1">{product.description}</p>
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
