import { GridItem } from 'src/shared/types/dashboard';
import { onBeforeUnmount, onMounted, Ref, ref } from 'vue';

export function useDashNDrop(layout: Ref<GridItem[]>, colNum: number) {
  const mouseXY = { x: 0, y: 0, offsetX: 0, offsetY: 0 };
  const DragPos: GridItem = { x: 0, y: 0, w: 1, h: 1, i: '' };
  const layoutRef = ref<any>();
  const itemRefs = ref<any[]>([]);
  const applyRef = (idx: number) => (r: any) => (itemRefs.value[idx] = r);
  const onDragOver = () => {
    document.addEventListener(
      'dragover',
      function (e: DragEvent) {
        mouseXY.x = e.clientX;
        mouseXY.y = e.clientY;
      },
      false
    );
  };
  onMounted(() => document.addEventListener('dragover', onDragOver));
  onBeforeUnmount(() => document.removeEventListener('dragover', onDragOver));
  const dragStart = function (e: DragEvent) {
    console.log(e);
    const target = e.target as HTMLElement;
    if (!target) return;
    mouseXY.offsetX = e.offsetX;
    mouseXY.offsetY = e.offsetY;
  };
  const drag = function (e: DragEvent) {
    const parentRect =
      layoutRef.value?.$el?.parentElement?.getBoundingClientRect();
    let mouseInGrid = false;
    if (
      mouseXY.x > parentRect.left &&
      mouseXY.x < parentRect.right &&
      mouseXY.y > parentRect.top &&
      mouseXY.y < parentRect.bottom
    ) {
      mouseInGrid = true;
    }
    const dataset = {
      w: +((e.target as HTMLElement | null)?.dataset.width || 1),
      h: +((e.target as HTMLElement | null)?.dataset.height || 1),
    };

    let index = layout.value.findIndex((item) => item.i === 'drop');
    if (mouseInGrid && index === -1) {
      layout.value.push({
        x: (layout.value.length * 2) % (colNum || 12),
        y: layout.value.length + (colNum || 12), // puts it at the bottom
        w: dataset.w,
        h: dataset.h,
        i: 'drop',
      });
      index = layout.value.length;
    }
    if (index !== -1 && itemRefs.value[index]) {
      try {
        itemRefs.value[layout.value.length].$refs.item.style.display = 'none';
      } catch {}
      const el = itemRefs.value[index];
      if (!el?.calcXY) debugger;
      if (!el?.calcXY) return;
      el.dragging = {
        top: mouseXY.y - parentRect.top - mouseXY.offsetY,
        left: mouseXY.x - parentRect.left - mouseXY.offsetX,
      };
      console.log(`dragging: ${el.dragging.top}, ${el.dragging.left}`);
      const new_pos = el.calcXY(
        mouseXY.y - parentRect.top - mouseXY.offsetY,
        mouseXY.x - parentRect.left - mouseXY.offsetX
      );
      console.log(`drag pos: ${new_pos.x}, ${new_pos.y}`);
      if (mouseInGrid) {
        layoutRef.value.dragEvent([
          'dragstart',
          'drop',
          new_pos.x,
          new_pos.y,
          dataset.h,
          dataset.w,
        ]);
        DragPos.i = String(index);
        DragPos.x = layout.value[index].x;
        DragPos.y = layout.value[index].y;
      }
      if (!mouseInGrid) {
        layoutRef.value.dragEvent([
          'dragend',
          'drop',
          new_pos.x,
          new_pos.y,
          dataset.h,
          dataset.w,
        ]);
        layout.value = layout.value.filter((obj) => obj.i !== 'drop');
      }
    }
  };

  const dragEnd = function (e: DragEvent) {
    const parentRect = layoutRef.value?.$el?.getBoundingClientRect();
    let mouseInGrid = false;
    if (
      mouseXY.x > parentRect.left &&
      mouseXY.x < parentRect.right &&
      mouseXY.y > parentRect.top &&
      mouseXY.y < parentRect.bottom
    ) {
      mouseInGrid = true;
    }
    if (mouseInGrid) {
      console.log(
        `Dropped element props:\n${JSON.stringify(
          DragPos,
          ['x', 'y', 'w', 'h'],
          2
        )}`
      );
      const dataset = {
        w: +((e.target as HTMLElement | null)?.dataset.width || 1),
        h: +((e.target as HTMLElement | null)?.dataset.height || 1),
      };
      layoutRef.value.dragEvent(
        'dragend',
        'drop',
        DragPos.x,
        DragPos.y,
        dataset.h,
        dataset.w
      );
      const current = layout.value.find((obj) => obj.i === 'drop');
      current && (current.i = DragPos.i);
      try {
        itemRefs.value[layout.value.length].$refs.item.style.display = 'block';
      } catch {}
    }
  };

  return { layoutRef, drag, dragEnd, dragStart, applyRef };
}
