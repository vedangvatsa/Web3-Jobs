'use client';
import { Printer } from 'lucide-react';
import { buttonStyle } from './ui';
export function NomadPrintButton() { return <button className={`${buttonStyle} print:hidden`} onClick={() => window.print()}><Printer className="h-4 w-4" aria-hidden />Print / save PDF</button>; }
