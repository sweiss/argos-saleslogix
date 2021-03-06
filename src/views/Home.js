/// <reference path="../../../../argos-sdk/libraries/ext/ext-core-debug.js"/>
/// <reference path="../../../../argos-sdk/libraries/sdata/sdata-client-debug"/>
/// <reference path="../../../../argos-sdk/libraries/Simplate.js"/>
/// <reference path="../../../../argos-sdk/src/View.js"/>
/// <reference path="../../../../argos-sdk/src/List.js"/>

Ext.namespace("Mobile.SalesLogix");

Mobile.SalesLogix.Home = Ext.extend(Sage.Platform.Mobile.List, {
    //Templates
    contentTemplate: new Simplate([
        '<h3>',
        '{% if ($.icon) { %}',
        '<img src="{%: $.icon %}" alt="icon" class="icon" />',
        '{% } %}',
        '{%: $.title %}',
        '</h3>'
    ]),

    //Localization
    configureText: 'Configure',
    titleText: 'Home',

    //View Properties
    id: 'home',
    expose: false,
    activateEntry: function(params) {
        if (params.key)
        {
            var view = App.getView(params.key);
            if (view)
                view.show();
        }
    },
    formatSearchQuery: function(query) {
        var expression = new RegExp(query, 'i');

        return function(entry) {
            return expression.test(entry.title);
        };
    },
    hasMoreData: function() {
        return false;
    },
    requestData: function() {
        var visible = App.preferences && App.preferences.home && App.preferences.home.visible,
            list = [],
            view,
            entry;

        for (var i = 0; i < visible.length; i++)
        {
            view = App.getView(visible[i]);

            if (view)
            {
                entry = {
                    '$key': view.id,
                    'icon': view.icon,
                    'title': view.titleText
                };

                if (typeof this.query !== 'function' || this.query(entry)) list.push(entry);
            }
        }

        this.processFeed({'$resources': list});
    },
    init: function() {
        Mobile.SalesLogix.Home.superclass.init.apply(this, arguments);

        App.on('registered', this.onRegistered, this);

        this.contentEl.on('longpress', function(evt, el, o){
            el = Ext.get(el);
            if (!el.is('li')) el = el.findParent('li');
            if (el && el.getAttribute('data-key') == 'contact_list')
            {
                App.getView('add_account_contact').show({
                    insert:true
                });
            }
        });

        this.tools.tbar = [{
            name: 'configure',
            title: this.configureText,
            cls: 'button',
            fn: this.navigateToConfigurationView,
            scope: this
        }];
    },
    navigateToConfigurationView: function() {
        App.getView('configure').show();
    },
    onRegistered: function() {
        this.refreshRequired = true;
    },    
    refreshRequiredFor: function(options) {
        var visible = App.preferences && App.preferences.home && App.preferences.home.visible,
            shown = this.feed && this.feed['$resources'];

        if (!visible || !shown || visible.length != shown.length) return true;

        return Mobile.SalesLogix.Home.superclass.refreshRequiredFor.apply(this, arguments);
    }
});