import React from 'react';
import Pagination from '@mui/material/Pagination';
import PaginationItem from '@mui/material/PaginationItem';
import Stack from '@mui/material/Stack';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

export default function CustomPagination({ totalItems, page, onPageChange }) {
  const itemsPerPage = 10;
  const count = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  // Determine standard start/end counts
  const startCount = totalItems === 0 ? 0 : (page - 1) * itemsPerPage + 1;
  const endCount = Math.min(page * itemsPerPage, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2.5 pb-1 text-[11.5px] text-slate-600 mt-1">
      <span className="text-slate-500 font-medium ml-1">
        Showing {startCount} to {endCount} of {totalItems} entries
      </span>
      <Stack spacing={1} className="mr-1">
        <Pagination
          count={count}
          page={page}
          size="small"
          onChange={onPageChange}
          color="primary"
          shape="rounded"
          renderItem={(item) => (
            <PaginationItem
              slots={{ previous: ArrowBackIcon, next: ArrowForwardIcon }}
              {...item}
              sx={{ minWidth: '26px', height: '26px', fontSize: '11px' }}
            />
          )}
          sx={{
            '& .MuiPaginationItem-root.Mui-selected': {
              backgroundColor: '#1b7f43',
              color: '#fff',
              '&:hover': {
                backgroundColor: '#125d30',
              }
            }
          }}
        />
      </Stack>
    </div>
  );
}
