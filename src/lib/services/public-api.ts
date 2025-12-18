import { api } from "@/lib/api";
import { BlogDTO, EventDTO, NewsDTO, PaginatedResponseDTO } from "@/types/dto";
import { BlogItem, EventItem, NewsItem } from "@/types/domain";
import { FALLBACK_IMAGES } from "@/lib/constants";
import { getDeterministicPattern } from "@/lib/utils";

export const PublicApiService = {
  // News
  async getNews(
    params: { limit?: number; page?: number } = {},
  ): Promise<PaginatedResponseDTO<NewsItem>> {
    const searchParams = new URLSearchParams();
    if (params.limit) searchParams.set("limit", params.limit.toString());
    if (params.page) searchParams.set("page", params.page.toString());

    const response = await api.get<PaginatedResponseDTO<NewsDTO>>(
      `/public/news?${searchParams.toString()}`,
    );

    return {
      ...response,
      data: response.data.map((dto) => ({
        id: dto.id,
        title: dto.title,
        description: dto.excerpt || "",
        // Use deterministic image based on ID
        image:
          dto.image || getDeterministicPattern(dto.id, FALLBACK_IMAGES.NEWS),
        date: dto.publishedAt
          ? new Date(dto.publishedAt).toISOString()
          : new Date().toISOString(),
      })),
    };
  },

  async getNewsById(id: string): Promise<NewsItem> {
    const dto = await api.get<NewsDTO>(`/public/news/${id}`);
    return {
      id: dto.id,
      title: dto.title,
      description: dto.content || dto.excerpt || "",
      image: dto.image || getDeterministicPattern(dto.id, FALLBACK_IMAGES.NEWS),
      date: dto.publishedAt
        ? new Date(dto.publishedAt).toISOString()
        : new Date().toISOString(),
    };
  },

  // Blogs
  async getBlogs(
    params: {
      limit?: number;
      page?: number;
      orderBy?: string;
      order?: "asc" | "desc";
    } = {},
  ): Promise<PaginatedResponseDTO<BlogItem>> {
    const searchParams = new URLSearchParams();
    if (params.limit) searchParams.set("limit", params.limit.toString());
    if (params.page) searchParams.set("page", params.page.toString());
    if (params.orderBy) searchParams.set("orderBy", params.orderBy);
    if (params.order) searchParams.set("order", params.order);

    const response = await api.get<PaginatedResponseDTO<BlogDTO>>(
      `/public/blogs?${searchParams.toString()}`,
    );

    return {
      ...response,
      data: response.data.map((dto) => ({
        id: dto.id,
        title: dto.title,
        author: dto.author?.email || "Unknown",
        date: dto.publishedAt
          ? new Date(dto.publishedAt).toISOString()
          : new Date().toISOString(),
        image:
          dto.image || getDeterministicPattern(dto.id, FALLBACK_IMAGES.BLOGS),
        excerpt: dto.excerpt || "",
        content: dto.content || "",
      })),
    };
  },

  async getBlogById(id: string): Promise<BlogItem> {
    const dto = await api.get<BlogDTO>(`/public/blogs/${id}`);
    return {
      id: dto.id,
      title: dto.title,
      author: dto.author?.email || "Unknown",
      date: dto.publishedAt
        ? new Date(dto.publishedAt).toISOString()
        : new Date().toISOString(),
      image:
        dto.image || getDeterministicPattern(dto.id, FALLBACK_IMAGES.BLOGS),
      excerpt: dto.excerpt || "",
      content: dto.content || "",
    };
  },

  // Events
  async getEvents(
    params: {
      limit?: number;
      page?: number;
      orderBy?: string;
      order?: "asc" | "desc";
    } = {},
  ): Promise<PaginatedResponseDTO<EventItem>> {
    const searchParams = new URLSearchParams();
    if (params.limit) searchParams.set("limit", params.limit.toString());
    if (params.page) searchParams.set("page", params.page.toString());
    if (params.orderBy) searchParams.set("orderBy", params.orderBy);
    if (params.order) searchParams.set("order", params.order);

    const response = await api.get<PaginatedResponseDTO<EventDTO>>(
      `/public/events?${searchParams.toString()}`,
    );

    return {
      ...response,
      data: response.data.map((dto) => ({
        id: dto.id,
        title: dto.title,
        description: dto.description || "",
        image:
          dto.image || getDeterministicPattern(dto.id, FALLBACK_IMAGES.EVENTS),
        date: dto.startDate
          ? new Date(dto.startDate).toISOString()
          : new Date().toISOString(),
        endDate: dto.endDate ? new Date(dto.endDate).toISOString() : undefined,
        location: dto.location || "",
        capacity: dto.capacity || undefined,
      })),
    };
  },

  async getEventById(id: string): Promise<EventItem> {
    const dto = await api.get<EventDTO>(`/public/events/${id}`);
    return {
      id: dto.id,
      title: dto.title,
      description: dto.description || "",
      image:
        dto.image || getDeterministicPattern(dto.id, FALLBACK_IMAGES.EVENTS),
      date: dto.startDate
        ? new Date(dto.startDate).toISOString()
        : new Date().toISOString(),
      endDate: dto.endDate ? new Date(dto.endDate).toISOString() : undefined,
      location: dto.location || "",
      capacity: dto.capacity || undefined,
    };
  },
};
