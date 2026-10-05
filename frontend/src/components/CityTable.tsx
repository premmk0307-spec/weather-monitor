import { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  SortingState,
} from "@tanstack/react-table";

export interface CityReading {
  key: string;
  name: string;
  temperature: number;
  windSpeed: number;
  aqi: number;
}

function aqiClass(aqi: number) {
  if (aqi <= 50) return "aqi-good";
  if (aqi <= 100) return "aqi-moderate";
  return "aqi-poor";
}

const columnHelper = createColumnHelper<CityReading>();

export default function CityTable({
  cities,
  onSelect,
}: {
  cities: CityReading[];
  onSelect: (key: string) => void;
}) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = useMemo(
    () => [
      columnHelper.accessor("name", { header: "City" }),
      columnHelper.accessor("temperature", {
        header: "Temp (°C)",
        cell: (info) => info.getValue()?.toFixed(1),
      }),
      columnHelper.accessor("windSpeed", {
        header: "Wind (km/h)",
        cell: (info) => info.getValue()?.toFixed(1),
      }),
      columnHelper.accessor("aqi", {
        header: "AQI (US)",
        cell: (info) => (
          <span className={aqiClass(info.getValue())}>{info.getValue()}</span>
        ),
      }),
    ],
    []
  );

  const table = useReactTable({
    data: cities,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <table>
      <thead>
        {table.getHeaderGroups().map((hg) => (
          <tr key={hg.id}>
            {hg.headers.map((h) => (
              <th key={h.id} onClick={h.column.getToggleSortingHandler()}>
                {flexRender(h.column.columnDef.header, h.getContext())}
                {{ asc: " ↑", desc: " ↓" }[h.column.getIsSorted() as string] ?? ""}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody>
        {table.getRowModel().rows.map((row) => (
          <tr key={row.id} onClick={() => onSelect(row.original.key)}>
            {row.getVisibleCells().map((cell) => (
              <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
