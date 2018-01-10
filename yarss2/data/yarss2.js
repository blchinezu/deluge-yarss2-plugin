
function cloneArray(data) {
    return JSON.parse(JSON.stringify(data))
}

Ext.ns('Deluge.ux');

Deluge.ux.Yarss2SubscriptionWindowBase = Ext.extend(Ext.Window, {

    layout: 'fit',
    width: 600,
    height: 500,
    closeAction: 'hide',

    initComponent: function() {
        Deluge.ux.Yarss2SubscriptionWindowBase.superclass.initComponent.call(this);
        this.addButton(_('Cancel'), this.onCancelClick, this);

        this.config = null
        this.key = null

        this.form = this.add({
            xtype: 'form',
            baseCls: 'x-plain',
            bodyStyle: 'padding: 5px',
            defaults: {
                width: 470,
                height: 22
            },
            items: [{
                xtype: 'textfield',
                fieldLabel: _('Name'),
                name: 'name',
            },{
                xtype: 'combo',
                fieldLabel: _('RSS Feed'),
                store: new Ext.data.ArrayStore({
                    fields: ['id', 'text'],
                    data: []
                }),
                name: 'rssfeed_key',
                mode: 'local',
                editable: false,
                triggerAction: 'all',
                valueField:    'id',
                displayField:  'text'
            },{
                xtype: 'compositefield',
                fieldLabel: _('Include (regex)'),
                items: [{
                    xtype: 'textfield',
                    name: 'regex_include',
                    width: 360
                },{
                    xtype: 'checkbox',
                    name: 'regex_include_ignorecase',
                    hideLabel: true,
                    width: 15,
                    flex: 1
                },{
                    xtype: 'displayfield',
                    value: 'Case Sensitive',
                    width: 85,
                    flex: 1
                }]
            },{
                xtype: 'compositefield',
                fieldLabel: _('Exclude (regex)'),
                items: [{
                    xtype: 'textfield',
                    name: 'regex_exclude',
                    width: 360
                },{
                    xtype: 'checkbox',
                    name: 'regex_exclude_ignorecase',
                    hideLabel: true,
                    width: 15,
                    flex: 1
                },{
                    xtype: 'displayfield',
                    value: 'Case Sensitive',
                    width: 85,
                    flex: 1
                }]
            },{
                xtype: 'tabpanel',
                activeTab: 0,
                width: 575,
                height: 272,
                padding: 5,
                items: [/*{
                    title: _('Matching'),
                    items: [this.subscriptionsList],
                },*/{
                    title: _('Options'),
                    items: [{
                        xtype: 'fieldset',
                        title: 'Paths',
                        autoHeight: true,
                        columnWidth: 0.5,
                        width: 560,
                        items :[{
                            xtype: 'textfield',
                            fieldLabel: _('Download path'),
                            name: 'download_location',
                            width: 430,
                        },{
                            xtype: 'textfield',
                            fieldLabel: _('Move completed'),
                            name: 'move_completed',
                            width: 430,
                        }]
                    },{
                        xtype: 'compositefield',
                        items: [{
                            xtype: 'fieldset',
                            title: 'Bandwidth',
                            autoHeight: true,
                            columnWidth: 0.5,
                            width: 277,
                            items :[{
                                xtype: 'numberfield',
                                fieldLabel: _('Max Down Speed'),
                                name: 'max_download_speed',
                                allowDecimals: false
                            },{
                                xtype: 'numberfield',
                                fieldLabel: _('Max Up Speed'),
                                name: 'max_upload_speed',
                                allowDecimals: false
                            },{
                                xtype: 'numberfield',
                                fieldLabel: _('Max Connections'),
                                name: 'max_connections',
                                allowDecimals: false
                            },{
                                xtype: 'numberfield',
                                fieldLabel: _('Max Upload Slots'),
                                name: 'max_upload_slots',
                                allowDecimals: false
                            }]
                        },{
                            xtype: 'fieldset',
                            title: 'General',
                            autoHeight: true,
                            columnWidth: 0.5,
                            width: 278,
                            flex: 1,
                            items :[{
                                xtype: 'combo',
                                fieldLabel: _('Add paused'),
                                store: new Ext.data.ArrayStore({
                                    fields: ['id', 'text'],
                                    data: [
                                        ['Default', _('Default')],
                                        ['True', _('True')],
                                        ['False', _('False')]
                                    ]
                                }),
                                name: 'add_torrents_in_paused_state',
                                mode: 'local',
                                editable: false,
                                triggerAction: 'all',
                                valueField:    'id',
                                displayField:  'text',
                                width: 140,
                            },{
                                xtype: 'combo',
                                fieldLabel: _('Auto managed'),
                                store: new Ext.data.ArrayStore({
                                    fields: ['id', 'text'],
                                    data: [
                                        ['Default', _('Default')],
                                        ['True', _('True')],
                                        ['False', _('False')]
                                    ]
                                }),
                                name: 'auto_managed',
                                mode: 'local',
                                editable: false,
                                triggerAction: 'all',
                                valueField:    'id',
                                displayField:  'text',
                                width: 140,
                            },{
                                xtype: 'combo',
                                fieldLabel: _('Sequential down'),
                                store: new Ext.data.ArrayStore({
                                    fields: ['id', 'text'],
                                    data: [
                                        ['Default', _('Default')],
                                        ['True', _('True')],
                                        ['False', _('False')]
                                    ]
                                }),
                                name: 'sequential_download',
                                mode: 'local',
                                editable: false,
                                triggerAction: 'all',
                                valueField:    'id',
                                displayField:  'text',
                                width: 140,
                            },{
                                xtype: 'combo',
                                fieldLabel: _('Prio First/Last'),
                                store: new Ext.data.ArrayStore({
                                    fields: ['id', 'text'],
                                    data: [
                                        ['Default', _('Default')],
                                        ['True', _('True')],
                                        ['False', _('False')]
                                    ]
                                }),
                                name: 'prioritize_first_last_pieces',
                                mode: 'local',
                                editable: false,
                                triggerAction: 'all',
                                valueField:    'id',
                                displayField:  'text',
                                width: 140,
                            }]
                        }]
                    }],
                }]
            }]
        });

        // TODO: remove
        window.cacatEdit = this
    },

    populateFeeds: function() {
        var feeds = []
        for (var i in this.config["rssfeeds"]) {
            var feed = this.config["rssfeeds"][i]

            feeds.push([
                feed['key'],
                feed['name'] + ' (' + feed['site'] + ')'
                ])
        }
        this.form.getForm().findField('rssfeed_key').getStore().loadData(feeds)
    },

    getPopularFeed: function() {
        var nbSubscriptions = []
        var key = null
        var maxSubscriptions = 0

        for (var i in this.config["subscriptions"]) {
            var feed = this.config["subscriptions"][i]['rssfeed_key']

            if( typeof(nbSubscriptions[feed]) == 'undefined' ) {
                nbSubscriptions[feed] = 1
            } else {
                nbSubscriptions[feed]++
            }

            if( nbSubscriptions[feed] > maxSubscriptions ) {
                key = feed
                maxSubscriptions = nbSubscriptions[feed]
            }
        }
        if( key === null ) {
            for (var i in this.config["rssfeeds"]) {
                return this.config["rssfeeds"][i]['key']
            }
        }

        return key
    },

    getLast: function(fieldName, defaultValue) {
        var value = defaultValue
        for (var i in this.config["subscriptions"]) {
            value = this.config["subscriptions"][i][fieldName]
        }
        return value
    },

    setDefaults: function() {
        this.key = null
        this.populateFeeds()

        popularFeed = this.getPopularFeed()
        if( popularFeed !== null ) {
            this.form.getForm().setValues({
                rssfeed_key: popularFeed
            });
        }

        this.form.getForm().setValues({
            name:                         '',
            regex_include:                '',
            regex_include_ignorecase:     false,
            regex_exclude:                '',
            regex_exclude_ignorecase:     false,
            download_location:            this.getLast('download_location',  ''),
            move_completed:               this.getLast('move_completed',     ''),
            max_download_speed:           this.getLast('max_download_speed', -1),
            max_upload_speed:             this.getLast('max_upload_speed',   -1),
            max_connections:              this.getLast('max_connections',    -1),
            max_upload_slots:             this.getLast('max_upload_slots',   -1),
            add_torrents_in_paused_state: 'Default',
            auto_managed:                 'Default',
            sequential_download:          'Default',
            prioritize_first_last_pieces: 'Default',
        });
    },

    processWebToCore: function(subscription) {
        var targets

        data = cloneArray(subscription)

        targets = [
            'max_download_speed',
            'max_upload_speed',
            'max_connections',
            'max_upload_slots',
        ]
        for (var i = targets.length - 1; i >= 0; i--) {
            data[targets[i]] = parseInt(data[targets[i]])
            if( data[targets[i]] < -1 ) {
                data[targets[i]] = -1
            }
        }

        targets = [
            'regex_include_ignorecase',
            'regex_exclude_ignorecase',
        ]
        for (var i = targets.length - 1; i >= 0; i--) {
            data[targets[i]] = !data[targets[i]]
        }

        targets = [
            'add_torrents_in_paused_state',
            'auto_managed',
            'sequential_download',
            'prioritize_first_last_pieces',
        ]
        for (var i = targets.length - 1; i >= 0; i--) {
            if( ['True','true',true].indexOf[data[targets[i]]] != -1 ) {
                data[targets[i]] = true
            }
            if( ['False','false',false].indexOf[data[targets[i]]] != -1 ) {
                data[targets[i]] = false
            }
            else if( data[targets[i]] !== 'Default' ) {
                alert('Yarss2SubscriptionWindowBase::processWebToCore(): Invalid value for "'+targets[i]+'" = "'+data[targets[i]]+'" ('+typeof(data[targets[i]])+')')
            }
        }

        return data
    },

    processCoreToWeb: function(subscription) {
        var targets

        data = cloneArray(subscription)

        targets = [
            'max_download_speed',
            'max_upload_speed',
            'max_connections',
            'max_upload_slots',
        ]
        for (var i = targets.length - 1; i >= 0; i--) {
            if( data[targets[i]] < -1 ) {
                data[targets[i]] = -1
            }
        }

        targets = [
            'regex_include_ignorecase',
            'regex_exclude_ignorecase',
        ]
        for (var i = targets.length - 1; i >= 0; i--) {
            data[targets[i]] = !data[targets[i]]
        }

        targets = [
            'add_torrents_in_paused_state',
            'auto_managed',
            'sequential_download',
            'prioritize_first_last_pieces',
        ]
        for (var i = targets.length - 1; i >= 0; i--) {
            if( data[targets[i]] === 'True' ) {
                data[targets[i]] = true
            }
            else if( data[targets[i]] === 'False' ) {
                data[targets[i]] = false
            }
        }

        return data
    },

    getFormData: function(withKey) {
        var subscription = this.form.getForm().getValues()
        subscription['active'] = true
        subscription['rssfeed_key'] = this.form.getForm().getFieldValues()['rssfeed_key']

        if( withKey ) {
            subscription['key'] = this.key
        }

        return subscription
    },

    onCancelClick: function() {
        this.hide();
    }
});

