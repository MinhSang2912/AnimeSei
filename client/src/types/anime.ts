export interface Anime {
  id: number;
  titleRomaji: string;
  titleEnglish?: string;
  titleNative?: string;
  description: string;
  coverImage?: string;
  bannerImage?: string;
  episodes?: number;
  status: string;
  format?: string;
  countryOfOrigin?: string;
  is3D?: boolean;
  genres: string[];
  averageScore?: number;
  seasonYear?: number;
  startDate?: string;
  trailerSite?: string;
  trailerId?: string;
  relations?: AnimeRelation[];
  viewCount: number;
}

export interface AnimeRelation {
  id: number;
  relationType: string;
  title: string;
  coverImage?: string;
  format?: string;
  seasonYear?: number;
}

export interface User {
  userId: string;
  username: string;
  email: string;
  role: string;
  accessToken: string;
  refreshToken: string;
  points: number;
  avatarUrl?: string;
}

export interface PagedResult<T> {
  items: T[];
  currentPage: number;
  lastPage: number;
  total: number;
  hasNextPage: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  errors?: string[];
}
