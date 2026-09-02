import ScrollRevealContentA, { ItemContent } from "@/components/ui/scroll-reveal-content-a";

const contentA: ItemContent = {
  title: "Multi-Sensor Satellite Ingestion",
  description:
    "Direct ingestion of multi-band GeoTIFF, Sentinel-2, Landsat-8, and high-res RGB scenes with CRS coordinate extraction and spatial normalization.",
  image: {
    url: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1200&q=80",
    width: 657.6,
    height: 715.3,
    alt: "Multi-Sensor Satellite Earth Ingestion",
  },
};

const contentB: ItemContent = {
  title: "Deterministic Intent Classifier",
  description:
    "Autonomous natural-language parser analyzes prompt semantics, verifies image count modal constraints, and formulates the multi-step execution plan.",
  image: {
    url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
    width: 657.6,
    height: 715.3,
    alt: "Geospatial Grid and Planetary AI Layering",
  },
};

const contentC: ItemContent = {
  title: "Hybrid Cloud & Local VLM Routing",
  description:
    "Dispatches high-throughput multimodal spatial inference to Groq Cloud (Qwen3.8-27B Vision) with automatic seamless failover to local Ollama.",
  image: {
    url: "https://images.unsplash.com/photo-1446776877081-d282a0f896e2?auto=format&fit=crop&w=1200&q=80",
    width: 657.6,
    height: 715.3,
    alt: "High-Altitude Remote Sensing and Multimodal Inference",
  },
};

export default function ScrollRevealContentADemo() {
  return <ScrollRevealContentA contentA={contentA} contentB={contentB} contentC={contentC} />;
}
