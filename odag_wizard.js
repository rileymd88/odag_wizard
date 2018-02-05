var rootPath = window.location.hostname;
var portUrl = "80";

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
                console.log('Number of Rows:',$('#Fieldselection tr').length-1);        
            });
        };

    //Add another Row
    $("body").delegate('.add_left', 'click', function () {
        var newrowcontent = '';
        newrowcontent = '<tr id=SelField_row_' + vRowNum + '><td id="SelField_row_' + vRowNum + '_Field"><select class="selectpicker" id="selectField_' + vRowNum + '" data-live-search="true" data-title="nothing selected" data-size="false"></select></td>';
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
        console.log('Number of Rows:',$('#Fieldselection tr').length-1);
    });






});

