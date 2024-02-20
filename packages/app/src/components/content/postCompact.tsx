import { ContentFeedItem } from "@nook/api/types";
import { PostData } from "@nook/common/types";
import { Text, View, XStack, YStack } from "tamagui";
import { Embed } from "@/components/embeds";
import { EntityAvatar } from "@/components/entity/avatar";
import {
  PostContent,
  formatTimeAgo,
  formatTipsAmount,
} from "@/components/utils";
import { EntityDisplay } from "../entity/display";
import { Image } from "expo-image";
import { Heart, MessageSquare, RefreshCw } from "@tamagui/lucide-icons";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { setActiveChannelModal } from "@/store/slices/user";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { selectChannelById } from "@/store/slices/channel";

export const ContentPostCompact = ({
  item: { data, timestamp, engagement, tips },
}: { item: ContentFeedItem<PostData> }) => {
  const dispatch = useAppDispatch();
  const degenTips =
    tips["chain://eip155:8453/erc20:0xc9034c3e7f58003e6ae0c8438e7c8f4598d5acaa"]
      ?.amount || 0;
  const channel = useAppSelector((state) =>
    data.channelId ? selectChannelById(state, data.channelId) : undefined,
  );

  return (
    <XStack
      padding="$2"
      borderBottomWidth="$0.25"
      borderBottomColor="$borderColor"
      gap="$2"
    >
      <View width="$3.5">
        <EntityAvatar entityId={data.entityId?.toString()} />
      </View>
      <YStack flex={1} gap="$0.5">
        <EntityDisplay entityId={data.entityId?.toString()} />
        <XStack alignItems="center" gap="$1.5" paddingBottom="$2">
          <Text color="$gray11">
            {`${formatTimeAgo(timestamp as unknown as string)} ago`}
          </Text>
          {channel && (
            <>
              <Text color="$gray11">in</Text>
              <TouchableOpacity
                onPress={() => dispatch(setActiveChannelModal(data.channelId))}
              >
                <View borderRadius="$10" overflow="hidden">
                  <Image
                    source={{ uri: channel.imageUrl }}
                    style={{ width: 16, height: 16 }}
                  />
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => dispatch(setActiveChannelModal(data.channelId))}
              >
                <Text numberOfLines={1} ellipsizeMode="tail" fontWeight="500">
                  {channel.name}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </XStack>
        <PostContent data={data} />
        {data.embeds.map((embed, i) => (
          <Embed key={embed} embed={embed} data={data} />
        ))}
        <XStack justifyContent="space-between" marginTop="$2" width="$20">
          <View flexDirection="row" alignItems="center" gap="$2" width="$5">
            <MessageSquare size={16} color="$gray11" />
            <Text color="$gray11">{engagement.replies}</Text>
          </View>
          <View flexDirection="row" alignItems="center" gap="$2" width="$5">
            <RefreshCw size={16} color="$gray11" />
            <Text color="$gray11">{engagement.reposts}</Text>
          </View>
          <View flexDirection="row" alignItems="center" gap="$2" width="$5">
            <Heart size={16} color="$gray11" />
            <Text color="$gray11">{engagement.likes}</Text>
          </View>
          {degenTips > 0 && (
            <View flexDirection="row" alignItems="center" gap="$2" width="$5">
              <Image
                source={{ uri: "https://www.degen.tips/logo_light.svg" }}
                style={{ width: 12, height: 12 }}
              />
              <Text color="$gray11">{formatTipsAmount(degenTips)}</Text>
            </View>
          )}
        </XStack>
      </YStack>
    </XStack>
  );
};
