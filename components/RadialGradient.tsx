export default function RadialGradient() {
  return (
        <div className="min-h-screen w-full fixed top-0 left-0 z-0">
        <div
            className="absolute inset-0 z-0"
            style={{
            background: "radial-gradient(125% 125% at 50% 90%, #fff 40%, #6366f1 100%)",
            }}
        />
            {/* Your Content/Components */}
        </div>
    );
}