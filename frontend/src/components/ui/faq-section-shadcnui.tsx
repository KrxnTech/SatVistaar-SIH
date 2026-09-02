import React, { useId, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, HelpCircle, Sparkles } from "lucide-react";

export interface FAQItem {
  question: string;
  answer: string;
  tag?: string;
}

const DEFAULT_FAQS: FAQItem[] = [
  {
    tag: "INGESTION & FORMATS",
    question: "What satellite image formats, sensors, and file sizes are supported?",
    answer:
      "SatVistaar ingests standard multi-band GeoTIFF (.tif, .tiff), PNG, JPG, and JPEG files up to 50MB. Multi-spectral optical rasters from Sentinel-2, Landsat-8, and commercial high-resolution constellations are automatically processed via our Python GDAL/Rasterio pipeline to extract spatial bounds, CRS metadata, and calibrated RGB representations.",
  },
  {
    tag: "HYBRID CLOUD & LOCAL VLM",
    question: "How does the multimodal VLM routing and failover work?",
    answer:
      "Queries and raster frames are initially routed to Groq Cloud (Qwen3.8-27B Vision) for high-throughput sub-2-second inference. If rate limits (HTTP 429), timeouts, or network interruptions occur, the intelligent model router automatically triggers zero-loss fallback to your local self-hosted Ollama (qwen2-vl) daemon.",
  },
  {
    tag: "VISUAL GROUNDING",
    question: "How does visual target localization and coordinate extraction operate?",
    answer:
      "Our visual grounding engine parses prompt queries to detect specific entities (such as runways, aircraft, naval vessels, and storage tanks). It outputs normalized bounding quadrant overlays, spatial attention coordinates, and standardized cryptographic JSON telemetry with UUID verification.",
  },
  {
    tag: "CHANGE DETECTION",
    question: "How does Bi-Temporal Change Detection evaluate two scenes?",
    answer:
      "Bi-Temporal Change mode accepts two co-registered satellite rasters—Baseline Scene A and Comparison Scene B. The VLM performs comparative differential reasoning to highlight infrastructure expansion, flood coverage, vegetation loss, or disaster damage alongside side-by-side visual comparisons.",
  },
  {
    tag: "SECURITY & AIR-GAP",
    question: "Can SatVistaar be deployed in secure, air-gapped tactical environments?",
    answer:
      "Yes. SatVistaar is fully containerized with Docker and supports completely offline, air-gapped on-premises deployments using local GPU-accelerated Ollama instances with zero external cloud dependencies or telemetry leakage.",
  },
];

interface FAQSectionProps {
  category?: string;
  heading?: string;
  description?: string;
  faqs?: FAQItem[];
}

export function FAQSection({
  category = "FREQUENTLY ASKED QUESTIONS",
  heading = "Everything You Need to Know About SatVistaar",
  description = "Detailed answers on satellite ingestion, multimodal VLM routing, visual grounding, and deployment architecture.",
  faqs = DEFAULT_FAQS,
}: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const baseId = useId();

  return (
    <section
      className="satvistaar-faq-section"
      style={{
        width: "100%",
        padding: "6.5rem 1.5rem 6.5rem 1.5rem",
        background: "#f8fafc",
        borderTop: "1px solid #e2e8f0",
        position: "relative",
        zIndex: 1,
      }}
    >
      <div style={{ maxWidth: "860px", margin: "0 auto", width: "100%" }}>
        {/* Header Block */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          style={{ textAlign: "center", marginBottom: "3.5rem" }}
        >
          {category && (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.35rem 0.9rem",
                borderRadius: "999px",
                background: "rgba(255, 82, 37, 0.08)",
                border: "1px solid rgba(255, 82, 37, 0.25)",
                color: "#ff5225",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "0.78rem",
                fontWeight: 700,
                letterSpacing: "0.06em",
                marginBottom: "1rem",
              }}
            >
              <Sparkles size={14} />
              <span>{category}</span>
            </div>
          )}
          <h2
            style={{
              fontSize: "clamp(2rem, 4vw, 3rem)",
              fontWeight: 800,
              color: "#000066",
              letterSpacing: "-0.03em",
              lineHeight: 1.15,
              marginBottom: "1rem",
            }}
          >
            {heading}
          </h2>
          <p
            style={{
              color: "#64748b",
              fontSize: "clamp(0.95rem, 1.2vw, 1.1rem)",
              lineHeight: 1.6,
              maxWidth: "620px",
              margin: "0 auto",
            }}
          >
            {description}
          </p>
        </motion.div>

        {/* Accordion Cards List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {faqs.map((faq, index) => {
            const questionId = `${baseId}-question-${index}`;
            const answerId = `${baseId}-answer-${index}`;
            const isOpen = openIndex === index;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.07 }}
              >
                <div
                  style={{
                    borderRadius: "14px",
                    border: isOpen ? "1.5px solid rgba(0, 0, 102, 0.35)" : "1px solid #e2e8f0",
                    background: "#ffffff",
                    boxShadow: isOpen
                      ? "0 10px 25px -5px rgba(0, 0, 102, 0.08), 0 4px 10px -2px rgba(0, 0, 102, 0.04)"
                      : "0 1px 3px rgba(0, 0, 0, 0.04)",
                    overflow: "hidden",
                    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "1.35rem 1.6rem",
                      textAlign: "left",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      gap: "1rem",
                    }}
                    aria-expanded={isOpen}
                    aria-controls={answerId}
                    id={questionId}
                  >
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem", flex: 1 }}>
                      {faq.tag && (
                        <span
                          style={{
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: "0.72rem",
                            fontWeight: 700,
                            color: "#ff5225",
                            letterSpacing: "0.06em",
                            textTransform: "uppercase",
                          }}
                        >
                          {faq.tag}
                        </span>
                      )}
                      <span
                        style={{
                          fontSize: "1.08rem",
                          fontWeight: 700,
                          color: isOpen ? "#000066" : "#1e293b",
                          lineHeight: 1.4,
                          transition: "color 0.2s ease",
                        }}
                      >
                        {faq.question}
                      </span>
                    </div>

                    <motion.div
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.25 }}
                      style={{
                        width: "34px",
                        height: "34px",
                        borderRadius: "999px",
                        background: isOpen ? "#000066" : "#f1f5f9",
                        color: isOpen ? "#ffffff" : "#64748b",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        transition: "background-color 0.2s ease, color 0.2s ease",
                      }}
                      aria-hidden="true"
                    >
                      <ChevronDown size={18} />
                    </motion.div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        role="region"
                        id={answerId}
                        aria-labelledby={questionId}
                      >
                        <div
                          style={{
                            padding: "0 1.6rem 1.5rem 1.6rem",
                            borderTop: "1px solid #f1f5f9",
                            paddingTop: "1rem",
                            color: "#475569",
                            fontSize: "0.95rem",
                            lineHeight: 1.7,
                          }}
                        >
                          <p style={{ margin: 0 }}>{faq.answer}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default FAQSection;
