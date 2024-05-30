import {
  FarcasterUserV1,
  FarcasterUserMutualsPreview,
  FetchUsersResponse,
} from "@nook/common/types";
import { makeRequest } from "../utils";
import {
  useQuery,
  InfiniteData,
  useInfiniteQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useUserStore } from "../../store/useUserStore";

export const fetchUser = async (
  username: string,
  fid?: boolean,
): Promise<FarcasterUserV1> => {
  return await makeRequest(
    `/v1/farcaster/users/${username}${fid ? `?fid=${fid}` : ""}`,
  );
};

export const useUser = (username: string, fid?: boolean) => {
  const addUsers = useUserStore((state) => state.addUsers);
  return useQuery<FarcasterUserV1>({
    queryKey: ["user", username],
    queryFn: async () => {
      const user = await fetchUser(username, fid);
      addUsers([user]);
      return user;
    },
    enabled: !!username,
  });
};

export const fetchUserMutualsPreview = async (
  username: string,
): Promise<FarcasterUserMutualsPreview> => {
  return await makeRequest(`/farcaster/users/${username}/mutuals-preview`);
};

export const fetchUsers = async (
  fids: string[],
): Promise<FetchUsersResponse> => {
  return await makeRequest("/farcaster/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fids }),
  });
};

export const useUsers = (fids: string[]) => {
  const addUsers = useUserStore((state) => state.addUsers);
  const queryClient = useQueryClient();
  const initialData = queryClient.getQueryData<FetchUsersResponse>([
    "users",
    fids.join(","),
  ]);
  return useQuery<FetchUsersResponse>({
    queryKey: ["users", fids.join(",")],
    queryFn: async () => {
      const users = await fetchUsers(fids);
      addUsers(users.data);
      return users;
    },
    enabled: fids.length > 0 && !initialData,
    initialData,
  });
};

export const fetchUsersByAddress = async (
  addresses: string[],
): Promise<FetchUsersResponse> => {
  return await makeRequest("/farcaster/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ addresses }),
  });
};

export const useUsersByAddress = (addresses: string[]) => {
  const addUsers = useUserStore((state) => state.addUsers);
  const queryClient = useQueryClient();
  const initialData = queryClient.getQueryData<FetchUsersResponse>([
    "users",
    addresses.join(","),
  ]);
  return useQuery<FetchUsersResponse>({
    queryKey: ["users", addresses.join(",")],
    queryFn: async () => {
      const users = await fetchUsersByAddress(addresses);
      addUsers(users.data);
      return users;
    },
    enabled: addresses.length > 0 && !initialData,
    initialData,
  });
};

export const fetchUserFollowers = async (username: string, cursor?: string) => {
  return await makeRequest(
    `/farcaster/users/${username}/followers${
      cursor ? `?cursor=${cursor}` : ""
    }`,
  );
};

export const useUserFollowers = (
  username: string,
  initialData?: FetchUsersResponse,
) => {
  const addUsers = useUserStore((state) => state.addUsers);
  return useInfiniteQuery<
    FetchUsersResponse,
    unknown,
    InfiniteData<FetchUsersResponse>,
    string[],
    string | undefined
  >({
    queryKey: ["user-followers", username],
    queryFn: async ({ pageParam }) => {
      const data = await fetchUserFollowers(username, pageParam);
      addUsers(data.data);
      return data;
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialData: initialData
      ? {
          pages: [initialData],
          pageParams: [undefined],
        }
      : undefined,
    initialPageParam: initialData?.nextCursor,
  });
};

export const fetchUserFollowing = async (username: string, cursor?: string) => {
  return await makeRequest(
    `/farcaster/users/${username}/following${
      cursor ? `?cursor=${cursor}` : ""
    }`,
  );
};

export const useUserFollowing = (
  username: string,
  initialData?: FetchUsersResponse,
) => {
  const addUsers = useUserStore((state) => state.addUsers);
  return useInfiniteQuery<
    FetchUsersResponse,
    unknown,
    InfiniteData<FetchUsersResponse>,
    string[],
    string | undefined
  >({
    queryKey: ["user-following", username],
    queryFn: async ({ pageParam }) => {
      const data = await fetchUserFollowing(username, pageParam);
      addUsers(data.data);
      return data;
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialData: initialData
      ? {
          pages: [initialData],
          pageParams: [undefined],
        }
      : undefined,
    initialPageParam: initialData?.nextCursor,
  });
};

export const fetchUserMutuals = async (username: string, cursor?: string) => {
  return await makeRequest(
    `/farcaster/users/${username}/mutuals${cursor ? `?cursor=${cursor}` : ""}`,
  );
};

export const useUserMutuals = (
  username: string,
  initialData?: FetchUsersResponse,
) => {
  const addUsers = useUserStore((state) => state.addUsers);
  return useInfiniteQuery<
    FetchUsersResponse,
    unknown,
    InfiniteData<FetchUsersResponse>,
    string[],
    string | undefined
  >({
    queryKey: ["user-mutuals", username],
    queryFn: async ({ pageParam }) => {
      const data = await fetchUserMutuals(username, pageParam);
      addUsers(data.data);
      return data;
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialData: initialData
      ? {
          pages: [initialData],
          pageParams: [undefined],
        }
      : undefined,
    initialPageParam: initialData?.nextCursor,
  });
};

export const searchUsers = async (
  query: string,
  cursor?: string,
  limit?: number,
): Promise<FetchUsersResponse> => {
  return await makeRequest(
    `/farcaster/users?query=${query}${cursor ? `&cursor=${cursor}` : ""}${
      limit ? `&limit=${limit}` : ""
    }`,
  );
};

export const useSearchUsers = (
  query: string,
  limit?: number,
  initialData?: FetchUsersResponse,
) => {
  const addUsers = useUserStore((state) => state.addUsers);
  return useInfiniteQuery<
    FetchUsersResponse,
    unknown,
    InfiniteData<FetchUsersResponse>,
    string[],
    string | undefined
  >({
    queryKey: ["users", "search", limit?.toString() || "", query],
    queryFn: async ({ pageParam }) => {
      const data = await searchUsers(query, pageParam, limit);
      addUsers(data.data);
      return data;
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialData: initialData
      ? {
          pages: [initialData],
          pageParams: [undefined],
        }
      : undefined,
    initialPageParam: initialData?.nextCursor,
    enabled: !!query,
  });
};
