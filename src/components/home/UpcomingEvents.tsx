import { Suspense } from "react";
// import { api } from "@/lib/api";
// import { EventDTO, PaginatedResponseDTO } from "@/types/dto";
import { EventItem } from "@/types/domain";
import { UpcomingEventsClient } from "./UpcomingEventsClient";

import { PublicApiService } from "@/lib/services/public-api";

async function getEvents(): Promise<EventItem[]> {
  try {
    const response = await PublicApiService.getEvents();
    return response.data;
  } catch (error) {
    console.error("Failed to fetch events:", error);
    return [];
  }
}

export async function UpcomingEvents() {
  const events = await getEvents();

  return (
    <Suspense fallback={null}>
      <UpcomingEventsClient events={events} />
    </Suspense>
  );
}
