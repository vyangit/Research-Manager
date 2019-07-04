"use strict"

$(window).on('load', () => {var popupState = new PopupState();});

class PopupState {
    constructor() {
        console.log("Hello popup state");
        this.extension;

        this.loadExtension = this.loadExtension.bind(this);
        this.linkExtensionStateListeners = this.linkExtensionStateListeners.bind(this);
        this.initialize()
    }

    initialize() {
        this.loadExtension().then(() => {
            this.linkEventListeners();
            this.setOnOff();
            this.populateSessionDropdown();
        });
    }

    async loadExtension() {
        let background = await browser.runtime.getBackgroundPage();
        this.extension = background.extensionState;
        
        await this.linkExtensionStateListeners();
    }

    /** 
     * Links event listeners to the extension storage
    */ 
    async linkExtensionStateListeners() {
        // Extension state should be updated before storage is
        await browser.storage.onChanged.addListener( (changes, areaName) => {
            if (areaName == 'local') {
                for (let itemChanged of Object.keys(changes)) {
                    if (changes[itemChanged].oldValue === changes[itemChanged].newValue){
                        continue;
                    }
                    
                    switch(itemChanged) {
                        case 'isOn':
                            this.setOnOff();
                            break;
                        case 'sessions':
                            this.populateSessionDropdown();
                            break;
                        case 'currentSession':
                            this.resetSessionView();
                            break;
                    }
                }
            }
        });
    }

    setOnOff() {
        if (this.extension.isOn) {
            $('#on-off-switch-label').text('On');
            $('#on-off-switch').attr('checked', true);
            $('#popup-interface-wrapper').attr('hidden', false);
        } else {
            $('#on-off-switch-label').text('Off');
            $('#on-off-switch').attr('checked', false);
            $('#popup-interface-wrapper').attr('hidden', true);
        }
    }
    
    populateSessionDropdown() {
        $('#session-selector').empty();
        if (this.extension.sessionsCache.size == 0) {
            let option = $('<option/>', {
                value:'Create a session...', 
                text:'Create a session...',
                disabled: true,
                selected: true,
                hidden: true,
            });
            $('#session-selector').append(option);
        } else {
            if (this.extension.currentSession === '') {
                let placeholder = $('<option/>', {
                    value:'Select a session...', 
                    text:'Select a session...',
                    disabled: true,
                    selected: true,
                    hidden: true,
                });
                $('#session-selector').append(placeholder);
            }

            for (let session of this.extension.sessionsCache.values()) {
                let option = $('<option/>', {
                    value:session.title, 
                    text:session.title
                });
                if (session.title == this.extension.currentSession) {
                    option.attr('selected', true);
                    this.resetSessionView();
                }
                $('#session-selector').append(option);
            }
        }
    } 
    
    resetSessionView() {
        let sessionTitle = this.extension.currentSession;
        if (sessionTitle === '' || sessionTitle === undefined) {  
            $('#session-tabs-section').attr('hidden', true);
        } else {        
            $('#session-tabs-section').attr('hidden', false);
            this.switchTab('Tabs');
        }
    }
    
    /** 
     * Links pop up event listeners
    */
     linkEventListeners() {
        $(document).on('click',this.resetWindow.bind(this));
        $('#on-off-switch')[0].addEventListener('click', this.toggleOnOffListener.bind(this));
        $('#session-selector')[0].addEventListener('change', this.switchSessionListener.bind(this));
        $('#toggle-create-new-session-btn')[0].addEventListener('click', this.toggleSessionCreator.bind(this));
        $('#cancel-new-session-btn')[0].addEventListener('click', this.toggleSessionCreator.bind(this));
        $('#create-new-session-btn')[0].addEventListener('click', this.createNewSession.bind(this));
        $('.tab-item').on('click', this.setTab.bind(this));
    }
    
    resetWindow() {
        this.clearGlobalWarnings();
    }
    
    clearGlobalWarnings() {
        $('.global-warning').attr('hidden', true);
    }

    toggleOnOffListener(e) {
        this.extension.isOn = e.target.checked;
        this.extension.saveStorageChanges();
    }

    switchSessionListener(e) {
        this.extension.currentSession = e.target.value;
        this.extension.saveStorageChanges();
    }

    toggleSessionCreator() {
        $('#new-session-name-text-input').val('');
        $('#popup-main-interface').attr('hidden', !$('#popup-main-interface').attr('hidden'));
        $('#session-creator').attr('hidden', !$('#session-creator').attr('hidden'));
    }

