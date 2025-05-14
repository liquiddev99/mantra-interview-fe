import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import { FaCheck, FaChevronDown } from "react-icons/fa6";
import clsx from "clsx";
import { Dispatch, SetStateAction } from "react";

interface SelectOptionsProps {
  name: string;
  options: string[];
  selected: string;
  setSelected: Dispatch<SetStateAction<string>>;
}

export default function SelectOptions({
  name,
  options,
  selected,
  setSelected,
}: SelectOptionsProps) {
  return (
    <div className="w-48 md:w-36">
      <div className="mb-1.5 text-m">{name}:</div>
      <Listbox value={selected} onChange={setSelected}>
        <ListboxButton
          className={clsx(
            "relative block w-full rounded-lg bg-slate-800 py-1.5 pr-8 pl-3 text-left text-sm/6 text-white cursor-pointer",
            "focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25",
          )}
        >
          {selected}
          <FaChevronDown
            className="group pointer-events-none absolute top-2.5 right-2.5 size-4 fill-white/60"
            aria-hidden="true"
          />
        </ListboxButton>
        <ListboxOptions
          anchor="bottom"
          className={clsx(
            "w-[var(--button-width)] !max-h-72 rounded-xl border border-white/5 bg-slate-800 p-1 [--anchor-gap:var(--spacing-1)] focus:outline-none",
            "transition duration-100 ease-in data-[leave]:data-[closed]:opacity-0",
          )}
        >
          {options.map((option) => (
            <ListboxOption
              key={option}
              value={option}
              className="group flex cursor-pointer items-center gap-2 rounded-lg py-1.5 px-3 select-none data-[focus]:bg-white/10"
            >
              <FaCheck className="invisible size-4 fill-white group-data-[selected]:visible" />
              <div className="text-sm/6 text-white">{option}</div>
            </ListboxOption>
          ))}
        </ListboxOptions>
      </Listbox>
    </div>
  );
}
