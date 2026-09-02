import React from "react";
import { ArrowRight } from "lucide-react";

export interface Feature {
  id: string;
  title: string;
  description: string;
  image: string;
  badge?: string;
  query?: string;
}

export interface Feature72Props {
  heading?: string;
  description?: string;
  linkUrl?: string;
  linkText?: string;
  onLinkClick?: () => void;
  onFeatureClick?: (feature: Feature) => void;
  features?: Feature[];
  category?: string;
}

export const Feature72 = ({
  category = "CORE CAPABILITIES",
  heading = "Supported Analysis Tasks",
  description = "SatVistaar implements four verified analysis workflows strictly supported by our multimodal remote sensing pipeline.",
  linkUrl = "/analysis",
  linkText = "Open Interactive Analysis Dashboard",
  onLinkClick,
  onFeatureClick,
  features = [
    {
      id: "qa",
      title: "Visual Question Answering (VQA)",
      badge: "1 IMAGE // INQUIRY",
      description:
        "Ask arbitrary natural language questions about visible objects, naval vessels, runway status, water bodies, or terrain features with sub-second VLM inference.",
      image: "https://images.unsplash.com/photo-1508873696983-2df5293cb395?auto=format&fit=crop&w=1000&q=80",
      query: "What is visible in this satellite image?",
    },
    {
      id: "caption",
      title: "Comprehensive Scene Captioning",
      badge: "1 IMAGE // DESCRIPTION",
      description:
        "Generates dense, multi-sentence analytical descriptions classifying land cover types, infrastructure density, maritime presence, and environmental topography.",
      image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1000&q=80",
      query: "Describe all terrain, infrastructure, and visible objects in this satellite scene.",
    },
    {
      id: "grounding",
      title: "Visual Grounding & Target Localization",
      badge: "1 IMAGE + OVERLAY // SPATIAL",
      description:
        "Detects and localizes specific targets such as aircraft, storage tanks, and bridges with bounding coordinates, quadrant attention maps, and structured JSON telemetry.",
      image: "https://images.unsplash.com/photo-1528728329032-2972f65dfb3f?auto=format&fit=crop&w=1000&q=80",
      query: "Locate and mark all runways and hangars in this airfield image.",
    },
    {
      id: "change",
      title: "Bi-Temporal Change Detection",
      badge: "2 IMAGES (PAIR) // DIFFERENCE",
      description:
        "Compares co-registered multi-temporal satellite scenes (baseline vs comparison) to detect deforestation, flood extent, urban expansion, or disaster damage.",
      image: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1000&q=80",
      query: "What changed between these two satellite scenes?",
    },
  ],
}: Feature72Props) => {
  return (
    <section
      className="satvistaar-feature-section"
      style={{
        width: "100%",
        padding: "6.5rem 0 6.5rem 0",
        background: "#ffffff",
        position: "relative",
        zIndex: 1,
      }}
    >
      <div className="container" style={{ maxWidth: "1360px", margin: "0 auto", padding: "0 1.5rem", display: "flex", flexDirection: "column", gap: "3.5rem" }}>
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-4 border-b border-slate-200">
          <div className="max-w-2xl">
            {category && (
              <span className="font-mono text-xs font-bold text-[#ff5225] tracking-wider uppercase mb-2 block">
                {category}
              </span>
            )}
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#000066] tracking-tight mb-4">
              {heading}
            </h2>
            <p className="text-slate-600 text-base md:text-lg leading-relaxed max-w-xl">
              {description}
            </p>
          </div>

          <div className="flex-shrink-0">
            {onLinkClick ? (
              <button
                type="button"
                onClick={onLinkClick}
                className="group transition-all"
                style={{
                  backgroundColor: "#000066",
                  color: "#ffffff",
                  padding: "0.75rem 1.45rem",
                  borderRadius: "999px",
                  fontWeight: 700,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.6rem",
                  fontSize: "0.92rem",
                  border: "none",
                  cursor: "pointer",
                  boxShadow: "0 4px 14px rgba(0, 0, 102, 0.22)",
                }}
              >
                <span>{linkText}</span>
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1 text-[#ff5225]" />
              </button>
            ) : (
              <a
                href={linkUrl}
                className="group transition-all"
                style={{
                  backgroundColor: "#000066",
                  color: "#ffffff",
                  padding: "0.75rem 1.45rem",
                  borderRadius: "999px",
                  fontWeight: 700,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.6rem",
                  fontSize: "0.92rem",
                  border: "none",
                  cursor: "pointer",
                  boxShadow: "0 4px 14px rgba(0, 0, 102, 0.22)",
                  textDecoration: "none",
                }}
              >
                <span>{linkText}</span>
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1 text-[#ff5225]" />
              </a>
            )}
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {features.map((feature) => (
            <div
              key={feature.id}
              onClick={() => onFeatureClick?.(feature)}
              className={`group flex flex-col overflow-clip rounded-2xl border border-slate-200/90 bg-white hover:border-[#000066]/30 hover:shadow-xl transition-all duration-300 ${
                onFeatureClick ? "cursor-pointer" : ""
              }`}
            >
              <div className="relative overflow-hidden aspect-[16/9] w-full bg-slate-900">
                <img
                  src={feature.image}
                  alt={feature.title}
                  className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />
                {feature.badge && (
                  <div className="absolute top-4 left-4">
                    <span className="font-mono text-[11px] font-bold px-3 py-1 rounded-md bg-black/70 backdrop-blur-md text-white border border-white/20">
                      {feature.badge}
                    </span>
                  </div>
                )}
              </div>
              <div className="p-6 md:p-8 flex flex-col justify-between flex-1">
                <div>
                  <h3 className="mb-2 text-xl md:text-2xl font-bold text-[#000066] tracking-tight group-hover:text-[#ff5225] transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 text-sm md:text-base leading-relaxed mb-4">
                    {feature.description}
                  </p>
                </div>

                {feature.query && (
                  <div className="mt-2 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span className="font-mono truncate max-w-[80%] italic">
                      &ldquo;{feature.query}&rdquo;
                    </span>
                    <span className="inline-flex items-center text-[#ff5225] font-semibold gap-1 group-hover:translate-x-1 transition-transform">
                      Try Mode <ArrowRight className="size-3.5" />
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
