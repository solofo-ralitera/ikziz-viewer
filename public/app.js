let IMAGE_LIMIT = 20;
let IMG_FILTER = "";

$(function () {
    // Load all image (paginated)
    observer.observe(document.getElementById("scrollLoader"));
    $("#searchinput").keydown(function(event) {
        if ( event.which == 13 ) {
            event.preventDefault();
            IMG_FILTER = $(this).val();
            currentOffset = 0;
            loadImages(true);
        }
    });

    setInterval(setBgImg, 10000);
});

$.fn.masonryImagesReveal = function ($items) {
    let msnry = this.data('masonry');
    let itemSelector = msnry.options.itemSelector;
    // hide by default
    $items.hide();
    // append to container
    this.append($items);
    $items.imagesLoaded().progress(function (imgLoad, image) {
        // get item
        // image is imagesLoaded class, not <img>, <img> is image.img
        let $item = $(image.img).parents(itemSelector);
        // un-hide item
        $item.show();
        // masonry does its thing
        msnry.appended($item);
    });
    return this;
};

// Oberserver for lazy render
let observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (el) {
        // Load image src (lazy render)
        if(el.target.tagName.toLowerCase() == "img") {
            let attr = el.target.getAttribute("data-src");
            if(attr && el.target.src == "") el.target.src = attr;
        }
        // Load next page on scroll
        else if(el.target.id == "scrollLoader") {
            if(el.intersectionRatio > 0){
                loadImages();
            }
        }
    });
}, {
    //root: document.querySelector('#scrollArea'),
    threshold: 1.0
});

let currentOffset = 0;
let imagesIsLoading = false;
function loadImages(resetView) {
    if(imagesIsLoading) return false;

    // return if no more page
    if(currentOffset < 0) return false;

    imagesIsLoading = true;
    $.ajax({
        url: APIURI + "/allBooks?offset=" + currentOffset + "&limit=" + IMAGE_LIMIT + "&filter=" + encodeURIComponent(IMG_FILTER),
        context: document.body
    }).done(function(items) {
        currentOffset += items.length;
        // no more page
        if(items.length == 0) {
            currentOffset = -1;
        }
        if(resetView) {
            $("#container").html("");
        }
        items.forEach(function(item) {
            addItem(item);
        });

        let $container = $('#container').masonry({
            itemSelector: '.item',
            columnWidth: 200
        });
        $container.masonryImagesReveal($('#imagesgallery').find('.item'));

    }).fail(function(error) {

    }).always(function() {
        imagesIsLoading = false;
    });
}

function addItem(item) {
    let newItem = document.createElement("div");
    newItem.setAttribute('data-path', item.path);
    newItem.setAttribute('data-uuid', item.uuid);
    newItem.className = "item";
    newItem.innerHTML = '<img src="'+ APIURI + "/image" + item.thumb +'">';
    newItem.onclick = function() {
        let path = $(this).attr('data-path');
        let uuid = $(this).attr('data-uuid');
        loadSlider(path, uuid);
    };
    document.getElementById("imagesgallery").appendChild(newItem);

}

function setBgImg() {
    let items = $("#container").find("img");
    let item = items[Math.floor(Math.random()*items.length)];
    $("body,html").css({
        "background-image" : "url(" + $(item).attr("src") + ")",
        "background-size": "100%",
        "background-repeat": "repeat-y",
    });
}

function loadSlider(path, uuid) {
    $.ajax({
        url: APIURI + "/book/" + encodeURIComponent(path),
        context: document.body
    }).done(function(items) {

        let str = "";
        items.files.forEach(function(img) {
            str += '<a class="gallery" href="' + APIURI + '/image' + img + '" title="' + items.author + " - " + items.title + '"></a>';
        });
        $("#slidecontainer").html(str);
        $("#slidecontainer a.gallery").colorbox({rel:'gallery'})[0].click();
    }).fail(function(error) {

    }).always(function() {

    });
}
