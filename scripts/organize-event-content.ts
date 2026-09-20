import { writeEventContentCatalog } from './event-content-catalog';

writeEventContentCatalog(process.argv.includes('--check'));