Deluge.ux.EditYarss2SubscriptionWindow = Ext.extend(Deluge.ux.Yarss2SubscriptionWindowBase, {

    title: _('YaRSS2 - Edit Subscription'),

    initComponent: function() {
        Deluge.ux.EditYarss2SubscriptionWindow.superclass.initComponent.call(this);
        this.addButton(_('Save'), this.onSaveClick, this);
        this.addEvents({
            'subscriptionedit': true
        });
    },

    show: function(subscription, config) {
        Deluge.ux.EditYarss2SubscriptionWindow.superclass.show.call(this);

        this.config = config
        this.setDefaults()

        // TODO: remove
        console.log('subscription', subscription)
        this.loadSubscription(subscription['key'])
    },

    loadSubscription: function(key) {
        this.key = parseInt(key)
        subscription = this.config['subscriptions'][key]

        this.form.getForm().setValues(this.processCoreToWeb(this.config['subscriptions'][key]));
    },

    onSaveClick: function() {
        var subscription = this.getFormData(true)

        console.log('edit subscription', subscription)
        subscription = this.processWebToCore(subscription)
        console.log('edit subscription processed', subscription)

        deluge.client.yarss2.save_subscription(subscription['key'], subscription, false, {
            success: function() {
                this.fireEvent('subscriptionedit', this);
            },
            scope: this
        });
        this.hide();
    }

});

