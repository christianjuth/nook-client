import { Channel } from "../../types";
import { makeRequest } from "../utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";

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
      queryClient.setQueryData(["channel", channelId], channel);
      return channel;
    },
    initialData,
    enabled: !initialData && !!channelId,
  });
};
