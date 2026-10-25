import type { Metadata } from 'next';
import Link from 'next/link';
import { MapPin } from 'lucide-react';
import Estimator from '@/components/Estimator';
import LocationCallButtons from '@/components/LocationCallButtons';
import { BUSINESS_ID, SITE_URL, pageMetadata } from '@/lib/seo';
import { estimateFareRange, formatInr, getActiveVehicleRates } from '@/lib/vehicleRates';
import hero from '@/app/locations/[slug]/LocationPage.module.css';
import styles from '@/components/ServicePage.module.css';

// Prices come from the admin rate settings; refresh the page at most once an hour.
export const revalidate = 3600;

const PATH = '/services/house-shifting-van-ranchi';

export const metadata: Metadata = pageMetadata({
  title: 'House Shifting Van in Ranchi | Chota Hathi & Pickup on Rent, Price List | B2 Transport',
  description:
    'Book a home shifting van in Ranchi: 3-wheeler, Tata Ace (Chota Hathi), Mahindra Pickup or 14 ft truck with driver. See per-km rates and fares, add packing and loading labour. Call 7654722708.',
  path: PATH,
});

// Approximate road distances from Ranchi, used only for the example fares below.
const exampleTrips = [
  { label: 'Within Ranchi (up to 25 km)', km: 20 },
  { label: 'Ranchi to Ramgarh (about 45 km)', km: 45 },
  { label: 'Ranchi to Hazaribagh (about 95 km)', km: 95 },
  { label: 'Ranchi to Jamshedpur (about 130 km)', km: 130 },
];

const faqs = [
  {
    q: 'Which van do I need to shift my house in Ranchi?',
    a: 'For a few items or a single room, a 3-wheeler loader or Tata Ace (Chota Hathi) is usually enough. A 1 BHK usually fits in a Tata Ace or Mahindra Pickup, a 2 BHK in a Pickup or 14 ft truck, and a 3 BHK in a 14 ft truck. Tell us your item list on call or WhatsApp and we will suggest the right vehicle.',
  },
  {
    q: 'Does the van come with a driver?',
    a: 'Yes. Every vehicle is booked with a driver. You do not need to drive the van yourself.',
  },
  {
    q: 'Do you provide labour for loading and unloading?',
    a: 'Yes. We can send loaders to carry heavy items like beds, almirahs, sofas, refrigerators and washing machines. We also offer packing and unpacking. Labour and packing are quoted separately, based on the number of items and floor levels.',
  },
  {
    q: 'How is the house shifting van charge calculated?',
    a: 'The vehicle fare is calculated per kilometre from pickup to drop, with a lower rate after the first 100 km. That price is then doubled, because the van has to drive back after your drop. Short local trips have a minimum fare. Use the fare estimator on this page for your exact route, then call us to confirm the final price.',
  },
  {
    q: 'Can I book a shifting van from Ranchi to another district or state?',
    a: 'Yes. We send vans from Ranchi to all 24 districts of Jharkhand and to other states. For long trips, please book in advance.',
  },
  {
    q: 'How do I book a Chota Hathi for shifting in Ranchi?',
    a: 'Call or WhatsApp 7654722708 with your pickup and drop address, date and item list. We confirm the Chota Hathi (Tata Ace) or a bigger vehicle if needed, plus the price, before the booking.',
  },
  {
    q: 'Ghar ka saman shift karne ke liye gadi kaise book karein?',
    a: 'Humein 7654722708 par call ya WhatsApp karein. Pickup aur drop address, date aur saman ki list batayein. Hum sahi gadi (3-wheeler, Chota Hathi, Pickup ya 14 ft truck), loading labour aur kiraya confirm kar denge.',
  },
];

