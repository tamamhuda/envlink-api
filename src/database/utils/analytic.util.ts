type CountryVisit = { countryCode: string; total: number; unique: number };
type RegionVisit = {
  region: string;
  total: number;
  unique: number;
  countryCode: string;
};
type CityVisit = {
  city: string;
  countryCode: string;
  total: number;
  unique: number;
};
type DeviceVisit = { device: string; total: number; unique: number };
type OsVisit = { os: string; total: number; unique: number };
type BrowserVisit = { browser: string; total: number; unique: number };
type ReferrerVisit = { referrer: string; total: number; unique: number };

export type Segments = {
  deviceVisits: DeviceVisit[];
  osVisits: OsVisit[];
  browserVisits: BrowserVisit[];
  countryVisits: CountryVisit[];
  regionVisits: RegionVisit[];
  cityVisits: CityVisit[];
  referrerVisits: ReferrerVisit[];
};

export class AnalyticUtil {
  static initSegments(): Segments {
    return {
      deviceVisits: [],
      osVisits: [],
      browserVisits: [],
      countryVisits: [],
      regionVisits: [],
      cityVisits: [],
      referrerVisits: [],
    };
  }

  static mergeRow(bucket: Segments, r: any) {
    mergeArray(bucket.deviceVisits, 'device', r);
    mergeArray(bucket.osVisits, 'os', r);
    mergeArray(bucket.browserVisits, 'browser', r);
    mergeArray(bucket.referrerVisits, 'referrer', r);

    mergeArray(bucket.countryVisits, 'countryCode', r);
    mergeArray(bucket.regionVisits, 'region', r, ['countryCode']);
    mergeArray(bucket.cityVisits, 'city', r, ['countryCode', 'region']);
  }

  static reduceRows(rows: any[]): Segments {
    const result = this.initSegments();
    for (const r of rows) this.mergeRow(result, r);
    return result;
  }

  static reduceByUrl(rows: any[]): Record<string, Segments> {
    const map: Record<string, Segments> = {};
    for (const r of rows) {
      if (!map[r.urlId]) map[r.urlId] = this.initSegments();
      this.mergeRow(map[r.urlId], r);
    }
    return map;
  }
}

/** helpers */
function mergeArray(
  bucket: any[],
  field: string,
  r: any,
  extraFields: string[] = [],
) {
  const match = bucket.find((x) => x[field] === r[field]);
  if (match) {
    match.total += r.total;
    match.unique += r.unique;
  } else {
    bucket.push({
      [field]: r[field],
      ...Object.fromEntries(extraFields.map((f) => [f, r[f]])),
      total: r.total,
      unique: r.unique,
    });
  }
}
