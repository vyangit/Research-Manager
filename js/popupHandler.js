$(window).on('load', initialize);

function initialize() {
    $('#on-off-switch')[0].addEventListener('click', toggleOnOff);
    populateSessionDropdown();
}

function populateSessionDropdown() {
    var sessions = window.localStorage.getItem("sessions");

    var option = $('<option/>', {value:'hi', text:'hi'});
    $('#session-selector').append(option);
} 

function toggleOnOff(e) {
    if ($('#on-off-switch-label').text() == 'On') {
        $('#on-off-switch-label').text('Off');
        $('#popup-main-interface').attr('hidden', true);
    } else {
        $('#on-off-switch-label').text('On');
        $('#popup-main-interface').show();
        $('#popup-main-interface').removeAttr('hidden');
    }
}

function switchSession(sessionTitle) {

}

function switchTab(tabTitle) {
    clearTabComponents();
    switch(tabTitle) {
        case 'Tabs': 
            break;
        case 'Quotes':
            break;
        case 'Citations':
            break;
        case 'Datasets':
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