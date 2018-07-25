let cheerio = require("cheerio");
let request = require("request");
let Note = require("../models/Note.js");
let Article = require("../models/Article.js");
let Save = require("../models/Save");

module.exports = function (app) {
    app.get("/scrape", function (req, res) {
        request("https://www.nytimes.com/", function (error, response, html) {

            let $ = cheerio.load(html);


            $("article.story").each(function (i, element) {
                let result = {};
                result.summary = $(element).children("p.summary").text();
                result.byline = $(element).children("p.byline").text();
                result.title = $(element).children("h2").text();
                result.link = $(element).children("h2").children("a").attr("href");
                if (result.title && result.link) {
                    let entry = new Article(result);

                    Article.update(
                        {link: result.link},
                        result,
                        { upsert: true },
                        function (error, doc){
                            if (error) {
                                console.log(error);
                            }
                        }
                    );
                }
            });
            res.json({"code" : "success"});

        });
    });

    app.get("/articles", function (req, res) {
        Article.find({}, function (error, doc) {
            if (error) {
                console.log(error);
            } else {
                res.send(doc);
            }
        });
    });

    app.get("/articles/:id", function (req, res) {
        Article.find({
                "_id": req.params.id
            })
            .populate("note")
            .exec(function (error, doc) {
                if (error) {
                    console.log(error)
                } else {
                    res.send(doc);
                }
            });
    });


    app.get("/saved/all", function (req, res) {
        Save.find({})
            .populate("note")
            .exec(function (error, data) {
                if (error) {
                    console.log(error);
                    res.json({"code" : "error"});
                } else {
                    res.json(data);
                }
            });
    });


    app.post("/save", function (req, res) {
        let result = {};
        result.id = req.body._id;
        result.summary = req.body.summary;
        result.byline = req.body.byline;
        result.title = req.body.title;
        result.link = req.body.link;

        let entry = new Save(result);
        entry.save(function (err, doc) {
            if (err) {
                console.log(err);
                res.json(err);
            }
            else {
                res.json(doc);
            }
        });
    });

    app.delete("/delete", function (req, res) {
        let result = {};
        result._id = req.body._id;
        Save.findOneAndRemove({
            '_id': req.body._id
        }, function (err, doc) {
            if (err) {
                console.log("error:", err);
                res.json(err);
            }
            else {
                res.json(doc);
            }
        });
    });

    app.get("/notes/:id", function (req, res) {
        if(req.params.id) {
            Note.find({
                "article_id": req.params.id
            })
            .exec(function (error, doc) {
                if (error) {
                    console.log(error)
                } else {
                    res.send(doc);
                }
            });
        }
    });

    app.post("/notes", function (req, res) {
        if (req.body) {
            let newNote = new Note(req.body);
            newNote.save(function (error, doc) {
                if (error) {
                    console.log(error);
                } else {
                    res.json(doc);
                }
            });
        } else {
            res.send("Error");
        }
    });

    app.get("/notepopulate", function (req, res) {
        Note.find({
            "_id": req.params.id
        }, function (error, doc) {
            if (error) {
                console.log(error);
            } else {
                res.send(doc);
            }
        });
    });



    app.delete("/deletenote", function (req, res) {
        let result = {};
        result._id = req.body._id;
        Note.findOneAndRemove({
            '_id': req.body._id
        }, function (err, doc) {
            if (err) {
                console.log("error:", err);
                res.json(err);
            }
            else {
                res.json(doc);
            }
        });
    });
}