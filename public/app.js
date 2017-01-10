let IMAGE_LIMIT = 40;
let IMG_FILTER = "";

let CollectionFilters = [];
let Collections = [
    {
        collection : "thumbsup",
        class : "glyphicon glyphicon-thumbs-up"
    },
    {
        collection : "toread",
        class : "glyphicon glyphicon-bookmark"
    },
    {
        collection : "favorite",
        class : "glyphicon glyphicon-star"
    }
];

$(function () {
    // Load all image (paginated)
    observer.observe(document.getElementById('scrollLoader'));
    // search input
    $('#searchinput').keydown(function(event) {
        if ( event.which == 13 ) {
            event.preventDefault();
            IMG_FILTER = $(this).val();
            loadImages(true);
        }
    });
    // header collection
    let collections = [];
    Collections.forEach(function(collection) {
        collections.push('<i class="collectionitem '+collection.class+'" data-collection="'+collection.collection+'"></i>');
    });
    $('#headercollection').html(collections.join('&nbsp;'));
    $('#headercollection').find('.collectionitem').click(function(el) {
        let i = CollectionFilters.indexOf($(el.target).attr('data-collection'));
        if(i > -1) {
            CollectionFilters.splice(i, 1);
        }else {
            CollectionFilters.push($(el.target).attr('data-collection'));
        }
        loadImages(true);
    });
    setInterval(function() {
        //$('#headercollection .collectionitem').removeClass('selected');
        Collections.forEach(function(collection) {
            if(CollectionFilters.indexOf(collection.collection) > -1) {
                $('#headercollection .collectionitem[data-collection='+ collection.collection +']').addClass('selected');
            }else {
                $('#headercollection .collectionitem[data-collection='+ collection.collection +']').removeClass('selected');
            }
        });
    }, 300);

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
    if(resetView) currentOffset = 0;

    if(imagesIsLoading) return false;

    // return if no more page
    if(currentOffset < 0) return false;

    imagesIsLoading = true;
    $.ajax({
        url: APIURI + "/allBooks?offset=" + currentOffset + "&limit=" + IMAGE_LIMIT + "&filter=" + encodeURIComponent(IMG_FILTER) + "&collection=" + encodeURIComponent(JSON.stringify(CollectionFilters)),
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
    $(newItem).append('<img src="'+ APIURI + "/image" + item.thumb +'">');

    let collections = [];
    Collections.forEach(function(collection) {
        collections.push('<i class="collectionitem '+collection.class+'" data-collection="'+collection.collection+'" data-uuid="'+item.uuid+'"></i>');
    });

    $(newItem).append(
        '<div class="footer">' +
            collections.join('&nbsp;') +
            '<br>' +
            '<small>' + item.author + ' - ' + item.title + '</small>'+

        '</div>'
    );
    $(newItem).find("i.collectionitem").click(function(el){
        $.ajax({
            url: APIURI + "/collection/" + encodeURIComponent($(el.target).attr('data-collection')) + "/" + encodeURIComponent($(el.target).attr('data-uuid')),
            context: document.body
        }).done(function(items) {

        }).fail(function(error) {

        }).always(function() {

        });
    });

    $(newItem).find("img")
        .attr('data-path', item.path)
        .attr('data-uuid', item.uuid)
        .click(function(el) {
            let path = $(el.target).attr('data-path');
            let uuid = $(el.target).attr('data-uuid');
            loadSlider(path, uuid);
        });
    document.getElementById("imagesgallery").appendChild(newItem);

}

function setBgImg() {
    let items = $("#container").find("img");
    if(items.length > 0) {
        let item = items[Math.floor(Math.random()*items.length)];
        $("body,html").css({
            "background-image" : "url(" + $(item).attr("src") + ")",
            "background-size": "100%",
            "background-repeat": "repeat-y",
        });
    }
}

function loadSlider(path, uuid) {
    $.ajax({
        url: APIURI + "/book/" + encodeURIComponent(path),
        context: document.body
    }).done(function(items) {

        let str = "";
        items.files.forEach(function(img) {
            str += '<span class="gallery" href="' + APIURI + '/image' + img + '" title="' + items.author + " - " + items.title + '"></span>';
        });
        $("#slidecontainer").html(str);
        $("#slidecontainer .gallery").colorbox({rel:'gallery'})[0].click();
    }).fail(function(error) {

    }).always(function() {

    });
}
