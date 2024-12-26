import Gio from 'gi://Gio';

import {ExtensionPreferences, gettext as _} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

const SCAN_INTERVAL_KEY = 'interval';
const ACTIVE_KEY = 'active';
const AWAY_DURATION = 'duration-in-seconds';
const HIDE_INDICATOR_KEY = 'indicator';
const DEVICE_MAC_KEY = 'mac';

function getSettings(schema, path) {
    const extension = ExtensionPreferences.lookupByURL(import.meta.url);
    const schemaDir = extension.dir.get_child('schemas');
    let schemaSource;
    if (schemaDir.query_exists(null)) {
        schemaSource = Gio.SettingsSchemaSource.new_from_directory(
            schemaDir.get_path(),
            Gio.SettingsSchemaSource.get_default(),
            false
        );  
    } else {
        schemaSource = Gio.SettingsSchemaSource.get_default();
    }   
            
    const schemaObj = schemaSource.lookup(schema, true);
    if (!schemaObj) {
        log(    
            `Schema ${schema} could not be found for extension ${
                extension.metadata.uuid}. Please check your installation.`
        );
        return null;
    }

    const args = {settings_schema: schemaObj};
    if (path)
        args.path = path;

    return new Gio.Settings(args);
}

export default class Settings {
    constructor() {
        this._settings = getSettings("org.gnome.shell.extensions.bluetooth_smartlock");
    }

    getScanInterval() {
        return this._settings.get_int(SCAN_INTERVAL_KEY);
    }

    setScanInterval(interval) {
        this._settings.set_int(SCAN_INTERVAL_KEY, interval);
    }

    getAwayDuration() {
        return this._settings.get_int(AWAY_DURATION);
    }

    setAwayDuration(duration) {
        this._settings.set_int(AWAY_DURATION, duration);
    }

    getActive() {
        return this._settings.get_boolean(ACTIVE_KEY);
    }

    setActive(mode) {
        this._settings.set_boolean(ACTIVE_KEY, mode);
    }

    getHideIndicator() {
        return this._settings.get_boolean(HIDE_INDICATOR_KEY);
    }

    setHideIndicator(value) {
        this._settings.set_boolean(HIDE_INDICATOR_KEY, value);
    }

    getDevice() {
        return this._settings.get_string(DEVICE_MAC_KEY);
    }

    setDevice(device) {
        if (device !== this.getDevice())
            this._settings.set_string(DEVICE_MAC_KEY, device);
    }
}
