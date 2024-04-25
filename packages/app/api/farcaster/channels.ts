import { Channel, FetchChannelsResponse } from "../../types";
import { makeRequest } from "../utils";
import {
  useQuery,
  useQueryClient,
  InfiniteData,
  useInfiniteQuery,
} from "@tanstack/react-query";

export const fetchChannel = async (channelId: string): Promise<Channel> => {
  return await makeRequest(`/farcaster/channels/${channelId}`);
};

export const useChannel = (channelId: string) => {
  const queryClient = useQueryClient();
  const initialData = queryClient.getQueryData<Channel>(["channel", channelId]);
  return useQuery<Channel>({
    queryKey: ["channel", channelId],
    queryFn: async () => {
      const channel = await fetchChannel(channelId);
      return channel;
    },
    initialData,
    enabled: !!channelId,
  });
};

export const fetchRecommendedChannels =
  async (): Promise<FetchChannelsResponse> => {
    // return await makeRequest("/farcaster/channels/recommended");
    return await makeRequest("/farcaster/users/0/recommended-channels");
  };

export const useRecommendedChannels = () => {
  return useQuery<FetchChannelsResponse>({
    queryKey: ["channels", "recommended"],
    queryFn: fetchRecommendedChannels,
  });
};

export const searchChannels = async (
  query: string,
  cursor?: string,
  limit?: number,
): Promise<FetchChannelsResponse> => {
  return await makeRequest(
    `/farcaster/channels?query=${query}${cursor ? `&cursor=${cursor}` : ""}${
      limit ? `&limit=${limit}` : ""
    }`,
  );
};

export const useSearchChannels = (query: string, limit?: number) => {
  return useInfiniteQuery<
    FetchChannelsResponse,
    unknown,
    InfiniteData<FetchChannelsResponse>,
    string[],
    string | undefined
  >({
    queryKey: ["channels", "search", limit?.toString() || "", query],
    queryFn: async ({ pageParam }) => {
      const data = await searchChannels(query, pageParam, limit);
      return data;
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined,
    enabled: !!query,
  });
};
