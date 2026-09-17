
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Checkbox, TablePagination } from '@mui/material';

/**
 * A generic reusable Table wrapper using MUI's standard Table components.
 * Later, this can be swapped with @mui/x-data-grid for advanced data tables.
 */
export default function DataGridTable({ 
  columns, 
  data, 
  selectable = false, 
  flat = false, 
  selected = null, 
  onSelectionChange = null,
  noHorizontalScroll = false,
  minWidth = 650,
  tableSx = {},
  containerSx = {}
}) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [internalSelected, setInternalSelected] = useState([]);

  const actualSelected = selected !== null ? selected : internalSelected;

  const setActualSelected = (newSelected) => {
    if (onSelectionChange) onSelectionChange(newSelected);
    if (selected === null) setInternalSelected(newSelected);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = data.map((n) => n.id || n.empId || Math.random());
      setActualSelected(newSelected);
      return;
    }
    setActualSelected([]);
  };

  const handleClick = (event, id) => {
    const selectedIndex = actualSelected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(actualSelected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(actualSelected.slice(1));
    } else if (selectedIndex === actualSelected.length - 1) {
      newSelected = newSelected.concat(actualSelected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        actualSelected.slice(0, selectedIndex),
        actualSelected.slice(selectedIndex + 1),
      );
    }
    setActualSelected(newSelected);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const isSelected = (id) => actualSelected.indexOf(id) !== -1;

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - data.length) : 0;
  
  const visibleRows = data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  if (!columns || !data) {
    return (
      <Paper className={`w-full bg-white rounded-lg p-6 text-center text-gray-500 ${flat ? '' : 'shadow-sm'}`}>
        No data available to display.
      </Paper>
    );
  }

  return (
    <TableContainer 
      component={flat ? 'div' : Paper} 
      className={`${flat ? '' : 'shadow-sm border border-gray-200'} rounded-lg ${noHorizontalScroll ? 'overflow-x-hidden' : 'overflow-x-auto'}`}
      sx={{
        ...(noHorizontalScroll ? { overflowX: 'hidden', maxWidth: '100%' } : {}),
        ...containerSx
      }}
    >
      <Table 
        sx={{ 
          minWidth: noHorizontalScroll ? '100%' : minWidth, 
          width: '100%',
          ...(noHorizontalScroll ? { tableLayout: 'auto' } : {}),
          ...tableSx 
        }} 
        size="small" 
        aria-label="simple table"
      >
        <TableHead className={`${flat ? 'bg-white border-b border-gray-100' : 'bg-gray-50 border-b border-gray-200'}`}>
          <TableRow>
            {selectable && (
              <TableCell padding="checkbox" sx={{ pl: flat ? '8px' : undefined }}>
                <Checkbox
                  color="primary"
                  indeterminate={actualSelected.length > 0 && actualSelected.length < data.length}
                  checked={data.length > 0 && actualSelected.length === data.length}
                  onChange={handleSelectAllClick}
                  inputProps={{ 'aria-label': 'select all items' }}
                  sx={{
                    color: flat ? '#d1d5db' : undefined,
                    '&.Mui-checked': { color: flat ? '#1f2937' : undefined }
                  }}
                />
              </TableCell>
            )}
            {columns.map((col, index) => (
              <TableCell key={index} className="font-bold text-gray-700" sx={col.headerSx || col.sx}>
                {col.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {visibleRows.map((row, rowIndex) => {
            const id = row.id || row.empId || rowIndex;
            const isItemSelected = isSelected(id);
            return (
              <TableRow 
                key={id} 
                className="hover:bg-gray-50 transition-colors duration-150"
                role="checkbox"
                aria-checked={isItemSelected}
                tabIndex={-1}
                selected={isItemSelected}
              >
                {selectable && (
                  <TableCell padding="checkbox" sx={{ pl: flat ? '8px' : undefined }}>
                    <Checkbox
                      color="primary"
                      checked={isItemSelected}
                      onChange={(event) => handleClick(event, id)}
                    />
                  </TableCell>
                )}
                {columns.map((col, colIndex) => (
                  <TableCell key={colIndex} className="text-gray-600" sx={col.cellSx || col.sx}>
                    {col.render ? col.render(row) : row[col.field]}
                  </TableCell>
                ))}
              </TableRow>
            );
          })}
          {emptyRows > 0 && (
            <TableRow style={{ height: 53 * emptyRows }}>
              <TableCell colSpan={selectable ? columns.length + 1 : columns.length} />
            </TableRow>
          )}
        </TableBody>
      </Table>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={data.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </TableContainer>
  );
}
