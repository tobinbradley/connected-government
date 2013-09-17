_.templateSettings.variable = "rc";
var actions;

$(document).ready(function() {

    // Tooltips
    $('a[rel=popover]').popover({delay: { show: 250, hide: 100 }});

    // filtering
    $('.btn').on("click", function() {
        var data = actions;
        if ($(this).data("status")) {
            var status = $(this).data("status");
            data = _.filter(actions, function(action) { return action.Status.toUpperCase() === status; });
        }
        reports(data);
    });

    // Get JSON from Google Docs and do magic things
    $.ajax({
        url: 'get_actions_as_json.php',
        type: 'GET',
        dataType: 'json',
        cache: false,
        success: function (data) {
            var sdata = _(data).sortBy("Title");
            actions = sdata;
            reports(sdata);
        }
    });

});

// create reports
function reports(data) {
    $('.actions-col1, .actions-col2').empty();
    var split = Math.ceil(data.length / 2);
    _.each(data, function(item, i) {
        if (i < split) {
            report("action", item, ".actions-col1");
        }
        else {
            report("action", item, ".actions-col2");
        }
    });
}

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
        templateVersion: "98739",
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
