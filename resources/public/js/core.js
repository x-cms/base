window.Xcms = {
    showNotice: function (messageType, message, messageHeader) {
        toastr.options = {
            closeButton: true,
            positionClass: 'toast-bottom-right',
            onclick: null,
            showDuration: 1000,
            hideDuration: 1000,
            timeOut: 10000,
            extendedTimeOut: 1000,
            showEasing: 'swing',
            hideEasing: 'linear',
            showMethod: 'fadeIn',
            hideMethod: 'fadeOut'

        };
        toastr[messageType](message, messageHeader);
    }
};

window.Helpers = {
    arrayGet: function (array, key, defaultValue = null) {
        let result;

        try {
            result = array[key];
        } catch (err) {
            return defaultValue;
        }

        if (result === null || typeof result == 'undefined') {
            result = defaultValue;
        }

        return result;
    },

    jsonEncode: function (object) {
        if (typeof object === 'undefined') {
            object = null;
        }
        return JSON.stringify(object);
    },

    jsonDecode: function (jsonString, defaultValue) {
        if (typeof jsonString === 'string') {
            let result;
            try {
                result = $.parseJSON(jsonString);
            } catch (err) {
                result = defaultValue;
            }
            return result;
        }
        return null;
    },

    asset: function (url) {
        if (url.substring(0, 2) == '//' || url.substring(0, 7) == 'http://' || url.substring(0, 8) == 'https://') {
            return url;
        }
        if (url.substring(0, 1) == '/') {
            return BASE_URL + url.substring(1);
        }
        return BASE_URL + url;
    }
}
