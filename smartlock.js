import GLib from 'gi://GLib';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import bluetooth from "./bluetooth/dbus.js";


// eslint-disable-next-line no-unused-vars
const SmartLock = class SmartLock {
    constructor(settings) {
        this._settings = settings
        this._lockTimeoutId = null;

        this._btPollTimeoutId = null;
        this._pollLock = false;
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

        //this._poll((device) => this._checkDevice(device), this._settings.getScanInterval());

        bluetooth.subscribe((device) => this._checkDevice(device));

        this._log('Subscribing to  signals poll:' + this._settings.getScanInterval());

        let devices = await bluetooth.getDevices();
        for (const device of devices) {
            this._checkDevice(device);
        }
    }

    async checkNow() {
        let devices = await bluetooth.getDevices();
        for (const device of devices) {
            this._checkDevice(device);
        }
    }

    _checkDevice(device) {

        if (device.address !== this._settings.getDevice()) {
            this._log(`BT -> Device ${device.name} [${device.address}] is not the target device ${this._settings.getDevice()}, ignoring.`);
            return;
        }

        if (device.connected) {
            this._log(`BT -> Device ${device.name} [${device.address}] is connected, resetting last seen time.`);
            this._settings.setLastSeen(new Date().getTime());
            this._clearLockTimeout();
            return;
        }

        let lastSeen = this._settings.getLastSeen();
        if (lastSeen === 0) {
            this._log(`BT -> Device ${device.name} [${device.address}] was not seen recently....`);
            return;
        }

        let duration = this._settings.getAwayDuration() || 3; // Default to 60 seconds if not set

        this._settings.setLastSeen(0);
        this._log(`BT -> Device ${device.address} is not connected, starting timer for ${device.duration} seconds.`);
        this._lockTimeoutId = GLib.timeout_add_seconds(
            GLib.PRIORITY_DEFAULT,
            duration,   // delay in seconds before locking
            () => {
                this._lockTimeoutId = null;

                // check if the device is still not connected
                if (this._settings.getLastSeen() > 0) {
                    this._log(`Device ${device.address} is now connected, cancelling lock timeout.`);
                } else {
                    this._log(`User stepped away for ${duration} seconds, locking the screen`);
                    this.lock_screen();
                }

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

        this._settings.setLastSeen(0);

        if (this._btPollTimeoutId) {
            GLib.source_remove(this._btPollTimeoutId);
            this._btPollTimeoutId = null;
        }

        bluetooth.disconnect();
    }

    /**
     * Poll for Bluetooth devices at regular intervals.
     * @param {*} cb 
     * @param {*} seconds 
     */
    _poll(cb, seconds = 60) {
        bluetooth.disconnect()
        this._log(`Polling LOCK devices every ${seconds} seconds...`);
        this._btPollTimeoutId = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, seconds, async () => {
            this._log(`Polling LOCK devices every ${seconds} seconds...`);
            if (this._pollLock) {
                 this._log(`Polling LOCK devices every ${this._pollLock} seconds...`);
                return GLib.SOURCE_CONTINUE; // Prevent re-entrancy
            }
            pollLock = true;
            this._log(`Polling Bluetooth devices every ${this._pollLock} seconds...`);
            try {
                const devices = await bluetooth.getDevices();
                for (const device of devices) {
                    cb(device);
                }
            } catch (error) {
                console.error('Error polling Bluetooth devices:', error);               
            }

            this._pollLock = false; // Release the lock after processing
            return GLib.SOURCE_CONTINUE;
        });
    }
};


export default SmartLock
