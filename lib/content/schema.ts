import { SITE_URL } from "./site-facts";

export type FaqItem = { q: string; a: string };

export type BreadcrumbItem = { name: string; path: string };

type WebPageInput = {
  name: string;
  description: string;
  path: string;
};

type BlogPostingInput = {
  title: string;
  description: string;
  path: string;
  datePublished: string;
  dateModified?: string;
};

export function buildBreadcrumbList(items: BreadcrumbItem[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}

export function buildWebPage({ name, description, path }: WebPageInput) {
  return {
    "@type": "WebPage",
    name,
    description,
    url: `${SITE_URL}${path}`,
    isPartOf: { "@type": "WebSite", name: "Rewardoxy", url: SITE_URL },
  };
}

export function buildFaqPage(faqs: FaqItem[]) {
  return {
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a },
    })),
  };
}

export function buildBlogPosting({
  title,
  description,
  path,
  datePublished,
  dateModified,
}: BlogPostingInput) {
  return {
    "@type": "BlogPosting",
    headline: title,
    description,
    url: `${SITE_URL}${path}`,
    datePublished,
    dateModified: dateModified ?? datePublished,
    author: { "@type": "Organization", name: "Rewardoxy", url: SITE_URL },
    publisher: {
      "@type": "Organization",
      name: "Rewardoxy",
      url: SITE_URL,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.png` },
    },
  };
}

export function buildPageGraph(nodes: Record<string, unknown>[]) {
  return {
    "@context": "https://schema.org",
    "@graph": nodes,
  };
}

export function buildStandardPageGraph(options: {
  webPage: WebPageInput;
  breadcrumbs: BreadcrumbItem[];
  faqs?: FaqItem[];
  blogPosting?: BlogPostingInput;
}) {
  const nodes: Record<string, unknown>[] = [
    buildWebPage(options.webPage),
    buildBreadcrumbList(options.breadcrumbs),
  ];
  if (options.faqs?.length) nodes.push(buildFaqPage(options.faqs));
  if (options.blogPosting) nodes.push(buildBlogPosting(options.blogPosting));
  return buildPageGraph(nodes);
}
