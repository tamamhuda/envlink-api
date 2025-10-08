declare module 'ipapi.co' {
  export interface IpApiLocation {
    ip?: string;
    city?: string;
    region?: string;
    country_name?: string;
    country_code?: string;
    postal?: string;
    latitude?: number;
    longitude?: number;
    timezone?: string;
    org?: string;
  }
  // ipapi.co supports both callback and promise usage
  function location(
    callback?: (response: IpApiLocation) => void,
    ip?: string,
  ): Promise<IpApiLocation>;
  export = { location };
}
