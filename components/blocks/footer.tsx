import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
// import Hita from "../icons/hita";

export default function Footer() {
  return (
    <footer className="w-full flex flex-col items-center justify-center text-center gap-8 border-t-2 border-dashed border-foreground/10 mb-20 md:mb-0 rounded-none pb-8 pt-6">
      <div className="w-full max-w-7xl py-4 px-12 md:px-12 flex flex-col gap-12">
        <div className="flex flex-col items-center md:items-start max-w-6xl  md:pt-8 md:pb-6 px-8 lg:flex-row mx-auto justify-between w-full gap-12">
          {/* Logo and Description */}
          <div className="flex flex-col items-center md:items-start gap-4 w-fit max-w-sm">
            <div className="flex items-center gap-4">
              <Link href={"/"} className="relative cursor-pointer h-12 w-16 block group">
                {/* Blurred background image */}
                <img
                  src="/hita.svg"
                  alt="logo-blur"
                  className="absolute top-0 left-0 h-12 w-16 blur-xl scale-110 opacity-60 dark:opacity-80 group-hover:opacity-80 group-hover:blur-lg transition-all duration-1000"
                  aria-hidden="true"
                />

                {/* Sharp foreground image */}
                <img
                  src="/hita.svg"
                  alt="logo"
                  className="relative h-12 w-16"
                />
              </Link>

              <span className="text-2xl pt-2 text-muted-foreground font-bold tracking-tighter">हित</span>
            </div>
            {/* <p className="text-muted-foreground text-base">Guide to a healthier you.</p> */}
            <p className="text-muted-foreground text-base">Where wellness meets wisdom</p>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-col sm:flex-row sm:flex-wrap md:flex-nowrap gap-8 sm:gap-6 md:gap-12">
            {/* Agent */}
            {/* <div className="flex flex-col gap-3">
              <h4 className="text-base font-semibold tracking-tight text-start">Agent</h4>
              <nav className="space-y-3">
                <Link 
                  href="/agent" 
                  className="flex items-center justify-between text-sm text-muted-foreground hover:text-blue-600 transition-colors group"
                >
                  <span>Agent</span>
                  <ArrowUpRight className="h-3 md:block hidden w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </nav>
            </div> */}

            {/* Discover Links */}
            <div className="flex flex-col items-center md:items-start gap-3 min-w-0 flex-1 sm:flex-none sm:w-auto">
              
              <h4 className="text-base font-semibold tracking-tight text-start">Discover</h4>
              <nav className="space-y-3">
                <Link 
                  href="/products" 
                  className="flex items-center justify-center md:justify-between text-sm text-muted-foreground hover:text-blue-600 transition-colors group"
                >
                  <span>Products</span>
                  <ArrowUpRight className="h-3 md:block hidden w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
                <Link 
                  href="/brands" 
                  className="flex items-center justify-center md:justify-between text-sm text-muted-foreground hover:text-blue-600 transition-colors group"
                >
                  <span>Brands</span>
                  <ArrowUpRight className="h-3 md:block hidden w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
                <Link 
                  href="/foods" 
                  className="flex items-center justify-center md:justify-between text-sm text-muted-foreground hover:text-blue-600 transition-colors group"
                >
                  <span>Foods</span>
                  <ArrowUpRight className="h-3 md:block hidden w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
                
              </nav>
            </div>

            {/* Wellness Links */}
            <div className="flex flex-col gap-3 items-center md:items-start min-w-0 flex-1 sm:flex-none sm:w-auto">
              <h4 className="text-base font-semibold tracking-tight text-start">Wellness</h4>
              <nav className="space-y-3">
                <Link 
                  href="/recipes" 
                  className="flex items-center justify-center md:justify-between text-sm text-muted-foreground hover:text-blue-600 transition-colors group"
                >
                  <span>Recipes</span>
                  <ArrowUpRight className="h-3 md:block hidden w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
                <Link 
                  href="/remedies" 
                  className="flex items-center justify-center md:justify-between text-sm text-muted-foreground hover:text-blue-600 transition-colors group"
                >
                  <span>Remedies</span>
                  <ArrowUpRight className="h-3 md:block hidden w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
                <Link 
                  href="/wellness-tips" 
                  className="flex items-center justify-center md:justify-between text-sm text-muted-foreground hover:text-blue-600 transition-colors group"
                >
                  <span>Wellness Tips</span>
                  <ArrowUpRight className="h-3 md:block hidden w-3 opacity-0 group-hover:opacity-100 transition-colors group" />
                </Link>
              </nav>
            </div>

            {/* Legal Links */}
            <div className="flex flex-col items-center md:items-start gap-3 min-w-0 flex-1 sm:flex-none sm:w-full md:w-auto pointer-events-none blur-[2px]">
              <h4 className="text-base font-semibold tracking-tight text-center md:text-start">Legal</h4>
              <nav className="space-y-3">
                <Link 
                  href="/privacy-policy"
                  className="flex items-center justify-center md:justify-between text-sm text-muted-foreground hover:text-blue-600 transition-colors group"
                >
                  <span>Privacy Policy</span>
                  <ArrowUpRight className="h-3 md:block hidden w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
                <Link 
                  href="/terms-conditions" 
                  className="flex items-center justify-center md:justify-between text-sm text-muted-foreground hover:text-blue-600 transition-colors group"
                >
                  <span>Terms & Conditions</span>
                  <ArrowUpRight className="h-3 md:block hidden w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
                <Link 
                  href="/refunds-cancellation" 
                  className="flex items-center justify-center md:justify-between text-sm text-muted-foreground hover:text-blue-600 transition-colors group"
                >
                  <span>Refunds & Cancellation</span>
                  <ArrowUpRight className="h-3 md:block hidden w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </nav>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-t pt-6 border-foreground/10 opacity-80">
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} हित. All rights reserved.</p>
          <p className="flex items-center justify-center md:justify-start text-sm text-muted-foreground">
            Built by&nbsp;
            <Link
              href="https://www.vashishtamithra.com/"
              target="_blank"
              className="underline text-foreground inline-flex items-center gap-1 group transition-all duration-500 pl-1 hover:text-primary"
            >
              Vashishta Mithra
              <ArrowUpRight className="w-4 h-4 transition-all duration-500" />
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}