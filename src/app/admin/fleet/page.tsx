import { redirect } from 'next/navigation';

export default function AdminFleetRedirect() {
  redirect('/admin/dashboard?tab=fleet');
}
