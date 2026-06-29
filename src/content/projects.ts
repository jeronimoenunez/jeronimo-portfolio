export type Project = {
  slug: string;
  title: string;
  category: string;
  year: string;
  description?: string;
  repo?: string;
  image: {
    src: string;
    alt: string;
  };
};

export const projects: Project[] = [
  {
    slug: "llm-redteam",
    title: "Red-Teaming de Agentes LLM Gobernados",
    category: "Seguridad de IA",
    year: "2026",
    description:
      "Auditoría de seguridad de agentes bajo OWASP Top 10 for LLM. Identifiqué inyección indirecta (7,81%), diseñé la mitigación y re-validé a 0% sin degradar el agente.",
    repo: "https://github.com/jeronimoenunez/llm-redteam-governed-agents",
    image: { src: "/img/VMA-1.webp", alt: "Red-Teaming de Agentes LLM Gobernados" },
  },
  {
    slug: "web-intelligence",
    title: "Web Intelligence Analyst",
    category: "Agente de IA + Seguridad",
    year: "2026",
    description:
      "Agente autónomo que audita sitios web. Lo sometí a red-teaming y corregí una vulnerabilidad crítica de 6 casos a 0 sin afectar funcionamiento.",
    repo: "https://github.com/jeronimoenunez/web-intelligence-analyst",
    image: { src: "/img/TN-1.webp", alt: "Web Intelligence Analyst" },
  },
  {
    slug: "multi-agente",
    title: "Sistema Multi-Agente con Gobernanza",
    category: "Arquitectura de IA",
    year: "2026",
    description:
      "Orquestación de agentes sobre procesos de negocio bajo capa de gobernanza: ninguna acción se ejecuta sin trazabilidad ni aprobación humana. JWT, proxy seguro a Claude API.",
    repo: "",
    image: { src: "/img/BP-1.webp", alt: "Sistema Multi-Agente con Gobernanza" },
  },
];
