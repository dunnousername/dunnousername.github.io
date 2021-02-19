(function (script) {
    function storageAvailable() {
        try {
            var x = '__storage_test__'
            localStorage.setItem(x, x);
            localStorage.removeItem(x, x);
            return true;
        } catch (e) {
            return e instanceof DOMException && (
                e.code === 22 ||
                e.code === 1014 ||
                e.name === 'QuotaExceededError' ||
                e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
                (localStorage && storage.length !== 0);
        }
    }

    $(document).ready(function(){
        $('#settings-anchor').attr('href', '../settings/settings').text('This applet uses site-wide advanced settings, which can be configured here.');
        
        settings = {
            'nsfw': false
        }

        if (storageAvailable()) {
            for (const key of Object.keys(settings)) {
                if (localStorage.getItem(key) === null) {
                    localStorage.setItem(key, settings[key] ? 'true' : 'false');
                } else {
                    settings[key] = localStorage.getItem(key) == 'true';
                }

                $('.settings-checkbox[data-settings=\'' + key + '\']').attr('checked', settings[key]).change(function() {
                    settings[key] = this.checked;
                    localStorage.setItem(key, settings[key] ? 'true' : 'false');
                });

                if (settings[key]) {
                    $('[data-settings-disallow-' + key + ']').remove();
                } else {
                    $('[data-settings-requires-' + key + ']').remove();
                }
            }
        } else {
            $('.settings-checkbox').attr('disabled', true);
        }

        window.settings = settings;
    })
})(document.currentScript);