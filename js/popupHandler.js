"use strict"

$(window).on('load', initialize);

function initialize() {
    linkEventListeners();
    populateSessionDropdown();
}

function linkEventListeners() {
    $('#on-off-switch')[0].addEventListener('click', toggleOnOffListener);
}

function toggleOnOffListener(e) {
    browser.storage.local.set({'isOn':e.target.checked})
    setOnOff();
}

function setOnOff() {
    browser.storage.local.get('isOn').then((res) => {
        if (res.isOn) {
            $('#on-off-switch-label').text('On');
            $('#on-off-switch').attr('checked', true);
            $('#popup-main-interface').attr('hidden', false);
        } else {
            $('#on-off-switch-label').text('Off');
            $('#on-off-switch').attr('checked', false);
            $('#popup-main-interface').attr('hidden', true);
        }
    });
}

function populateSessionDropdown() {
    browser.storage.local.get('sessions', (res) => {
        if (typeof res.sessions === 'undefined' || res.sessions.length == 0) {
            let option = $('<option/>', {
                value:'Create a session...', 
                text:'Create a session...',
                disabled: true,
                selected: true,
                hidden: true,
            });
            $('#session-selector').append(option);
        } else {
            let placeholder = $('<option/>', {
                value:'Select a session...', 
                text:'Select a session...',
                disabled: true,
                selected: true,
                hidden: true,
            });
            $('#session-selector').append(option);
            for (let session in res.sessions) {
                let option = $('<option/>', {value:'session.label', text:'session.label'});
                $('#session-selector').append(option);
            }
        }
    });
} 

function switchSession(sessionTitle) {

}

function switchTab(tabTitle) {
    clearTabComponents();
    switch(tabTitle) {
        case 'Tabs': 
            populateTabsView();
            break;
        case 'Quotes':
            populateQuotesView() 
            break;
        case 'Citations':
            populateCitationsView()
            break;
        case 'Datasets':
            populateDatasetsView()
            break;
    }
}

function clearTabComponents() {
    $('#tabView').empty();
}

function populateTabsView() {

}

function populateQuotesView() {
    
}

function populateCitationsView() {
    
}

function populateDatasetsView() {
    
}