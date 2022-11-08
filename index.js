const dotenv = require("dotenv");
const axios = require("axios");
const path = require('path');
const Octokit = require('octokit').Octokit
dotenv.config();

const vercelToken = process.env.VERCEL_TOKEN;
const githubToken = process.env.GITHUB_TOKEN

const apiEndPt = "https://api.vercel.com/v9/projects";



const express = require("express");
const app = express();
const port = 3000;


const SELF = {
    name:"bene-project-logger"
}
app.get("/",(req,res)=>{
    res.sendFile(path.join(__dirname,'index.html'))
})

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

app.get('/api/github/projects', (req, res) => {
const octokit = new Octokit({
    auth: githubToken
  })
  
 octokit.request('GET /user/repos', {}).then((result)=>{
    let names = []
    for (let repo of result.data){
        if (repo.name!==SELF.name){
            var tmp = {"name":repo.name,githubRepo:"https://github.com/bene-volent/"+repo.name}
            if (!(repo.homepage==null || repo.homepage=="") && !repo.homepage.includes('.vercel.app')){
                tmp.link=repo.homepage
                console.log(repo)
            }
            names.push(tmp)
            
        }
    }
    res.send(names)

 }).catch(err=>console.log(err))
})

// app.listen(3000,()=>{console.log("http://localhost:3000")})
module.exports= app