export default function HitaMeaning(){
    return(
        <section className="flex flex-col items-center justify-center pt-32 px-6 max-w-3xl text-center -rotate-2  hover:rotate-0 transition-all duration-500 opacity-65 md:mx-0 mx-4">
          <div className="bg-muted/30 border border-border rounded-2xl p-8 shadow-sm">
            {/* <h4 className="text-2xl md:text-3xl font-satoshi font-bold text-foreground/90 mb-4">
              हित | Hita
            </h4> */}
            <p className="text-base md:text-lg text-foreground/60 font-satoshi font-semibold leading-relaxed italic">
              {/* <span className="font-semibold text-foreground">Hita</span> is a Sanskrit word that translates to 
              <span className="italic"> “good, beneficial, and conducive to well-being.”</span>  
              This meaning is the foundation of our platform — bringing you choices that truly support your wellness. */}
              हित | Hita is a sanskrit word which translates to welfare, good.
            </p>
          </div>
        </section>
    );
}