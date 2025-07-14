import { gettext as _ } from 'resource:///org/gnome/shell/extensions/extension.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';
import GObject from 'gi://GObject';
import St from 'gi://St';
import Gio from 'gi://Gio';
import bluetooth from "./bluetooth/dbus.js";

class SmartlockIndicatorClass extends PanelMenu.Button { // Use a temporary name for the raw class
    constructor() {
        super(0.0, _('Bluetooth Smartlock'));

    }

    init(extension, settings) {
        this._extension = extension;
        this._settings = settings; // Pass settings directly

        const interfaceSettings = new Gio.Settings({ schema_id: 'org.gnome.desktop.interface' });
        const iconScheme = interfaceSettings.get_string('color-scheme') === 'prefer-dark' ? 'white' : 'black';

        let icon = new St.Icon({
            gicon: Gio.icon_new_for_string('system-lock-screen-symbolic'),
            style_class: 'system-status-icon',
        });
        this.add_child(icon);

        // Initial menu item for "Smart Lock" active state
        let activeMenu = new PopupMenu.PopupSwitchMenuItem(_('Smart Lock'), this._settings.getActive());
        activeMenu.connect('activate', (item) => {
            this._settings.setActive(item.state);
        });
        this.menu.addMenuItem(activeMenu);

        this.menu.connect('open-state-changed', this._createMenu.bind(this));

        this._settings.connectLastSeenChangeSignal(() => this._setIconColor(icon));
        this._settings.connectActiveSignal(() => this._setIconColor(icon));
        this._settings.connectDeviceChangeSignal(() => this._setIconColor(icon));
    }

    _setIconColor(icon) {
        if (!this._settings.getActive()) {
            icon.set_style(null);
            return;
        }

        if (!this._settings.getDevice()) {
            icon.set_style(null);
            return;
        }

        if (this._settings.getLastSeen()) {
            icon.style = `color: #00FF00;`; // Green if last seen is recent
        } else {
            icon.style = `color: #FF0000;`; // Red if not seen recently
        }
    }

    async _createMenu() {
        this.menu.removeAll();

        const devices = await bluetooth.getDevices()

        devices.sort((a, b) => a.name.localeCompare(b.name));

        for (const device of devices) {
            if (device.paired && device.name !== '') {
                let address = device.address;
                let menuItem = new PopupMenu.PopupSwitchMenuItem(`${device.name}`, this._settings.getDevice() === address);
                menuItem.connect('activate', () => {
                    this._settings.setDevice(address);
                });
                this.menu.addMenuItem(menuItem);
            }
        }

        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

        let activeMenu = new PopupMenu.PopupSwitchMenuItem(_('Enable Smart Lock'), this._settings.getActive());
        activeMenu.connect('activate', (item) => {
            this._settings.setActive(item.state);
        });
        this.menu.addMenuItem(activeMenu);

        let icon = new Gio.ThemedIcon({ name: 'preferences-other-symbolic' });
        let settingsMenu = new PopupMenu.PopupImageMenuItem(_('Settings'), icon);
        settingsMenu.connect('activate', () => {
            this._extension.openPreferences();
        });
        this.menu.addMenuItem(settingsMenu);

    }
}

// Export the registered class
export default GObject.registerClass(
    {
        GTypeName: 'SmartlockIndicator',
        Extends: PanelMenu.Button,
    },
    SmartlockIndicatorClass // Pass the class itself
);