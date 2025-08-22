"use client"

import Link from "next/link"
// import Image from "next/image"
import { Badge } from "./ui/badge"
import FadeInWhenVisible from "./animations/FadeInWhenVisible"

interface Food {
  id: string
  name: string
  slug: string
  description: string
  main_image: string
  vitamins: string[] | null
  minerals: string[] | null
  is_common: boolean
}

export function FoodCard({ food }: { food: Food }) {
  return (
    <FadeInWhenVisible>
    <Link href={`/foods/${food.slug}`} className="block group">
      <div className="rounded-2xl transition-all duration-300 p-6 w-full border-2 border-foreground/20 border-dashed hover:border-foreground/40 hover:-translate-y-1">
        {/* Content */}
        <div className="space-y-3">
          <div className="flex flex-row items-center md:items-start justify-start gap-4">
            <div className="relative overflow-hidden rounded-2xl bg-foreground/5 aspect-square w-[100px] h-[100px] flex-shrink-0">
              <img
                src={food.main_image || "/placeholder.svg"}
                alt={food.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                className="object-cover rounded-xl group-hover:scale-105 transition-transform duration-300 bg-foreground/10 dark:bg-white"
              />
            </div>
            
            <div className="flex flex-col items-start justify-start text-left flex-1 min-w-0">
              <h2 className="text-xl md:text-2xl font-semibold text-foreground/80 leading-tight line-clamp-1 text-pretty mb-1 w-full">
                {food.name}
              </h2>
              <p className="text-foreground/60 text-sm leading-relaxed line-clamp-2 w-full mb-2">
                {food.description}
              </p>
              
              {/* Nutrient Tags */}
              {(food.vitamins || food.minerals) && (
                <div className="flex flex-wrap gap-1">
                  {food.vitamins?.slice(0, 2).map((vitamin, index) => (
                    <Badge key={`v-${index}`} variant="outline" className="text-xs bg-green-100/30 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                      {vitamin}
                    </Badge>
                  ))}
                  {food.minerals?.slice(0, 2).map((mineral, index) => (
                    <Badge key={`m-${index}`} variant="outline" className="text-xs bg-blue-100/30 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                      {mineral}
                    </Badge>
                  ))}
                  {((food.vitamins?.length || 0) + (food.minerals?.length || 0) > 4) && (
                    <Badge variant="outline" className="text-xs">+more</Badge>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
    </FadeInWhenVisible>
  )
}