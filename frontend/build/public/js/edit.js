var achId

function getAch() {
    let url = window.location.href
    let ip = url.split('/')[4]
    achId = ip
    var xhr = new XMLHttpRequest()
    xhr.open('GET', '/getAch/?achievement=' + ip, true)

    $.validator.addMethod("unique7aEdit", function(value, element) {
            r = (value == '1 (7а)' && user.Achs.some(o => o && o.crit == '1 (7а)' && o._id.toString() != achId))
            if (r) {
                $(element).addClass("is-invalid");
                return false}
            else {
                $(element).removeClass("is-invalid");
                return true}
        },
        "<span style='color:#FF0000; vertical-align: center'>Достижение, соответствующее критерию 7а, уже добавлено</span>")

    critValidator = $('#critForm').validate({
        check2: {
            firstCourse: {},
            unique7aEdit: {}
        }
    })


    xhr.onload = function () {
        let data = JSON.parse(xhr.responseText)

        document.getElementById('comment').value = data.achievement;

        k = $('#check2')
        k.val(data.crit).change();

        for (ch of data.chars) {
            k = createdKrits[createdKrits.length - 1]
            k.val(ch).change()

        }

        if (data.SZ) {
            $("#szBox").attr('checked', true).change();
            $('#szNum').val(data.SZ['Num'])
            $('#szDate').val(getDate(data.SZ['Date']))
            $('#szPril').val(data.SZ['Pril'])
            $('#szPunkt').val(data.SZ['Punkt'])
        }

        if (kritSelector.val() != '1 (7а)'){
            $('#Date').val(getDate(data.achDate)).change()
        }

        console.log(user)
        if (!user) {
            userEvent.on('userLoaded', function (e) {
                if (user.IsInRating) {
                    $('#SubmitButton').remove()
                    $('#DeleteButton').remove()
                    $('#check2').attr("disabled", true);
                    $(".input").attr("disabled", true);
                    $('#form').attr('disabled', true)
                    $("#form :input").attr("disabled", true);
                    $('#textForm').attr('disabled', true)
                    $("#textForm :input").attr("disabled", true);
                    $("#textForm").css("margin-bottom", '2rem');
                }

                critValidator.form()
                $('#panel2').fadeIn(60);
            })
        }
        else {
            if (user.IsInRating) {
                $('#SubmitButton').remove()
                $('#DeleteButton').remove()
                $('#check2').attr("disabled", true);
                $(".input").attr("disabled", true);
                $('#form').attr('disabled', true)
                $("#form :input").attr("disabled", true);
                $('#textForm').attr('disabled', true)
                $("#textForm :input").attr("disabled", true);
                $("#textForm").css("margin-bottom", '2rem');
            }

            critValidator.form()
            $('#panel2').fadeIn(60);
        }
    }
    xhr.send()




}

function deleteAch() {
    if (!confirm('Вы уверены? Удаление достижения необратимо.')) return false;

    var form = document.forms.namedItem('fileinfo')
    var oData = new FormData(form)
    oData.append('data', JSON.stringify(''))
    oData.append('achId', achId)
    var oReq = new XMLHttpRequest()
    oReq.open('POST', '/delete_achieve', true)
    oReq.onload = function (oEvent) {
        if (oReq.status === 200) {
            $(location).attr('href','/home')
        }
        else {
            console.log(
                'Error ' + oReq.status + ' occurred when trying to delete achieve.'
            )
        }
    }
    oReq.send(oData)
}

function editCrit() {
    a = validator.form()
    b = textValidator.form()
    c = critValidator.form()
    if (!a || !b || !c) return false;
    if (!confirm('Вы уверены? Если достижение было принято, после изменения снова потребуется проверка.')) return false;

    var res = {}
    res.type = $('#check1').val();
    res.crit = $('#check2').val();
    res.chars = [];

    // получение списка характеристик
    if (kritSelector.kritChild)
        getChars(kritSelector.kritChild, res.chars);

    res.achDate = makeDate($("#Date").val());
    if (hasSZ) {
        res.SZ = {}
        res.SZ['Date'] = makeDate($('#szDate').val());
        res.SZ['Num'] = $('#szNum').val();
        res.SZ['Pril'] = $('#szPril').val();
        res.SZ['Punkt'] = $('#szPunkt').val();
    }

    res.achievement = $('#comment').val()
    res.status = 'Ожидает проверки'
    var form = document.forms.namedItem('fileinfo')
    var oData = new FormData(form)
    oData.append('data', JSON.stringify(res))
    oData.append('achId', achId)
    var oReq = new XMLHttpRequest()
    oReq.open('POST', '/update_achieve', true)
    oReq.onload = function (oEvent) {
        if (oReq.status === 200) {
            $(location).attr('href','/home')
        }
        else {
            console.log(
                'Error ' + oReq.status + ' occurred when trying to upload your file.'
            )
        }
    }
    oReq.send(oData)
}

function getDate(d) {
    if (!d) return undefined
    d = new Date(d)
    return (d.getDate()> 9 ? d.getDate() : '0' + d.getDate())  + "." + ((d.getMonth()+1) > 9 ? (d.getMonth()+1) : '0' + (d.getMonth()+1)) + "." + d.getFullYear();
}

$(document).ready(getAch)


