import { Entity, PostData } from "@flink/common/types";
import { Linking } from "react-native";
import { Text } from "tamagui";

export const ContentPost = ({
  data,
  entityMap,
}: {
  data: PostData;
  entityMap: Record<string, Entity>;
}) => {
  const textParts = [];

  const splitLinkParts = (text: string) => {
    const splitParts = [];
    for (const part of text.split(/(https?:\/\/[^\s]+)/g)) {
      if (!part) continue;
      if (/https?:\/\/[^\s]+/.test(part)) {
        if (data.embeds.includes(part)) {
          continue;
        }

        splitParts.push(
          <Text
            key={`${data.contentId}-${part}`}
            color="$color10"
            onPress={() => Linking.openURL(part)}
          >
            {part}
          </Text>,
        );
      } else {
        splitParts.push(<Text key={`${data.contentId}-${part}`}>{part}</Text>);
      }
    }
    return splitParts;
  };

  let index = data.text.length;
  const sortedMentions = [...data.mentions].sort(
    (a, b) => b.position - a.position,
  );
  for (const mention of sortedMentions) {
    const mentionedEntity = entityMap[mention.entityId.toString()];
    const label = `@${
      mentionedEntity?.farcaster?.username ||
      mentionedEntity?.farcaster?.fid ||
      mention.entityId.toString()
    }`;

    textParts.push(
      ...splitLinkParts(data.text.substring(mention.position, index)),
    );
    textParts.push(
      <Text key={`${data.contentId}-${label}`} color="$color10">
        {label}
      </Text>,
    );
    index = mention.position;
  }

  textParts.push(...splitLinkParts(data.text.substring(0, index)));

  if (data.mentions.length > 0) {
    textParts.reverse();
  }

  return <Text>{textParts}</Text>;
};
