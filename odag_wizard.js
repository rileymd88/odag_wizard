var rootPath=window.location.hostname;
var portUrl = "80";

if(window.location.port==""){
    if("https:" == window.location.protocol)
        portUrl="443";
    else{
        portUrl="80";
    }
}
else
    portUrl = window.location.port;

var pathRoot="//localhost:4848/extensions/";
if(portUrl!="4848")
    pathRoot="//"+rootPath+":"+portUrl+"/resources/";

var config = {
    host: window.location.hostname,
    prefix: "/",
    port: window.location.port,
    isSecure: window.location.protocol === "https:"
};

require.config({
    baseUrl: (config.isSecure ? "https://" : "http://") + config.host + (config.port ? ":" + config.port : "") + config.prefix + "resources",
    paths: { app: (config.isSecure ? "https://" : "http://") + config.host + (config.port ? ":" + config.port : "")}
});

require(["js/qlik", "jquery"], function (qlik, jQuery) {

    //hide configuration dialog
    $('#hide_dialog1').on('click', function () {
        $('#dialog').hide();
        $('#dialog').removeClass('seeyou');
    });

    $('#hide_dialog2').on('click', function () {
        $('#dialog').hide();
        $('#dialog').removeClass('seeyou');

    });

    $('#show_dialog').on('click', function () {
        if ($('#dialog').hasClass('seeyou')) {
            $('#dialog').hide();
            $('#dialog').removeClass('seeyou');
        } else {
            $('#dialog').show();
            $('#dialog').addClass('seeyou');
        }
    });

    $('#show_apps').on('click', function () {
        if ($('#apps').hasClass('is-active')){
            $('#apps').removeClass('is-active');
        } else {
            $('#apps').addClass('is-active');
        }
    });
    
    //write Apps in Listbox
    qlik.getGlobal(config).getAppList(function (list) {
        var str = "";
        $.each(list, function (key, value) {
            str += value.qDocName + ' ' + value.qDocId;
            $("#selectapp").append("<option value='" + value.qDocId + "'>" + value.qDocName + "</option>");
        });
    });

    // Apply app and build charts
    $('#applyapp').click(function () {
        var vAppselection = $('#selectapp').val();
        //alert(vAppselection);
        if (vAppselection != null) {
            var app = qlik.openApp(vAppselection, config);
            app.getObject('CurrentSelections', 'CurrentSelections');
            app.getList("FieldList", function (reply) {
                $.each(reply.qFieldList.qItems, function (index, value) {
                    $("#selectField").append("<option value='" + value.qName + "'>" + value.qName + "</option>");
                });
            });
            $('#apps').addClass('established');
        } else {
            alert("Please select your app!");
        }
    });
});