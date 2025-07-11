import GLib from 'gi://GLib';
import Gio from 'gi://Gio';
import Gtk from 'gi://Gtk?version=3.0';
const { gettext: _ } = imports.gettext;

import Settings from './settings.js';

let metadata;

export function init(_metadata) {
    metadata = _metadata;
}

export function buildPrefsWidget() {
    const settings = new Settings()._settings;
    const builder = new Gtk.Builder();
    builder.add_from_file(GLib.build_filenamev([metadata.path, 'settings.ui']));
    const container = builder.get_object('container');

    builder.get_object('advanced_button').connect('clicked', () => {
        const dialog = new Gtk.Dialog({
            title: _('Advanced Settings'),
            transient_for: container.get_ancestor(Gtk.Window),
            use_header_bar: true,
            modal: true,
        });

        const box = builder.get_object('advanced_settings');
        dialog.get_content_area().append(box);

        dialog.connect('response', () => {
            dialog.get_content_area().remove(box);
            dialog.destroy();
        });

        dialog.show();
    });

    settings.bind('active', builder.get_object('active_switch'), 'active', Gio.SettingsBindFlags.DEFAULT);
    settings.bind('indicator', builder.get_object('hide_indicator_switch'), 'active', Gio.SettingsBindFlags.DEFAULT);
    settings.bind('interval', builder.get_object('scan_interval'), 'value', Gio.SettingsBindFlags.DEFAULT);
    settings.bind('duration-in-seconds', builder.get_object('duration'), 'value', Gio.SettingsBindFlags.DEFAULT);

    return container;
}
