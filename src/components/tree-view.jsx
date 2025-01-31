/* eslint-disable consistent-return */
/* eslint-disable no-param-reassign */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable max-len */

'use client';

import React from 'react';
import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { ChevronRight } from 'lucide-react';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const treeVariants = cva(
  'group hover:before:opacity-100 before:absolute before:rounded-lg before:left-0 px-0.5 py-1 before:w-full before:opacity-0 before:bg-accent/70 before:h-[2rem] before:-z-10',
);

const selectedTreeVariants = cva('before:opacity-100 before:bg-accent/70 text-accent-foreground');

const TreeView = React.forwardRef((
  {
    data,
    initialSelectedItemId,
    onSelectChange,
    expandAll,
    defaultLeafIcon,
    defaultNodeIcon,
    className,
    ...props
  },
  ref,
) => {
  const [selectedItemId, setSelectedItemId] = React.useState(initialSelectedItemId);

  const handleSelectChange = React.useCallback((item) => {
    setSelectedItemId(item?.id);
    if (onSelectChange) {
      onSelectChange(item);
    }
  }, [onSelectChange]);

  const expandedItemIds = React.useMemo(() => {
    if (!initialSelectedItemId) {
      return [];
    }

    const ids = [];

    function walkTreeItems(
      items,
      targetId,
    ) {
      if (items instanceof Array) {
        for (let i = 0; i < items.length; i += 1) {
          ids.push(items[i].id);
          if (walkTreeItems(items[i], targetId) && !expandAll) {
            return true;
          }
          if (!expandAll) ids.pop();
        }
      } else if (!expandAll && items.id === targetId) {
        return true;
      } else if (items.children) {
        return walkTreeItems(items.children, targetId);
      }
    }

    walkTreeItems(data, initialSelectedItemId);
    return ids;
  }, [data, expandAll, initialSelectedItemId]);

  return (
    (
      <div className={cn('overflow-hidden relative p-2', className)}>
        <TreeItem
          data={data}
          ref={ref}
          selectedItemId={selectedItemId}
          handleSelectChange={handleSelectChange}
          expandedItemIds={expandedItemIds}
          defaultLeafIcon={defaultLeafIcon}
          defaultNodeIcon={defaultNodeIcon}
          {...props}
        />
      </div>
    )
  );
});
TreeView.displayName = 'TreeView';

const TreeItem = React.forwardRef((
  {
    className,
    data,
    selectedItemId,
    handleSelectChange,
    expandedItemIds,
    defaultNodeIcon,
    defaultLeafIcon,
    ...props
  },
  ref,
) => {
  if (!(data instanceof Array)) {
    data = [data];
  }
  return (
    (
      <div ref={ref} role="tree" className={className} {...props}>
        <ul>
          {data.map((item) => (
            <li key={item.id}>
              {item.children ? (
                <TreeNode
                  item={item}
                  selectedItemId={selectedItemId}
                  expandedItemIds={expandedItemIds}
                  handleSelectChange={handleSelectChange}
                  defaultNodeIcon={defaultNodeIcon}
                  defaultLeafIcon={defaultLeafIcon}
                />
              ) : (
                <TreeLeaf
                  item={item}
                  selectedItemId={selectedItemId}
                  handleSelectChange={handleSelectChange}
                  defaultLeafIcon={defaultLeafIcon}
                />
              )}
            </li>
          ))}
        </ul>
      </div>
    )
  );
});
TreeItem.displayName = 'TreeItem';

function TreeNode({
  item,
  handleSelectChange,
  expandedItemIds,
  selectedItemId,
  defaultNodeIcon,
  defaultLeafIcon,
}) {
  const [value, setValue] = React.useState(expandedItemIds.includes(item.id) ? [item.id] : []);
  return (
    (
      <AccordionPrimitive.Root
        type="multiple"
        value={value}
        onValueChange={(s) => setValue(s)}
      >
        <AccordionPrimitive.Item value={item.id}>
          <AccordionTrigger
            className={cn(treeVariants(), selectedItemId === item.id && selectedTreeVariants(), 'hover:bg-accent/50')}
            onClick={() => {
              handleSelectChange(item);
              item.onClick?.();
            }}
          >
            <TreeIcon
              item={item}
              isSelected={selectedItemId === item.id}
              isOpen={value.includes(item.id)}
              default={defaultNodeIcon}
            />
            {item.labelRender ? item.labelRender(item) : (
              <span className="flex-grow text-sm truncate">{item.name}</span>
            )}
            <TreeActions isSelected={selectedItemId === item.id}>
              {item.actions}
            </TreeActions>
          </AccordionTrigger>
          <AccordionContent
            className="ml-2.5 pl-0.5 border-l"
          >
            <TreeItem
              data={item.children ? item.children : item}
              selectedItemId={selectedItemId}
              handleSelectChange={handleSelectChange}
              expandedItemIds={expandedItemIds}
              defaultLeafIcon={defaultLeafIcon}
              defaultNodeIcon={defaultNodeIcon}
            />
          </AccordionContent>
        </AccordionPrimitive.Item>
      </AccordionPrimitive.Root>
    )
  );
}

const TreeLeaf = React.forwardRef((
  {
    className,
    item,
    selectedItemId,
    handleSelectChange,
    defaultLeafIcon,
    ...props
  },
  ref,
) => (
  (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div
      ref={ref}
      className={cn(
        'ml-2 flex text-left items-center py-2 cursor-pointer before:right-1',
        treeVariants(),
        className,
        selectedItemId === item.id && selectedTreeVariants(),
        'hover:bg-accent/50 rounded-md',
      )}
      onClick={() => {
        handleSelectChange(item);
        item.onClick?.();
      }}
      {...props}
    >
      <TreeIcon
        item={item}
        isSelected={selectedItemId === item.id}
        default={defaultLeafIcon}
      />
      {item.labelRender ? item.labelRender(item) : (
        <span className="flex-grow text-sm truncate">{item.name}</span>
      )}

      <TreeActions isSelected={selectedItemId === item.id}>
        {item.actions}
      </TreeActions>
    </div>
  )
));
TreeLeaf.displayName = 'TreeLeaf';

const AccordionTrigger = React.forwardRef(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header>
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        'flex flex-1 w-full items-center py-2 transition-all first:[&[data-state=open]>svg]:rotate-90',
        className,
      )}
      {...props}
    >
      <ChevronRight
        className="h-4 w-4 shrink-0 transition-transform duration-200 text-accent-foreground/50 mr-1"
      />
      {children}
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
));
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

const AccordionContent = React.forwardRef(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className={cn(
      'overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down',
      className,
    )}
    {...props}
  >
    <div className="pb-1 pt-0">{children}</div>
  </AccordionPrimitive.Content>
));
AccordionContent.displayName = AccordionPrimitive.Content.displayName;

function TreeIcon({
  item,
  isOpen,
  isSelected,
  default: defaultIcon,
}) {
  let Icon = defaultIcon;
  if (isSelected && item.selectedIcon) {
    Icon = item.selectedIcon;
  } else if (isOpen && item.openIcon) {
    Icon = item.openIcon;
  } else if (item.icon) {
    Icon = item.icon;
  }
  return Icon ? (
    React.cloneElement(Icon, {
      props: {
        className: 'h-4 w-4 shrink-0 mr-2',
      },
    })
  ) : null;
}

function TreeActions({
  children,
  isSelected,
}) {
  return (
    (
      <div
        className={cn(isSelected ? 'block' : 'hidden', 'absolute right-3 group-hover:block')}
      >
        {children}
      </div>
    )
  );
}

export { TreeView };
