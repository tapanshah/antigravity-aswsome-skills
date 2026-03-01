$(document).ready(function() {
    $('#cmdSave').on('click', function(e) {
        e.preventDefault();

        var btn     = $(this);
        var btnText = btn.html();
        var form    = $('#frmDetails')[0];
        var data    = new FormData(form);

        $.ajax({
            type: "POST",
            url: "<?php echo $controller_page . '/save' ?>",
            data: data,
            dataType: "json",
            processData: false,
            contentType: false,
            beforeSend: function() {
                btn.html(`<div class="spinner-border spinner-border-sm" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>`);
                btn.prop('disabled', true);
            },
            success: function(response) {
                Swal.fire({
                    title: response.title,
                    text: response.message,
                    icon: 'success',
                    confirmButtonText: "Ok"
                }).then(() => {
                    if (response.data && response.data.url) {
                        window.location.replace(response.data.url);
                    } else {
                        window.location.reload();
                    }
                });
            },
            error: function(xhr) {
                if (xhr.responseJSON) {
                    Swal.fire(xhr.responseJSON.title, xhr.responseJSON.message, "error");
                } else {
                    Swal.fire("Error", xhr.status + ": " + xhr.statusText, "error");
                }
            },
            complete: function() {
                btn.html(btnText);
                btn.prop('disabled', false);
            }
        });
    });
});
