import DietList from "@/components/diet/DietList";

export default function DietPage() {
  return (
    <div className="wrapperx max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Diet Plans</h1>
      <p className="text-base text-muted-foreground italic mb-6">
        Browse curated and community plans. Create your own anytime.
      </p>
      <div className="relative flex justify-center items-center mb-6">
        <img
          src="/graphics/platey.png"
          alt="Indian Plate"
          className="w-full object-cover rounded-md"
        />
        <p className="absolute text-white text-center text-3xl italic mb-6">
          Let&apos;s Start By creating your own diet plan.
        </p>
      </div>
      <DietList />
    </div>
  );
}