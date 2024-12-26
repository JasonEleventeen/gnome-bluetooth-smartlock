import {ExtensionPreferences} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';
import GLib from 'gi://GLib';
import Gio from 'gi://Gio';
import Gtk from 'gi://Gtk';
import {gettext as _} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

import Settings from './settings.js';

export default class BluetoothSmartLockPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        const settings = new SettingsBuilder(this.metadata);
        const widget = settings.build();
        window.add(widget);
    }
}

class SettingsBuilder {
    constructor(metadata) {
        this._settings = new Settings()._settings;
        this._builder = new Gtk.Builder();
        this._metadata = metadata;
    }

    build() {
        this._builder.add_from_file(GLib.build_filenamev([this._metadata.path, 'settings.ui']));
        this._container = this._builder.get_object('container');
        this._builder.get_object('advanced_button').connect('clicked', () => {
            let dialog = new Gtk.Dialog({
                title: _('Advanced Settings'),
                transient_for: this._container.get_ancestor(Gtk.Window),
                use_header_bar: true,
                modal: true,
            });
            let box = this._builder.get_object('advanced_settings');
            dialog.get_content_area().append(box);

            dialog.connect('response', () => {
                dialog.get_content_area().remove(box);
                dialog.destroy();
            });
            dialog.show();
        });

        this._settings.bind('active', this._builder.get_object('active_switch'), 'active', Gio.SettingsBindFlags.DEFAULT);
        this._settings.bind('indicator', this._builder.get_object('hide_indicator_switch'), 'active', Gio.SettingsBindFlags.DEFAULT);
        this._settings.bind('interval', this._builder.get_object('scan_interval'), 'value', Gio.SettingsBindFlags.DEFAULT);
        this._settings.bind('duration-in-seconds', this._builder.get_object('duration'), 'value', Gio.SettingsBindFlags.DEFAULT);

        return this._container;
    }
}
