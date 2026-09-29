import React from 'react';
import Pagination from '@mui/material/Pagination';
import PaginationItem from '@mui/material/PaginationItem';
import Stack from '@mui/material/Stack';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

export default function CustomPagination({ count, page, onChange }) {
  return (
    <Stack spacing={2} className="py-4 flex items-center justify-center">
      <Pagination
        count={count}
        page={page}
        onChange={onChange}
        renderItem={(item) => (
          <PaginationItem
            slots={{ previous: ArrowBackIcon, next: ArrowForwardIcon }}
            {...item}
            sx={{
              '&.Mui-selected': {
                backgroundColor: '#1b7f43',
                color: '#fff',
                '&:hover': {
                  backgroundColor: '#125d30',
                }
              }
            }}
          />
        )}
      />
    </Stack>
  );
}
