"use client"

import Link from "next/link"
import { Badge } from "./ui/badge"
import { Clock, Users, ChefHat } from "lucide-react"

interface Recipe {
  id: string
  name: string
  slug: string
  description: string
  short_description: string
  main_image_url: string
  prep_time_minutes: number | null
  cook_time_minutes: number | null
  total_time_minutes: number | null
  servings: number | null
  difficulty_level: 'very_easy' | 'easy' | 'medium' | 'hard' | 'expert' | null
  dietary_tags: string[] | null
  cuisine_type: string | null
  meal_type: string[] | null
  is_healthy: boolean
  is_quick: boolean
  is_vegetarian: boolean
  is_vegan: boolean
  is_gluten_free: boolean
  is_dairy_free: boolean
}

export function RecipeCard({ recipe }: { recipe: Recipe }) {
  const getDifficultyColor = (level: string | null) => {
    switch (level) {
      case 'very_easy': return 'bg-emerald-100/30 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
      case 'easy': return 'bg-green-100/30 text-green-800 dark:bg-green-900/30 dark:text-green-300'
      case 'medium': return 'bg-yellow-100/30 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
      case 'hard': return 'bg-red-100/30 text-red-800 dark:bg-red-900/30 dark:text-red-300'
      case 'expert': return 'bg-purple-100/30 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
      default: return 'bg-gray-100/30 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
    }
  }

  const getDifficultyLabel = (level: string | null) => {
    return level ? level.replace('_', ' ') : 'Unknown'
  }

  const totalTime = recipe.total_time_minutes || 
    ((recipe.prep_time_minutes || 0) + (recipe.cook_time_minutes || 0))

  return (
      <Link href={`/recipes/${recipe.slug}`} className="block group">
        <div className="rounded-2xl transition-all duration-300 p-6 w-full border-2 border-foreground/20 border-dashed hover:border-foreground/40 hover:-translate-y-0.5">
          {/* Content */}
          <div className="space-y-3">
            <div className="flex flex-col items-center justify-start gap-4">
              <div className="relative overflow-hidden rounded-2xl bg-foreground/5 aspect-square w-[250px] h-[200px] flex-shrink-0">
                <img
                  src={recipe.main_image_url || "/placeholder.svg"}
                  alt={recipe.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  className="object-cover rounded-xl group-hover:scale-105 transition-transform duration-500 bg-foreground/10 dark:bg-white"
                />
              </div>
              
              <div className="flex flex-col items-start justify-start text-left flex-1 min-w-0">
                <h2 className="text-xl md:text-2xl font-semibold text-foreground/80 leading-tight line-clamp-1 text-pretty mb-1 w-full">
                  {recipe.name}
                </h2>
                <p className="text-foreground/60 text-sm leading-relaxed line-clamp-2 w-full mb-2">
                  {recipe.short_description || recipe.description}
                </p>
                
                {/* Recipe Meta Info */}
                <div className="flex flex-wrap gap-2 mb-2 text-xs text-foreground/60">
                  {totalTime > 0 && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{totalTime}m</span>
                    </div>
                  )}
                  {recipe.servings && (
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      <span>{recipe.servings} servings</span>
                    </div>
                  )}
                  {recipe.difficulty_level && (
                    <div className="flex items-center gap-1">
                      <ChefHat className="w-3 h-3" />
                      <span className="capitalize">{getDifficultyLabel(recipe.difficulty_level)}</span>
                    </div>
                  )}
                </div>
                
                {/* Dietary Tags */}
                <div className="flex flex-wrap gap-1">
                  {recipe.is_quick && (
                    <Badge variant="outline" className="text-xs bg-blue-100/30 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                      Quick
                    </Badge>
                  )}
                  {recipe.is_vegetarian && (
                    <Badge variant="outline" className="text-xs bg-emerald-100/30 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
                      Vegetarian
                    </Badge>
                  )}
                  {recipe.is_vegan && (
                    <Badge variant="outline" className="text-xs bg-purple-100/30 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                      Vegan
                    </Badge>
                  )}
                  {recipe.is_gluten_free && (
                    <Badge variant="outline" className="text-xs bg-orange-100/30 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                      Gluten-Free
                    </Badge>
                  )}
                  {recipe.is_dairy_free && (
                    <Badge variant="outline" className="text-xs bg-cyan-100/30 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300">
                      Dairy-Free
                    </Badge>
                  )}
                  {recipe.difficulty_level && (
                    <Badge variant="outline" className={`text-xs ${getDifficultyColor(recipe.difficulty_level)}`}>
                      {getDifficultyLabel(recipe.difficulty_level)}
                    </Badge>
                  )}
                  {recipe.cuisine_type && (
                    <Badge variant="outline" className="text-xs">
                      {recipe.cuisine_type}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
  )
}