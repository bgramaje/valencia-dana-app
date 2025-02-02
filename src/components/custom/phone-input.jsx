/* eslint-disable no-use-before-define */
/* eslint-disable react/jsx-pascal-case */
import React, { useState } from 'react';
import { CheckIcon, ChevronsUpDown } from 'lucide-react';
import * as RPNInput from 'react-phone-number-input';
import flags from 'react-phone-number-input/flags';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { ScrollArea } from '../ui/scroll-area';

const PhoneInput = React.forwardRef(
  ({
    className, onChange, value, ...props
  }, ref) => (
    <RPNInput.default
      ref={ref}
      className={cn('flex', className)}
      flagComponent={FlagComponent}
      countrySelectComponent={CountrySelect}
      inputComponent={InputComponent}
      smartCaret={false}
      value={value}
      international
      onChange={(_value) => onChange(_value || '')}
      {...props}
    />
  ),
);
PhoneInput.displayName = 'PhoneInput';

const InputComponent = React.forwardRef(
  ({ className, ...props }, ref) => (
    <Input
      className={cn('rounded-e-lg rounded-s-none', className)}
      {...props}
      ref={ref}
    />
  ),
);
InputComponent.displayName = 'InputComponent';

function CountrySelect({
  disabled, value: selectedCountry, options: countryList, onChange,
}) {
  const [open, setOpen] = useState(false);

  const handleCountrySelect = (country) => {
    onChange(country);
    setOpen(false); // Cierra el popover al seleccionar un país
  };

  return (
    <Popover modal open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="flex gap-1 rounded-e-none rounded-s-lg px-3 border-r-0 focus:z-10"
          disabled={disabled}
          onClick={() => setOpen((prev) => !prev)}
        >
          <FlagComponent country={selectedCountry} countryName={selectedCountry} />
          <ChevronsUpDown
            className={cn('-mr-2 size-4 opacity-50', disabled ? 'hidden' : 'opacity-100')}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[250px] p-0 ml-0"
        align="start"
        side="bottom"
        style={{ zIndex: 1000 }}
      >
        <Command>
          <CommandInput placeholder="Search country..." />
          <CommandList>
            <ScrollArea className="h-72">
              <CommandEmpty>No country found.</CommandEmpty>
              <CommandGroup>
                {countryList.map(({ value, label }) => (value ? (
                  <CountrySelectOption
                    key={value}
                    country={value}
                    countryName={label}
                    selectedCountry={selectedCountry}
                    onChange={handleCountrySelect}
                  />
                ) : null))}
              </CommandGroup>
            </ScrollArea>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function CountrySelectOption({
  country,
  countryName,
  selectedCountry,
  onChange,
}) {
  return (
    <CommandItem className="gap-2" onSelect={() => onChange(country)}>
      <FlagComponent country={country} countryName={countryName} />
      <span className="flex-1 text-sm">{countryName}</span>
      <span className="text-foreground/50 text-sm">{`+${RPNInput.getCountryCallingCode(country)}`}</span>
      <CheckIcon
        className={`ml-auto size-4 ${country === selectedCountry ? 'opacity-100' : 'opacity-0'}`}
      />
    </CommandItem>
  );
}

function FlagComponent({ country, countryName }) {
  const Flag = flags[country];

  return (
    <span className="flex items-center w-5 h-4 justify-center p-0 overflow-hidden rounded-sm">
      {Flag && <Flag className="rounded-md" title={countryName} />}
    </span>
  );
}

export { PhoneInput };
