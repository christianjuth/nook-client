import { FarcasterCastRecasts } from "@nook/app/features/farcaster/cast-screen/cast-recasts";
import { fetchCastRecasts } from "@nook/app/server/feed";

export default async function CastRecasts({
  params,
}: { params: { hash: string } }) {
  const initialData = await fetchCastRecasts(params.hash);
  return <FarcasterCastRecasts hash={params.hash} initialData={initialData} />;
}
