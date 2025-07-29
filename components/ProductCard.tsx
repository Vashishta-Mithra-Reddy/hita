import Link from 'next/link';
import Image from 'next/image';

interface Product {
  id: string;
  name: string;
  description: string;
  main_image: string;
  availableAt: {
    amazon: string;
    local?: string[];
  };
  verified?: boolean;
}

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/products/${product.id}`} className="block">
      <div className="rounded-2xl  transition-all duration-300 p-6 w-full max-w-md border-2 border-foreground/20 border-dashed">
        {/* <div className='flex items-center justify-center'>
        <Image
            src={product.main_image}
            alt={product.name}
            width={100}
            height={100}
            className="w-100 h-100 object-cover rounded-md"
          />
        </div> */}
        <div className="flex items-start justify-between">
          <h2 className="text-2xl font-semibold text-foreground/80">{product.name}</h2>
          {/* {product.verified && (
            <span className="ml-2 inline-flex items-center gap-1 bg-green-100 text-green-800 text-xs font-medium px-3 py-1 rounded-full">
              ✅ Verified
            </span>
          )} */}
        </div>

        <p className="mt-2 text-foreground/60 text-sm leading-relaxed">{product.description}</p>

        {/* <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm">
          <span
            className="inline-block text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md transition-colors duration-200 text-center"
            onClick={(e) => {
              e.preventDefault(); // Prevent navigation to product detail
              window.open(product.availableAt.amazon, '_blank');
            }}
          >
            Buy on Amazon
          </span>

          {product.availableAt.local && product.availableAt.local.length > 0 && (
            <div className="text-gray-500 text-xs sm:text-sm">
              <span className="font-medium text-gray-700">Local:</span>{' '}
              {product.availableAt.local.join(', ')}
            </div>
          )}
        </div> */}
      </div>
    </Link>
  );
}
