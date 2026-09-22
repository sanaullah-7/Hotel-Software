import React from 'react';
import DataGridTable from '../../../../components/tables/DataGridTable';

export default function StaffTable({ columns, data, selected, onSelectionChange }) {
  return (
    <DataGridTable
      columns={columns}
      data={data}
      selectable
      flat
      selected={selected}
      onSelectionChange={onSelectionChange}
      noHorizontalScroll
      checkboxHeaderSx={{ pl: '8px !important', pr: '8px !important', width: '48px !important', minWidth: '48px !important', maxWidth: '48px !important' }}
      checkboxCellSx={{ pl: '8px !important', pr: '8px !important', width: '48px !important', minWidth: '48px !important', maxWidth: '48px !important' }}
    />
  );
}
