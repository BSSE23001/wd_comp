import { fetchAdvocateAnalytics } from "@/app/actions/analytics";
import AnalyticsClient from "./AnalyticsClient";

export default async function AnalyticsPage() {
  const analyticsRes = await fetchAdvocateAnalytics();

  if (!analyticsRes.success || !analyticsRes.data) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-center text-rose-500">
        <p className="font-semibold">{analyticsRes.error}</p>
      </div>
    );
  }

  return <AnalyticsClient data={analyticsRes.data} />;
}
