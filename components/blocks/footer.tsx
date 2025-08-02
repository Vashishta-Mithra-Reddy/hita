import Link  from "next/link";
// import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
// import { BackgroundGradientAnimation } from "../background-gradient";

export default function Footer() {
return(
    <footer className="w-full flex items-center justify-center text-center text-xs gap-8 border-t-2 border-dashed border-foreground/10 mb-20 md:mb-0 rounded-none">
      <div className="w-full max-w-7xl py-8 px-8 md:px-20 flex items-center justify-between text-center text-xs gap-8 backdrop-blur-3xl rounded-none">
      <Link href={"/"} className="text-xl font-semibold">
      <div className="flex items-center">
      {/* <Image src="/hita.png" width={80} height={80} alt="Hita Logo" className="rounded-full"/> */}
      <p className="pl-4 text-2xl text-muted-foreground">हित</p>
      </div>
      </Link>
      <p className="flex items-center justify-center md:justify-start mb-2 md:mb-0 text-sm text-muted-foreground">
                        Built by&nbsp;
                        <Link
                          href="https://www.vashishtamithra.com/"
                          target="_blank"
                          className="underline text-foreground inline-flex items-center gap-1 group transition-all duration-500 pl-1 hover:text-primary"
                        >
                          Vashishta
                          <ArrowUpRight className="w-5 h-5 transition-all duration-500" />
                        </Link>
                      </p>
      </div>
    </footer>
);
}