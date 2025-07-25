import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const colorVariants = {
  blue: {
    icon: 'text-blue-500',
    bg: 'bg-blue-50',
    trend: 'text-blue-600'
  },
  green: {
    icon: 'text-green-500',
    bg: 'bg-green-50',
    trend: 'text-green-600'
  },
  red: {
    icon: 'text-red-500',
    bg: 'bg-red-50',
    trend: 'text-red-600'
  },
  purple: {
    icon: 'text-purple-500',
    bg: 'bg-purple-50',
    trend: 'text-purple-600'
  }
};

export default function MetricCard({ title, value, icon: Icon, color, trend, isLoading }) {
  const colors = colorVariants[color] || colorVariants.blue;

  if (isLoading) {
    return (
      <Card className="shadow-lg border-0 bg-white">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-16" />
            </div>
            <Skeleton className="w-12 h-12 rounded-xl" />
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <Skeleton className="h-3 w-20" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-0 bg-white hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-sm font-medium text-gray-600 mb-2">
              {title}
            </CardTitle>
            <div className="text-3xl font-bold text-gray-900">
              {value}
            </div>
          </div>
          <div className={`p-3 rounded-xl ${colors.bg}`}>
            <Icon className={`w-6 h-6 ${colors.icon}`} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className={`text-sm font-medium ${colors.trend}`}>
          {trend}
        </p>
      </CardContent>
    </Card>
  );
}