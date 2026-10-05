import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';

/**
 * Reusable card for displaying dashboard statistics in compact high-density mode.
 */
export default function StatSummaryCard({ title, value, icon }) {
  return (
    <Card className="shadow-xs rounded-xl border border-gray-100/80 hover:shadow-md transition-shadow duration-200">
      <CardContent className="flex items-center p-3 sm:p-3.5 !pb-3 sm:!pb-3.5">
        {icon && (
          <div className="mr-3 text-blue-600 bg-blue-50/80 p-2 rounded-lg flex items-center justify-center shrink-0">
            {icon}
          </div>
        )}
        <div className="min-w-0">
          <Typography variant="subtitle2" className="text-gray-500 uppercase font-semibold text-[10.5px] tracking-wider truncate">
            {title || "Stat Card"}
          </Typography>
          <Typography variant="h5" className="font-bold text-gray-800 text-lg sm:text-xl mt-0.5 leading-tight">
            {value || "0"}
          </Typography>
        </div>
      </CardContent>
    </Card>
  );
}
