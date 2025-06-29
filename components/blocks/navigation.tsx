"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";

export default function Navigation() {
    const pathname = usePathname();
    return (
        <div className="hidden md:flex gap-4">
              <Link href={"/"} className={`text-foreground px-5 py-2 rounded-lg hover:text-foreground hover:bg-foreground/10 ${pathname==="/"?"bg-foreground/10 border-2 border-dashed border-foreground/10":""}`}>
                Home
              </Link>
            </div>
    );
}