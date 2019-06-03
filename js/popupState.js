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

    async linkExtensionStateListeners() {
        // Extension state should be updated before storage is
        await browser.storage.onChanged.addListener( (changes, areaName) => {
            if (areaName == 'local') {
                for (let itemChanged of Object.keys(changes)) {
                    switch(itemChanged) {
                        case 'isOn':
                            this.setOnOff();
                        case 'sessions':
                            this.populateSessionDropdown();
                        case 'currentSession':
                            this.switchSession(changes[itemChanged].newValue);
                    }
                }
            }
        });
    }

    
    linkEventListeners() {
        $('#on-off-switch')[0].addEventListener('click', this.toggleOnOffListener.bind(this));
        $('#session-selector')[0].addEventListener('change', this.switchSessionListener.bind(this));
        $('#toggle-create-new-session-btn')[0].addEventListener('click', this.toggleSessionCreator.bind(this));
        $('#cancel-new-session-btn')[0].addEventListener('click', this.toggleSessionCreator.bind(this));
        $('#create-new-session-btn')[0].addEventListener('click', this.createNewSession.bind(this));
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
        if (this.extension.sessionsCache.has(name)) {
            $('#new-session-name-warning').attr('hidden', false);
        } else {
            this.extension.currentSession = name;
            this.extension.researchSessionManager.startNewResearchSession(name);
            this.toggleSessionCreator();
        }
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
                    this.switchSession(session.title)
                }
                $('#session-selector').append(option);
            }
        }
    } 
    
    switchSession(sessionTitle) {
        this.switchTab('Tabs');
    }
    
    switchTab(tabTitle) {
        this.clearTabComponents();
        $('session-tabs-section').attr('hidden', false);
        switch(tabTitle) {
            case 'Tabs': 
                this.populateTabGroupsView();
                break;
            case 'Quotes':
                this.populateQuotesView() 
                break;
            case 'Citations':
                this.populateCitationsView()
                break;
            case 'Datasets':
                this.populateDatasetsView()
                break;
        }
    }
    
    clearTabComponents() {
        $('#tab-view').empty();
    }
    
    /**
     * Populates the popup view with tab groups
     */
    populateTabGroupsView() {
        let session = this.extension.sessionsCache.get(this.extension.currentSession);
        var tabSessionsList = $('<ul></ul>');
        for (let i = 0; i < tabSessionsList.length; i++) {
            let tabSession = tabSessionsList[i];
            tabSessionsList.add($('<li></li>', {
                value: i,
                text: tabSession.title
            }));
        }
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