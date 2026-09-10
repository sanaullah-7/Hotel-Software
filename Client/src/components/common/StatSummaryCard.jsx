
import { Card, CardContent, Typography } from '@mui/material';

/**
 * Reusable card for displaying dashboard statistics.
 * Uses Material UI's Card and Typography along with Tailwind for layout.
 */
export default function StatSummaryCard({ title, value, icon }) {
  return (
    <Card className="shadow-md rounded-xl border border-gray-100 hover:shadow-lg transition-shadow duration-300">
      <CardContent className="flex items-center p-6">
        {icon && (
          <div className="mr-4 text-blue-600 bg-blue-50 p-3 rounded-full flex items-center justify-center">
            {icon}
          </div>
        )}
        <div>
          <Typography variant="subtitle2" className="text-gray-500 uppercase font-semibold text-xs tracking-wider">
            {title || "Stat Card"}
          </Typography>
          <Typography variant="h4" className="font-bold text-gray-800 mt-1">
            {value || "0"}
          </Typography>
        </div>
      </CardContent>
    </Card>
  );
}
