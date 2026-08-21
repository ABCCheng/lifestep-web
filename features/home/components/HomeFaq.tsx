import { ChevronDown } from "lucide-react";

export function HomeFaq({ items }: { items: Array<{ question: string; answer: string }> }) {
  return <div className="home-faq-grid">{items.map((item) => <details key={item.question}><summary><span>{item.question}</span><ChevronDown /></summary><p>{item.answer}</p></details>)}</div>;
}
