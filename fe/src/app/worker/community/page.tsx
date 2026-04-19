import type { Metadata } from "next";
import { fetchPublicGrievances, fetchPlatforms } from "@/app/actions/grievances";
import CommunityClient from "./CommunityClient";

export const metadata: Metadata = {
  title: "Community Board | FairGig",
  description: "Anonymous grievance board for gig workers to report platform issues, share rate intelligence, and organize collectively.",
};

export default async function CommunityPage() {
  const [grievancesRes, platformsRes] = await Promise.all([
    fetchPublicGrievances(),
    fetchPlatforms()
  ]);

  const initialGrievances = grievancesRes.success ? grievancesRes.data : [];
  const platforms = platformsRes.success ? platformsRes.data : [];

  return <CommunityClient initialGrievances={initialGrievances} platforms={platforms} />;
}
