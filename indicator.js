import {domain} from 'gettext';
import GObject from 'gi://GObject';
import St from 'gi://St';
import Gio from 'gi://Gio';
import GnomeBluetooth from "gi://GnomeBluetooth";
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';
import * as ExtensionUtils from 'resource:///org/gnome/shell/misc/extensionUtils.js';

import Settings from './settings';

const Me = ExtensionUtils.getCurrentExtension();
const {gettext: _} = domain(Me.metadata['gettext-domain']);

// eslint-disable-next-line no-unused-vars
var Indicator = GObject.registerClass(
    class Indicator extends PanelMenu.Button {
        _init() {
            super._init(0.0, _('Bluetooth Smartlock'));
            this._client = new GnomeBluetooth.Client();
            this._settings = new Settings();

            let interfaceSettings = new Gio.Settings({schema_id: 'org.gnome.desktop.interface'});
            let iconScheme = interfaceSettings.get_string('color-scheme') === 'prefer-dark' ? 'white' : 'black';
            let icon = new St.Icon({style_class: 'system-status-icon'});
            icon.gicon = Gio.icon_new_for_string(`${Me.path}/icons/smartlock-${iconScheme}.svg`);
            this.add_child(icon);

            let activeMenu = new PopupMenu.PopupSwitchMenuItem(_('Active'), this._settings.getActive());
            activeMenu.connect('activate', self => {
                this._settings.setActive(self.state);
            });
            this.menu.addMenuItem(activeMenu);

            this.menu.connect('open-state-changed', this._createMenu.bind(this));
        }

        _createMenu() {
            this.menu.removeAll();
            let activeMenu = new PopupMenu.PopupSwitchMenuItem(_('Smart Lock'), this._settings.getActive());
            activeMenu.connect('activate', self => {
                this._settings.setActive(self.state);
            });
            this.menu.addMenuItem(activeMenu);

            let icon = new Gio.ThemedIcon({name: 'emblem-system-symbolic'});
            let settingsMenu = new PopupMenu.PopupImageMenuItem(_('Settings'), icon);
            settingsMenu.connect('activate', () => {
                ExtensionUtils.openPrefs();
            });
            this.menu.addMenuItem(settingsMenu);

            this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem(_('Devices')));

            let store = this._client.get_devices();
            let nItems = store.get_n_items();
            for (let i = 0; i < nItems; i++) {
                let device = store.get_item(i);
                if (device.paired && device.name !== '') {
                    let address = device.address;
                    let menu = new PopupMenu.PopupSwitchMenuItem(`${device.name}`, this._settings.getDevice() === address);
                    menu.connect('activate', () => {
                        this._settings.setDevice(address);
                    });
                    this.menu.addMenuItem(menu);
                }
            }
        }
    });

export default Indicator