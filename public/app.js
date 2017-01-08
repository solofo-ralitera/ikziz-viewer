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
    var msnry = this.data('masonry');
    var itemSelector = msnry.options.itemSelector;
    // hide by default
    $items.hide();
    // append to container
    this.append($items);
    $items.imagesLoaded().progress(function (imgLoad, image) {
        // get item
        // image is imagesLoaded class, not <img>, <img> is image.img
        var $item = $(image.img).parents(itemSelector);
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

        var $container = $('#container').masonry({
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
    newItem.className = "item"
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
        $("#jssorcontainer").html($("#templatejssor").html());

        items.files.forEach(function(img) {
            $("#jssorcontainer .jssor_slidecontainer").append(
                '<div data-p="144.50">' +
                    '<img data-u="image" src="' + APIURI + '/image' + img + '" />'+
                    '<img data-u="thumb" src="' + APIURI + '/image' + img + '" />'+
                '</div>'
            );
        });

        document.getElementById("modalcontainer").innerHTML = $("#modalcontainer").html();

        $("#modalcontainer .book-title").html(items.author + " - " + items.title);

        $('[data-remodal-id=modal]').remodal({}).open();

        $("#modalcontainer .jssor-container,#modalcontainer .jssor_slidecontainer").css({
            "height": (items.height + 120) + "px"
        });
        jssor_1_slider_init("jssorcontainer");

        setTimeout(function() {
            $("#jssorcontainer img[data-u=image]").css({
                "width" : "auto",
                "height" : "auto",
                "left" : "",
                "position" : ""
            });
        }, 1000);
    }).fail(function(error) {

    }).always(function() {

    });
}

jssor_1_slider_init = function(container) {
    let jssor_1_options = {
        $AutoPlay: true,
        $SlideshowOptions: {
            $Class: $JssorSlideshowRunner$,
            $TransitionsOrder: 1
        },
        $ArrowNavigatorOptions: {
            $Class: $JssorArrowNavigator$
        },
        $ThumbnailNavigatorOptions: {
            $Class: $JssorThumbnailNavigator$,
            $Cols: 10,
            $SpacingX: 8,
            $SpacingY: 8,
            $Align: 360
        }
    };
    let jssor_1_slider = new $JssorSlider$(container, jssor_1_options);
    /*responsive code begin*/
    /*you can remove responsive code if you don't want the slider scales while window resizing*/
    function ScaleSlider() {
        let refSize = jssor_1_slider.$Elmt.parentNode.clientWidth;
        if (refSize) {
            refSize = Math.min(refSize, 800);
            jssor_1_slider.$ScaleWidth(refSize);
        }
        else {
            window.setTimeout(ScaleSlider, 30);
        }
    }
    ScaleSlider();
    $Jssor$.$AddEvent(window, "load", ScaleSlider);
    $Jssor$.$AddEvent(window, "resize", ScaleSlider);
    $Jssor$.$AddEvent(window, "orientationchange", ScaleSlider);
    /*responsive code end*/
};