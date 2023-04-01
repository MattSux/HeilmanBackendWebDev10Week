// Core Node Modules
const fs = require('fs');
const path = require("path");
const fsPromises = require("fs").promises;
const http = require("http");
const { constants } = require('buffer');
const { stringify } = require('querystring');

const serveFile = async (filePath, contentType, response) => {
    try {
        const encoding = contentType.startsWith('text/') || contentType === 'application/json' ? 'utf-8' : null;
        const rawData = await fsPromises.readFile(filePath, encoding);
        response.writeHead(200, { "Content-Type": contentType });

        if (encoding) {
            const data = contentType === 'application/json' ? JSON.parse(rawData) : rawData;
            response.end(contentType === 'application/json' ? JSON.stringify(data) : data);
        } else {
            response.end(rawData);
        }
    } catch (err) {
        console.log(err);
        response.statusCode = 500;
        response.end();
    }
};


const server = http.createServer((req, res)=>{
    console.log(req.url);


    let contentType;
    const extension = path.extname(req.url);
    switch (extension) {
        case ".css":
        contentType = "text/css";
        break;
        case ".js":
        contentType = "text/javascript";
        break;
        case ".txt":
            contentType = "text/plain";
        break;
        case ".json":
            contentType = "application/json";
        break;
        case ".jpg":
            contentType = "image/jpeg";
        break;
        case ".png":
            contentType = "image/png";
        break;
        default:
            contentType = "text/html";
    }

    // Setting up the file path

    let filePath = contentType == "text/html" && req.url === "/"
    ? path.join(__dirname,"views","index.html")
    : contentType === "text/html" && req.url.slice(-1) === "/"
    ? path.join(__dirname,"views","index.html")
    : contentType === "text/html"
    ? path.join(__dirname, "views", req.url)
    : path.join(__dirname, req.url);
    
    if(!extension && req.url.slice(-1) !== "/" ) filePath +=".html";

    const fileExists = fs.existsSync(filePath);

    if (fileExists) {
    serveFile(filePath, contentType, res);
    } else {
        // 404
        switch (path.parse(filePath).base){
            case "old-page.html":
                res.writeHead(301, {Location: "/new-page.html"});
                res. end();
                break;
            case "www-page.html":
                res.writeHead(301, {Location: "/"});
                res. end();
                break;
            default:
                serveFile(path.join(__dirname, "views", "404.html"), "text/html", res);
        }
    }
});



server.listen(3000, ()=>{
    console.log("Server is listening on port 3000");
});