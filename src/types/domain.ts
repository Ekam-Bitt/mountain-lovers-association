import { StaticImageData } from "next/image";

// UI-Specific Domain Models
// These are used by Frontend Components and may differ from API DTOs.

export interface NewsItem {
    id: string | number;
    title: string;
    description: string;
    image: string | StaticImageData;
    date: string; // ISO date string preferred for backend, but keeping string for now
}
// ... existing EventItem, BlogItem ...
export interface EventItem {
    id: string | number;
    title: string;
    description: string;
    image: string | StaticImageData;
    date: string;
    location?: string;
}

export interface BlogItem {
    id: string | number;
    title: string;
    author: string;
    date: string;
    image: string | StaticImageData;
    excerpt?: string;
    content?: string;
    alignment?: 'left' | 'right'; // UI specific, might keep separate or optional
}
