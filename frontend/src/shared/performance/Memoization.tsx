/** Memoization - Proper memoization patterns */
import { memo, useMemo, useCallback } from 'react';
export const MemoizedComponent = memo(({ data }: { data: any }) => {
  const processed = useMemo(() => data.map((d: any) => d * 2), [data]);
  const handleClick = useCallback(() => console.log(processed), [processed]);
  return <div onClick={handleClick}>Data: {processed.length}</div>;
});

