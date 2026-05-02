import { useSuspenseQuery } from "@tanstack/react-query";
import { useListBlogPosts, useGetBlogPostBySlug } from "@workspace/api-client-react";
import type { BlogPostResponse, BlogPostListResponse, ListBlogPostsOrderBy } from "@workspace/api-client-react";

// Extended interface that matches what the component expects
export interface BlogPost extends BlogPostResponse {
  readTime: string;
  imageUrl: string;
  category: string;
}

// Fallback data for fields not in the API
const getFallbackData = (post: BlogPostResponse): Omit<BlogPost, keyof BlogPostResponse> => {
  // Generate read time based on content length (rough estimate)
  const wordCount = post.content.split(' ').length;
  const readTime = Math.ceil(wordCount / 200) + ' min read';
  
  // Generate category from industry or use default
  const category = post.industry?.name || 'General';
  
  // Generate image URL based on title or use default
  const imageUrl = `https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=800`;
  
  return {
    readTime,
    imageUrl,
    category
  };
};

export function useBlogPost(slug: string): BlogPost {
  const { data } = useGetBlogPostBySlug(slug);
  
  // With Suspense, data is guaranteed to be defined
  // Merge API data with fallback data
  const fallbackData = getFallbackData(data!);
  
  return {
    ...data!,
    ...fallbackData
  };
}

export function useBlogPosts(params?: {
  page?: number;
  limit?: number;
  search?: string;
  orderBy?: ListBlogPostsOrderBy;
  industrySlug?: string;
  featured?: boolean;
}) {
  const { data } = useListBlogPosts({
    page: params?.page || 0,
    limit: params?.limit || 10,
    search: params?.search,
    orderBy: params?.orderBy || 'published_at',
    industrySlug: params?.industrySlug,
    featured: params?.featured
  });

  // Transform blog posts with fallback data
  const blogPosts = data?.blogPosts.map(post => {
    const fallbackData = getFallbackData(post);
    return {
      ...post,
      ...fallbackData
    };
  }) || [];

  return {
    blogPosts,
    pagination: data?.pagination || {
      page: 0,
      limit: 10,
      total: 0,
      totalPages: 0,
      hasNext: false,
      hasPrev: false
    }
  };
}
