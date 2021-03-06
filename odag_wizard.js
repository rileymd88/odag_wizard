var rootPath = window.location.hostname;
var portUrl = "80";
var newAppId;
var selectionAppName;
var clipboard = new Clipboard('#CopyCode');
var dataSource;
var dataSourceFolder;

if (window.location.port == "") {
    if ("https:" == window.location.protocol)
        portUrl = "443";
    else {
        portUrl = "80";
    }
}
else
    portUrl = window.location.port;

var pathRoot = "//localhost:4848/extensions/";
if (portUrl != "4848")
    pathRoot = "//" + rootPath + ":" + portUrl + "/resources/";

var config = {
    host: window.location.hostname,
    prefix: "/",
    port: window.location.port,
    isSecure: window.location.protocol === "https:"
};

var mainConfig;

$.ajax({
    url: "./config/config.json",
    success: function (data) {
        mainConfig = data;
    }
})

require.config({
    baseUrl: (config.isSecure ? "https://" : "http://") + config.host + (config.port ? ":" + config.port : "") + config.prefix + "resources",
    paths: { app: (config.isSecure ? "https://" : "http://") + config.host + (config.port ? ":" + config.port : "") }
});

require([
    "js/qlik",
    "jquery",
    "odag_wizard/js/bootstrap.min",
    "odag_wizard/js/bootstrap-select.min",
    "odag_wizard/js/qvhighlight/highlight.pack",
    "odag_wizard/js/qvhighlight/highlightjs-line-numbers.min"
],

    function (qlik, $, selectpicker) {


        var global = qlik.getGlobal(config);            //Get Global Context
        var app;                                        //Keeps App Context
        var vselapp;                                    //Keeps selected app
        var vRowNum = 1;                                //Keeps Amount of rows for Fieldselections
        // Initiate select pickers
        $('#selectApp').selectpicker({
            style: 'btn-default',
            size: 10
        });
        $('#selectDataSource').selectpicker({
            style: 'btn-default',
            size: 10
        });


        // Make connection to Enigma and watch for scope changes
        var scope = $('body').scope();
        scopeEnigma = null;
        scope.$watch(function () { return global.session.__enigmaApp }, function (newValue, oldValue) {
            if (newValue) {
                scopeEnigma = newValue;
                scopeEnigma.getDocList().then(function (list) {
                    //write Apps in Listbox  
                    $.each(list, function (key, value) {
                        $("#selectApp").append("<option value='" + value.qDocId + "'>" + value.qDocName + "</option>");
                    });
                    $('#selectApp').selectpicker('refresh');
                    //write data Sources in Listbox
                    $.each(mainConfig.config.dataSources, function (key, value) {
                        $("#selectDataSource").append("<option value='" + value.dataSourceId + "'>" + value.dataSourceName + "</option>");
                    })
                    $("#selectDataSource").selectpicker('refresh');
                });
            }
        });
        //Select app
        $('#selectApp').on('changed.bs.select', function () {
            vselapp = $(this).val();
            selectionAppName = $('#selectApp :selected').text();
            console.log(selectionAppName);
            app = qlik.openApp(vselapp, config);
            vRowNum = 1;
            //Create first Row
            var newrowcontent = '';
            var newrowcontent = '';
            newrowcontent = '<tr class="contentRow" id=SelField_row_' + vRowNum + '><td id="SelField_row_Field' + vRowNum + '_Field"><select class="selectpicker" id="selectField_' + vRowNum + '" data-live-search="true" data-title="nothing selected" data-size="false"></select></td>';
            newrowcontent += '<td id="SelField_row_' + vRowNum + '_Option"><select id="Option_' + vRowNum + '" class="selectpicker"><option value="ods">Selected (green) values</option><option value="odo">Optional (white) values</option><option value="odso">Selected or optional values</option></select></td>';
            newrowcontent += ' <td id="SelField_row_' + vRowNum + '_Type"><select id="Type_' + vRowNum + '" class="selectpicker"><option value="String">String</option><option value="Date">Date</option></select></td>';
            newrowcontent += '<td><div class="add_left"><a><span id="SelField_row_' + vRowNum + '_Add" class=" lui-icon lui-icon--plus"></span></a></div><div class="add_right"><a><span id="SelField_row_' + vRowNum + '_Delete" class="lui-icon lui-icon--minus"></span></a></div></td></tr>';
            $('#tablecontent').empty();
            $('#tablecontent').append(newrowcontent);
            createRow(vRowNum);
        });
        // Select data source
        $('#selectDataSource').on('changed.bs.select', function (selectDataSource) {
            return new Promise(function (resolve, reject) {
                resolve($('#selectDataSource').val());
            }).then(function (ds) {
                // Set sub folder location based on data source
                dataSource = ds;
                dataSourceListLength = mainConfig.config.dataSources.length;
                for(i=0;i<dataSourceListLength;i++) {
                    if(mainConfig.config.dataSources[i].dataSourceId == ds) {
                        dataSourceFolder = mainConfig.config.dataSources[i].dataSourceName
                    }
                }
            })
        });

        //Create a new Row and run selectpicker
        function createRow(Rownum) {
            app.getList("FieldList", function (reply) {
                $.each(reply.qFieldList.qItems, function (index, value) {
                    $("#selectField_" + Rownum).append("<option value='" + value.qName + "'>" + value.qName + "</option>");
                });
                $('#selectField_' + Rownum).selectpicker({
                    style: 'btn-default',
                    size: 10
                });
                $('#Option_' + Rownum).selectpicker({
                    style: 'btn-default',
                    size: 10
                });
                $('#Type_' + Rownum).selectpicker({
                    style: 'btn-default',
                    size: 10
                });
                vRowNum++;
            });
        };

        //Add another Row
        $("body").delegate('.add_left', 'click', function () {
            var newrowcontent = '';
            newrowcontent = '<tr class="contentRow" id=SelField_row_' + vRowNum + '><td id="SelField_row_Field' + vRowNum + '_Field"><select class="selectpicker" id="selectField_' + vRowNum + '" data-live-search="true" data-title="nothing selected" data-size="false"></select></td>';
            newrowcontent += '<td id="SelField_row_' + vRowNum + '_Option"><select id="Option_' + vRowNum + '" class="selectpicker"><option value="ods">Selected (green) values</option><option value="odo">Optional (white) values</option><option value="odso">Selected or optional values</option></select></td>';
            newrowcontent += '<td id="SelField_row_' + vRowNum + '_Type"><select id="Type_' + vRowNum + '" class="selectpicker"><option value="String">String</option><option value="Date">Date</option></select></td>';
            newrowcontent += '<td><div class="add_left"><a><span id="SelField_row_' + vRowNum + '_Add" class=" lui-icon lui-icon--plus"></span></a></div><div class="add_right"><a><span id="SelField_row_' + vRowNum + '_Delete" class="lui-icon lui-icon--minus"></span></a></div></td></tr>';
            $(newrowcontent).insertAfter('#' + $(this).closest("tr").attr('id'));
            createRow(vRowNum);
        });

        //Remove a Row
        $("body").delegate('.add_right', 'click', function () {
            $('#' + $(this).closest("tr").attr('id')).remove();
            //Count # rows
            vRowNum = vRowNum - 1;
        });
        // Create script and app when Create App button is clicked
        //$("#ApplySelectedTable").click(function () {  $('#startModal').modal('show'); });

        $("#ApplySelectedTable").click(function () {
            createScript().then(function (script) {
                createApp(script).then(function (app) {
                    newAppId = app.qAppId;
                    $('#startModal').modal('show');
                })
            })
        });
        // On click of Show Script button
        $('#showScriptButton').on('click', function () {
            createScript().then(function (script) {
                $('#code').empty();
                $('#code').append(script);
                $('#scriptModal').modal('show');
                hljs.initHighlighting();
                hljs.initLineNumbersOnLoad();
                //hljs.highlight();
            })
        })
    });


