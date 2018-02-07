var rootPath = window.location.hostname;
var portUrl = "80";

var odagQuoteWrapping;
var rows = [];
var odagBindingScripts = [];
var extendWhereList = "";
var extendWhereScript;
var extendWhereDatesList = "";
var extendWhereDatesScript;

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




console.log('running');
require.config({
    baseUrl: (config.isSecure ? "https://" : "http://") + config.host + (config.port ? ":" + config.port : "") + config.prefix + "resources",
    paths: { app: (config.isSecure ? "https://" : "http://") + config.host + (config.port ? ":" + config.port : "") }
});

require([
    "js/qlik",
    "jquery",
    "odag_wizard/js/bootstrap.min",
    "odag_wizard/js/bootstrap-select.min"
],

    function (qlik, $, selectpicker) {

        var global = qlik.getGlobal(config);            //Get Global Context
        var app;                                        //Keeps App Context
        var vselapp;                                    //Keeps selected app
        var vRowNum = 1;                                //Keeps Amount of rows for Fieldselections

        //write Apps in Listbox       
        global.getAppList(function (list) {
            $.each(list, function (key, value) {
                $("#selectApp").append("<option value='" + value.qDocId + "'>" + value.qDocName + "</option>");
            });
            $('#selectApp').selectpicker({
                style: 'btn-default',
                size: 10
            });
        });

        //Select Event for selectApp
        $('#selectApp').on('changed.bs.select', function () {
            vselapp = $(this).val();
            console.log('selected app id:', vselapp);
            app = qlik.openApp(vselapp, config);
            vRowNum = 1;

            //Create first Row
            var newrowcontent = '';
            newrowcontent = '<tr id=SelField_row_' + vRowNum + '><td id="SelField_row_' + vRowNum + '_Field"><select class="selectpicker" id="selectField_' + vRowNum + '" data-live-search="true" data-title="nothing selected" data-size="false"></select></td>';
            newrowcontent += '<td id="SelField_row_' + vRowNum + '_Option"><select id="Option_' + vRowNum + '" class="selectpicker"<option>odo</option><option>odso</option><option>ods</option><option>odo</option><option>od</option></select></td>';
            newrowcontent += ' <td id="SelField_row_' + vRowNum + '_Type"><select id="Type_' + vRowNum + '" class="selectpicker"><option>String</option><option>Date</option></select></td>';
            newrowcontent += '<td><div class="add_left"><a><span id="SelField_row_' + vRowNum + '_Add" class="glyphicon glyphicon-plus"></span></a></div></td></tr>';
            $('#tablecontent').empty();
            $('#tablecontent').append(newrowcontent);

            createRow(vRowNum);
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
                console.log('Number of Rows:', $('#Fieldselection tr').length - 1);
            });
        };

        //Add another Row
        $("body").delegate('.add_left', 'click', function () {
            var newrowcontent = '';
            newrowcontent = '<tr id=SelField_row_' + vRowNum + '><td id="SelField_row_Field' + vRowNum + '_Field"><select class="selectpicker" id="selectField_' + vRowNum + '" data-live-search="true" data-title="nothing selected" data-size="false"></select></td>';
            newrowcontent += '<td id="SelField_row_' + vRowNum + '_Option"><select id="Option_' + vRowNum + '" class="selectpicker"<option>odo</option><option>odso</option><option>ods</option><option>odo</option><option>od</option></select></td>';
            newrowcontent += ' <td id="SelField_row_' + vRowNum + '_Type"><select id="Type_' + vRowNum + '" class="selectpicker"><option>String</option><option>Date</option></select></td>';
            newrowcontent += '<td><div class="add_left"><a><span id="SelField_row_' + vRowNum + '_Add" class="glyphicon glyphicon-plus"></span></a></div><div class="add_right"><a><span id="SelField_row_' + vRowNum + '_Delete" class="glyphicon glyphicon-minus"></span></a></div></td></tr>';
            $(newrowcontent).insertAfter('#' + $(this).closest("tr").attr('id'));
            createRow(vRowNum);
        });

        //Remove a Row
        $("body").delegate('.add_right', 'click', function () {
            $('#' + $(this).closest("tr").attr('id')).remove();
            //Count # rows
            console.log('Number of Rows:', $('#Fieldselection tr').length - 1);
        });

        // Create an array when submit button is clicked and create ODAG bindings and Extend Where loops
        $("#ApplySelectedTable").click(function () {
            return new Promise(function (resolve, reject) {
                $('table tr').each(function (i, n) {
                    var $row = $(n);
                    if (i != 0) {
                        rows.push({
                            Field: $row.find('button:eq(0)').text().slice(" ", -1),
                            Option: $row.find('button:eq(1)').text().slice(" ", -1),
                            Type: $row.find('button:eq(2)').text().slice(" ", -1)
                        });
                    }
                })
                resolve(rows);
            }).then((function () {
                console.log(JSON.stringify(rows));
                // Get default ODAG Binding script
                $.ajax({
                    url: "./config/OdagBinding.txt",
                    success: function (data) {
                    }
                }).then(function (data) {
                    odagBindingScript = data;
                    // loop through rows selected and create ODAG Bindings
                    for (var i = 0; i < rows.length; i++) {
                        tmpScriptOne = odagBindingScript.replace("OdagField", rows[i].Field);
                        tmpScriptTwo = tmpScriptOne.replace("OptionField", rows[i].Option);
                        finalScript = tmpScriptTwo.replace("OdagQuoteWrapping", 0);
                        odagBindingScripts.push(finalScript);
                    }
                    console.log(odagBindingScripts);
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
                                if (rows[i].Type === "String") {
                                    extendWhereList += "'" + rows[i].Field + "',";
                                }
                            }
                            resolve(extendWhereList.slice(",", -1));
                        }).then(function (data) {
                            extendWhereList = data;
                            console.log('extendWhereList', extendWhereList);
                            return new Promise(function (resolve, reject) {
                                resolve(extendWhereScript.replace("ExtendWhereList", extendWhereList));
                            }).then(function (data) {
                                extendWhereScript = data;
                                console.log(extendWhereScript);
                                // GET default ExtendWhereDates script
                                $.ajax({
                                    url: "./config/ExtendWhereDates.txt",
                                    success: function (data) {
                                    }
                                }).then(function (data) {
                                    console.log("dates", data);
                                    extendWhereDatesScript = data;
                                    // loop through rows selected and create ExtendWhereDates script
                                    return new Promise(function (resolve, reject) {
                                        for (var i = 0; i < rows.length; i++) {
                                            if (rows[i].Type === "Date") {
                                                extendWhereDatesList += "'" + rows[i].Field + "',";
                                            }
                                        }
                                        resolve(extendWhereDatesList.slice(",", -1));
                                    }).then(function (data) {
                                        extendWhereDatesList = data;
                                        console.log('extendWhereDatesList', extendWhereDatesList);
                                        return new Promise(function (resolve, reject) {
                                            resolve(extendWhereDatesScript.replace("ExtendWhereDatesList", extendWhereDatesList));
                                        }).then(function (data) {
                                            extendWhereDatesScript = data;
                                            console.log('extendWhereDatesScript', extendWhereDatesScript);
                                        })
                                    })
                                })
                            });
                        });
                    })
                });
            }));
        });
    });


