import { fetchGrievances, fetchClusters } from "@/app/actions/advocate";
import GrievancesClient from "./GrievancesClient";

export default async function GrievancesPage() {
  const [grievancesRes, clustersRes] = await Promise.all([
    fetchGrievances(),
    fetchClusters()
  ]);

  const grievances = grievancesRes.success ? grievancesRes.data : [];
  const clusters = clustersRes.success ? clustersRes.data : [];

  return <GrievancesClient initialGrievances={grievances} initialClusters={clusters} />;
}
