import * as React from 'react';
import { CloudRain, Droplets, Thermometer } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { metric, type MonthlyClimate } from '@/lib/nomads/types';

function ClimateChart({ months, kind, name }: { months: MonthlyClimate[]; kind: 'temp' | 'rain'; name: string }) {
  const values = months.map(month => month[kind]).filter((value): value is number => value !== null && Number.isFinite(value));
  const temperature = kind === 'temp';
  const Icon = temperature ? Thermometer : CloudRain;
  const color = temperature ? 'text-orange-600 dark:text-orange-400' : 'text-sky-600 dark:text-sky-400';
  const low = temperature && values.length ? Math.floor(Math.min(...values) / 5) * 5 - 5 : 0;
  const high = values.length ? temperature ? Math.ceil(Math.max(...values) / 5) * 5 + 5 : Math.max(50, Math.ceil(Math.max(...values) / 50) * 50) : 1;
  const width = 600, height = 180;
  const x = (index: number) => (index + 0.5) * width / Math.max(1, months.length);
  const y = (value: number) => height - (value - low) / (high - low) * height;
  let connected = false;
  const line = months.map((month, index) => {
    const value = month[kind];
    if (value === null || !Number.isFinite(value)) { connected = false; return ''; }
    const command = `${connected ? 'L' : 'M'}${x(index)},${y(value)}`;
    connected = true;
    return command;
  }).join(' ');

  return <Card className="min-w-0 border-border/70 shadow-none">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 pb-3 pt-4">
      <h3 className="flex items-center gap-2 text-sm font-semibold"><Icon className={`h-4 w-4 ${color}`} aria-hidden />{temperature ? 'Temperature' : 'Rainfall'}</h3><span className="text-xs text-muted-foreground">{temperature ? 'Monthly average · °C' : 'Monthly total · mm'}</span>
    </CardHeader>
    <CardContent className="px-4 pb-4 pt-2">
      {values.length ? <div className="grid grid-cols-[2rem_minmax(0,1fr)] gap-2">
        <div className="flex h-44 flex-col justify-between text-right text-[10px] tabular-nums text-muted-foreground">{[0, 1, 2, 3, 4].map(index => <span key={index}>{metric(high - (high - low) * index / 4)}</span>)}</div>
        <div className="min-w-0">
          <svg role="img" aria-label={`${name}: monthly ${temperature ? 'temperature in degrees Celsius' : 'rainfall in millimetres'}. Values are listed below.`} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className={`h-44 w-full overflow-visible ${color}`}>
            {[0, 1, 2, 3, 4].map(index => <line key={index} x1="0" x2={width} y1={height * index / 4} y2={height * index / 4} stroke="currentColor" strokeOpacity="0.12" vectorEffect="non-scaling-stroke" />)}
            {temperature && <path d={line} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />}
            {months.map((month, index) => {
              const value = month[kind];
              if (value === null || !Number.isFinite(value)) return null;
              const title = `${month.month}: ${metric(value, temperature ? '°C' : ' mm')}`;
              return temperature ? <circle key={month.month} cx={x(index)} cy={y(value)} r="4" fill="currentColor"><title>{title}</title></circle> : <rect key={month.month} x={x(index) - 14} y={y(value)} width="28" height={height - y(value)} rx="3" fill="currentColor" fillOpacity="0.75"><title>{title}</title></rect>;
            })}
          </svg>
          <div className="mt-2 grid grid-cols-12 text-center text-[10px] text-muted-foreground">{months.map(month => <span key={month.month}>{month.month.slice(0, 3)}</span>)}</div>
        </div>
      </div> : <p className="py-16 text-center text-sm text-muted-foreground">No measurements available.</p>}
    </CardContent>
  </Card>;
}

export function ClimateVisuals({ months, name }: { months: MonthlyClimate[]; name: string }) {
  const maximumRain = Math.max(1, ...months.map(month => month.rain ?? 0));
  return <div>
    <div className="mb-4 grid gap-4 lg:grid-cols-2"><ClimateChart months={months} name={name} kind="temp" /><ClimateChart months={months} name={name} kind="rain" /></div>
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-6 xl:grid-cols-12">{months.map(month => <Card key={month.month} data-climate-month={month.month} className="min-w-0 overflow-hidden border-border/70 px-2 py-3 text-center shadow-none">
      <h3 className="text-xs font-medium text-muted-foreground">{month.month}</h3>
      <p className="mt-2 text-lg font-semibold tabular-nums">{month.temp === null ? '—' : metric(month.temp, '°')}</p>
      <p className="mt-2 flex items-center justify-center gap-1 text-[11px] text-muted-foreground"><CloudRain className="h-3 w-3 shrink-0 text-sky-600" aria-hidden />{month.rain === null ? '—' : metric(month.rain, ' mm')}</p>
      <p className="mt-1 flex items-center justify-center gap-1 text-[11px] text-muted-foreground"><Droplets className="h-3 w-3 shrink-0" aria-hidden />{month.humidity === null ? '—' : metric(month.humidity, '%')}</p>
      <div className="mt-3 h-1 rounded-full bg-muted" aria-hidden><div className="h-full rounded-full bg-sky-500/70" style={{ width: `${Math.max(0, (month.rain ?? 0) / maximumRain * 100)}%` }} /></div>
    </Card>)}</div>
    <p className="mt-3 text-xs text-muted-foreground">Historical monthly averages: temperature, rainfall and relative humidity.</p>
  </div>;
}
