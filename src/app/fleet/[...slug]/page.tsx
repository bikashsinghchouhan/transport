import { redirect } from 'next/navigation';

export default function FleetSlugRedirect() {
  redirect('/admin/dashboard?tab=fleet');
}
