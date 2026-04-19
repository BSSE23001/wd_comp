import { fetchVerifiers } from "@/app/actions/advocate";
import VerifiersClient from "./VerifiersClient";

export default async function VerifiersPage() {
  const res = await fetchVerifiers();

  if (!res.success) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-center text-rose-500">
        <p className="font-semibold">{res.error}</p>
      </div>
    );
  }

  return <VerifiersClient initialVerifiers={res.data || []} />;
}
