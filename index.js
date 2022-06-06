const express = require('express');
const path = require('path');
require('dotenv').config()
const app = express();
app.use(express.static(path.resolve(__dirname, './public')));
const livereload = require("livereload");
const connectLiveReload = require("connect-livereload");
const YamlLoader = require('./services/yaml-loader.service');

(async () => {
    // Load Yaml parameters
    const parameters = await YamlLoader.load(path.resolve(__dirname, './config/parameters.yaml'));

    // configure hot reload
    const liveReloadServer = livereload.createServer();
    liveReloadServer.watch(path.join(__dirname, 'public'));
    liveReloadServer.watch(path.join(__dirname, 'views'));
    liveReloadServer.watch(path.join(__dirname, 'config'));
    liveReloadServer.server.once("connection", () => {
        setTimeout(() => {
            liveReloadServer.refresh("/");
        }, 100);
    });

    app.use(connectLiveReload());

    // set twig as rendering engine
    app.set('views', __dirname + '/views/pages');
    app.set('view engine', 'twig');

    app.set("twig options", {
        allow_async: true, // Allow asynchronous compiling
        strict_variables: false
    });

    // routing
    app.use(function (err, req, res, next) {
        console.log(err);
        res.render('404', {
            ...parameters,
        });
    })

    app.get('/', (req, res) => {
        res.render(`index`, {
            ...parameters,
        });
    });


    app.get('*', (req, res) => {
        // you can serve static html files from public/pages
        if (req.url.match(/.*\.html/)) {
            res.sendFile(path.resolve(__dirname, './public/pages/' + req.url))
        } else {
        // or twig template
            const token = req.url.split('/');
            token.shift();
            res.render(token.join('/'), {
                ...parameters,
            }, function (err, html) {
                if (err) {
                    console.log(err);
                    // template not found
                    res.render('404', {
                        ...parameters,
                    }, (renderingErr, page404html) => {
                        res.status(404).send(page404html);
                    });
                } else {
                    res.send(html);
                }
            });
        }
    });

    app.listen(process.env.PORT, () => {
        console.log(`twig-express is started on port ${process.env.PORT}`);
    });
})();

