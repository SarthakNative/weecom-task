import React from 'react';
import { Skeleton } from '../ui/skeleton';

const ProductTableSkeleton = () => {
  return (
    <div className="space-y-4">
      {/* Table Header Skeleton */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 px-4">
                <Skeleton className="h-4 w-16" />
              </th>
              <th className="text-left py-2 px-4">
                <Skeleton className="h-4 w-12" />
              </th>
              <th className="text-left py-2 px-4">
                <Skeleton className="h-4 w-16" />
              </th>
              <th className="text-left py-2 px-4">
                <Skeleton className="h-4 w-12" />
              </th>
              <th className="text-left py-2 px-4">
                <Skeleton className="h-4 w-16" />
              </th>
            </tr>
          </thead>
          <tbody>
            {/* Generate 5 skeleton rows */}
            {Array.from({ length: 5 }).map((_, index) => (
              <tr key={index} className="border-b">
                <td className="py-2 px-4">
                  <Skeleton className="h-4 w-32" />
                </td>
                <td className="py-2 px-4">
                  <Skeleton className="h-4 w-16" />
                </td>
                <td className="py-2 px-4">
                  <Skeleton className="h-4 w-20" />
                </td>
                <td className="py-2 px-4">
                  <Skeleton className="h-4 w-12" />
                </td>
                <td className="py-2 px-4">
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-12" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination Skeleton */}
      <div className="flex justify-between items-center mt-4">
        <Skeleton className="h-4 w-48" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-16" />
        </div>
      </div>
    </div>
  );
};

export default ProductTableSkeleton;