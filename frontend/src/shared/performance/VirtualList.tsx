/** VirtualList - Virtual scrolling for large lists */
import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';
export const VirtualList = ({ items }: { items: any[] }) => {
  const parentRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({ count: items.length, getScrollElement: () => parentRef.current, estimateSize: () => 50 });
  return (<div ref={parentRef} className="h-96 overflow-auto">{virtualizer.getVirtualItems().map(item => (<div key={item.index} className="p-2 border-b">{items[item.index]?.name}</div>))}</div>);
};

