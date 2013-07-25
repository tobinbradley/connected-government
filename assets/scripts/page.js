_.templateSettings.variable = "rc";

$(document).ready(function() {

    // filtering
    $('.btn').on("click", function() {
        if ($(this).hasClass("btn-complete")) {
            $('.pending, .started').hide();
            $('.complete').show();
        }
        else if ($(this).hasClass("btn-started")) {
            $('.pending, .complete').hide();
            $('.started').show();
        }
        else {
            $('.pending, .complete, .started').show();
        }
    });


    // Get JSON from Google Docs and do magic things
    $.ajax({
        url: 'get_actions_as_json.php',
        type: 'GET',
        dataType: 'json',
        cache: false,
        success: function (data) {
            var split = Math.ceil(data.length / 2);
            $.each(data, function(i, item) {
                if (i < split) {
                    report("action", item, ".actions-col1");
                }
                else {
                    report("action", item, ".actions-col2");
                }
            });
        }
    });

});

// Display detailed information
function report(q, data, element) {
    templateLoader.loadRemoteTemplate(q, "templates/" + q + ".html", function (tmpl) {
        var compiled = _.template(tmpl);
        $(element).append(compiled(data));
    });
}

// Status tag
function getTag(tag) {
    var theTag = tag.toUpperCase();
    if (theTag === "STARTED") {
        return "started";
    }
    else if (theTag === "COMPLETE") {
        return "complete";
    }
    else {
        return "pending";
    }
}

// Fix trim() being unsupported in IE8. Damn you IE8.
if (typeof String.prototype.trim !== 'function') {
    String.prototype.trim = function () {
        return this.replace(/^\s+|\s+$/g, '');
    };
}


// underscore template loader
// https://github.com/Gazler/Underscore-Template-Loader
(function () {
    var templateLoader = {
        templateVersion: "5484",
        templateName: "cgplan-",
        templates: {},
        loadRemoteTemplate: function (templateName, filename, callback) {
            if (!this.templates[templateName]) {
                var self = this;
                jQuery.get(filename + "?v=" + this.templateVersion, function (data) {
                    self.addTemplate(templateName, data);
                    self.saveLocalTemplates();
                    callback(data);
                });
            } else {
                callback(this.templates[templateName]);
            }
        },
        addTemplate: function (templateName, data) {
            this.templates[templateName] = data;
        },
        localStorageAvailable: function () {
            try {
                return 'localStorage' in window && window['localStorage'] !== null;
            } catch (e) {
                return false;
            }
        },
        saveLocalTemplates: function () {
            if (this.localStorageAvailable) {
                localStorage.setItem(this.templateName + "templates", JSON.stringify(this.templates));
                localStorage.setItem(this.templateName + "templateVersion", this.templateVersion);
            }
        },
        loadLocalTemplates: function () {
            if (this.localStorageAvailable) {
                var templateVersion = localStorage.getItem(this.templateName + "templateVersion");
                if (templateVersion && templateVersion === this.templateVersion) {
                    var templates = localStorage.getItem(this.templateName + "templates");
                    if (templates) {
                        templates = JSON.parse(templates);
                        for (var x in templates) {
                            if (!this.templates[x]) {
                                this.addTemplate(x, templates[x]);
                            }
                        }
                    }
                } else {
                    localStorage.removeItem(this.templateName + "templates");
                    localStorage.removeItem(this.templateName + "templateVersion");
                }
            }
        }
    };
    templateLoader.loadLocalTemplates();
    window.templateLoader = templateLoader;
})();
