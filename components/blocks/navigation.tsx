"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";

export default function Navigation() {
    const pathname = usePathname();
    return (
        <div className="hidden md:flex gap-4">
              {/* <Link href={"/"} className={`text-foreground px-5 py-2 rounded-lg hover:text-foreground hover:bg-foreground/10 ${pathname==="/"?"bg-foreground/10 border-2 border-dashed border-foreground/10":""}`}>
                Home
              </Link> */}
              <Link href={"/products"} className={`text-foreground px-5 py-2 rounded-lg hover:text-foreground hover:bg-foreground/10 ${pathname==="/products"?"bg-foreground/10 border-2 border-dashed border-foreground/10":""}`}>
                Products
              </Link>
              <Link href={"/brands"} className={`text-foreground px-5 py-2 rounded-lg hover:text-foreground hover:bg-foreground/10 ${pathname==="/brands"?"bg-foreground/10 border-2 border-dashed border-foreground/10":""}`}>
                Brands
              </Link>
              <Link href={"/remedies"} className={`text-foreground px-5 py-2 rounded-lg hover:text-foreground hover:bg-foreground/10 ${pathname==="/remedies"?"bg-foreground/10 border-2 border-dashed border-foreground/10":""}`}>
                Remedies
              </Link>
              <Link href={"/wellness-tips"} className={`text-foreground px-5 py-2 rounded-lg hover:text-foreground hover:bg-foreground/10 ${pathname==="/wellness-tips"?"bg-foreground/10 border-2 border-dashed border-foreground/10":""}`}>
                Wellness Tips
              </Link>
        </div>
    );
}