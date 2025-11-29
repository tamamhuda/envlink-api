type CountryVisit = { countryCode: string; total: number; unique: number };
type RegionVisit = { region: string; total: number; unique: number };
type CityVisit = {
  city: string;
  countryCode: string;
  total: number;
  unique: number;
};
export type VisitCount = { total: number; unique: number };

export type Segments = {
  deviceVisits: Record<string, VisitCount>;
  osVisits: Record<string, VisitCount>;
  browserVisits: Record<string, VisitCount>;
  countryVisits: CountryVisit[];
  regionVisits: RegionVisit[];
  cityVisits: CityVisit[];
  referrerVisits: Record<string, VisitCount>;
};

export class AnalyticUtil {
  static initSegments(): Segments {
    return {
      deviceVisits: {},
      osVisits: {},
      browserVisits: {},
      countryVisits: [],
      regionVisits: [],
      cityVisits: [],
      referrerVisits: {},
    };
  }

  static mergeRow(bucket: Segments, r: any) {
    mergeCount(bucket.deviceVisits, r.device, r);
    mergeCount(bucket.osVisits, r.os, r);
    mergeCount(bucket.browserVisits, r.browser, r);
    mergeCount(bucket.referrerVisits, r.referrer, r);

    mergeArray(bucket.countryVisits, 'countryCode', r);
    mergeArray(bucket.regionVisits, 'region', r);
    mergeArray(bucket.cityVisits, 'city', r, ['countryCode']);
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

function mergeCount(bucket: Record<string, VisitCount>, key: string, r: any) {
  if (!bucket[key]) bucket[key] = { total: 0, unique: 0 };
  bucket[key].total += r.total;
  bucket[key].unique += r.unique;
}

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
