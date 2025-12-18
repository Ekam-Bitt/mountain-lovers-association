import { Suspense } from "react";
// import { api } from "@/lib/api";
// import { NewsDTO, PaginatedResponseDTO } from "@/types/dto";
import { NewsItem } from "@/types/domain";
import { NewsSectionClient } from "./NewsSectionClient";

import { PublicApiService } from "@/lib/services/public-api";

async function getNews(): Promise<NewsItem[]> {
  try {
    const response = await PublicApiService.getNews();
    return response.data;
  } catch (error) {
    console.error("Failed to fetch news:", error);
    return [];
  }
}

export async function NewsSection() {
  const newsItems = await getNews();

  return (
    <Suspense fallback={null}>
      <NewsSectionClient newsItems={newsItems} />
    </Suspense>
  );
}
