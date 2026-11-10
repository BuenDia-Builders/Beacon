import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

export default defineConfig({
  site: "https://BuenDia-Builders.github.io",
  base: "/Beacon",
  integrations: [
    starlight({
      title: "Beacon",
      description: "Fuzzy matching for Stellar payment memos and references.",
      logo: {
        src: "./src/assets/logo.svg",
        replacesTitle: false,
      },
      social: [
        { icon: "github", label: "GitHub", href: "https://github.com/BuenDia-Builders/Beacon" },
      ],
      sidebar: [
        {
          label: "Guide",
          items: [
            { label: "Overview", slug: "guide/overview" },
            { label: "Getting started", slug: "guide/getting-started" },
            { label: "Examples", slug: "guide/examples" },
            { label: "How it works", slug: "guide/how-it-works" },
            { label: "Limitations", slug: "guide/limitations" },
            { label: "FAQ", slug: "guide/faq" },
          ],
        },
        { label: "Why", slug: "why" },
        { label: "Roadmap", slug: "roadmap" },
      ],
    }),
  ],
});
