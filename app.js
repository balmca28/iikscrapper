const express = require('express');
const mysqlUtil = require("mysql-query-util");
const path = require('path');
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const app = express();
const config = require('./config.js');

app.use(express.static('public'));
app.get('/main-page',async(req, res)=>{
    const url = 'https://www.indiansinkuwait.com/iikclassified/';
    const data = await getResults(url,'main')
    res.json(data);
})
app.get('/',async(req, res)=>{
    const data = 'Welcome';
    res.json(data);
})
app.get('/single-page',async(req, res)=>{
    mysqlUtil.setConnection(config);
    const result = await mysqlUtil. rawQuery("select * from data WHERE completed=0 LIMIT 1 ");
    console.log(result)
    let data=null;
    if(result?.length > 0){
        data = await getResults(result[0]?.url,'single')
        console.log(data)
        await mysqlUtil.update("data", data,[["id", "=", result[0]?.id]]); 
    }
    res.json(data);
})

const mainPageScraperData = async(url,page)=>{
    try {
        await page.goto(url, {waitUntil:'load', timeout:0});
        const html = await page.evaluate(()=>document.body.innerHTML);
        const $ = cheerio.load(html);
        const crewLength = $('#ctl00_ContentPlaceHolder1_grdTodaysAd > tbody > tr').length;
        const data = [];
        mysqlUtil.setConnection(config);
        $('#ctl00_ContentPlaceHolder1_grdTodaysAd>tbody>tr').each(async(i, el) => {
            const id=($(el).find('td > div > div >span').text()).trim();
            let title=$(el).find('td > div > h6 > a').text();
            title=title.replace(/[^a-zA-Z ]/g, "");
            const url="https://www.indiansinkuwait.com"+$(el).find('td > div > h6 > a').attr('href');
            const completed=0;
            if(id && title){
                data.push({id,title,url,completed})
                // const result = await mysqlUtil.select("data",'*',[["id", "=", id]]);
                // if(result?.length === 0){
                // await mysqlUtil.insert("data", {
                //     id,
                //     title,
                //     url,
                //     completed
                // }); 
            //}
            }
        })
        return {
            crewLength,
            data
        }
    } catch (error) {
        console.log(error);
    }
}
const singlePageScraperData = async(url,page)=>{
    try {
        await page.goto(url, {waitUntil:'load', timeout:0});
        const html = await page.evaluate(()=>document.body.innerHTML);
        const $ = cheerio.load(html);
        const id = $('#ctl00_ContentPlaceHolder1_lblID').text();
        const location=$('#ctl00_ContentPlaceHolder1_lblLocation').text();
        const title = $('.classifiedtitle').text();
        const description=$('#ctl00_ContentPlaceHolder1_lblMatter').text();
        const phone = $('#ctl00_ContentPlaceHolder1_lblPhone2').text();
        const location2=$('#ctl00_ContentPlaceHolder1_lblLocation2').text();
        const phone2 = $('#ctl00_ContentPlaceHolder1_lblPhone > a').text();

        return {
            id,
            title,
            location,
            description,phone,location2,phone2,
            completed:1
        }
    } catch (error) {
        console.log(error);
    }
}

const getResults = async(url,type)=>{
 const browser = await puppeteer.launch({headless:false,args: [
    '--no-sandbox',
    '--disable-setuid-sandbox'
]});
   const page = await browser.newPage();
   let  data = null
   if(type === 'single'){
     data = await singlePageScraperData(url,page);
   }else{
     data = await mainPageScraperData(url,page);
   }
   browser.close();
return data;
}
module.exports = app;