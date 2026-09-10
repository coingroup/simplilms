import type { MetadataRoute } from "next";

const INDUSTRY_SLUGS = [
  "healthcare",
  "real-estate",
  "technology",
  "financial-services",
  "construction",
  "beauty-cosmetology",
  "legal",
  "education",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://simplilms.com";

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/industries`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];

  const industryPages: MetadataRoute.Sitemap = INDUSTRY_SLUGS.map((slug) => ({
    url: `${baseUrl}/industries/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...industryPages];
}
