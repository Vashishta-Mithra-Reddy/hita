"use client"

import Link from "next/link"
import Image from "next/image"
import { Badge } from "./ui/badge"

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
    <Link href={`/foods/${food.slug}`} className="block group">
      <div className="rounded-2xl transition-all duration-300 p-6 w-full border-2 border-foreground/20 border-dashed hover:border-foreground/40 hover:-translate-y-1">
        {/* Content */}
        <div className="space-y-3">
          <div className="flex flex-col md:flex-row items-center md:items-start justify-center">
            <div className="relative overflow-hidden rounded-2xl bg-foreground/5 p-4 w-full aspect-square max-w-[100px] mr-0 md:mr-6 mb-6 md:mb-0">
              <Image
                src={food.main_image || "/placeholder.svg"}
                alt={food.name}
                fill
                className="object-cover rounded-xl group-hover:scale-105 transition-transform duration-300 bg-foreground/10 dark:bg-white"
              />
            </div>
            <div className="flex flex-col items-center md:items-start justify-center">
              <h2 className="text-2xl font-semibold text-foreground/80 leading-tight text-center md:text-start line-clamp-2 text-pretty mb-2">{food.name}</h2>
              <p className="text-foreground/60 text-sm leading-relaxed md:text-start text-center line-clamp-1">{food.description}</p>
              
              {/* Nutrient Tags */}
              {(food.vitamins || food.minerals) && (
                <div className="flex flex-wrap gap-1 mt-2 justify-center md:justify-start">
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
  )
}