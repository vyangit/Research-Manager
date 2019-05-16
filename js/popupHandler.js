"use strict"

$(window).on('load', initialize);

function initialize() {
    linkEventListeners();
    setOnOff();
    populateSessionDropdown();
}

function linkEventListeners() {
    $('#on-off-switch')[0].addEventListener('click', toggleOnOffListener);
    $('#session-selector')[0].addEventListener('change', switchSessionListener);
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
                let option = $('<option/>', {
                    value:'session.label', 
                    text:'session.label'
                });
                $('#session-selector').append(option);
            }
        }
    });
} 

function switchSessionListener(e) {
    switchSession(e.target.value);
}

function switchSession(sessionTitle) {
    console.log(sessionTitle);
    //TODO
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