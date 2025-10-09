declare module 'ip2location-io-nodejs' {
  export interface ConfigurationOptions {
    apiKey: string;
  }

  export class Configuration {
    constructor(options: ConfigurationOptions);
    apiKey: string;
  }

  export interface AsInfo {
    as_number: string;
    as_name: string;
    as_domain: string;
    as_usage_type: string;
    as_cidr: string;
  }

  export interface Translation {
    lang: string;
    value: string;
  }

  export interface CurrencyInfo {
    code: string;
    name: string;
    symbol: string;
  }

  export interface LanguageInfo {
    code: string;
    name: string;
  }

  export interface CountryInfo {
    name: string;
    alpha3_code: string;
    numeric_code: number;
    demonym: string;
    flag: string;
    capital: string;
    total_area: number;
    population: number;
    currency: CurrencyInfo;
    language: LanguageInfo;
    tld: string;
    translation: Translation;
  }

  export interface RegionInfo {
    name: string;
    code: string;
    translation: Translation;
  }

  export interface CityInfo {
    name: string;
    translation: Translation;
  }

  export interface ContinentInfo {
    name: string;
    code: string;
    hemisphere: string[];
    translation: Translation;
  }

  export interface TimeZoneInfo {
    olson: string;
    current_time: string;
    gmt_offset: number;
    is_dst: boolean;
    abbreviation: string;
    dst_start_date: string | null;
    dst_end_date: string | null;
    sunrise: string;
    sunset: string;
  }

  export interface ProxyInfo {
    last_seen: number;
    proxy_type: string;
    threat: string;
    provider: string;
    is_vpn: boolean;
    is_tor: boolean;
    is_data_center: boolean;
    is_public_proxy: boolean;
    is_web_proxy: boolean;
    is_web_crawler: boolean;
    is_residential_proxy: boolean;
    is_consumer_privacy_network: boolean;
    is_enterprise_private_network: boolean;
    is_spammer: boolean;
    is_scanner: boolean;
    is_botnet: boolean;
    is_bogon: boolean;
  }

  export interface IpGeolocationResponse {
    ip: string;
    country_code: string;
    country_name: string;
    region_name: string;
    district: string;
    city_name: string;
    latitude: number;
    longitude: number;
    zip_code: string;
    time_zone: string;
    asn: string;
    as: string;
    as_info: AsInfo;
    isp: string;
    domain: string;
    net_speed: string;
    idd_code: string;
    area_code: string;
    weather_station_code: string;
    weather_station_name: string;
    mcc: string;
    mnc: string;
    mobile_brand: string;
    elevation: number;
    usage_type: string;
    address_type: string;
    ads_category: string;
    ads_category_name: string;
    continent: ContinentInfo;
    country: CountryInfo;
    region: RegionInfo;
    city: CityInfo;
    time_zone_info: TimeZoneInfo;
    geotargeting: { metro: string | null };
    is_proxy: boolean;
    fraud_score: number;
    proxy: ProxyInfo;
  }

  export class IPGeolocation {
    constructor(config: Configuration);
    lookup(ip: string, lang?: string): Promise<IpGeolocationResponse>;
  }
}
