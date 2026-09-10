import { redirect } from 'next/navigation';

export function GET() {
  redirect('/events?utm_source=telegram&utm_medium=social&utm_campaign=events_button');
}
