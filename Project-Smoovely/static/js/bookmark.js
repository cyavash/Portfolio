$(document).ready(function() {

    function toggleBookMark(evt) {
        evt.preventDefault();
        var csrf = document.getElementsByName("csrfmiddlewaretoken")[0].value;
        var bookmarkLink = $(this);
        var estateId = bookmarkLink[0].dataset['id'];
        var isBookMarked = bookmarkLink.hasClass('on');
        var url = "/estate/bookmark/create/" + estateId + '/';
        var icon = bookmarkLink.find('span.fav');

        if(isBookMarked) {
            url = "/estate/bookmark/delete/" + estateId + '/';
        } 

        $.ajax({
            type: 'POST',
            url: url,
            headers: {"X-CSRFToken" : csrf },
            success: function(data, textStatus, xhr) {
                icon.toggleClass('color-gold', !isBookMarked);
                bookmarkLink.toggleClass('on', !isBookMarked);               
            },
            error: function(data, textStatus, xhr) {
                if(data.status == '401') {
                    showLogin();
                }
            }
        });
    }

    $('body').on('click', 'a.bookmark', toggleBookMark);

});