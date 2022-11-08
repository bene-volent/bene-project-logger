const dotenv = require("dotenv");
const axios = require("axios");
dotenv.config();

const vercelToken = process.env.VERCEL_TOKEN;

const apiEndPt = "https://api.vercel.com/v9/projects";

const express = require("express");
const app = express();
const port = 3000;


const SELF = {
    name:"bene-project-logger"
}

app.get("/api/vercel/projects", (req, res) => {
    let config = {
        method: "get",
        url: apiEndPt,
        headers: {
            Authorization: "Bearer " + vercelToken,
        },
    };

    let results = [];

    axios(config)
        .then((response) => {
            for (let project of response.data.projects) {
                if (project.name!=SELF.name)
                results.push({
                    name: project.name,
                    githubRepo: `https://github.com/${project.link.org}/${project.link.repo}`,
                    link: project.latestDeployments[0].alias[0],
                });
            }

            if (response.data.pagination.next !== null) {
                config.url = `${apiEndPt}?until=${response.data.pagination.next}`;
                loop();
            } else {
                res.status(200).json(results);
            }
        })
        .catch((err) => {
            console.log(err);
        });
});
app.listen(port, () => console.log(`Example app listening on port ${port} !`));
