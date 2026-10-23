import { redirect } from 'next/navigation';

export default async function AdminContactRedirect(props: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = props.searchParams ? await props.searchParams : {};
  const query = new URLSearchParams();
  if (sp && sp.action) query.set('action', String(sp.action));
  const queryString = query.toString();
  redirect(`/admin/contactsetting${queryString ? `?${queryString}` : ''}`);
}
