import { buildPageGraph } from "@/lib/content/schema";

type JsonLdProps = {
  graph: ReturnType<typeof buildPageGraph>;
};

export default function JsonLd({ graph }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}
