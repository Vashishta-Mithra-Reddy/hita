import DietPlanBuilder from "@/components/diet/DietPlanBuilder";

export default function DietMePage() {
  return (
    <div className="wrapperx max-w-6xl mx-auto">
      <div className="mb-8">
      <h1 className="text-3xl tracking-tight font-bold mb-2 text-center">Create Your Plan</h1>
      <p className="text-base text-muted-foreground mb-6 text-center">
        Build a personalized plan; set meal slots, add foods, and publish if you like.
      </p>
      </div>
      <DietPlanBuilder />
    </div>
  );
}
