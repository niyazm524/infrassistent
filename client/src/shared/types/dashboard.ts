export type GridItem = {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;

  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
  preserveAspectRatio?: boolean;
};

export type WidgetItem = {
  widget: string;
  props?: any;
  gridSettings?: Pick<GridItem, 'minW' | 'minH' | 'maxW' | 'maxH'>;
};

export type GridWidgetItem = Exclude<WidgetItem, 'gridSettings'> & GridItem;
