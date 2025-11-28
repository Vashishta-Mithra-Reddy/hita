import DietList from "@/components/diet/DietList";

export default function DietPage() {
  return (
    <div className="wrapperx max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Diet Plans</h1>
      <p className="text-base text-muted-foreground italic mb-6">
        Browse curated and community plans. Create your own anytime.
      </p>
      <DietList />
    </div>
  );
}