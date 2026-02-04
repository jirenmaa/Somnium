import { useInfiniteQuery, InfiniteData } from "@tanstack/react-query";

const LIMIT = 6 * 2;

export const pinsKeys = {
  all: ["videos"] as const,
  infinite: () => ["videos", "infinite"] as const,
};

type UseInfiniteProps<T> = {
  fn: (page: number, limit: number) => Promise<T[]>;
  queryKey?: readonly unknown[];
};

export default function useInfiniteScroll<T>({
  fn,
  queryKey = pinsKeys.infinite(),
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
