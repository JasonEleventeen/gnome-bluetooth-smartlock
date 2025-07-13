import GLib from 'gi://GLib';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import dbus from "./dbus.js";

// eslint-disable-next-line no-unused-vars
const SmartLock = class SmartLock {
    constructor(settings) {

        this._settings = settings
        this._lastSeen = 0;

        this._dbusSubscriptionId = null;
        this._lockTimeoutId = null;
    }

    _log(message) {
        log(`[gnome-bluetooth-smartlock@eleventeen] ${message}`);
    }

    lock_screen() {
        if (!Main.screenShield._locked) {
            Main.overview.hide();
            Main.screenShield.lock(true);
        }
    }

    async enable() {
        this._log('Enabling extension');

        dbus.poll((device) => this._checkDevice(device), this._settings.getScanInterval());

        this._log('Subscribing to D-Bus signals poll:' + this._settings.getScanInterval());

        let devices = await dbus.getDevices();
        for (const device of devices) {
            this._checkDevice(device);
        }
    }

    _checkDevice(device) {

        if (device.address !== this._settings.getDevice()) {
            this._log(`BT -> Device ${device.name} [${device.address}] is not the target device ${this._settings.getDevice()}, ignoring.`);
            return;
        }

        if (device.visible) {
            this._log(`BT -> Device ${device.name} [${device.address}] is visible, resetting last seen time.`);
            this._lastSeen = new Date().getTime();
            this._clearLockTimeout();
            return;
        }

        let duration = this._settings.getAwayDuration() || 60; // Default to 60 seconds if not set

        this._log(`BT -> Device ${device.address} is not visible, starting timer for ${device.duration} seconds.`);
        this._lockTimeoutId = GLib.timeout_add_seconds(
            GLib.PRIORITY_DEFAULT,
            duration,   // delay in seconds before locking
            () => {
                this._lockTimeoutId = null;
                this._lastSeen = 0;
                this._log(`User stepped away for ${duration} seconds, locking the screen`);
                this.lock_screen();

                // Clear the timeout to prevent it from running again
                return GLib.SOURCE_REMOVE;
            }
        );
    }

    _clearLockTimeout() {
        if (this._lockTimeoutId) {
            GLib.source_remove(this._lockTimeoutId);
            this._lockTimeoutId = null;
        }
    }

    disable() {
        this._clearLockTimeout()

        this._log('Disabling extension');

        this._lastSeen = 0;

        dbus.disconnect();
    }
};


export default SmartLock
