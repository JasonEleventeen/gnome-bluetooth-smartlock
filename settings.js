import Gio from 'gi://Gio';

const SCAN_INTERVAL_KEY = 'interval';
const ACTIVE_KEY = 'active';
const AWAY_DURATION = 'duration-in-seconds';
const HIDE_INDICATOR_KEY = 'indicator';
const DEVICE_MAC_KEY = 'mac';

function getSettings(schema, extensionDir, path) {
    let schemaSource;
    if (extensionDir) {
        const schemaDir = Gio.File.new_for_path(`${extensionDir}/schemas`);
        if (schemaDir.query_exists(null)) {
            schemaSource = Gio.SettingsSchemaSource.new_from_directory(
                schemaDir.get_path(),
                Gio.SettingsSchemaSource.get_default(),
                false
            );
        }
    }
    if (!schemaSource) {
        schemaSource = Gio.SettingsSchemaSource.get_default();
    }

    const schemaObj = schemaSource.lookup(schema, true);
    if (!schemaObj) {
        console.error(`Schema ${schema} could not be found. Please check your installation.`);
        return null;
    }

    const args = { settings_schema: schemaObj };
    if (path)
        args.path = path;

    return new Gio.Settings(args);
}

export default class Settings {
    constructor(settings) {
        this._settings = settings;
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
