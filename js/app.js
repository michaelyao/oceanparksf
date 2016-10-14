$( document ).ready(function() {
    var heights = $(".br-panel").map(function() {
        return $(this).height();
    }).get(),

    maxHeight = Math.max.apply(null, heights);

    $(".br-panel").height(maxHeight);
});