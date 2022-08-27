/* extension.js
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 */

/* exported init */
const GETTEXT_DOMAIN = 'bil4x4-audiodevicetoggle-extension';


const { GObject, St, Gio } = imports.gi;

const ExtensionUtils = imports.misc.extensionUtils;
const BIL4X4 = ExtensionUtils.getCurrentExtension();
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;

const Vars = BIL4X4.imports.vars;

const _ = ExtensionUtils.gettext;

const AudioDeviceToggle = GObject.registerClass(
class AudioDeviceToggle extends PanelMenu.Button {
    _init() {
        this._settings = ExtensionUtils.getSettings(Vars.settingsId);
        this._icon = new St.Icon({
            style_class: Vars.iconStyleClass,
        });
        this._icon.gicon = Gio.icon_new_for_string(Vars.iconNames.speaker);

        super._init(0.0, Vars.indicatorNam);
        this.add_actor(this._icon);
        this.connect('button-press-event', this.toggleState.bind(this));
        this.connect('touch-event', this.toggleState.bind(this));
    }

    toggleState() {
        if (this._icon.icon_name === Vars.iconNames.speaker) {
            if (this._settings.get_boolean(Vars.SettingsKey.SHOW_NOTIFICATIONS)) {
                Main.notify('Audio device set to headphones');
            }
            this._icon.gicon = Gio.icon_new_for_string(Vars.iconNames.headphones);
        } else {
            if (this._settings.get_boolean(Vars.SettingsKey.SHOW_NOTIFICATIONS)) {
                Main.notify('Audio device set to speaker');
            }
            this._icon.gicon = Gio.icon_new_for_string(Vars.iconNames.speaker);
        }
    }
});

class Extension {
    constructor(uuid) {
        this._uuid = uuid;

        ExtensionUtils.initTranslations(GETTEXT_DOMAIN);
    }

    enable() {
        this._audioDeviceToggle = new AudioDeviceToggle();
        Main.panel.addToStatusArea(this._uuid, this._audioDeviceToggle);
    }

    disable() {
        this._audioDeviceToggle.destroy();
        this._audioDeviceToggle = null;
    }
}

function init(meta) {
    return new Extension(meta.uuid);
}
