global.d = console.log;

jQuery(document).ready( function($){
    $.getJSON('data.json', () => {

    }).done( (data) => {
        const template = $('#template').html();
        const html = mustache.render(template,data)
        $('#gallery').html(html);
    });
});