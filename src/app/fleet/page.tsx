import { redirect } from 'next/navigation';

export default function FleetRedirect() {
  redirect('/admin/dashboard?tab=fleet');
}