Deluge.ux.AddYarss2SubscriptionWindow = Ext.extend(Deluge.ux.Yarss2SubscriptionWindowBase, {

    title: _('YaRSS2 - Add Subscription'),

    initComponent: function() {
        Deluge.ux.AddYarss2SubscriptionWindow.superclass.initComponent.call(this);
        this.addButton(_('Save'), this.onSaveClick, this);
        this.addEvents({
            'subscriptionadd': true
        });
    },

    show: function(config) {
        Deluge.ux.AddYarss2SubscriptionWindow.superclass.show.call(this);

        this.config = config
        this.setDefaults()
    },

    onSaveClick: function() {
        var subscription = this.getFormData(false)

        console.log('add subscription', subscription)
        subscription = this.processWebToCore(subscription)
        console.log('add subscription processed', subscription)

        deluge.client.yarss2.save_subscription(null, subscription, false, {
            success: function() {
                this.fireEvent('subscriptionadd', this);
            },
            scope: this
        });
        this.hide();
    }

});

Ext.ns('Deluge.ux.preferences');

/**
 * @class Deluge.ux.preferences.Yarss2Page
 * @extends Ext.Panel
 */
Deluge.ux.preferences.Yarss2Page = Ext.extend(Ext.Panel, {

    title: _('YaRSS2'),
    layout: 'fit',
    border: false,

    initComponent: function() {
        Deluge.ux.preferences.Yarss2Page.superclass.initComponent.call(this);

        this.config = null

        ///////////////////
        // SUBSCRIPTIONS //
        ///////////////////

        this.subscriptionsList = new Ext.grid.GridPanel({
            xtype: 'grid',
            autoHeight: true,
            width: 320,
            autoExpandColumn: 'name',
            viewConfig: {
                emptyText: _('There are no subscriptions'),
                deferEmptyText: false
            },
            colModel: new Ext.grid.ColumnModel({
                defaults: {
                    renderer: function(value, meta, record, rowIndex, colIndex, store) {
                        if (Ext.isBoolean(value)) {
                            return '<div class="x-grid3-check-col' + (value ? '-on' : '') +
                                '" style="width: 20px;">&#160;</div>';
                        }
                        return value;
                    }
                },
                columns: [{
                    id: 'active',
                    header: " ",
                    sortable: false,
                    dataIndex: 'active',
                    hideable: false,
                    menuDisabled: true,
                    width: 30
                },{
                    id: 'key',
                    header: "ID",
                    sortable: true,
                    dataIndex: 'key',
                    hidden: true,
                    width: 30
                },{
                    id: 'name',
                    header: _('Name'),
                    sortable: true,
                    dataIndex: 'name',
                    hideable: false
                },{
                    id: 'feed',
                    header: _('Feed Name'),
                    sortable: true,
                    dataIndex: 'feed'
                },{
                    id: 'site',
                    header: _('Site'),
                    sortable: true,
                    dataIndex: 'site',
                    hidden: true
                },{
                    id: 'last_matched',
                    header: _('Last Matched'),
                    sortable: true,
                    dataIndex: 'last_matched',
                    width: 116
                },{
                    id: 'move_completed',
                    header: _('Move Completed'),
                    sortable: true,
                    dataIndex: 'move_completed',
                    hidden: true
                }]
            }),
            store: new Ext.data.ArrayStore({
                autoDestroy: true,
                fields: [{
                    name: 'active'
                },{
                    name: 'key'
                },{
                    name: 'name'
                },{
                    name: 'feed'
                },{
                    name: 'site'
                },{
                    name: 'last_matched'
                },{
                    name: 'move_completed'
                }]
            }),
            listeners: {
                cellclick: function(grid, rowIndex, colIndex, e) {
                    var record = grid.getStore().getAt(rowIndex);
                    var field = grid.getColumnModel().getDataIndex(colIndex);
                    var value = record.get(field);

                    if (colIndex == 0) {
                        if (Ext.isBoolean(value)) {
                            record.set(field, !value);
                            record.commit();
                        }
                    }
                },
                rowclick: function(grid, rowIndex, e) {
                    var record = grid.getStore().getAt(rowIndex);

                    if( grid.getSelectionModel().selections.items.length == 0 ) {
                        this.tabPanel.getBottomToolbar().items.get(1).disable();
                        this.tabPanel.getBottomToolbar().items.get(3).disable();
                    } else {
                        this.tabPanel.getBottomToolbar().items.get(3).enable();
                        if( grid.getSelectionModel().selections.items.length == 1 ) {
                            this.tabPanel.getBottomToolbar().items.get(1).enable();
                        }
                        else {
                            this.tabPanel.getBottomToolbar().items.get(1).disable();
                        }
                    }
                },
                rowdblclick: function(grid, rowIndex, colIndex, e) {
                    var record = grid.getStore().getAt(rowIndex);
                },
                beforeedit: function(e) {
                    if (Ext.isBoolean(e.value)) {
                        return false;
                    }

                    return e.record.get('enabled');
                },
                afteredit: function(e) {
                    e.record.commit();
                }
            },
            setEmptyText: function(text) {
                if (this.viewReady) {
                    this.getView().emptyText = text;
                    this.getView().refresh();
                } else {
                    Ext.apply(this.viewConfig, {emptyText: text});
                }
            },
            loadData: function(config) {
                var data = []

                for (var i in config["subscriptions"]) {
                    var subscription = config["subscriptions"][i]
                    var feed = config["rssfeeds"][ subscription["rssfeed_key"] ]
                    if( typeof(feed) == 'undefined' ) {
                        feed = {
                            name: 'UNDEFINED',
                            site: 'UNDEFINED',
                        }
                    }

                    data.push([
                        subscription["active"],
                        subscription["key"],
                        subscription["name"],
                        feed["name"],
                        feed["site"],
                        subscription["last_matched"],
                        subscription["move_completed"]
                        ])
                }

                // TODO: remove
                console.log("subscriptions", data)
                this.getStore().loadData(data);
                if (this.viewReady) {
                    this.getView().updateHeaders();
                }
            }
        });

        ///////////
        // FEEDS //
        ///////////

        this.feedsList = new Ext.grid.GridPanel({
            xtype: 'grid',
            autoHeight: true,
            autoExpandColumn: 'name',
            viewConfig: {
                emptyText: _('There are no feeds'),
                deferEmptyText: false
            },
            colModel: new Ext.grid.ColumnModel({
                defaults: {
                    renderer: function(value, meta, record, rowIndex, colIndex, store) {
                        if (Ext.isBoolean(value)) {
                            return '<div class="x-grid3-check-col' + (value ? '-on' : '') +
                                '" style="width: 20px;">&#160;</div>';
                        }
                        return value;
                    }
                },
                columns: [{
                    id: 'active',
                    header: " ",
                    sortable: false,
                    dataIndex: 'active',
                    hideable: false,
                    menuDisabled: true,
                    width: 30
                },{
                    id: 'key',
                    header: "ID",
                    sortable: true,
                    dataIndex: 'key',
                    hidden: true,
                    width: 30
                },{
                    id: 'name',
                    header: _('Name'),
                    sortable: true,
                    dataIndex: 'name',
                    hideable: false
                },{
                    id: 'site',
                    header: _('Site'),
                    sortable: true,
                    dataIndex: 'site',
                    hidden: true
                },{
                    id: 'update_interval',
                    header: _('Interval'),
                    sortable: true,
                    dataIndex: 'update_interval',
                    width: 40
                },{
                    id: 'last_update',
                    header: _('Last Update'),
                    sortable: true,
                    dataIndex: 'last_update',
                    width: 116
                },{
                    id: 'subscriptions',
                    header: _('Subscriptions'),
                    sortable: true,
                    dataIndex: 'subscriptions',
                    width: 40
                },{
                    id: 'url',
                    header: _('Url'),
                    sortable: true,
                    dataIndex: 'url',
                    hidden: true
                }]
            }),
            store: new Ext.data.ArrayStore({
                autoDestroy: true,
                fields: [{
                    name: 'active'
                },{
                    name: 'key'
                },{
                    name: 'name'
                },{
                    name: 'site'
                },{
                    name: 'update_interval'
                },{
                    name: 'last_update'
                },{
                    name: 'subscriptions'
                },{
                    name: 'url'
                }]
            }),
            listeners: {
                cellclick: function(grid, rowIndex, colIndex, e) {
                    var record = grid.getStore().getAt(rowIndex);
                    var field = grid.getColumnModel().getDataIndex(colIndex);
                    var value = record.get(field);

                    if (colIndex == 0) {
                        if (Ext.isBoolean(value)) {
                            record.set(field, !value);
                            record.commit();
                        }
                    }
                },
                rowclick: function(grid, rowIndex, e) {
                    var record = grid.getStore().getAt(rowIndex);

                    if( grid.getSelectionModel().selections.items.length == 0 ) {
                        this.tabPanel.getBottomToolbar().items.get(1).disable();
                        this.tabPanel.getBottomToolbar().items.get(3).disable();
                    } else {
                        this.tabPanel.getBottomToolbar().items.get(3).enable();
                        if( grid.getSelectionModel().selections.items.length == 1 ) {
                            this.tabPanel.getBottomToolbar().items.get(1).enable();
                        }
                        else {
                            this.tabPanel.getBottomToolbar().items.get(1).disable();
                        }
                    }
                },
                rowdblclick: function(grid, rowIndex, colIndex, e) {
                    var record = grid.getStore().getAt(rowIndex);
                },
                beforeedit: function(e) {
                    if (Ext.isBoolean(e.value)) {
                        return false;
                    }

                    return e.record.get('enabled');
                },
                afteredit: function(e) {
                    e.record.commit();
                }
            },
            setEmptyText: function(text) {
                if (this.viewReady) {
                    this.getView().emptyText = text;
                    this.getView().refresh();
                } else {
                    Ext.apply(this.viewConfig, {emptyText: text});
                }
            },
            loadData: function(config) {
                var data = []

                for (var i in config["rssfeeds"]) {
                    var feed = config["rssfeeds"][i]

                    var subscriptions = 0
                    var activeSubscriptions = 0
                    for (var j in config["subscriptions"]) {
                        if( config["subscriptions"][j]["rssfeed_key"] != feed["key"] ) {
                            continue;
                        }
                        subscriptions++
                        if( config["subscriptions"][j]["active"] ) {
                            activeSubscriptions++
                        }
                    }

                    data.push([
                        feed["active"],
                        feed["key"],
                        feed["name"],
                        feed["site"],
                        feed["update_interval"],
                        feed["last_update"],
                        activeSubscriptions + " / " + subscriptions,
                        feed["url"]
                        ])
                }

                // TODO: remove
                console.log("feeds", data)
                this.getStore().loadData(data);
                if (this.viewReady) {
                    this.getView().updateHeaders();
                }
            }
        });

        ///////////////
        // TAB PANEL //
        ///////////////

        this.tabPanel = this.add({
            xtype: 'tabpanel',
            activeTab: 0,
            defaults: {
                autoScroll: true
            },
            items: [{
                title: _('Subscriptions'),
                items: [this.subscriptionsList],
                autoScroll: true,
                bbar: {
                    items: [{
                        text: _('Add'),
                        iconCls: 'icon-add',
                        handler: this.onAddSubscriptionClick,
                        scope: this
                    },{
                        text: _('Edit'),
                        iconCls: 'icon-edit',
                        handler: this.onEditSubscriptionClick,
                        scope: this,
                        disabled: true
                    }, '->', {
                        text: _('Remove'),
                        iconCls: 'icon-remove',
                        handler: this.onRemoveSubscriptionClick,
                        scope: this,
                        disabled: true
                    }]
                },
            },{
                title: _('Feeds'),
                items: [this.feedsList],
                autoScroll: true,
                bbar: {
                    items: [{
                        text: _('Add'),
                        iconCls: 'icon-add',
                        handler: this.onAddFeedClick,
                        scope: this
                    },{
                        text: _('Edit'),
                        iconCls: 'icon-edit',
                        handler: this.onEditFeedClick,
                        scope: this,
                        disabled: true
                    }, '->', {
                        text: _('Remove'),
                        iconCls: 'icon-remove',
                        handler: this.onRemoveFeedClick,
                        scope: this,
                        disabled: true
                    }]
                },
                autoScroll: true
            }]
        });
        this.subscriptionsList.tabPanel = this.tabPanel.getItem(0)
        this.feedsList.tabPanel = this.tabPanel.getItem(1)

        this.on('show', this.onPreferencesShow, this);

        // TODO: remove
        window.cacat = this
    },

    onPreferencesShow: function() {
        this.updateConfig();
    },

    updateConfig: function() {
        deluge.client.yarss2.get_config({
            success: function(config) {
                this.config = config;
                // TODO: remove
                console.log('config',config)
                this.subscriptionsList.loadData(config);
                this.feedsList.loadData(config);
            },
            scope: this
        });
    },

    onAddSubscriptionClick: function() {
        if (!this.addWin) {
            this.addWin = new Deluge.ux.AddYarss2SubscriptionWindow();
            this.addWin.on('subscriptionadd', function() {
                this.updateConfig();
            }, this);
        }
        this.addWin.show(this.config);
    },

    onEditSubscriptionClick: function() {
        if (!this.editWin) {
            this.editWin = new Deluge.ux.EditYarss2SubscriptionWindow();
            this.editWin.on('subscriptionedit', function() {
                this.updateConfig();
            }, this);
        }
        this.editWin.show(this.subscriptionsList.getSelectionModel().selections.items[0]['data'], this.config);
    },

    onRemoveSubscriptionClick: function() {
        var record = this.feedsList.getSelectedRecords()[0];
        deluge.client.yarss2.remove_command(record.id, {
            success: function() {
                this.updateConfig();
            },
            scope: this
        });
    },

    onAddFeedClick: function() {
        // if (!this.addWin) {
        //     this.addWin = new Deluge.ux.AddExecuteCommandWindow();
        //     this.addWin.on('commandadd', function() {
        //         this.updateConfig();
        //     }, this);
        // }
        // this.addWin.show();
    },

    onEditFeedClick: function() {
        // if (!this.editWin) {
        //     this.editWin = new Deluge.ux.EditYarss2SubscriptionWindow();
        //     this.editWin.on('commandedit', function() {
        //         this.updateConfig();
        //     }, this);
        // }
        // this.editWin.show(this.feedsList.getSelectedRecords()[0]);
    },

    onRemoveFeedClick: function() {
        // var record = this.feedsList.getSelectedRecords()[0];
        // deluge.client.yarss2.remove_command(record.id, {
        //     success: function() {
        //         this.updateConfig();
        //     },
        //     scope: this
        // });
    },
});

Deluge.plugins.Yarss2Plugin = Ext.extend(Deluge.Plugin, {
    name: 'YaRSS2',

    onDisable: function() {
        deluge.preferences.removePage(this.prefsPage);
    },

    onEnable: function() {
        this.prefsPage = deluge.preferences.addPage(new Deluge.ux.preferences.Yarss2Page());
    }
});

Deluge.registerPlugin('YaRSS2', Deluge.plugins.Yarss2Plugin);
