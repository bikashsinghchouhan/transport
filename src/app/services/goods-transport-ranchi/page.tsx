import type { Metadata } from 'next';
import Link from 'next/link';
import ServiceLanding, { ServiceSection, type Faq } from '@/components/ServiceLanding';
import FareExamplesTable from '@/components/FareExamplesTable';
import { pageMetadata } from '@/lib/seo';
import { getActiveVehicleRates } from '@/lib/vehicleRates';
import styles from '@/components/ServicePage.module.css';

// Prices come from the admin rate settings; refresh at most once an hour.
export const revalidate = 3600;

const PATH = '/services/goods-transport-ranchi';

export const metadata: Metadata = pageMetadata({
  title: 'Transport Service in Ranchi | Goods Transport Across Jharkhand | B2 Transport',
  description:
    'Goods transport service from Ranchi to all 24 districts of Jharkhand and other states. 3-wheeler, Tata Ace, pickup and 14 ft truck with driver for shop, business and household goods. Call 7654722708.',
  path: PATH,
});

const districts = [
  'Ranchi', 'Bokaro', 'Chatra', 'Deoghar', 'Dhanbad', 'Dumka', 'East Singhbhum (Jamshedpur)', 'Garhwa',
  'Giridih', 'Godda', 'Gumla', 'Hazaribagh', 'Jamtara', 'Khunti', 'Koderma', 'Latehar', 'Lohardaga',
  'Pakur', 'Palamu', 'Ramgarh', 'Sahibganj', 'Seraikela-Kharsawan', 'Simdega', 'West Singhbhum',
];

const trips = [
  { label: 'Ranchi to Ramgarh (about 45 km)', km: 45 },
  { label: 'Ranchi to Bokaro (about 115 km)', km: 115 },
  { label: 'Ranchi to Jamshedpur (about 130 km)', km: 130 },
  { label: 'Ranchi to Dhanbad (about 160 km)', km: 160 },
];

const faqs: Faq[] = [
  {
    q: 'Which areas does your transport service cover?',
    a: 'We transport goods within Ranchi, to all 24 districts of Jharkhand, and to other states. Vehicles are sent from our Ranchi office.',
  },
  {
    q: 'What kind of goods do you transport?',
    a: 'Shop stock, business and office goods, furniture, appliances, household goods and general cargo that fits our vehicles, from a few boxes up to a 14 ft truck load.',
  },
  {
    q: 'How is the transport charge calculated?',
    a: 'The fare is per kilometre from pickup to drop, with a lower rate after the first 100 km. It is then doubled because the vehicle returns empty. Loading labour, tolls and parking are extra.',
  },
  {
    q: 'Do you provide labour for loading and unloading?',
    a: 'Yes. Loaders can be booked with the vehicle. Labour is quoted separately based on the load and floor levels.',
  },
];

export default async function GoodsTransportRanchiPage() {
  const vehicles = await getActiveVehicleRates();

  return (
    <ServiceLanding
      path={PATH}
      badge="Ranchi, Jharkhand"
      titleLine1="Transport Service in Ranchi"
      titleLine2="Goods Transport Across Jharkhand"
      subtitle="Book a goods vehicle with driver from Ranchi for shop, business or household goods, to any district of Jharkhand or to other states."
      enquiryLabel="goods transport service in Ranchi"
      serviceName="Goods transport service in Ranchi"
      serviceType="Goods transport"
      breadcrumbName="Goods Transport"
      faqTitle="Transport Service: Common Questions"
      faqs={faqs}
      related={[
        { href: '/services/house-shifting-van-ranchi', label: 'House shifting van rates' },
        { href: '/services/interstate-shifting-ranchi', label: 'Interstate shifting from Ranchi' },
        { href: '/locations/ranchi', label: 'Packers and movers in Ranchi' },
      ]}
    >
      <ServiceSection title="Goods Vehicles Available">
        <p>
          Choose the vehicle by the size of your load. Every vehicle comes with a driver. See the{' '}
          <Link href="/services/house-shifting-van-ranchi" style={{ color: 'var(--accent-cyan)', textDecoration: 'underline' }}>
            full rate list
          </Link>{' '}
          for per-km rates and capacities.
        </p>
        <ul className={styles.list}>
          {vehicles.map((v) => (
            <li key={v.name}><strong>{v.name}</strong> ({v.capacity}): {v.description}</li>
          ))}
        </ul>
      </ServiceSection>

      <ServiceSection title="Example Transport Charges from Ranchi">
        <p>Estimated vehicle fare with driver, including the vehicle&apos;s return trip.</p>
        <FareExamplesTable vehicles={vehicles} trips={trips} />
        <p className={styles.note}>
          Estimates only. Loading labour, tolls and parking are extra. The final price is confirmed when you book.
        </p>
      </ServiceSection>

      <ServiceSection title="Districts We Serve in Jharkhand">
        <p>We transport goods from Ranchi to all 24 districts of Jharkhand:</p>
        <p>{districts.join(', ')}.</p>
        <p className={styles.note}>For distant districts, please book in advance.</p>
      </ServiceSection>

      <ServiceSection title="Transport for Shops and Businesses">
        <ul className={styles.list}>
          <li>Shop stock and inventory moves</li>
          <li>Office and shop shifting, with packing and loading labour on request</li>
          <li>Delivery of furniture, appliances and other goods to customers</li>
          <li>Single trips or repeat bookings</li>
        </ul>
      </ServiceSection>
    </ServiceLanding>
  );
}
