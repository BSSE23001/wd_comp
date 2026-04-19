import { fetchPlatforms } from "@/app/actions/advocate";
import PlatformsClient from "./PlatformsClient";

export default async function PlatformsPage() {
  const res = await fetchPlatforms();

  if (!res.success) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-center text-rose-500">
        <p className="font-semibold">{res.error}</p>
      </div>
    );
  }

  return <PlatformsClient initialPlatforms={res.data || []} />;
}
