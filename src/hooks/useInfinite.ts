import { useInfiniteQuery, InfiniteData } from "@tanstack/react-query";

const LIMIT = 12;

export const videosKeys = {
  all: ["videos"] as const,
  infinite: () => ["videos", "infinite"] as const,
};

type UseInfiniteProps<T> = {
  fn: (page: number, limit: number) => Promise<T[]>;
  queryKey?: readonly unknown[];
};

export default function useInfiniteScroll<T>({
  fn,
  queryKey = videosKeys.infinite(),
}: UseInfiniteProps<T>) {
  return useInfiniteQuery<  
    T[],
    Error,
    InfiniteData<T[]>,
    readonly unknown[],
    number
  >({
    queryKey,
    initialPageParam: 1,
    queryFn: ({ pageParam }) => fn(pageParam, LIMIT),
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < LIMIT) return undefined;
      return allPages.length + 1;
    },
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 10,
    retry: 1,
  });
}
