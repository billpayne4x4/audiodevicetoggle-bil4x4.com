const { GObject, Gtk, Gio, Pango, GLib } = imports.gi;
const ExtensionUtils = imports.misc.extensionUtils;
const BIL4X4 = ExtensionUtils.getCurrentExtension();
const Vars = BIL4X4.imports.vars;

const SettingListBoxRow = GObject.registerClass({
    Properties: {
        'label': GObject.ParamSpec.string(
            'label', 'Settings Label', 'label',
            GObject.ParamFlags.READWRITE,
            ''),
        'description': GObject.ParamSpec.string(
            'description', 'Settings Description', 'description',
            GObject.ParamFlags.READWRITE,
            ''),
        'settingsKey': GObject.ParamSpec.string(
            'settingsKey', 'Settings Key', 'settingsKey',
            GObject.ParamFlags.READWRITE,
            ''),
        'type': GObject.ParamSpec.string(
            'type', 'Control Type', 'type',
            GObject.ParamFlags.READWRITE,
            'switch'),
        'options': GObject.param_spec_variant(
            'options', 'Options for Control', 'options',
            new GLib.VariantType('a{sv}'),
            null,
            GObject.ParamFlags.READWRITE),
    },
},
class SettingListBoxRow extends Gtk.ListBoxRow {
    _init(label, description, settingsKey, type, options) {
        this.rowType = type;
        this._settings = ExtensionUtils.getSettings(Vars.settingsId);

        const _hbox = new Gtk.Box({
            spacing: 12,
            margin_top: 12,
            margin_bottom: 12,
            margin_start: 12,
            margin_end: 12,
        });

        super._init({
            child: _hbox,
        });

        let _vbox = new Gtk.Box({
            orientation: Gtk.Orientation.VERTICAL,
        });
        _hbox.append(_vbox);

        let _label = new Gtk.Label({
            label,
            halign: Gtk.Align.START,
            hexpand: true,
        });
        _vbox.append(_label);

        const _descriptionAttributes = new Pango.AttrList();
        _descriptionAttributes.insert(Pango.attr_scale_new(0.83));
        let _description = new Gtk.Label({
            label: description,
            halign: Gtk.Align.START,
            attributes: _descriptionAttributes,
        });
        _description.get_style_context().add_class('dim-label');
        _vbox.append(_description);

        switch (type) {
        case 'combobox':
            this.control = new Gtk.ComboBoxText();
            for (let item of options.values)
                this.control.append_text(item);
            this._settings.connect(`changed::${settingsKey}`, () => {
                this.control.set_active(this._settings.get_enum(settingsKey));
            });
            this.control.connect('changed', combobox => {
                this._settings.set_enum(settingsKey, combobox.get_active());
            });
            this.control.set_active(this._settings.get_enum(settingsKey) || 0);
            break;
        default:
            this.rowType = 'switch';
            this.control = new Gtk.Switch({
                active: this._settings.get_boolean(settingsKey),
                halign: Gtk.Align.END,
                valign: Gtk.Align.CENTER,
            });
            this._settings.bind(settingsKey, this.control, 'active', Gio.SettingsBindFlags.DEFAULT);
        }
        _hbox.append(this.control);
    }
}
);

const AudioDeviceTogglePrefsWidget = GObject.registerClass(
    class AudioDeviceTogglePrefsWidget extends Gtk.Frame {
        _init() {
            super._init({
                margin_top: 16,
                margin_bottom: 16,
                margin_start: 16,
                margin_end: 16,
            });

            const _listBox = new Gtk.ListBox({
                selection_mode: Gtk.SelectionMode.NONE,
                valign: Gtk.Align.START,
                show_separators: true,
            });

            const _showNotifications = new SettingListBoxRow('Notifications', 'Enable or disable notifications', Vars.SettingsKey.SHOW_NOTIFICATIONS);
            _listBox.append(_showNotifications);

            this.set_child(_listBox);
        }
    }
);



function init() {
    
}

function buildPrefsWidget() {
    let widget = new AudioDeviceTogglePrefsWidget();
    widget.show();
    return widget;
}
