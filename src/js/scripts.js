global.jQuery = require('jquery');
global.d = console.log;
bootstrap = require('bootstrap');
mustache = require('mustache');

jQuery(document).ready( function($){
    $.getJSON('data.json', () => {

    }).done( (data) => {
        const template = $('#template').html();
        const html = mustache.render(template,data)
        $('#gallery').html(html);
    });
});