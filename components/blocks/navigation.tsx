"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import ThemeSwitcher from "../theme-switcher";

export default function Navigation() {
    const pathname = usePathname();
    
    const navItems = [
        { href: "/products", label: "Products" },
        { href: "/brands", label: "Brands" },
        { href: "/remedies", label: "Remedies" },
        { href: "/wellness-tips", label: "Wellness Tips" }
    ];
    
    return (
        <div className="hidden md:flex items-stretch justify-between w-full">
            {/* Logo/Brand */}
            <Link 
                href="/" 
                className="flex items-center font-bold px-4 border-r-2 border-dashed border-foreground/10 hover:bg-foreground/5 transition-colors duration-200 rounded-l-xl"
            >
                <span className="text-3xl py-5 pl-6 px-5">हित</span>
            </Link>
            
            <div className="flex flex-row">
            {/* Navigation Items */}
            {navItems.map((item, index) => (
                <Link
                    key={item.href}
                    href={item.href}
                    className={`
                        flex items-center mx-2 px-5 my-5 py-2 text-sm font-medium rounded-lg
                        border-r-2 border-dashed border-foreground/0
                        hover:text-foreground hover:bg-foreground/10 
                        transition-all duration-200
                        ${pathname === item.href 
                            ? "bg-foreground/10" 
                            : "text-foreground/70"
                        }
                    ${index === 0 ? "border-l-2":""}
                    `}
                >
                    {item.label}
                </Link>
            ))}
            </div>
            <ThemeSwitcher/>
        </div>
    );
}