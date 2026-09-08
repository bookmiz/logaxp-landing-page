"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { LocationDetailManager } from "@/logaxp/components/orgStructure/locations/LocationDetailManager";

export default function LocationDetailPage() {
  const params = useParams();
  const id = String(params.id);

  return <LocationDetailManager locationId={id} />;
}