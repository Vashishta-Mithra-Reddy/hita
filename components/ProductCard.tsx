interface Product {
  name: string;
  description: string;
  availableAt: {
    amazon: string;
    local?: string[];
  };
  verified?: boolean;
}

export function ProductCard({ product }: { product: Product }) {
  return (
    <div className="p-4 border rounded-xl shadow-sm bg-white space-y-2 hover:shadow-md transition-shadow duration-200">
      <h2 className="text-xl font-medium">{product.name}</h2>
      <p className="text-gray-700 text-sm">{product.description}</p>
      <div className="flex flex-wrap gap-2 text-sm">
        <a href={product.availableAt.amazon} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">Buy on Amazon</a>
        {product.availableAt.local && (
          <span className="text-gray-500">Local: {product.availableAt.local.join(', ')}</span>
        )}
      </div>
      {product.verified && (
        <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">Personally Verified</span>
      )}
      <p className="text-xs text-muted-foreground italic">Genuine recommendation no brand bias.</p>
    </div>
  );
}
