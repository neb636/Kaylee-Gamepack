import { create } from "zustand";

/** Tabs with unsaved edits (file tabs): the tab shows a dot, and closing it asks first. Not persisted. */
export const useDirtyViews = create<Record<string, boolean>>(() => ({}));

export function setViewDirty(viewId: string, dirty: boolean): void {
  if (Boolean(useDirtyViews.getState()[viewId]) === dirty) return;
  useDirtyViews.setState({ [viewId]: dirty });
}

export function isViewDirty(viewId: string): boolean {
  return Boolean(useDirtyViews.getState()[viewId]);
}
