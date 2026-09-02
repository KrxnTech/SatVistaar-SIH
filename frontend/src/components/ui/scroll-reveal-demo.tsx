"use client";

import React from "react";
import ScrollRevealContentA, { ItemContent } from "@/components/ui/scroll-reveal-content-a";

const contentA: ItemContent = {
  title: "Join The Community",
  description:
    "Join over a billion people around the world who come to games to create, connect and be entertained.",
  image: {
    url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80",
    width: 657.6,
    height: 715.3,
    alt: "Satellite Earth Observation",
  },
};

const contentB: ItemContent = {
  title: "Bask in the spotlight",
  description:
    "This is where customer attention locks in — with your brand directly in the action of the biggest IP games.",
  image: {
    url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
    width: 657.6,
    height: 715.3,
    alt: "Deep Space and Orbital Network",
  },
};

const contentC: ItemContent = {
  title: "Drive big results",
  description:
    "Reach massive, high-intent audiences — and turn attention into awareness, engagement, and sales.",
  image: {
    url: "https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?auto=format&fit=crop&w=1200&q=80",
    width: 657.6,
    height: 715.3,
    alt: "Satellite Telemetry and Grounding",
  },
};

export default function ScrollRevealContentADemo() {
  return <ScrollRevealContentA contentA={contentA} contentB={contentB} contentC={contentC} />;
}
