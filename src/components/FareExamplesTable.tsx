import { estimateFareRange, formatInr, type VehicleRate } from '@/lib/vehicleRates';
import styles from '@/components/ServicePage.module.css';

export interface ExampleTrip {
  label: string;
  /** Approximate one-way road distance in km. */
  km: number;
}

// Example fares (vehicle + driver, including the van's return trip) for given trips.
export default function FareExamplesTable({ vehicles, trips }: { vehicles: VehicleRate[]; trips: ExampleTrip[] }) {
  return (
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
          {trips.map((t) => (
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
  );
}
