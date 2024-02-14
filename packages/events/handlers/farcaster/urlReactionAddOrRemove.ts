import {
  EventAction,
  EventActionType,
  EventType,
  FarcasterReactionType,
  FarcasterUrlReactionData,
  RawEvent,
  EntityEvent,
  TopicType,
} from "@flink/common/types";
import { ContentActionData } from "@flink/common/types/actionTypes";
import { MongoClient } from "@flink/common/mongo";
import { getOrCreateEntitiesForFids } from "@flink/common/entity";

export const handleUrlReactionAddOrRemove = async (
  client: MongoClient,
  rawEvent: RawEvent<FarcasterUrlReactionData>,
) => {
  let eventActionType: EventActionType | undefined;

  const isRemove = [
    EventType.CAST_REACTION_REMOVE,
    EventType.URL_REACTION_REMOVE,
  ].includes(rawEvent.source.type);

  if (rawEvent.data.reactionType === FarcasterReactionType.LIKE) {
    eventActionType = isRemove ? EventActionType.UNLIKE : EventActionType.LIKE;
  } else if (rawEvent.data.reactionType === FarcasterReactionType.RECAST) {
    eventActionType = isRemove
      ? EventActionType.UNREPOST
      : EventActionType.REPOST;
  } else {
    throw Error(`Unsupported reaction type: ${rawEvent.data.reactionType}`);
  }

  const fidToEntity = await getOrCreateEntitiesForFids(client, [
    rawEvent.data.fid,
  ]);

  const entityId = fidToEntity[rawEvent.data.fid]._id;
  const contentId = rawEvent.data.url;
  const actions: EventAction<ContentActionData>[] = [
    {
      eventId: rawEvent.eventId,
      source: rawEvent.source,
      timestamp: new Date(rawEvent.timestamp),
      entityId,
      referencedEntityIds: [entityId],
      referencedContentIds: [contentId],
      createdAt: new Date(),
      updatedAt: new Date(),
      type: eventActionType,
      data: {
        entityId,
        contentId,
      },
      deletedAt: isRemove ? new Date() : undefined,
      topics: [
        {
          type: TopicType.SOURCE_ENTITY,
          value: entityId.toString(),
        },
        {
          type: TopicType.TARGET_CONTENT,
          value: contentId,
        },
      ],
    },
  ];

  const event: EntityEvent<FarcasterUrlReactionData> = {
    ...rawEvent,
    entityId,
    timestamp: new Date(rawEvent.timestamp),
    createdAt: actions[0].createdAt,
    updatedAt: actions[0].updatedAt,
  };

  return { event, actions, content: [] };
};
