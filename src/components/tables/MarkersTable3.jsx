'use client';

import { ChevronDown, MapPin } from 'lucide-react';

import * as React from 'react';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Icon } from '@iconify/react';
import { formatDate } from '@/lib/date';
import { useMarkers } from '@/context/MarkerContext';

function StatusChip({ status }) {
  let color;
  switch (status.toLowerCase()) {
    case 'completado':
      color = 'bg-green-600';
      break;
    case 'pendiente':
      color = 'bg-gray-600';
      break;
    case 'asignado':
      color = 'bg-orange-600';
      break;
    default:
      color = 'bg-gray-600';
  }

  return <Badge className={`${color} text-white uppercase px-1.5 py-0 text-[11px] rounded-xl`}>{status}</Badge>;
}

function LocationChip({ location }) {
  return <Badge className="bg-blue-600 text-white uppercase text-right px-1.5 py-0 text-[11px] rounded-xl">{location}</Badge>;
}

const columns = [
  {
    accessorKey: 'id',
    header: 'Id',
    cell: ({ row }) => <p className="rounded-xl px-0 py-0 text-[11px] font-semibold">{row.getValue('id')}</p>,
  },
  {
    accessorKey: 'status',
    header: 'Estado',
    cell: ({ row }) => <StatusChip status={row.getValue('status')} />,
  },
  {
    accessorKey: 'location',
    header: 'Ubicación',
    enableColumnFilter: true,
    cell: ({ row }) => (
      <LocationChip location={row.getValue('location').name} />
    ),
  },
  {
    accessorKey: 'description',
    header: 'Descripción',
    cell: ({ row }) => (
      <div
        className="max-w-[250px] text-wrap font-semibold text-justify line-clamp-3 truncate text-ellipsis text-xs"
        title={row.getValue('description')}
      >
        {row.getValue('description')}
      </div>
    ),
  },
  {
    accessorKey: 'helper_name',
    header: 'Ayudante',
    cell: ({ row }) => (
      <div className="max-w-[150px] truncate" title={row.getValue('helper_name')}>
        {row.getValue('helper_name')}
      </div>
    ),
  },
  {
    accessorKey: 'created_at',
    header: 'Creado',
    cell: ({ row }) => (
      <div className="flex gap-1 items-center font-medium text-xs text-right">
        <Icon
          icon="fluent:hourglass-three-quarter-16-regular"
          style={{ width: 14, height: 14 }}
        />
        {row.getValue('created_at') && formatDate(row.getValue('created_at'))}
      </div>
    ),
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => {
      const { location } = row.original;
      return (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            className="p-0 px-1"
            onClick={() => {
              console.log(`Locate marker at: ${location.latitude}, ${location.longitude}`);
            }}
          >
            <MapPin className="h-4" />
          </Button>
          <Button
            variant="ghost"
            className="p-0 px-1"
          >
            <Icon
              icon="solar:phone-calling-bold"
              style={{ width: 14, height: 14 }}
            />
          </Button>
          <Button
            variant="ghost"
            className="p-0 px-1"
          >
            <Icon
              icon="ic:outline-whatsapp"
              style={{ width: 14, height: 14 }}
            />
          </Button>
        </div>
      );
    },
  },
];

export function DataTableDemo() {
  const { markers } = useMarkers();
  const [sorting, setSorting] = React.useState([]);
  const [columnFilters, setColumnFilters] = React.useState([]);
  const [statusFilter, setStatusFilter] = React.useState('');

  const filteredData = React.useMemo(() => {
    if (!statusFilter) return markers;
    return markers.filter((marker) => marker.status.toLowerCase() === statusFilter.toLowerCase());
  }, [markers, statusFilter]);

  const table = useReactTable({
    data: filteredData,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  });

  return (
    <div className="w-full h-full overflow-auto">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filtrar por ubicación..."
          value={table.getColumn('location')?.getFilterValue() ?? ''}
          onChange={(event) => {
            table.getColumn('location')?.setFilterValue(event.target.value);
          }}
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-4">
              Filtrar por estado
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {['Pendiente', 'Asignado', 'Completado'].map((status) => (
              <DropdownMenuCheckboxItem
                key={status}
                className="capitalize"
                checked={statusFilter === status.toLowerCase()}
                onCheckedChange={(value) => setStatusFilter(value ? status.toLowerCase() : '')}
              >
                {status}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border overflow-y-auto" style={{ maxHeight: '500px' }}>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="uppercase text-[11px]">
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No se encontraron resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
