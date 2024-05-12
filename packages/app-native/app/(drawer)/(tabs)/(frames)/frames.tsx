import { FarcasterFilteredFeed } from "@nook/app/features/farcaster/cast-feed/filtered-feed";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { HEADER_HEIGHT, PagerLayout } from "../../../../components/PagerLayout";
import { useAuth } from "@nook/app/context/auth";
import { Display, UserFilterType } from "@nook/common/types";

export default function FramesScreen() {
  const paddingBottom = useBottomTabBarHeight();
  const { session } = useAuth();

  if (!session?.fid) return null;

  return (
    <PagerLayout
      title="Frames"
      pages={[
        {
          name: "Following",
          component: (
            <FarcasterFilteredFeed
              paddingBottom={paddingBottom}
              paddingTop={HEADER_HEIGHT}
              filter={{
                users: {
                  type: UserFilterType.FOLLOWING,
                  data: {
                    fid: session?.fid,
                  },
                },
                onlyFrames: true,
              }}
              displayMode={Display.FRAMES}
            />
          ),
        },
        {
          name: "Latest",
          component: (
            <FarcasterFilteredFeed
              paddingBottom={paddingBottom}
              paddingTop={HEADER_HEIGHT}
              filter={{
                users: {
                  type: UserFilterType.POWER_BADGE,
                  data: {
                    badge: true,
                  },
                },
                onlyFrames: true,
              }}
              displayMode={Display.FRAMES}
            />
          ),
        },
      ]}
    />
  );
}
