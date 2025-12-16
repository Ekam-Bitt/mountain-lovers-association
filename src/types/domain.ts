import { StaticImageData } from "next/image";

export interface NewsItem {
    id: string | number;
    title: string;
    description: string;
    image: string | StaticImageData;
    date: string; // ISO date string preferred for backend, but keeping string for now
}

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
