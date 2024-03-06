import { createEntityAdapter, createSlice } from "@reduxjs/toolkit";
import { RootState } from "..";
import { farcasterApi } from "../apis/farcasterApi";
import { FarcasterCastResponseWithContext } from "@nook/common/types";

const castAdapter = createEntityAdapter({
  selectId: (content: FarcasterCastResponseWithContext) => content.hash,
});

const contentSlice = createSlice({
  name: "content",
  initialState: castAdapter.getInitialState(),
  reducers: {
    likeCast: (state, action) => {
      const existingCast = state.entities[action.payload.hash];
      if (existingCast?.context) {
        existingCast.context.liked = true;
      } else {
        existingCast.context = { liked: true, recasted: false };
      }
    },
    unlikeCast: (state, action) => {
      const existingCast = state.entities[action.payload.hash];
      if (existingCast?.context) {
        existingCast.context.liked = false;
      } else {
        existingCast.context = { liked: false, recasted: false };
      }
    },
    recastCast: (state, action) => {
      const existingCast = state.entities[action.payload.hash];
      if (existingCast?.context) {
        existingCast.context.recasted = true;
      } else {
        existingCast.context = { liked: false, recasted: true };
      }
    },
    unrecastCast: (state, action) => {
      const existingCast = state.entities[action.payload.hash];
      if (existingCast?.context) {
        existingCast.context.recasted = false;
      } else {
        existingCast.context = { liked: false, recasted: false };
      }
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      farcasterApi.endpoints.getCast.matchFulfilled,
      (state, action) => {
        castAdapter.addOne(state, action.payload);
      },
    );
    builder.addMatcher(
      farcasterApi.endpoints.getCastReplies.matchFulfilled,
      (state, action) => {
        const casts = [];
        for (const cast of action.payload.data) {
          casts.push(cast);
          casts.push(...cast.embedCasts);
          if (cast.parent) {
            casts.push(cast.parent);
          }
        }
        castAdapter.addMany(state, casts);
      },
    );
    builder.addMatcher(
      farcasterApi.endpoints.getFeed.matchFulfilled,
      (state, action) => {
        const casts = [];
        for (const cast of action.payload.data) {
          casts.push(cast);
          casts.push(...cast.embedCasts);
          if (cast.parent) {
            casts.push(cast.parent);
          }
        }
        castAdapter.addMany(state, casts);
      },
    );
    builder.addMatcher(
      farcasterApi.endpoints.deleteCast.matchFulfilled,
      (state, action) => {
        castAdapter.removeOne(state, action.payload.hash);
      },
    );
  },
});

export const { selectById: selectCastById } = castAdapter.getSelectors(
  (state: RootState) => state.casts,
);

export const { likeCast, unlikeCast, recastCast, unrecastCast } =
  contentSlice.actions;

export default contentSlice.reducer;
