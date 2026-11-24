'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  Building2,
  Calculator,
  Home,
  Package,
  Phone,
  ShieldCheck,
  Tag,
  Truck,
} from 'lucide-react';
import { useContact } from '@/context/ContactContext';
import { telHref } from '@/lib/seo';
import styles from './HeroBanner.module.css';

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || '';

// To change the hero photo, replace public/hero.png (a wide night-highway truck shot works best).
const HERO_IMAGE = `${BASE}/hero.png`;

const SERVICE_CHIPS = [
  { label: 'House Shifting', href: '/services/house-shifting-van-ranchi', Icon: Home },
  { label: 'Goods Transport', href: '/services/goods-transport-ranchi', Icon: Package },
  { label: 'Local & Interstate', href: '/services/interstate-shifting-ranchi', Icon: Truck },
  { label: 'Office Relocation', href: '#services', Icon: Building2 },
];

export default function HeroBanner() {
  const { contact } = useContact();

  return (
    <section className={styles.hero}>
      {/* Right side: photo with wave edge, Jharkhand map and service chips */}
      <div className={styles.media}>
        <Image
          src={HERO_IMAGE}
          alt="B2 Transport truck on a highway at night with a city skyline"
          fill
          priority
          unoptimized
          sizes="(max-width: 992px) 100vw, 60vw"
          className={styles.photo}
        />
        <div className={styles.photoShade} aria-hidden="true" />

        <nav className={styles.chips} aria-label="Popular services">
          {SERVICE_CHIPS.map(({ label, href, Icon }) => (
            <Link key={label} href={href} className={styles.chip}>
              <Icon size={18} />
              <span>{label}</span>
            </Link>
          ))}
        </nav>

        {/* Orange accent swoosh, bottom-right */}
        <svg className={styles.swoosh} viewBox="0 0 400 120" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 120 C120 90 260 70 400 0 V120 Z" />
        </svg>
      </div>

      {/* Soft glowing border along the photo's curved edge (same box as the photo) */}
      <svg className={styles.edge} viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-hidden="true">
        {/* All strokes are centred on the exact curve used for the photo mask, with fixed pixel widths,
            so the edge is the same thickness from top to bottom and never drifts off the photo. */}
        <path className={styles.edgeGlow} d="M480 0 C430 250 300 420 180 620 C110 740 60 870 0 1000" />
        <path className={styles.edgeSoft} d="M480 0 C430 250 300 420 180 620 C110 740 60 870 0 1000" />
        <path className={styles.edgeLine} d="M480 0 C430 250 300 420 180 620 C110 740 60 870 0 1000" />
      </svg>

      {/* Jharkhand state outline: real 2011 census boundary (district polygons merged, simplified) with the Ranchi head-office pin */}
      <div className={styles.mapCard} aria-hidden="true">
        <svg viewBox="0 0 480 385" className={styles.mapSvg}>
          <path className={styles.mapShape} d="M424 25L425 13L430 15L431 10L434 8L437 12L445 12L447 18L454 19L456 37L471 49L472 55L465 62L466 66L463 65L463 71L460 72L459 69L458 73L467 77L465 81L468 83L467 86L467 88L463 88L467 89L467 91L461 95L453 92L457 96L455 101L457 99L457 102L459 101L457 103L458 105L455 110L457 110L456 114L452 122L447 123L447 127L442 130L440 128L440 132L446 135L445 139L433 138L437 141L432 147L426 143L425 146L427 146L425 150L427 152L420 154L422 157L420 158L412 154L409 155L410 152L400 151L399 153L402 155L402 159L405 160L405 166L403 169L400 165L400 175L398 174L399 171L395 173L395 171L389 170L393 175L391 178L387 178L373 170L370 172L367 168L364 170L365 175L363 172L358 176L356 174L359 181L356 189L350 191L347 188L336 191L328 196L322 196L320 199L314 202L312 207L312 212L314 213L310 217L306 217L307 220L302 218L300 220L299 218L300 215L298 216L290 214L291 204L280 201L277 205L281 212L271 213L264 212L262 214L261 218L264 218L266 221L262 222L264 227L257 236L259 241L264 243L264 246L267 249L271 247L280 249L280 253L290 257L294 264L299 265L306 263L315 267L318 265L326 265L328 268L330 266L328 271L325 272L323 270L319 273L322 276L319 280L318 288L327 297L332 296L339 301L339 307L342 311L352 311L356 321L351 321L351 324L352 328L360 331L359 339L365 342L364 346L357 346L357 345L356 348L355 345L357 348L356 350L354 350L355 349L354 348L351 351L341 348L340 345L335 344L334 341L329 341L325 336L319 341L312 336L304 325L287 321L280 312L278 317L274 318L271 323L277 328L278 333L275 337L278 338L277 340L280 340L273 347L279 353L275 360L276 362L266 377L252 375L255 365L259 366L256 362L250 366L244 368L241 364L235 366L225 361L212 357L212 361L207 361L199 373L193 366L192 368L191 366L188 366L185 363L181 362L174 365L178 361L182 344L187 342L187 340L185 340L183 335L182 321L164 328L163 325L159 327L156 325L151 325L150 328L129 328L123 329L124 332L118 333L118 336L104 337L100 333L95 333L91 330L89 322L76 317L76 312L84 304L90 305L97 301L98 293L101 290L104 290L108 281L112 280L115 273L113 267L104 269L103 266L101 268L97 267L94 262L93 267L90 269L88 261L88 256L81 252L79 249L81 242L83 228L80 224L77 224L76 226L71 223L73 219L72 214L77 210L78 205L77 196L68 197L69 203L56 201L47 190L50 186L46 175L42 174L41 172L32 171L34 168L30 167L27 153L20 151L18 146L8 144L16 126L13 121L21 116L18 112L16 111L14 106L15 101L25 98L47 100L62 97L69 95L76 85L80 89L86 103L89 101L90 97L93 100L94 95L96 97L99 95L101 98L102 94L105 94L108 102L104 105L105 106L109 108L107 109L109 113L114 113L118 117L118 119L121 119L124 121L126 120L124 122L125 124L128 118L128 115L132 114L132 111L142 113L144 106L154 100L156 98L159 99L159 106L164 105L166 115L173 115L178 110L182 111L183 108L184 115L193 109L192 105L198 105L200 102L204 102L204 98L211 98L209 100L215 98L213 95L219 98L225 96L228 99L230 94L233 94L234 90L242 92L243 88L240 81L246 76L246 70L249 66L253 68L262 68L270 75L281 70L279 75L285 74L288 79L287 85L289 90L294 92L297 88L302 92L308 91L306 94L307 100L303 105L307 107L311 107L317 114L321 115L322 109L325 109L326 100L328 96L331 97L337 89L341 93L349 92L351 88L353 88L357 90L356 93L360 93L361 95L364 93L367 96L367 90L370 84L371 86L374 86L381 89L385 68L383 66L391 59L390 44L397 36L399 36L400 33L405 36L409 22L413 24L415 21L417 23Z" />
        </svg>
        <div className={styles.mapPin} style={{ left: '43.4%', top: '58.9%' }}>
          <span className={styles.mapPulse} />
          <svg viewBox="0 0 24 24" className={styles.mapPinIcon}>
            <path d="M12 1.5a7.5 7.5 0 0 0-7.5 7.5c0 5.6 7.5 13.5 7.5 13.5s7.5-7.9 7.5-13.5A7.5 7.5 0 0 0 12 1.5zm0 10.3a2.8 2.8 0 1 1 0-5.6 2.8 2.8 0 0 1 0 5.6z" />
          </svg>
          <span className={styles.mapLabel}>
            <strong>Ranchi</strong>
            <small>(Jharkhand)</small>
          </span>
        </div>
      </div>

      {/* Left side: copy and calls to action */}
      <div className={styles.content}>
        <div className={styles.badge}>
          <Truck size={15} />
          <span>RANCHI-BASED SHIFTING &amp; TRANSPORT</span>
        </div>

        <h1 className={styles.title}>
          Packers and Movers in Ranchi
          <span className={styles.titleAccent}>
            Across Jharkhand
            <svg className={styles.underline} viewBox="0 0 300 20" preserveAspectRatio="none" aria-hidden="true">
              <path d="M4 14 C80 4 200 2 296 10" />
            </svg>
          </span>
        </h1>

        <p className={styles.description}>
          Need to shift your house or transport goods? <strong>B2 Transport</strong> is based in Ranchi and provides
          home shifting, packing, loading help and truck hire across all districts of Jharkhand.
        </p>

        <div className={styles.ctas}>
          <Link href="#estimator" className={styles.ctaPrimary}>
            <Calculator size={18} />
            <span>Calculate Fare Estimate</span>
            <ArrowRight size={17} />
          </Link>
          <a href={telHref(contact.phone)} className={styles.ctaSecondary} suppressHydrationWarning>
            <Phone size={17} />
            <span suppressHydrationWarning>Call {contact.phone}</span>
          </a>
        </div>

        <ul className={styles.trust}>
          <li>
            <Package size={16} />
            <span>Packing &amp; Loading Help</span>
          </li>
          <li>
            <ShieldCheck size={16} />
            <span>Safe &amp; Timely Delivery</span>
          </li>
          <li>
            <Tag size={16} />
            <span>Fare Estimate Before Booking</span>
          </li>
        </ul>
      </div>
    </section>
  );
}
