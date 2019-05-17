"use strict"
$(window).on('load', initialize);

var sessionsCache; 
var currentSession;

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
    browser.storage.local.set({'isOn':e.target.checked}, () => {setOnOff()});
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
    if (sessionsCache.size == 0) {
        let option = $('<option/>', {
            value:'Create a session...', 
            text:'Create a session...',
            disabled: true,
            selected: true,
            hidden: true,
        });
        $('#session-selector').append(option);
    } else {
        if (currentSession === '') {
            let placeholder = $('<option/>', {
                value:'Select a session...', 
                text:'Select a session...',
                disabled: true,
                selected: true,
                hidden: true,
            });
        }
        $('#session-selector').append(option);
        for (let session in sessionsCache.values()) {
            let option = $('<option/>', {
                value:'session.title', 
                text:'session.title'
            });
            if (session.title == currentSession) {
                option.attr('selected', true);
            }
            $('#session-selector').append(option);
        }
    }
} 

function switchSessionListener(e) {
    browser.storage.local.set({'currentSession': sessionTitle}, () => {switchSession(e.target.value)});
}

function switchSession(sessionTitle) {
    switchTab('Tabs');
}

function switchTab(tabTitle) {
    clearTabComponents();
    switch(tabTitle) {
        case 'Tabs': 
            populateTabGroupsView();
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

/**
 * Populates the popup view with tab groups
 */
function populateTabGroupsView() {
    let session = sessionsCache.get(currentSession);
    var tabSessionsList = $('<ul></ul>');
    for (let i = 0; i < tabSessionsList.length; i++) {
        let tabSession = tabSessionsList[i];
        tabSessionsList.add($('<li></li>', {
            value: i,
            text: tabSession.title
        }));
    }
}

function populateQuotesView() {
    let session = sessionsCache.get(currentSession);
}

function populateCitationsView() {
    let session = sessionsCache.get(currentSession);
}

function populateDatasetsView() {
    
}