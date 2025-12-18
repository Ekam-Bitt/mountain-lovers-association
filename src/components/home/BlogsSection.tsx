import { Suspense } from "react";
// import { api } from "@/lib/api";
// import { BlogDTO, PaginatedResponseDTO } from "@/types/dto";
import { BlogItem } from "@/types/domain";
import { BlogsSectionClient } from "./BlogsSectionClient";

import { PublicApiService } from "@/lib/services/public-api";

async function getBlogs(): Promise<BlogItem[]> {
  try {
    const response = await PublicApiService.getBlogs({
      limit: 3,
      orderBy: "publishedAt",
      order: "desc",
    });
    return response.data.map((blog, index) => ({
      ...blog,
      alignment: index % 2 === 0 ? "left" : "right",
    }));
  } catch (error) {
    console.error("Failed to fetch blogs:", error);
    return [];
  }
}

export async function BlogsSection() {
  const blogs = await getBlogs();

  return (
    <Suspense fallback={null}>
      <BlogsSectionClient blogs={blogs} />
    </Suspense>
  );
}
