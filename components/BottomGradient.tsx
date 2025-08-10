export default function BottomGradient() {
    return (
      <div
        className="fixed bottom-0 left-0 w-full h-[16vh] z-10 pointer-events-none"
        style={{
          background: 'linear-gradient(to top, hsl(var(--background)) 10%, transparent 100%)',
          transform: 'none',
        }}
      />
    );
  }
  