export default async function HouseShiftingVanRanchiPage() {
  const vehicles = await getActiveVehicleRates();
  const pageUrl = `${SITE_URL}${PATH}`;

  const schema = [
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: 'House shifting van in Ranchi',
      serviceType: 'House shifting vehicle hire with driver',
      url: pageUrl,
      provider: { '@id': BUSINESS_ID },
      areaServed: { '@type': 'City', name: 'Ranchi', containedInPlace: { '@type': 'State', name: 'Jharkhand' } },
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Shifting vehicles',
        itemListElement: vehicles.map((v) => ({
          '@type': 'Offer',
          itemOffered: { '@type': 'Service', name: `${v.name} for house shifting` },
          priceSpecification: {
            '@type': 'UnitPriceSpecification',
            price: v.rateFirst100,
            priceCurrency: 'INR',
            unitText: 'per km (first 100 km)',
          },
        })),
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'House Shifting Van in Ranchi', item: pageUrl },
      ],
    },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <div className={hero.wrapper}>
        <section className={hero.heroSection}>
          <div className={hero.heroGlow}></div>
          <div className="container">
            <div className={hero.heroContent}>
              <div className={hero.locationBadge}>
                <MapPin size={16} className={hero.pinIcon} />
                <span>Ranchi, Jharkhand</span>
              </div>
              <h1 className={hero.heroTitle}>
                House Shifting Van <br />
                <span className="text-gradient">in Ranchi</span>
              </h1>
              <p className={hero.heroSubtitle}>
                Book a 3-wheeler, Tata Ace (Chota Hathi), Mahindra Pickup or 14 ft truck with driver for your home shifting. Add packing and loading labour if you need it.
              </p>
              <LocationCallButtons locationName="house shifting van in Ranchi" stylesActionRowClass={hero.actionRow} />
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={`container ${styles.narrow}`}>
            <div className={`glass-panel ${styles.card}`}>
              <h2>Shifting Vans and Rates</h2>
              <p>
                Choose a vehicle by how much you are moving. Rates are per kilometre and include the vehicle and driver. Because the van has to drive back after your drop, the distance price is charged both ways (doubled). Loading labour and packing are extra.
              </p>
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th scope="col">Vehicle</th>
                      <th scope="col">Capacity / Body</th>
                      <th scope="col">Best for</th>
                      <th scope="col">Rate per km</th>
                      <th scope="col">Local minimum</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vehicles.map((v) => (
                      <tr key={v.name}>
                        <td><strong>{v.name}</strong></td>
                        <td>{v.capacity}<br />{v.dimensions}</td>
                        <td>{v.description}</td>
                        <td>{formatInr(v.rateFirst100)} (first 100 km)<br />{formatInr(v.rateAfter100)} after<br />× 2 for return trip</td>
                        <td>{formatInr(v.minFareMin)} - {formatInr(v.minFareMax)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={`container ${styles.narrow}`}>
            <div className={`glass-panel ${styles.card}`}>
              <h2>Example Shifting Van Charges from Ranchi</h2>
              <p>Estimated vehicle fare for common trips, including the van&apos;s return trip, using the same formula as our fare estimator.</p>
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th scope="col">Trip</th>
                      {vehicles.map((v) => (
                        <th scope="col" key={v.name}>{v.name}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {exampleTrips.map((t) => (
                      <tr key={t.label}>
                        <td><strong>{t.label}</strong></td>
                        {vehicles.map((v) => {
                          const r = estimateFareRange(t.km, v);
                          return <td key={v.name}>{formatInr(r.min)} - {formatInr(r.max)}</td>;
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className={styles.note}>
                Estimates only: vehicle fare with driver, both ways. Packing, loading labour and the final price are confirmed when you book.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={`container ${styles.narrow}`}>
            <div className={`glass-panel ${styles.card}`}>
              <h2>Chota Hathi Booking for Shifting in Ranchi</h2>
              <p>
                The Tata Ace, known locally as Chota Hathi, is the most popular vehicle for small home shifting, PG and student moves, and single-item shifting in Ranchi. For a bigger load, book a Mahindra Pickup or 14 ft truck instead.
              </p>
              <p lang="hi-Latn">
                <strong>Ghar ka saman shift karna hai?</strong> Saman shifting ke liye tempo, Chota Hathi, pickup ya truck, driver aur loading labour ke saath, Ranchi se Jharkhand ke kisi bhi zile tak. Call ya WhatsApp karein: 7654722708.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={`container ${styles.narrow}`}>
            <div className={`glass-panel ${styles.card}`}>
              <h2>Which Van for Your Home?</h2>
              <ul className={styles.list}>
                <li><strong>Single items or one room</strong> (bed, fridge, almirah, luggage): 3-wheeler loader or Tata Ace.</li>
                <li><strong>1 RK / 1 BHK or PG shifting</strong>: Tata Ace (Chota Hathi) or Mahindra Pickup.</li>
                <li><strong>2 BHK</strong>: Mahindra Pickup, or a 14 ft truck if you have a lot of furniture.</li>
                <li><strong>3 BHK or office</strong>: 14 ft container truck.</li>
              </ul>
              <p className={styles.note}>Not sure? Send your item list on WhatsApp and we will suggest the right vehicle.</p>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={`container ${styles.narrow}`}>
            <div className={`glass-panel ${styles.card}`}>
              <h2>What You Can Add</h2>
              <ul className={styles.list}>
                <li>Packing and unpacking of household goods</li>
                <li>Loading and unloading labour, including upper floors</li>
                <li>Bike or car transport along with your household goods</li>
                <li>Shifting to any district of Jharkhand or to other states</li>
              </ul>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={`container ${styles.narrow}`}>
            <div className={`glass-panel ${styles.card}`}>
              <h2>How to Book a Shifting Van</h2>
              <ol className={styles.steps}>
                <li>Check the estimated fare for your route with the fare estimator below.</li>
                <li>Call or WhatsApp us with your pickup and drop address, date, and item list.</li>
                <li>We confirm the vehicle, labour, and final price.</li>
                <li>The van and driver arrive at your pickup address at the booked time.</li>
              </ol>
            </div>
          </div>
        </section>

        <div className={hero.estimatorWrapper}>
          <Estimator />
        </div>

        <section className={styles.section}>
          <div className={`container ${styles.narrow}`}>
            <div className={`glass-panel ${styles.card}`}>
              <h2>House Shifting Van: Common Questions</h2>
              <div className={styles.faq}>
                {faqs.map((f) => (
                  <div className={styles.faqItem} key={f.q}>
                    <h3>{f.q}</h3>
                    <p>{f.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={`container ${styles.narrow}`}>
            <div className={`glass-panel ${styles.card}`}>
              <h2>Related Services</h2>
              <div className={styles.links}>
                <Link href="/locations/ranchi">Packers and movers in Ranchi</Link>
                <Link href="/locations/ramgarh">Shifting in Ramgarh</Link>
                <Link href="/locations/jamshedpur">Ranchi to Jamshedpur shifting</Link>
                <Link href="/locations/hazaribagh">Shifting in Hazaribagh</Link>
                <Link href="/services/goods-transport-ranchi">Goods transport service</Link>
                <Link href="/services/bike-car-transport-ranchi">Bike and car transport</Link>
                <Link href="/services/interstate-shifting-ranchi">Interstate shifting</Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
