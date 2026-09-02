"use client"

import React, { useRef } from "react"
import { cn } from "@/lib/utils"
import { useMotionValueEvent, useScroll } from "motion/react"

export const centralColumnStyle = "w-[90%] max-w-[1340px] mx-auto"
export const pageYPadding = "py-10 md:py-12 lg:py-20 xl:py-30 2xl:py-40"

export interface ItemContent {
  title: string
  description: string
  image: {
    url: string
    width: number
    height: number
    alt: string
  }
}

interface Props extends React.ComponentProps<"div"> {
  contentA: ItemContent
  contentB: ItemContent
  contentC: ItemContent
  contentD?: ItemContent
  titleClass?: string
  descriptionClass?: string
}

const ScrollRevealContentA = ({
  contentA,
  contentB,
  contentC,
  contentD,
  className,
  ...props
}: Props) => {
  const [scrollProgress, setScrollProgress] = React.useState(0)
  const ref0 = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: ref0,
  })

  useMotionValueEvent(scrollYProgress, "change", () => {
    setScrollProgress(scrollYProgress.get())
  })

  const hasD = !!contentD
  const t1e = hasD ? 0.25 : 0.33
  const t2s = hasD ? 0.25 : 0.33
  const t2e = hasD ? 0.50 : 0.66
  const t3s = hasD ? 0.50 : 0.66
  const t3e = hasD ? 0.75 : 1.0
  const t4s = 0.75

  return (
    <div
      ref={ref0}
      className={cn(className)}
      style={{ background: "#fff" }}
      {...props}
    >
      {/* inner centering wrapper */}
      <div style={{ maxWidth: "90vw", margin: "0 auto" }}>
        {/* flex row: sticky panel + spacer sibling */}
        <div style={{ display: "flex", width: "100%", position: "relative", zIndex: 20 }}>

          {/* STICKY PANEL — stays fixed while spacer creates scroll height */}
          <div
            style={{
              position: "sticky",
              top: 0,
              height: "100vh",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              justifyContent: "center",
              width: "90%",
              maxWidth: "1340px",
              margin: "0 auto",
              flexShrink: 0,
            }}
          >
            <div style={{ display: "flex", flexDirection: "row", gap: "5rem", width: "100%", height: "100%" }}>

              {/* LEFT: step list */}
              <div
                style={{
                  width: "50%",
                  height: "auto",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  gap: "2.5rem",
                }}
              >
                <PointItem
                  active={true}
                  number="01"
                  title={contentA.title}
                  description={contentA.description}
                  thresholdStart={0}
                  thresholdEnd={t1e}
                  scrollProgress={scrollProgress}
                />
                <PointItem
                  active={true}
                  number="02"
                  title={contentB.title}
                  description={contentB.description}
                  thresholdStart={t2s}
                  thresholdEnd={t2e}
                  scrollProgress={scrollProgress}
                />
                <PointItem
                  active={true}
                  number="03"
                  title={contentC.title}
                  description={contentC.description}
                  thresholdStart={t3s}
                  thresholdEnd={t3e}
                  scrollProgress={scrollProgress}
                />
                {contentD && (
                  <PointItem
                    active={true}
                    number="04"
                    title={contentD.title}
                    description={contentD.description}
                    thresholdStart={t4s}
                    thresholdEnd={1.0}
                    scrollProgress={scrollProgress}
                  />
                )}
              </div>

              {/* RIGHT: stacked images that crossfade */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  width: "50%",
                  position: "relative",
                  height: "100%",
                }}
              >
                <img
                  src={contentA.image.url}
                  alt={contentA.image.alt}
                  style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    width: "auto",
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: "1rem",
                    opacity: scrollProgress > -1 ? 1 : 0,
                    transition: "opacity 0.3s ease",
                  }}
                />
                <img
                  src={contentB.image.url}
                  alt={contentB.image.alt}
                  style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    width: "auto",
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: "1rem",
                    opacity: scrollProgress > t2s ? 1 : 0,
                    transition: "opacity 0.3s ease",
                  }}
                />
                <img
                  src={contentC.image.url}
                  alt={contentC.image.alt}
                  style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    width: "auto",
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: "1rem",
                    opacity: scrollProgress > t3s ? 1 : 0,
                    transition: "opacity 0.3s ease",
                  }}
                />
                {contentD && (
                  <img
                    src={contentD.image.url}
                    alt={contentD.image.alt}
                    style={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      width: "auto",
                      height: "100%",
                      objectFit: "cover",
                      borderRadius: "1rem",
                      opacity: scrollProgress > t4s ? 1 : 0,
                      transition: "opacity 0.3s ease",
                    }}
                  />
                )}
              </div>
            </div>
          </div>

          {/* SPACER — zero width, 300vh height — makes outer div scroll-trackable */}
          <div style={{ height: "300vh", flexShrink: 0, width: 0 }} />
        </div>
      </div>
    </div>
  )
}

export default ScrollRevealContentA

const getBarPercentageHeight = (scrollProgress: number, thresholdStart: number, thresholdEnd: number) => {
  if (scrollProgress < thresholdStart) return 0
  if (scrollProgress > thresholdEnd) return 100
  return ((scrollProgress - thresholdStart) / (thresholdEnd - thresholdStart)) * 100
}

const PointItem = ({
  active,
  number,
  title,
  description,
  thresholdStart,
  thresholdEnd,
  scrollProgress,
}: {
  active: boolean
  number: string
  title: string
  description: string
  thresholdStart: number
  thresholdEnd: number
  scrollProgress: number
}) => {
  const barHeightPercentage = getBarPercentageHeight(scrollProgress, thresholdStart, thresholdEnd)
  const isActive = barHeightPercentage > 0

  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%", opacity: active ? 1 : 0.5 }}>
      {/* Step number */}
      <div style={{ width: "100%" }}>
        <h3
          style={{
            fontSize: "1.25rem",
            fontWeight: 700,
            fontFamily: "'JetBrains Mono', monospace",
            marginBottom: "0.5rem",
            marginLeft: "1.25rem",
            color: isActive ? "#000066" : "#94a3b8",
            transition: "color 0.3s ease",
          }}
        >
          {number}
        </h3>
      </div>

      {/* Bar + text row */}
      <div style={{ display: "flex", position: "relative", left: "1rem", width: "100%" }}>

        {/* Vertical progress bar */}
        <div style={{ width: "70px", display: "flex", alignItems: "flex-start", justifyContent: "center", position: "relative", flexShrink: 0 }}>
          {/* Track */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: "50%",
              transform: "translateX(-50%)",
              width: "2px",
              height: "100%",
              background: "#e2e8f0",
            }}
          />
          {/* Fill */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: "50%",
              transform: "translateX(-50%)",
              width: "3px",
              height: `${barHeightPercentage}%`,
              background: "#ff5225",
              transition: "height 0.05s linear",
            }}
          />
        </div>

        {/* Title + description */}
        <div style={{ paddingLeft: "1rem", flex: 1 }}>
          <h3
            style={{
              fontSize: "1.1rem",
              fontWeight: 700,
              color: isActive ? "#0f172a" : "#94a3b8",
              marginBottom: "0.4rem",
              letterSpacing: "-0.01em",
              transition: "color 0.3s ease",
            }}
          >
            {title}
          </h3>
          <p
            style={{
              fontSize: "0.88rem",
              color: isActive ? "#475569" : "#cbd5e1",
              lineHeight: 1.65,
              maxWidth: "420px",
              transition: "color 0.3s ease",
            }}
          >
            {description}
          </p>
        </div>
      </div>
    </div>
  )
}
