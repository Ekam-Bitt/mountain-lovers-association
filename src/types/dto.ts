
// Backend DTOs (Data Transfer Objects)
// These types reflect exactly what the API returns.

export interface UserDTO {
    id: string;
    email: string;
    role: string;
}

export interface AuthResponseDTO {
    success: boolean;
    user: UserDTO;
}

export interface PaginationDTO {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface PaginatedResponseDTO<T> {
    data: T[];
    pagination: PaginationDTO;
}

export interface BlogDTO {
    id: string;
    title: string;
    slug: string;
    content: string;
    excerpt?: string | null;
    status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
    publishedAt?: Date | string | null;
    authorId: string;
    createdAt: Date | string;
    updatedAt: Date | string;
    author?: {
        id: string;
        email: string;
        role: string;
    };
}

export interface EventDTO {
    id: string;
    title: string;
    slug: string;
    description: string;
    location: string;
    startDate: Date | string;
    endDate: Date | string;
    capacity?: number | null;
    status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
    organizerId: string;
    createdAt: Date | string;
    updatedAt: Date | string;
    organizer?: {
        id: string;
        email: string;
        role: string;
    };
}

export interface NewsDTO {
    id: string;
    title: string;
    slug: string;
    content: string;
    excerpt?: string | null;
    status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
    publishedAt?: Date | string | null;
    authorId: string;
    createdAt: Date | string;
    updatedAt: Date | string;
}

export interface EventRegistrationDTO {
    id: string;
    eventId: string;
    userId: string;
    status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
    createdAt: Date | string;
    cancelledAt?: Date | string | null;
}
