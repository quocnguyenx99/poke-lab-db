import { Dashboard } from '@/components/Dashboard';
import { getCatalog } from '@/lib/data-source';

export default async function Page() {
  const catalog = await getCatalog();

  return <Dashboard initialCatalog={catalog} />;
}
