window.onload = function () {
    document.querySelectorAll('.tabs').forEach(function (tab) {
        tab.addEventListener('click', handleTabClick);
    });
}

window.addEventListener('resize', function () {

});

function handleTabClick(event) {
    var tab = event.target;
    var tabId = tab.getAttribute('data-tab-id');
    var tabContent = document.getElementById(tabId);

    document.querySelectorAll('.tab').forEach(function (tab) {
        tab.classList.remove('active');
    });

    document.querySelectorAll('.tab-wrapper').forEach(function (tab) {
        tab.classList.remove('active');
    });

    tab.classList.add('active');
    tabContent.classList.add('active');
}