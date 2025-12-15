import { Card, CardContent } from '../ui/card';
import {CircularProgress} from '../shared/CircularProgress';

export const StatCard = ({ title, subtitle, percentage, color }) => {
    return (
      <Card className="overflow-hidden dark:bg-blue-900 hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex flex-col items-center text-center space-y-4">
  
            {/* Circular Progress */}
            <CircularProgress percentage={percentage} size={100} strokeWidth={8} color={color} />
  
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-muted-foreground dark:text-blue-200">{title}</h3>
              {subtitle && (
                <p className="text-sm font-medium dark:text-white text-blue-500">{subtitle}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  