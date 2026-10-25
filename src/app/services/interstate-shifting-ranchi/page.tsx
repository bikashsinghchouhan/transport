import type { Metadata } from 'next';
import ServiceLanding, { ServiceSection, type Faq } from '@/components/ServiceLanding';
import FareExamplesTable from '@/components/FareExamplesTable';
import { pageMetadata } from '@/lib/seo';
import { getActiveVehicleRates } from '@/lib/vehicleRates';
import styles from '@/components/ServicePage.module.css';

// Prices come from the admin rate settings; refresh at most once an hour.
export const revalidate = 3600;

const PATH = '/services/interstate-shifting-ranchi';

export const metadata: Metadata = pageMetadata({
  title: 'Packers and Movers from Ranchi to Kolkata, Patna & Other States | B2 Transport',
  description:
    'Interstate house shifting and goods transport from Ranchi to Kolkata, Patna, Bhubaneswar and other states. Packing, loading labour, bike and car transport. Call 7654722708 for a quote.',
  path: PATH,
});

// Approximate one-way road distances, used only for example fares.
const trips = [
  { label: 'Ranchi to Patna (about 330 km)', km: 330 },
  { label: 'Ranchi to Kolkata (about 400 km)', km: 400 },
  { label: 'Ranchi to Bhubaneswar (about 460 km)', km: 460 },
];

const faqs: Faq[] = [
  {
    q: 'Do you shift household goods from Ranchi to other states?',
    a: 'Yes. We move household and office goods from Ranchi to other states, with packing, loading labour and bike or car transport on request.',
  },
  {
    q: 'Do you also move goods to Ranchi from other cities, like Kolkata to Ranchi?',
    a: 'Call or WhatsApp us with your route and date. We will confirm whether we can take the booking and share the price.',
  },
  {
    q: 'How is the interstate shifting charge calculated?',
    a: 'The vehicle fare is per kilometre, with a lower rate after the first 100 km, and it is doubled because the vehicle returns to Ranchi. Packing, labour, tolls and state permits or taxes, if any, are quoted separately.',
  },
  {
    q: 'How far in advance should I book an interstate move?',
    a: 'Book as early as you can, ideally a few days before your moving date, so we can arrange the right vehicle and labour.',
  },
];

export default async function InterstateShiftingRanchiPage() {
  const vehicles = await getActiveVehicleRates();

  return (
    <ServiceLanding
      path={PATH}
      badge="From Ranchi to other states"
      titleLine1="Interstate Shifting"
      titleLine2="from Ranchi"
      subtitle="House shifting and goods transport from Ranchi to Kolkata, Patna, Bhubaneswar and other states, with packing and loading help."
      enquiryLabel="interstate shifting from Ranchi"
      serviceName="Interstate shifting from Ranchi"
      serviceType="Interstate moving and goods transport"
      breadcrumbName="Interstate Shifting"
      city="Ranchi"
      faqTitle="Interstate Shifting: Common Questions"
      faqs={faqs}
      related={[
        { href: '/services/bike-car-transport-ranchi', label: 'Bike and car transport' },
        { href: '/services/goods-transport-ranchi', label: 'Goods transport in Jharkhand' },
        { href: '/locations/ranchi', label: 'Packers and movers in Ranchi' },
      ]}
    >
      <ServiceSection title="Packers and Movers from Ranchi to Other States">
        <p>
          Moving out of Jharkhand? We handle the full move from your home in Ranchi: packing, loading, transport and unloading at your new address.
        </p>
        <ul className={styles.list}>
          <li>Neighbouring states: West Bengal (Kolkata), Bihar (Patna) and Odisha (Bhubaneswar)</li>
          <li>Longer moves, for example to Delhi, Bangalore, Hyderabad or Mumbai: call to check availability for your date</li>
          <li>Bike and car transport with your household goods</li>
        </ul>
      </ServiceSection>

      <ServiceSection title="Example Interstate Vehicle Charges">
        <p>Estimated vehicle fare with driver for one trip, including the vehicle&apos;s return to Ranchi.</p>
        <FareExamplesTable vehicles={vehicles} trips={trips} />
        <p className={styles.note}>
          Estimates only. Packing, labour, tolls and any state permits or taxes are extra. The final price is confirmed when you book.
        </p>
      </ServiceSection>

      <ServiceSection title="How an Interstate Move Works">
        <ol className={styles.steps}>
          <li>Share your item list, pickup address in Ranchi, destination and date on call or WhatsApp.</li>
          <li>We suggest the vehicle and labour and confirm the price.</li>
          <li>On moving day we pack and load your goods.</li>
          <li>Your goods are delivered and unloaded at your new address.</li>
        </ol>
      </ServiceSection>
    </ServiceLanding>
  );
}
