import Clutter from 'gi://Clutter';
import St from 'gi://St';
import GObject from 'gi://GObject';

import * as Config from 'resource:///org/gnome/shell/misc/config.js';
import * as ModalDialog from 'resource:///org/gnome/shell/ui/modalDialog.js';

let _openDialog;

// St.BoxLayout's `vertical` property was deprecated in GNOME Shell 48 in favor of
// `orientation` and removed entirely in GNOME Shell 51.
const SHELL_VERSION = parseInt(Config.PACKAGE_VERSION.split('.')[0]);
function boxLayoutOrientation(vertical) {
  return SHELL_VERSION >= 48
    ? {
        orientation: vertical
          ? Clutter.Orientation.VERTICAL
          : Clutter.Orientation.HORIZONTAL,
      }
    : { vertical };
}

export function openConfirmDialog(
  title,
  message,
  sub_message,
  ok_label,
  cancel_label,
  callback,
) {
  if (!_openDialog) {
    _openDialog = new ConfirmDialog(
      title,
      message + '\n' + sub_message,
      ok_label,
      cancel_label,
      callback,
    ).open();
  }
}

const ConfirmDialog = GObject.registerClass(
  class ConfirmDialog extends ModalDialog.ModalDialog {
    _init(title, desc, ok_label, cancel_label, callback) {
      super._init();

      let main_box = new St.BoxLayout({
        ...boxLayoutOrientation(false),
      });
      this.contentLayout.add_child(main_box);

      let message_box = new St.BoxLayout({
        ...boxLayoutOrientation(true),
      });
      main_box.add_child(message_box);

      let subject_label = new St.Label({
        style: 'font-weight: bold',
        x_align: Clutter.ActorAlign.CENTER,
        text: title,
      });
      message_box.add_child(subject_label);

      let desc_label = new St.Label({
        style: 'padding-top: 12px',
        x_align: Clutter.ActorAlign.CENTER,
        text: desc,
      });
      message_box.add_child(desc_label);

      this.setButtons([
        {
          label: cancel_label,
          action: () => {
            this.close();
            _openDialog = null;
          },
          key: Clutter.Escape,
        },
        {
          label: ok_label,
          action: () => {
            this.close();
            callback();
            _openDialog = null;
          },
        },
      ]);
    }
  },
);
