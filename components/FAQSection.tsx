import FAQItem from "./FAQItem";

const faqs = [
  {
    question: "What is Hita?",
    answer:
      "Hita is your wellness companion, a trusted space to find healthy products, verified remedies, food data, and wellness tips without wasting hours researching."
  },
  {
    question: "Are the products and remedies verified?",
    answer:
      "Yes, everything listed is curated with care. We focus only on clean, healthy, and effective solutions backed by trusted brands and real results."
  },
  {
    question: "Do I need to sign up to use Hita?",
    answer:
      "Nope. You can freely explore products, foods, and remedies without creating an account."
  },
  {
    question: "Can I trust the food data?",
    answer:
      "Absolutely. We source data from the Indian Food Composition Tables (IFCT) published by the National Institute of Nutrition (NIN), ICMR, ensuring accuracy and reliability. "
  },
  {
    question: "Is Hita free to use?",
    answer:
      "Yes, Hita is completely free. Our mission is to make wellness accessible and easy for everyone."
  },
];

export default function FAQSection() {
  return (
    <section className="max-w-5xl mx-auto pb-48 px-6 md:px-12">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-satoshi font-semibold mb-4 text-foreground/80">
          Frequently Asked Questions
        </h2>
        <p className="text-lg md:text-xl text-foreground/70">
          Everything you need to know about Hita.
        </p>
      </div>
      <div className="divide-y divide-foreground/10">
        {faqs.map((faq, i) => (
          <FAQItem key={i} question={faq.question} answer={faq.answer} />
        ))}
      </div>
    </section>
  );
}
