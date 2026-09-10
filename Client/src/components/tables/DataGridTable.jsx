
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

/**
 * A generic reusable Table wrapper using MUI's standard Table components.
 * Later, this can be swapped with @mui/x-data-grid for advanced data tables.
 */
export default function DataGridTable({ columns, data }) {
  if (!columns || !data) {
    return (
      <Paper className="w-full bg-white shadow-sm rounded-lg p-6 text-center text-gray-500">
        No data available to display.
      </Paper>
    );
  }

  return (
    <TableContainer component={Paper} className="shadow-sm border border-gray-200 rounded-lg overflow-hidden">
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead className="bg-gray-50 border-b border-gray-200">
          <TableRow>
            {columns.map((col, index) => (
              <TableCell key={index} className="font-bold text-gray-700">
                {col.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, rowIndex) => (
            <TableRow key={rowIndex} className="hover:bg-gray-50 transition-colors duration-150">
              {columns.map((col, colIndex) => (
                <TableCell key={colIndex} className="text-gray-600">
                  {row[col.field]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
