'use client';

import { Children, isValidElement, type ReactNode, type ComponentPropsWithoutRef } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { cn } from '@/lib/utils';

const EMPTY = '__empty_filter__';
type Option = { value?: string | number; children?: ReactNode; disabled?: boolean };

function textContent(children: ReactNode): string {
  return Children.toArray(children).map(child => typeof child === 'string' || typeof child === 'number' ? String(child) : isValidElement<{ children?: ReactNode }>(child) ? textContent(child.props.children) : '').join('');
}

export function FilterSelect({ value, onValueChange, children, className, ...props }: Omit<ComponentPropsWithoutRef<typeof SelectTrigger>, 'value' | 'children' | 'onChange'> & {
  value: string | number;
  onValueChange: (value: string) => void;
  children: ReactNode;
}) {
  const options = Children.toArray(children).filter(isValidElement<Option>).map(option => ({
    value: String(option.props.value ?? textContent(option.props.children)),
    label: textContent(option.props.children),
    disabled: option.props.disabled,
  }));
  return <Select value={String(value) || EMPTY} onValueChange={next => onValueChange(next === EMPTY ? '' : next)} disabled={props.disabled}>
    <SelectTrigger {...props} data-value={String(value)} className={cn('h-11 min-h-11 min-w-0 text-base text-foreground shadow-none md:text-sm [&>span]:truncate [&>svg]:shrink-0', className)}>
      <SelectValue>{options.find(option => option.value === String(value))?.label || 'Choose an option'}</SelectValue>
    </SelectTrigger>
    <SelectContent className="max-w-[calc(100vw-2rem)]">
      {options.map(option => <SelectItem key={option.value} value={option.value || EMPTY} data-value={option.value} disabled={option.disabled} className="min-h-11 cursor-pointer" textValue={option.label}>{option.label}</SelectItem>)}
    </SelectContent>
  </Select>;
}
