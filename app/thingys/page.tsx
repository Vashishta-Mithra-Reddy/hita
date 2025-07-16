import { ProductCard } from "@/components/ProductCard"

const dummyProducts = [
  {
    id: "p1",
    name: "Organic Amla Juice",
    description: "Rich in Vitamin C and good for immunity.",
    availableAt: {
      amazon: "https://amazon.in/amla",
      local: ["500032", "500001"],
    },
    verified: true,
  },
  {
    id: "p2",
    name: "Ashwagandha Capsules",
    description: "Reduces stress and boosts energy.",
    availableAt: {
      amazon: "https://amazon.in/ashwagandha",
    },
    verified: false,
  },
]

export default function ProductsPage() {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-semibold mb-4">Curated Products</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {dummyProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}
