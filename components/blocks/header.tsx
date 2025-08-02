// import Link from "next/link";
// import { AuthButton } from "../auth-button";
import Navigation from "./navigation";
// import Image from "next/image";

export default function Header() {
return (
         <nav className="w-full max-w-6xl flex justify-center h-fit bg-foreground/5 backdrop-blur-3xl sticky top-0 md:top-8 rounded-none md:rounded-xl z-50 md:shadow-md">
          <div className="w-full max-w-7xl flex justify-center items-center text-sm">
            {/* <div className="flex gap-5 items-center font-semibold"> */}
              {/* <Link href={"/"} className="text-3xl pl-4 font-bold md:hidden flex">हित</Link> */}
              {/* <Link href={"/"} className="text-xl font-bold px-0 md:px-10">
              <Image src="/hita.png" width={60} height={60} priority alt="Hita Logo" className="rounded-full"/>
              </Link> */}
            {/* </div> */}
            <Navigation />
            {/* <AuthButton /> */}
          </div>
        </nav>
);
}