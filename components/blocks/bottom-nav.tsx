"use client";

import Link from "next/link";
import { Apple, Citrus, Fingerprint, Heart, Package } from "lucide-react";
import { usePathname } from "next/navigation";

export default function BottomNav() {
  const pathname = usePathname();
  
  const navigationLinks = [
    // { href: "/", label: "Home", icon: <Home  className="h-5 w-5" /> },
    { href: "/products", label: "Products", icon: <Package className="h-5 w-5" /> },
    { href: "/foods", label: "Foods", icon: <Apple className="h-5 w-5" /> },
    { href: "/brands", label: "Brands", icon: <Fingerprint className="h-5 w-5" /> },
    { href: "/remedies", label: "Remedies", icon: <Citrus className="h-5 w-5" /> },
    { href: "/wellness-tips", label: "Wellness", icon: <Heart className="h-5 w-5" /> }
    
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-foreground/5 backdrop-blur-3xl shadow-lg">
      <div className="flex justify-around items-center h-20 px-4">
        {navigationLinks.map((link) => {
          const isActive = pathname === link.href || 
                          (link.href !== "/" && pathname.startsWith(link.href));
          
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-colors ${
                isActive 
                  ? "text-[#00b8f1]" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className={`${isActive ? "text-[#00b8f1]" : "text-muted-foreground"}`}>
                {link.icon}
              </div>
              <span className="text-xs mt-1">{link.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}