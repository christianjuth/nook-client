import { EmbedMedia } from "./EmbedMedia";
import { CdnAvatar } from "../cdn-avatar";
import { FarcasterUserTextDisplay } from "../farcaster/users/user-display";
import { NookText, View, XStack, YStack } from "@nook/app-ui";
import { FarcasterCastResponseText } from "../farcaster/casts/cast-text";
import { FarcasterCastResponse } from "@nook/common/types";
import { formatTimeAgo } from "../../utils";
import { useRouter } from "solito/navigation";

export const EmbedCast = ({
  cast,
  disableLink,
}: {
  cast: FarcasterCastResponse;
  disableLink?: boolean;
}) => {
  const router = useRouter();

  // @ts-ignore
  const handlePress = (event) => {
    if (disableLink) return;
    const selection = window?.getSelection()?.toString();
    if (!selection || selection.length === 0) {
      if (event.ctrlKey || event.metaKey) {
        // metaKey is for macOS
        window.open(`/casts/${cast.hash}`, "_blank");
      } else {
        router.push(`/casts/${cast.hash}`);
      }
    }
  };

  return (
    <View
      onPress={(e) => {
        e.preventDefault();
        e.stopPropagation();
        handlePress(e);
      }}
      cursor="pointer"
      transition="all 0.2s ease-in-out"
      hoverStyle={{
        // @ts-ignore
        transition: "all 0.2s ease-in-out",
        backgroundColor: "$color2",
      }}
    >
      <YStack
        borderWidth="$0.5"
        borderColor="$borderColorBg"
        borderRadius="$4"
        padding="$2.5"
        gap="$1"
      >
        <XStack alignItems="center">
          <View marginRight="$2">
            <CdnAvatar src={cast.user.pfp} size="$1" />
          </View>
          <FarcasterUserTextDisplay user={cast.user} />
          <NookText muted>{` · ${formatTimeAgo(cast.timestamp)}`}</NookText>
        </XStack>
        {(cast.text || cast.mentions.length > 0) && (
          <FarcasterCastResponseText cast={cast} disableLinks />
        )}
        {cast.embeds.length > 0 && <EmbedMedia cast={cast} />}
      </YStack>
    </View>
  );
};
