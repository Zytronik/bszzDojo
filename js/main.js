window.onload = function () {
    document.querySelectorAll('.tabs').forEach(function (tab) {
        tab.addEventListener('click', handleTabClick);
    });

    const searchContainer = document.querySelector('.search-container');
    if (searchContainer) {
        setupUserSearch();
    }

    initDatePickers();

    setupLightThemeSwitch();
}

window.addEventListener('resize', function () {

});

function initDatePickers() {
    const datePickers = document.querySelectorAll('.datePicker');
    datePickers.forEach(function (datePicker) {
        datePicker.valueAsDate = new Date();
        datePicker.max = new Date().toISOString().split('T')[0];
    });
}

function setupLightThemeSwitch() {
    const body = document.querySelector('body');
    const themeSwitch = document.getElementById('lightTheme');

    const lightThemeEnabled = getCookie('lightThemeEnabled');
    if (lightThemeEnabled === 'true') {
        if (themeSwitch) {
            themeSwitch.checked = true;
        }
        body.classList.add('light-theme');
    } else {
        if (themeSwitch) {
            themeSwitch.checked = false;
        }
        body.classList.remove('light-theme');
    }

    if (themeSwitch) {
        themeSwitch.addEventListener('change', function () {
            if (this.checked) {
                body.classList.add('light-theme');
                setCookie('lightThemeEnabled', 'true', 365);
            } else {
                body.classList.remove('light-theme');
                setCookie('lightThemeEnabled', 'false', 365);
            }
        });
    }
}

function handleTabClick(event) {
    let tab = event.target;
    let tabParent = tab.parentNode.parentNode;
    let tabId = tab.getAttribute('data-tab-id');
    let tabContent = document.getElementById(tabId);

    tabParent.querySelectorAll('.tab').forEach(function (tab) {
        tab.classList.remove('active');
    });

    tabParent.querySelectorAll('.tab-wrapper').forEach(function (tab) {
        tab.classList.remove('active');
    });

    tab.classList.add('active');
    tabContent.classList.add('active');
}

function setupUserSearch() {
    const userSearchInput = document.getElementById('user-search');
    const searchResultsDiv = document.getElementById('user-search-results');
    const searchOpenButton = document.querySelector('header nav li.search');
    const searchContainer = document.querySelector('.search-container');
    const closeSearchButton = document.querySelector('.search-wrapper i');

    searchOpenButton.addEventListener('click', function (event) {
        event.preventDefault();
        if (searchContainer.classList.contains('open')) {
            closeSearch();
        } else {
            openSearch();
        }
    });

    closeSearchButton.addEventListener('click', function (event) {
        event.preventDefault();
        closeSearch();
    });

    userSearchInput.addEventListener('input', function () {
        const query = userSearchInput.value;
        if (query.length > 0) {
            fetch('search.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({ query: query })
            })
                .then(response => response.text())
                .then(data => {
                    searchResultsDiv.innerHTML = data;
                });
        } else {
            searchResultsDiv.innerHTML = '';
        }
    });

    function openSearch() {
        searchContainer.classList.add('open');
        userSearchInput.focus();
    }

    function closeSearch() {
        searchContainer.classList.remove('open');
        userSearchInput.value = '';
    }
}

function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "expires=" + date.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
}

function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(nameEQ) === 0) {
            return c.substring(nameEQ.length, c.length);
        }
    }
    return null;
}

let deleteModal = document.getElementById("deleteModal");
if (deleteModal) {
    let confirmDeleteButton = deleteModal.querySelector("#confirmDelete");
    let cancelDeleteButton = deleteModal.querySelector("#cancelDelete");
    let closeButton = deleteModal.querySelector(".close");
    let deleteIcons = document.querySelectorAll(".delete-icon");

    closeButton.onclick = function () {
        deleteModal.classList.remove("open");
    }

    window.onclick = function (event) {
        if (event.target == deleteModal) {
            deleteModal.classList.remove("open");
        }
    }

    deleteIcons.forEach(icon => {
        icon.addEventListener("click", function () {
            let userId = this.getAttribute("data-user-id");
            confirmDeleteButton.setAttribute("data-user-id", userId);
            deleteModal.classList.add("open");
        });
    });

    confirmDeleteButton.addEventListener("click", function () {
        let userId = this.getAttribute("data-user-id");

        fetch(`deleteUser.php?id=${userId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    document.querySelector(`.user-record-wrapper[data-user-record-id="${userId}"]`).remove();
                    deleteModal.classList.remove("open");
                } else {
                    alert("Beim Löschen des Benutzers ist ein Fehler aufgetreten.");
                }
            })
            .catch(error => console.error('Error:', error));
    });

    cancelDeleteButton.onclick = function () {
        deleteModal.classList.remove("open");
    }
}