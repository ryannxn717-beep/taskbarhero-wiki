export interface ShellSnapshot {
  menuOpen: boolean;
  announcementVisible: boolean;
}

export function createShellState(initial?: Partial<ShellSnapshot>) {
  let state: ShellSnapshot = {
    menuOpen: initial?.menuOpen ?? false,
    announcementVisible: initial?.announcementVisible ?? true
  };

  return {
    snapshot: () => ({ ...state }),
    openMenu: () => {
      state = { ...state, menuOpen: true };
    },
    closeMenu: () => {
      state = { ...state, menuOpen: false };
    },
    dismissAnnouncement: () => {
      state = { ...state, announcementVisible: false };
    }
  };
}