    createNewSession() {
        let name = $('#new-session-name-text-input').val();
        $('.session-name-input-warning').attr('hidden', true);

        if (name === '') {
            $('#new-session-empty-name-warning').attr('hidden', false);
            $('#new-session-name-text-input').focus();
        } else if (this.extension.sessionsCache.has(name)) {
            $('#new-session-name-warning').attr('hidden', false);
            $('#new-session-name-text-input').focus();
        } else {
            this.extension.currentSession = name;
            this.extension.researchSessionManager.startNewResearchSession(name);
            this.toggleSessionCreator();
        }
    }

    setTab(e) {
        this.switchTab(e.target.text);
    }
    
    switchTab(tabTitle) {
        this.clearTabComponents();
        $('session-tabs-section').attr('hidden', false);

        $('.tab-item').removeClass('active');

        switch(tabTitle) {
            case 'Tabs': 
                $('#tab-item-tabs').addClass('active');
                this.populateTabGroupsView();
                break;
            case 'Quotes':
                $('#tab-item-quotes').addClass('active');
                this.populateQuotesView() 
                break;
            case 'Citations':
                $('#tab-item-citations').addClass('active');
                this.populateCitationsView()
                break;
            case 'Datasets':
                $('#tab-item-datasets').addClass('active');
                this.populateDatasetsView()
                break;
        }
    }
    
    clearTabComponents() {
        $('#popup-tab-content').empty();
    }
    
    /**
     * Populates the popup view with tab groups
     */
    populateTabGroupsView() {
        let session = this.extension.sessionsCache.get(this.extension.currentSession);
        var tabGroupsView = $('<div></div>',{
            class: "mx-auto"
        });
        var tabGroups = session.tabGroups;

        // Add list view of tab groups already created
        let tabGroupsList = $('<div></div>', {
            id: 'tab-groups-view'
        })
        for (let i = 0; i < tabGroups.length; i++) {
            let tabGroup = tabGroups[i];
            let tabGroupName = tabGroup.name == '' ? '': ' - ' + tabGroup.name;
            tabGroupName = tabGroup.tabs.length + ' tabs' + tabGroupName;
            tabGroupsList.append($('<div></div>',{
                class: 'd-flex flex-row align-items-baseline justify-content-between m-2'
            }).append(
                $('<button></button>', {
                    class: 'btn btn-link',
                    value: i,
                    text: tabGroupName,
                    click: this.extension.researchSessionManager.launchTabGroupFromSession.bind(this, this.extension.currentSession, i)
                }),
                $('<button></button>',{
                    class: 'btn btn-danger',
                    text: 'Delete',
                    click: this.extension.researchSessionManager.deleteTabGroupFromSession.bind(this, this.extension.currentSession, i)
                })
            ));
        } 

        // Add input to add new tab groups
        var addNewTabGroupInput = $('<div></div>', {
            class: "input-group mb-3"
        }).append(
            $('<input></input>', {
                id: "tab-group-name-text-input",
                class: "form-control",
                type: "text",
                maxlength: 10,
                placeholder: '(Optional) Tab Group Name',
            }), 
            $('<div></div>', {
                class: "input-group-append"
            }).append(
                $('<button></button>', {
                    class: "btn btn-primary",
                    click: this.createNewTabGroup.bind(this),
                    text: "Create tab group",
                    type: "button"
                })
            )
        );

        tabGroupsView.append(tabGroupsList);
        tabGroupsView.append(addNewTabGroupInput);
        $('#popup-tab-content').append(tabGroupsView);
    }

    createNewTabGroup() {
        let name = $('#tab-group-name-text-input').val();
        let sessionTitle = this.extension.currentSession;
        let tabsQuery = browser.tabs.query({
            currentWindow: true
        });

        tabsQuery.then((tabs) => {
            let omittedTabs = this.extension.researchSessionManager.addNewTabGroupToSession(name, sessionTitle, tabs);
            if (omittedTabs.length != 0) {
                this.displayOmittedTabsMessage(omittedTabs)
            };
            this.resetSessionView();
        });
    }
    
    displayOmittedTabsMessage(omittedTabs) {
        this.clearGlobalWarnings();
        
        $('#omitted-tabs-list').empty();
        for (let omittedTab of omittedTabs) {
            let text = omittedTab.url + ' - ' + omittedTab.title;
            $('#omitted-tabs-list').append($('<div></div>',{
                text: text
            }))
        }

        $('#omitted-tabs-warning').attr('hidden', false);        
    }

    populateQuotesView() {
        let session = this.extension.sessionsCache.get(this.extension.currentSession);
    }
    
    populateCitationsView() {
        let session = this.extension.sessionsCache.get(this.extension.currentSession);
    }
    
    populateDatasetsView() {
        
    }
}