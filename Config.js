if(typeof module == "undefined") module = {};

module.exports = {
    SITE_NAME : "Zizki viewer",
    API  : "http://localhost:8080/",

    Collections : [
        {
            collection : "thumbsup",
            class : "glyphicon glyphicon-thumbs-up",
            label : "Thumbs-up"
        },
        {
            collection : "toread",
            class : "glyphicon glyphicon-eye-open",
            label : "To read"
        },
        {
            collection : "favorite",
            class : "glyphicon glyphicon-star",
            label : "Favorite"
        }
    ]
}