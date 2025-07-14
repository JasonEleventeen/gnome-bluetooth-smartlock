import Gio from 'gi://Gio';

const SCAN_INTERVAL_KEY = 'interval';
const ACTIVE_KEY = 'active';
const AWAY_DURATION = 'duration-in-seconds';
const HIDE_INDICATOR_KEY = 'indicator';
const DEVICE_MAC_KEY = 'mac';
const LAST_SEEN = 'last-seen';

class Settings {
    init(settings) {
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
    connectActiveSignal(cb) {
        return this._settings.connect(`changed::${ACTIVE_KEY}`, () => cb(this.getActive()));
    }

    getHideIndicator() {
        return this._settings.get_boolean(HIDE_INDICATOR_KEY);
    }
    setHideIndicator(value) {
        this._settings.set_boolean(HIDE_INDICATOR_KEY, value);
    }
    connectIndicatorChangeSignal(cb) {
        return this._settings.connect(`changed::${HIDE_INDICATOR_KEY}`, () => cb(this.getHideIndicator()));
    }

    getDevice() {
        return this._settings.get_string(DEVICE_MAC_KEY);
    }
    setDevice(device) {
        if (device !== this.getDevice())
            this._settings.set_string(DEVICE_MAC_KEY, device);
    }
    connectDeviceChangeSignal(cb) {
        return this._settings.connect(`changed::${DEVICE_MAC_KEY}`, () => cb(this.getDevice()));
    }

    getLastSeen() {
        return this._settings.get_int64(LAST_SEEN);
    }
    setLastSeen(timestamp) {
        this._settings?.set_int64(LAST_SEEN, timestamp);
    }

    connectLastSeenChangeSignal(cb) {
        return this._settings.connect(`changed::${LAST_SEEN}`, () => cb(this.getLastSeen()));
    }

    disconnect(signalId) {
        if (this._settings) {
            this._settings.disconnect(signalId);
            this._settings = null;
        }
    }
}

const settings = new Settings();
export default settings;