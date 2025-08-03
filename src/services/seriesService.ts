import { supabase } from '@/lib/supabase';

export interface Episode {
  id: string;
  title: string;
  duration: number;
  description: string;
  thumbnail_url: string;
  episode_number: number;
  season_number: number;
  video_url: string;
  view_count: number;
  rating: number;
  isWatched?: boolean;
}

export interface SeriesDetail {
  id: string;
  title: string;
  description: string;
  long_description?: string;
  poster_url: string;
  banner_url?: string;
  thumbnail_url?: string;
  trailer_url?: string;
  rating: number;
  year: number;
  genres: string[];
  duration: string;
  total_episodes: number;
  total_seasons: number;
  status: string;
  is_featured: boolean;
  is_trending: boolean;
  view_count: number;
  like_count: number;
  bookmark_count: number;
  cast_members?: string[];
  director_name?: string;
  creator_name?: string;
  language?: string;
  country?: string;
  release_date?: string;
  maturity_rating?: string;
  episodes: Episode[];
  isFavorite?: boolean;
}

// Fetch all series from Supabase
export const getAllSeries = async (): Promise<SeriesDetail[]> => {
  try {
    const { data: seriesData, error } = await supabase
      .from('series')
      .select(`
        *,
        episodes (
          id,
          title,
          description,
          duration,
          episode_number,
          season_number,
          video_url,
          thumbnail_url,
          view_count,
          rating
        )
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching series:', error);
      return [];
    }

    return seriesData?.map(series => ({
      id: series.id,
      title: series.title,
      description: series.description,
      long_description: series.long_description,
      poster_url: series.poster_url,
      banner_url: series.banner_url,
      thumbnail_url: series.thumbnail_url,
      trailer_url: series.trailer_url,
      rating: series.rating || 0,
      year: series.year || new Date().getFullYear(),
      genres: series.genres || [],
      duration: series.duration || 'Unknown',
      total_episodes: series.total_episodes || 0,
      total_seasons: series.total_seasons || 1,
      status: series.status,
      is_featured: series.is_featured || false,
      is_trending: series.is_trending || false,
      view_count: series.view_count || 0,
      like_count: series.like_count || 0,
      bookmark_count: series.bookmark_count || 0,
      cast_members: series.cast_members,
      director_name: series.director_name,
      creator_name: series.creator_name,
      language: series.language,
      country: series.country,
      release_date: series.release_date,
      maturity_rating: series.maturity_rating,
      episodes: series.episodes?.map(episode => ({
        id: episode.id,
        title: episode.title,
        duration: episode.duration || 0,
        description: episode.description || '',
        thumbnail_url: episode.thumbnail_url || '',
        episode_number: episode.episode_number,
        season_number: episode.season_number,
        video_url: episode.video_url || '',
        view_count: episode.view_count || 0,
        rating: episode.rating || 0,
        isWatched: false
      })) || []
    })) || [];
  } catch (error) {
    console.error('Error in getAllSeries:', error);
    return [];
  }
};

// Fetch series by ID
export const getSeriesById = async (id: string): Promise<SeriesDetail | null> => {
  try {
    const { data: seriesData, error } = await supabase
      .from('series')
      .select(`
        *,
        episodes (
          id,
          title,
          description,
          duration,
          episode_number,
          season_number,
          video_url,
          thumbnail_url,
          view_count,
          rating
        )
      `)
      .eq('id', id)
      .eq('status', 'active')
      .single();

    if (error || !seriesData) {
      console.error('Error fetching series by ID:', error);
      return null;
    }

    return {
      id: seriesData.id,
      title: seriesData.title,
      description: seriesData.description,
      long_description: seriesData.long_description,
      poster_url: seriesData.poster_url,
      banner_url: seriesData.banner_url,
      thumbnail_url: seriesData.thumbnail_url,
      trailer_url: seriesData.trailer_url,
      rating: seriesData.rating || 0,
      year: seriesData.year || new Date().getFullYear(),
      genres: seriesData.genres || [],
      duration: seriesData.duration || 'Unknown',
      total_episodes: seriesData.total_episodes || 0,
      total_seasons: seriesData.total_seasons || 1,
      status: seriesData.status,
      is_featured: seriesData.is_featured || false,
      is_trending: seriesData.is_trending || false,
      view_count: seriesData.view_count || 0,
      like_count: seriesData.like_count || 0,
      bookmark_count: seriesData.bookmark_count || 0,
      cast_members: seriesData.cast_members,
      director_name: seriesData.director_name,
      creator_name: seriesData.creator_name,
      language: seriesData.language,
      country: seriesData.country,
      release_date: seriesData.release_date,
      maturity_rating: seriesData.maturity_rating,
      episodes: seriesData.episodes?.map(episode => ({
        id: episode.id,
        title: episode.title,
        duration: episode.duration || 0,
        description: episode.description || '',
        thumbnail_url: episode.thumbnail_url || '',
        episode_number: episode.episode_number,
        season_number: episode.season_number,
        video_url: episode.video_url || '',
        view_count: episode.view_count || 0,
        rating: episode.rating || 0,
        isWatched: false
      })) || []
    };
  } catch (error) {
    console.error('Error in getSeriesById:', error);
    return null;
  }
};

// Fetch featured series
export const getFeaturedSeries = async (): Promise<SeriesDetail[]> => {
  try {
    const { data: seriesData, error } = await supabase
      .from('series')
      .select(`
        *,
        episodes (
          id,
          title,
          description,
          duration,
          episode_number,
          season_number,
          video_url,
          thumbnail_url,
          view_count,
          rating
        )
      `)
      .eq('status', 'active')
      .eq('is_featured', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching featured series:', error);
      return [];
    }

    return seriesData?.map(series => ({
      id: series.id,
      title: series.title,
      description: series.description,
      long_description: series.long_description,
      poster_url: series.poster_url,
      banner_url: series.banner_url,
      thumbnail_url: series.thumbnail_url,
      trailer_url: series.trailer_url,
      rating: series.rating || 0,
      year: series.year || new Date().getFullYear(),
      genres: series.genres || [],
      duration: series.duration || 'Unknown',
      total_episodes: series.total_episodes || 0,
      total_seasons: series.total_seasons || 1,
      status: series.status,
      is_featured: series.is_featured || false,
      is_trending: series.is_trending || false,
      view_count: series.view_count || 0,
      like_count: series.like_count || 0,
      bookmark_count: series.bookmark_count || 0,
      cast_members: series.cast_members,
      director_name: series.director_name,
      creator_name: series.creator_name,
      language: series.language,
      country: series.country,
      release_date: series.release_date,
      maturity_rating: series.maturity_rating,
      episodes: series.episodes?.map(episode => ({
        id: episode.id,
        title: episode.title,
        duration: episode.duration || 0,
        description: episode.description || '',
        thumbnail_url: episode.thumbnail_url || '',
        episode_number: episode.episode_number,
        season_number: episode.season_number,
        video_url: episode.video_url || '',
        view_count: episode.view_count || 0,
        rating: episode.rating || 0,
        isWatched: false
      })) || []
    })) || [];
  } catch (error) {
    console.error('Error in getFeaturedSeries:', error);
    return [];
  }
};

// Fetch series by genre
export const getSeriesByGenre = async (genre: string): Promise<SeriesDetail[]> => {
  try {
    const { data: seriesData, error } = await supabase
      .from('series')
      .select(`
        *,
        episodes (
          id,
          title,
          description,
          duration,
          episode_number,
          season_number,
          video_url,
          thumbnail_url,
          view_count,
          rating
        )
      `)
      .eq('status', 'active')
      .contains('genres', [genre])
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching series by genre:', error);
      return [];
    }

    return seriesData?.map(series => ({
      id: series.id,
      title: series.title,
      description: series.description,
      long_description: series.long_description,
      poster_url: series.poster_url,
      banner_url: series.banner_url,
      thumbnail_url: series.thumbnail_url,
      trailer_url: series.trailer_url,
      rating: series.rating || 0,
      year: series.year || new Date().getFullYear(),
      genres: series.genres || [],
      duration: series.duration || 'Unknown',
      total_episodes: series.total_episodes || 0,
      total_seasons: series.total_seasons || 1,
      status: series.status,
      is_featured: series.is_featured || false,
      is_trending: series.is_trending || false,
      view_count: series.view_count || 0,
      like_count: series.like_count || 0,
      bookmark_count: series.bookmark_count || 0,
      cast_members: series.cast_members,
      director_name: series.director_name,
      creator_name: series.creator_name,
      language: series.language,
      country: series.country,
      release_date: series.release_date,
      maturity_rating: series.maturity_rating,
      episodes: series.episodes?.map(episode => ({
        id: episode.id,
        title: episode.title,
        duration: episode.duration || 0,
        description: episode.description || '',
        thumbnail_url: episode.thumbnail_url || '',
        episode_number: episode.episode_number,
        season_number: episode.season_number,
        video_url: episode.video_url || '',
        view_count: episode.view_count || 0,
        rating: episode.rating || 0,
        isWatched: false
      })) || []
    })) || [];
  } catch (error) {
    console.error('Error in getSeriesByGenre:', error);
    return [];
  }
};

// Fetch trending series
export const getTrendingSeries = async (): Promise<SeriesDetail[]> => {
  try {
    const { data: seriesData, error } = await supabase
      .from('series')
      .select(`
        *,
        episodes (
          id,
          title,
          description,
          duration,
          episode_number,
          season_number,
          video_url,
          thumbnail_url,
          view_count,
          rating
        )
      `)
      .eq('status', 'active')
      .eq('is_trending', true)
      .order('view_count', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching trending series:', error);
      return [];
    }

    return seriesData?.map(series => ({
      id: series.id,
      title: series.title,
      description: series.description,
      long_description: series.long_description,
      poster_url: series.poster_url,
      banner_url: series.banner_url,
      thumbnail_url: series.thumbnail_url,
      trailer_url: series.trailer_url,
      rating: series.rating || 0,
      year: series.year || new Date().getFullYear(),
      genres: series.genres || [],
      duration: series.duration || 'Unknown',
      total_episodes: series.total_episodes || 0,
      total_seasons: series.total_seasons || 1,
      status: series.status,
      is_featured: series.is_featured || false,
      is_trending: series.is_trending || false,
      view_count: series.view_count || 0,
      like_count: series.like_count || 0,
      bookmark_count: series.bookmark_count || 0,
      cast_members: series.cast_members,
      director_name: series.director_name,
      creator_name: series.creator_name,
      language: series.language,
      country: series.country,
      release_date: series.release_date,
      maturity_rating: series.maturity_rating,
      episodes: series.episodes?.map(episode => ({
        id: episode.id,
        title: episode.title,
        duration: episode.duration || 0,
        description: episode.description || '',
        thumbnail_url: episode.thumbnail_url || '',
        episode_number: episode.episode_number,
        season_number: episode.season_number,
        video_url: episode.video_url || '',
        view_count: episode.view_count || 0,
        rating: episode.rating || 0,
        isWatched: false
      })) || []
    })) || [];
  } catch (error) {
    console.error('Error in getTrendingSeries:', error);
    return [];
  }
};

// Fetch new releases (recently added series)
export const getNewReleases = async (): Promise<SeriesDetail[]> => {
  try {
    const { data: seriesData, error } = await supabase
      .from('series')
      .select(`
        *,
        episodes (
          id,
          title,
          description,
          duration,
          episode_number,
          season_number,
          video_url,
          thumbnail_url,
          view_count,
          rating
        )
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching new releases:', error);
      return [];
    }

    return seriesData?.map(series => ({
      id: series.id,
      title: series.title,
      description: series.description,
      long_description: series.long_description,
      poster_url: series.poster_url,
      banner_url: series.banner_url,
      thumbnail_url: series.thumbnail_url,
      trailer_url: series.trailer_url,
      rating: series.rating || 0,
      year: series.year || new Date().getFullYear(),
      genres: series.genres || [],
      duration: series.duration || 'Unknown',
      total_episodes: series.total_episodes || 0,
      total_seasons: series.total_seasons || 1,
      status: series.status,
      is_featured: series.is_featured || false,
      is_trending: series.is_trending || false,
      view_count: series.view_count || 0,
      like_count: series.like_count || 0,
      bookmark_count: series.bookmark_count || 0,
      cast_members: series.cast_members,
      director_name: series.director_name,
      creator_name: series.creator_name,
      language: series.language,
      country: series.country,
      release_date: series.release_date,
      maturity_rating: series.maturity_rating,
      episodes: series.episodes?.map(episode => ({
        id: episode.id,
        title: episode.title,
        duration: episode.duration || 0,
        description: episode.description || '',
        thumbnail_url: episode.thumbnail_url || '',
        episode_number: episode.episode_number,
        season_number: episode.season_number,
        video_url: episode.video_url || '',
        view_count: episode.view_count || 0,
        rating: episode.rating || 0,
        isWatched: false
      })) || []
    })) || [];
  } catch (error) {
    console.error('Error in getNewReleases:', error);
    return [];
  }
}; 