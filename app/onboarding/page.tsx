import DietOnboardingForm from "@/components/diet/DietOnboardingForm";

export default function OnboardingPage() {
  return (
    <div className="min-h-screen wrapperx flex items-center justify-center bg-gradient-to-b from-background to-muted/20 w-full">
      <div className="w-full max-w-5xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight mb-2 text-balance">Let's personalize your plan</h1>
          <p className="text-muted-foreground">
            We need a few details to calculate your macros and structure your daily meals.
          </p>
        </div>
        <DietOnboardingForm />
      </div>
    </div>
  );
}