function createScript() {
    var odagQuoteWrapping = 0;
    var rows = [];
    var odagBindingScripts = [];
    var extendWhereList = "";
    var extendWhereScript = "";
    var extendWhereDatesList = "";
    var extendWhereDatesScript = "";
    var defaultSubs = "";
    var traceScript = "";
    var script = "";
    return new Promise(function (resolve, reject) {
        return new Promise(function (resolve, reject) {
            rows = [];
            $('.contentRow').each(function (i, n) {
                var $row = $(n);
                id = i + 1;
                rows.push({
                    Field: $row.find(`#selectField_${id}`).val(),
                    Option: $row.find(`#Option_${id}`).val(),
                    Type: $row.find(`#Type_${id}`).val()
                });
            })
            resolve(rows);
        }).then((function () {
            // Get default ODAG Binding script
            $.ajax({
                url: "./config/OdagBinding.txt",
                success: function (data) {
                }
            }).then(function (data) {
                odagBindingScript = data;
                // loop through rows selected and create ODAG Bindings
                for (var i = 0; i < rows.length; i++) {
                    if (rows[i].Field != "nothing selected") {
                        trimmedField = rows[i].Field.replace(/[^a-z0-9]/ig, '');
                        tmpScript = odagBindingScript.replace(/Trimmed/g, trimmedField);
                        tmpScriptOne = tmpScript.replace(/OdagField/g, rows[i].Field);
                        tmpScriptTwo = tmpScriptOne.replace(/OptionField/g, rows[i].Option);
                        finalScript = tmpScriptTwo.replace(/OdagQuoteWrapping/g, 0);
                        odagBindingScripts.push(finalScript);
                    }
                }
            }).then(function () {
                // Get default ExtendWhere script
                $.ajax({
                    url: "./config/ExtendWhere.txt",
                    success: function (data) {
                    }
                }).then(function (data) {
                    extendWhereScript = data;
                    // loop through rows selected and create ExtendWhere script
                    return new Promise(function (resolve, reject) {
                        for (var i = 0; i < rows.length; i++) {
                            if (rows[i].Type === "String" && rows[i].Field != "nothing selected") {
                                extendWhereList += "'" + rows[i].Field.replace(/[^a-z0-9]/ig, '') + "',";
                            }
                        }
                        resolve(extendWhereList.slice(",", -1));
                    }).then(function (data) {
                        extendWhereList = data;
                        return new Promise(function (resolve, reject) {
                            if (extendWhereList.valueOf() == "") {
                                resolve("");
                            }
                            else {
                                resolve(extendWhereScript.replace("ExtendWhereList", extendWhereList));
                            }
                        }).then(function (data) {
                            extendWhereScript = data;
                            // GET default ExtendWhereDates script
                            $.ajax({
                                url: "./config/ExtendWhereDates.txt",
                                success: function (data) {
                                }
                            }).then(function (data) {
                                extendWhereDatesScript = data;
                                // loop through rows selected and create ExtendWhereDates script
                                return new Promise(function (resolve, reject) {
                                    for (var i = 0; i < rows.length; i++) {
                                        if (rows[i].Type === "Date" && rows[i].Field != "nothing selected") {
                                            extendWhereDatesList += "'" + rows[i].Field.replace(/[^a-z0-9]/ig, '') + "',";
                                        }
                                    }
                                    resolve(extendWhereDatesList.slice(",", -1));
                                }).then(function (data) {
                                    extendWhereDatesList = data;
                                    return new Promise(function (resolve, reject) {
                                        if (extendWhereDatesList.valueOf() == "") {
                                            resolve("");
                                        }
                                        else {
                                            resolve(extendWhereDatesScript.replace("ExtendWhereDatesList", extendWhereDatesList));
                                        }
                                    }).then(function (data) {
                                        extendWhereDatesScript = data;
                                        // Begin work to put script together
                                        script += "///$tab Main\r\n";
                                        script += "SET ThousandSep=',';\n";
                                        script += "SET DecimalSep='.';\n";
                                        script += "SET MoneyThousandSep=',';\n";
                                        script += "SET MoneyDecimalSep='.';\n";
                                        script += "SET MoneyFormat='#.##0,00 €;-#.##0,00 €';\n";
                                        script += "SET TimeFormat='hh:mm:ss';\n";
                                        script += "SET DateFormat='DD.MM.YYYY';\n";
                                        script += "SET TimestampFormat='DD.MM.YYYY hh:mm:ss[.fff]';\n";
                                        script += "SET MonthNames='Jan;Feb;Mrz;Apr;Mai;Jun;Jul;Aug;Sep;Okt;Nov;Dez';\n";
                                        script += "SET DayNames='Mo;Di;Mi;Do;Fr;Sa;So';\n";
                                        script += "SET LongMonthNames='Januar;Februar;März;April;Mai;Juni;Juli;August;September;Oktober;November;Dezember';\n";
                                        script += "SET LongDayNames='Montag;Dienstag;Mittwoch;Donnerstag;Freitag;Samstag;Sonntag';\n";
                                        script += "SET FirstWeekDay=0;\n";
                                        script += "SET BrokenWeeks=0;\n";
                                        script += "SET ReferenceDay=4;\n";
                                        script += "SET FirstMonthOfYear=1;\n";
                                        script += "SET CollationLocale='de-DE';\n";
                                        script += "///$tab ODAG Section\r\n";
                                        // Get default sub data and add to script
                                        $.ajax({
                                            url: "./config/" + dataSourceFolder + "/Subs.txt",
                                            success: function (data) {
                                            }
                                        }).then(function (data) {
                                            defaultSubs = data;
                                            return script += defaultSubs;
                                        }).then(function () {
                                            return script += "SET WHERE_PART = '';" + "\n" + "\n";
                                        }).then(function () {
                                            for (i = 0; i < odagBindingScripts.length; i++) {
                                                script += odagBindingScripts[i];
                                            }
                                            return script += extendWhereScript + extendWhereDatesScript;
                                        }).then(function () {
                                            // Get default trace data and add to script
                                            $.ajax({
                                                url: "./config/" + dataSourceFolder + "/Trace.txt",
                                                success: function (data) {
                                                }
                                            }).then(function (data) {
                                                traceScript = data;
                                                return script += traceScript;
                                            }).then(function () {
                                                resolve(script);
                                            }).catch(function (error) {
                                                console.error('Error' + error);
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        }));
    });
}

function createApp(script) {
    var app;
    return new Promise(function (resolve, reject) {
        scopeEnigma.createApp(`${selectionAppName}_Template`).then(function (newApp) {
            newAppId = newApp.qAppId;
            scopeEnigma.openDoc(newApp.qAppId).then(function (conns) {
                app = conns;
                return app.setScript(script);
            }).then(function () {
                return app.doSave();
            }).then(function () {
                return $("#openAppButton").attr('onclick', 'location.href= ' + '"' + 'https://' + window.location.hostname + '/dataloadeditor/app/' + newAppId + '"');
            }).then(function (e) {
                resolve(app);
            });
        })
    })
}


