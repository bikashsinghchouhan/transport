import type { Metadata } from 'next';
import ServiceLanding, { ServiceSection, type Faq } from '@/components/ServiceLanding';
import { pageMetadata } from '@/lib/seo';
import styles from '@/components/ServicePage.module.css';

const PATH = '/services/bike-car-transport-ranchi';

export const metadata: Metadata = pageMetadata({
  title: 'Bike and Car Transport Service in Ranchi | B2 Transport',
  description:
    'Bike transport and car transport from Ranchi to any district of Jharkhand and other states, on its own or with your household shifting. Call or WhatsApp 7654722708 for a quote.',
  path: PATH,
});

const faqs: Faq[] = [
  {
    q: 'Do you transport bikes and cars from Ranchi?',
    a: 'Yes. We transport bikes, scooters and cars from Ranchi to all districts of Jharkhand and to other states, either as a separate booking or together with your household shifting.',
  },
  {
    q: 'Can I send my bike along with my household goods?',
    a: 'Yes. If you are shifting your home with us, your bike can travel in the same vehicle when there is space, which usually costs less than a separate booking.',
  },
  {
    q: 'What documents do I need for bike or car transport?',
    a: 'Keep a copy of the vehicle RC, a valid insurance policy and your ID proof ready. For long-distance or interstate moves, carry the originals with you and share copies with us.',
  },
  {
    q: 'How much does bike or car transport cost?',
    a: 'The price depends on the vehicle, the distance and whether it travels alone or with household goods. Call or WhatsApp us with the vehicle model, pickup and drop location for a quote.',
  },
];

export default function BikeCarTransportRanchiPage() {
  return (
    <ServiceLanding
      path={PATH}
      badge="Ranchi, Jharkhand"
      titleLine1="Bike and Car Transport"
      titleLine2="from Ranchi"
      subtitle="Transport your bike, scooter or car within Jharkhand or to another state, on its own or with your household shifting."
      enquiryLabel="bike and car transport in Ranchi"
      serviceName="Bike and car transport in Ranchi"
      serviceType="Vehicle transport"
      breadcrumbName="Bike and Car Transport"
      city="Ranchi"
      faqTitle="Bike and Car Transport: Common Questions"
      faqs={faqs}
      related={[
        { href: '/services/interstate-shifting-ranchi', label: 'Interstate shifting from Ranchi' },
        { href: '/locations/ranchi', label: 'Packers and movers in Ranchi' },
        { href: '/services/house-shifting-van-ranchi', label: 'House shifting van rates' },
      ]}
    >
      <ServiceSection title="Bike Transport Service in Ranchi">
        <p>
          Moving to a new city or district and need your bike there too? We load your bike or scooter, secure it in the vehicle so it does not move during the trip, and deliver it to your new address.
        </p>
        <ul className={styles.list}>
          <li>Bikes and scooters of all common sizes</li>
          <li>Within Ranchi, to any Jharkhand district, or to other states</li>
          <li>Can travel with your household goods to save cost</li>
        </ul>
      </ServiceSection>

      <ServiceSection title="Car Transport Service in Ranchi">
        <p>
          We also transport cars from Ranchi to other districts of Jharkhand and to other states. Tell us the car model and route, and we will confirm the vehicle, schedule and price.
        </p>
      </ServiceSection>

      <ServiceSection title="How to Prepare Your Bike or Car">
        <ol className={styles.steps}>
          <li>Keep only a small amount of fuel in the tank.</li>
          <li>Remove helmets, mirrors that can come off, and any loose items or valuables.</li>
          <li>Note any existing scratches or dents and take photos before loading.</li>
          <li>Keep copies of the RC, insurance and your ID proof ready to share with us.</li>
        </ol>
      </ServiceSection>
    </ServiceLanding>
  );
}
