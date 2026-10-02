import citiesJson from '../../../content/nomads/cities.json';
import placesJson from '../../../content/nomads/places.json';
import visasJson from '../../../content/nomads/visas.json';
import countriesJson from '../../../content/nomads/countries.json';
import servicesJson from '../../../content/nomads/services.json';
import taxesJson from '../../../content/nomads/taxes.json';
import sourcesJson from '../../../content/nomads/sources.json';
import { citySummary, decodePlaces, type NomadCity, type CompactPlaces, type VisaProgram, type PassportCountry, type ServiceCategory, type TaxReference } from './types';

const cities = citiesJson as unknown as NomadCity[];
const bySlug = new Map(cities.map(city => [city.slug, city]));
const summaries = cities.map(citySummary);
let places: ReturnType<typeof decodePlaces> | undefined;

export const nomadSources = sourcesJson;
export const getNomadCities = (): readonly NomadCity[] => cities;
export const getNomadCity = (slug: string): NomadCity | undefined => bySlug.get(slug);
export const getNomadSummaries = () => summaries;
export const getNomadPlaces = () => places ??= decodePlaces(placesJson as unknown as CompactPlaces);
export const getCityPlaces = (slug: string) => getNomadPlaces().filter(place => place.citySlug === slug);
export const getNomadVisas = () => (visasJson as unknown as VisaProgram[]).map(({ source: _source, ...program }) => program);
export const getPassportCountries = () => countriesJson as PassportCountry[];
export const getNomadServices = () => servicesJson as ServiceCategory[];
export const getNomadTaxes = () => taxesJson as TaxReference[];
