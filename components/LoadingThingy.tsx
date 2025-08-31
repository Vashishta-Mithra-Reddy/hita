"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader2, Lightbulb, Quote, Sparkles } from "lucide-react";

const funFacts = [
  "Did you know? Honey never spoils. Archaeologists found 3000-year-old honey still edible.",
  "Fun fact: Bananas are berries, but strawberries aren’t.",
  "Your brain uses about 20% of your body’s total energy.",
  "Sharks existed before trees – by about 50 million years.",
  "Octopuses have three hearts and blue blood."
];

const tips = [
  "💡 Pro tip: Use clear goals to get better AI results.",
  "💡 Ask follow-up questions to refine your answers.",
  "💡 Break down problems into smaller steps for clarity.",
  "💡 Save important chats to revisit later.",
  "💡 Try rephrasing if an answer feels incomplete."
];

export default function LoadingExperience() {
  const [factIndex, setFactIndex] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    const factInterval = setInterval(() => {
      setFactIndex((prev) => (prev + 1) % funFacts.length);
    }, 5000);

    const tipInterval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % tips.length);
    }, 7000);

    return () => {
      clearInterval(factInterval);
      clearInterval(tipInterval);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center gap-6 py-10 animate-fadeIn">
      <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />

      <Card className="w-full max-w-md shadow-md rounded-2xl border border-border/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-yellow-500" />
            Something to Think About
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{funFacts[factIndex]}</p>
        </CardContent>
      </Card>

      <Card className="w-full max-w-md shadow-md rounded-2xl border border-border/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Lightbulb className="h-5 w-5 text-blue-500" />
            Quick Tip
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{tips[tipIndex]}</p>
        </CardContent>
      </Card>

      <Card className="w-full max-w-md shadow-md rounded-2xl border border-border/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Quote className="h-5 w-5 text-green-500" />
            Quote of the Moment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="italic text-muted-foreground">
            &quot;Patience is not simply the ability to wait – it’s how we behave while we’re waiting.&quot;
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
