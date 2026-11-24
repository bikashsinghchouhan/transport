import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Truck } from 'lucide-react';
import styles from './ServiceHighlights.module.css';

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || '';

// Each card has its own pastel tone (see .tone* in the CSS module).
const CARDS = [
  {
    title: 'Home Shifting',
    text: 'Safe and hassle-free household relocation.',
    href: '/services/house-shifting-van-ranchi',
    img: 'home.png',
    alt: 'House with packed moving boxes',
    tone: 'toneBlue',
  },
  {
    title: 'Goods Transport',
    text: 'Reliable transport for all types of goods.',
    href: '/services/goods-transport-ranchi',
    img: 'goods.png',
    alt: 'Stack of cardboard cartons',
    tone: 'tonePeach',
  },
  {
    title: 'Shifting Van & Rates',
    text: 'Choose the right vehicle at the best rate.',
    href: '#fleet',
    img: 'truck.png',
    alt: 'Orange goods truck',
    tone: 'toneGreen',
  },
  {
    title: 'Office Relocation',
    text: 'Move your office equipment safely.',
    href: '#services',
    img: 'office.png',
    alt: 'Office desk, chair and computer',
    tone: 'toneLavender',
  },
] as const;

export default function ServiceHighlights() {
  return (
    <section className={styles.section} aria-labelledby="service-highlights-title">
      <div className={styles.header}>
        <span className={styles.badge}>
          <Truck size={16} />
          Our Services
        </span>
        <h2 id="service-highlights-title" className={styles.title}>
          Complete Moving &amp;{' '}
          <span className={styles.titleAccent}>
            Transport Solutions
            <svg className={styles.underline} viewBox="0 0 200 14" preserveAspectRatio="none" aria-hidden="true">
              <path d="M4 10 C60 2 140 2 196 8" />
            </svg>
          </span>
        </h2>
      </div>

      <div className={styles.grid}>
        {CARDS.map((card) => (
          <Link key={card.title} href={card.href} className={`${styles.card} ${styles[card.tone]}`}>
            <div className={styles.art}>
              <Image
                src={`${BASE}/services/${card.img}`}
                alt={card.alt}
                width={300}
                height={160}
                className={styles.artImg}
              />
            </div>
            <div className={styles.body}>
              <div>
                <h3 className={styles.cardTitle}>{card.title}</h3>
                <p className={styles.cardText}>{card.text}</p>
              </div>
              <span className={styles.arrow} aria-hidden="true">
                <ArrowRight size={16} />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
