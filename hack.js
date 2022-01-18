// I use fs module , path module to make folders and xlsx to acsess and store data
// in excel format.

// I make this script fully using puppeteer and scrap the all data using puppeteer.

// Main moto of my project is to scrap company wise interview question available in gfg till now .
// Means I automate around 158 pages scrap data of 156 pages stored it in txt and excel and data means question name and link of the question company wise .
// My script able to fetch around 3150+ questions and links company wise.
// It also upload the files in uppy.io and also take every processes screen shot 

let fs = require("fs");
let path = require("path");
let xlsx = require("xlsx");
const puppeteer = require("puppeteer");
let page, browser;

// It creates the main directory / parent directory named "Interview_Questions"
let dirPath = path.join(__dirname,"Interview_Questions");
isDirrectory(dirPath);

// async function started  

(async function fn() {
    // Opening Chromium Browser
    let browserStartPromise = await puppeteer.launch({
        headless: false, defaultViewport: null,
        //If you use mac then use the following args,
        args: ["--start-fullscreen", '--window-size=1920,1040',"--disable-notifications"],

        // If you use windows uncomment the nextline and comment the 27th line.
        //args: ["--start-maximized","--disable-notifications"],
    });

    let browserObj = await browserStartPromise;
    console.log("--------------------");
    console.log("Chromium Browser opened");
    console.log("--------------------");

    browser = browserObj
    let  pages = await browser.pages();
    // fetch the aldready opened pages in the browser in a array and then instruct it to work on the first tab means 0th index of the pages array.

    page = pages[0];
    // Pass the url where i want to go ,to automate the process.
    await page.goto("https://www.geeksforgeeks.org/",{visible:true});

    // There is a pop up in the page it comes too late for it some times if you
    // I have bad internet connection it throws Navigation time out ,
    // If you faced the same issue then uncomment the following line .
    //    await page.waitForTimeout(10000);

    // Using "span.close" selector i clicked the X button of the pop up.
    await page.waitForSelector("span.close",{visible:true}); 
    await page.click("span.close",{visible:true});
    console.log("X Closed");
    console.log("--------------------");

    // ".gfg-icon.gfg-icon_arrow-down.gfg-icon_header" this selector is for the clicking a dropdown menu named "TUTORIALS" in the page.
    await page.waitForSelector(".gfg-icon.gfg-icon_arrow-down.gfg-icon_header");
    let dropDownArr =  await page.$$(".gfg-icon.gfg-icon_arrow-down.gfg-icon_header");
    await page.evaluate(function(element){
        element.click();
    },dropDownArr[0]);
    console.log("Tutorial clicked");
    console.log("--------------------");

    // As puppeteer is working too fast to visualize the clicks i add some wait time manually.
    await page.waitForTimeout(3000);
   
    // ".mega-dropdown__list-item .gfg-icon.gfg-icon_arrow-right" this selector return the array of 
    // elemets present inside the tutorials and then using evaluate click the needed option "Interview Corner".
    await page.waitForSelector(".mega-dropdown__list-item .gfg-icon.gfg-icon_arrow-right");
    let dropDownOptionArr =  await page.$$(".mega-dropdown__list-item .gfg-icon.gfg-icon_arrow-right");
    await page.evaluate(function(element){
        element.click();
    },dropDownOptionArr[4]);
    console.log("Interview Corner clicked");
    console.log("--------------------");

    // As puppeteer is working too fast to visualize the clicks i add some wait time manually.
    await page.waitForTimeout(3000);
 
    // ".mega-dropdown .mega-dropdown__list-item a" this selector return the array of 
    // elemets present inside the "Interview Corner" and then using evaluate click the needed option "Practice company questions".
    await page.waitForSelector(".mega-dropdown .mega-dropdown__list-item a");
    let finalDropDownOptionArr =  await page.$$(".mega-dropdown .mega-dropdown__list-item a");
    await page.evaluate(function(element){
        element.click();
    },finalDropDownOptionArr[185]); 
    console.log("Practice company questions clicked");
    console.log("--------------------");


    // ".well.table.whiteBgColor tr .text-center a" this selector returns the array of 156 comapanies present in that page.
    await page.waitForSelector(".well.table.whiteBgColor tr .text-center a");
    let companyArr = await page.$$(".well.table.whiteBgColor tr .text-center a");
    // console.log(companyArr.length);    

    // currentPageURL is the url of the page which consists of all 156 comapies name came after clicking the Practice Interview Question.
    let currentPageURL = await page.url();  
    console.log(currentPageURL) 
    console.log("--------------------");
    
    // I create this blank array to store the link of 156 companies which scrap from the page.
    let companyLinks=[] ;
    

    // Using the forloop I scrap the href means links of all 156 companies and 
    // as the links are incomplete then complete the link and then push it into the blank array.
    for (let i = 0; i < companyArr.length; i++) {
       let linkPromise = await page.evaluate(function (elem) {
           return elem.getAttribute("href");
       }, companyArr[i]);
       let fullLink = `https://practice.geeksforgeeks.org${linkPromise}`;
       //console.log(fullLink);
       companyLinks.push(fullLink);
    }

    await page.waitForTimeout(3000);
    
    // This will a screenshot of the page where the name of 156 companies
    // are displayed and saved in locally inside the current 
    // working Directory by the name of "GeeksforGeeks_Company_list.png" 
    await page.screenshot({
        path: `./GeeksforGeeks_Company_list.png`, 
        fullPage: true 
      });
    // As puppeteer is working too fast to visualize the clicks i add some wait time manually.
    await page.waitForTimeout(5000);

    // This function automatically scroll the current page opened in the chromium browser.
    await autoScroll(page);

    // As puppeteer is working too fast to visualize the clicks i add some wait time manually.
    await page.waitForTimeout(5000);

    // This for loop calls the linkNavigator function for each company present in the list 
    // and open the companies question page in new tab and the scroll it down 
    // till the last question is not loaded successfully then it read data scrap it 
    // and store it inside excel file for each company present.
    for(let i = 1; i < 3; i++){
        await linkNavigator(companyLinks[i],i+1);
    }
    // await linkNavigator("https://practice.geeksforgeeks.org/company/Snapdeal/",1);

    

    
    console.log("--------------------");


    //This messege will be printed after the completation of the whole process.
    console.log("Completed! Thank You for Using. Wish you a great efficient day ahead.")

    // This will close the last opened page automatically.
    page.close();

    // Finally this will close the browser automatically.
    browser.close();
     
})();

// This function perforn the main task. 
// Opening each companies question page in a new tab ,
// scroll it till the last question is not loaded then
// It  start reading the data of the page scrap the data and
// store it in excel and after doing all the work it automatically close the tab and
// call for the next page coming to it as an attribute.
async function linkNavigator(cLink,companyNo) {

    // opening new page/tab in chromium browser
    page = await browser.newPage();
    await page.goto(cLink , {visible : true});
    console.log("new page opened");

    // As puppeteer is working too fast to visualize the clicks i add some wait time manually.
    await page.waitForTimeout(3000);

    // ".filter" this selector help to scrap the company name after going to the company's page.
    await page.waitForSelector(".filter",{visible:true});
    let nameElement = await page.$(".filter",{visible:true});
    let nameOfCompany = await page.evaluate(txtElem,nameElement);


    // Some company has "*" special character in the name which throws error while creating folder.
    // Because there are some limitations of creating folder name.
    let splCharPresent = nameOfCompany.includes("*");
    console.log("--------------------");

    // Ths line provide us the company number along with the company name which we scrap.
    console.log("["+companyNo+"] "+nameOfCompany);
    
    console.log("--------------------");
    
    // As puppeteer is working too fast to visualize the clicks i add some wait time manually.
    await page.waitForTimeout(5000);

    // This will be a screenshot of the page where questions of companies
    // are displayed and saved in locally inside the current 
    // working Directory by the name of "Name Of Company.png"
    await page.screenshot({
        path: `./${nameOfCompany}.png`, 
        fullPage: true 
      });
    // By using $eval i ensure if the passed selector present in the page or not.
    const exists = await page.$eval(".col-sm-6.col-md-6.col-lg-6.col-xs-12.item",() => true).catch(() => false);
    
    // If the selector is present means questions are present in the company page if false means there is no question present for that company.
    if(exists == true) {

        //This will load first 20 questions.
        await page.waitForSelector(".col-sm-6.col-md-6.col-lg-6.col-xs-12.item", {visible : true});
        let questionArr = await page.$$(".col-sm-6.col-md-6.col-lg-6.col-xs-12.item");
        let previous = questionArr.length;
    //    console.log(previous); 
    
        
        for(let i = 0; i < 10; i++){
            await page.waitForTimeout(2000);
            scrollToBottom();
        }

        //This will scroll and load next 20 question means total 40 question.
        await page.waitForSelector(".col-sm-6.col-md-6.col-lg-6.col-xs-12.item", {visible : true});
        let newquestionArr = await page.$$(".col-sm-6.col-md-6.col-lg-6.col-xs-12.item");
        let next = newquestionArr.length;
    //    console.log(next);
    //    console.log( "Previous : " + previous + "//  Next : " + next);
    
        // As puppeteer is working too fast to visualize the clicks i add some wait time manually.
        await page.waitForTimeout(2000);


        // This is my algorithm to scroll till the last question of the page is not laded .
        // this loop will run till previous and next questions are same.
        // Baically i use a variation of 2 Pointer algo approach in it.
        while(previous != next){
            previous = next;    
            for(let i = 0; i < 10; i++){
                //console.log(count);
                await page.waitForTimeout(2000);
                scrollToBottom();
            }
            
            // As puppeteer is working too fast to visualize the clicks i add some wait time manually.
            await page.waitForTimeout(2000);
            
            await page.waitForSelector(".col-sm-6.col-md-6.col-lg-6.col-xs-12.item", {visible : true});
            newquestionArr = await page.$$(".col-sm-6.col-md-6.col-lg-6.col-xs-12.item");
            next = newquestionArr.length;
            // console.log( "Previous : " + previous + "//  Next : " + next);
         }
            
    
        // .col-sm-6.col-md-6.col-lg-6.col-xs-12.item .panel.problem-block a[style='position: absolute;top: 0;left: 0;height: 100%;width: 100%;z-index:1;pointer:cursor;'] This selector help me to scrap the question link 
        await page.waitForSelector(".col-sm-6.col-md-6.col-lg-6.col-xs-12.item .panel.problem-block a[style='position: absolute;top: 0;left: 0;height: 100%;width: 100%;z-index:1;pointer:cursor;']", {visible : true});
        let interviewQuestions = await page.$$(".col-sm-6.col-md-6.col-lg-6.col-xs-12.item .panel.problem-block a[style='position: absolute;top: 0;left: 0;height: 100%;width: 100%;z-index:1;pointer:cursor;']",{visible : true});
        
        // ".panel-body span[style='display:block;font-size: 20px !important']" this selector help me to scrap the name of each question.
        await page.waitForSelector(".panel-body span[style='display:block;font-size: 20px !important']", {visible : true});
        let nameArr = await page.$$(".panel-body span[style='display:block;font-size: 20px !important']",{visible : true});
        
        // If special char ter in the name Of The Company present ("*") i will change the name.
        // i.e. 24*7 Innovation Labs ==> 24X7 Innovation Lab.
        if(splCharPresent){
                let originalName = nameOfCompany.split("*");
                let namePart1 = originalName[0];
                let namePart2 = originalName[1];
                nameOfCompany = `${namePart1}X${namePart2}`;
        }

        // creating the company directory as the child directory of the main "Interview_Questions" directory.
        let interviewQuestionsFolderPath = path.join(__dirname,"Interview_Questions",nameOfCompany);
        isDirrectory(interviewQuestionsFolderPath);

        // creating file for each child directory.
        // i.e. Interview_Questions
        //                    |____ Amazon
        //                              |–– Amazon.xlsx
        let filePath = path.join(interviewQuestionsFolderPath,nameOfCompany+".xlsx");

        console.log(filePath);

        let content  = excelReader(filePath,nameOfCompany);
        let tableArray = [];


        // This for loop helps me to get the link of each questions which I scrap.
        for(let i = 0;i < interviewQuestions.length; i++){

            // The link Promise is returning me the herf of each element tata passes inside the function.
            let linkPromise = await page.evaluate(function (elem) {
                return elem.getAttribute("href");
            }, interviewQuestions[i]);
            //console.log(linkPromise);

            // The name Promise is returning the name of each questions.
            let namePromise = await page.evaluate(txtElem,nameArr[i]);
            // console.log(namePromise );

            // With the help of val I make the count of questions present in the page,i.e. for Amazon = 592, Microsoft = 401 etc.
            let val = i+1;
            console.log("["+val+"] "+namePromise+" <-----||-----> "+linkPromise);
                
            // Now i crate this object and assigned values to its keys .
            let interViewQuestionsData = {
                Question_Name : namePromise,
                Qustion_Link:linkPromise
            }

            // Now push the object inside arrays.
            tableArray.push(interViewQuestionsData);
            content.push(interViewQuestionsData);
        }

        // I use console.table to visualize it through a table formatting along with the normal line wise printing.
        console.table(tableArray);
        excelWriter(filePath, content, nameOfCompany);
        console.log("######################################################")

        // Now it goes to a website named uppy.io and click on choose file.
        await page.goto('https://uppy.io/examples/xhrupload/', { "waitUntil": 'networkidle2' });
        const [fileChooser] = await Promise.all([
            page.waitForFileChooser(),
            page.click('.uppy-FileInput-btn')
        ]);

        // This will will allow the uppy.io to accpect the filepath means the excel file 
        // Which will be created by scrapping gfg company.
        await fileChooser.accept([filePath]);

        await page.waitForTimeout(5000);

        // After completation of upload file it then click the screenshot of that page and saved locally as a proof that the file is uploaded.
        await page.screenshot({
            path: `./${nameOfCompany}_UploadingProgress_Report.png`, 
            fullPage: true 
          });

       

        await page.waitForTimeout(10000);
        // This will close the last opened page automatically.
        page.close();
    }else{
        console.log("No Questions found for this company");
        // This will close the last opened page automatically.
        page.close();
    }
}  

// This function take a element as attribute and return the text content of that attribute element.
function txtElem(element){
    return element.textContent.trim();
}


// This function is scroll the page till its inner height.
async function scrollToBottom() {
    await page.evaluate(goToBottom);
    function goToBottom() {
        window.scrollBy(0, window.innerHeight);
    }
}

// totalHeight is used to record the current height of the page, 
// the initial value is 0. distance is used to indicate the distance of each scroll down,
// here is 100 pixels. Then a timer was used to scroll down the distance set by the distance every 100 milliseconds, 
// and then accumulated to totalHeight,
// until it is greater than or equal to the actual height of the page document.body.scrollHeight, 
// the timer will be cleared, and the Promise object The state of is set to resolve().
async function autoScroll(page){
    await page.evaluate(async () => {
        await new Promise(function fn(resolve, reject){
            var totalHeight = 0;
            var distance = 100;
            var timer = setInterval(() => {
                var scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if(totalHeight >= scrollHeight){
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    });
}

// This function is used to read a excel file.
function excelReader(filePath, name) {
    if (!fs.existsSync(filePath)) {
        return [];
    } else {
        let wb = xlsx.readFile(filePath);
        let excelData = wb.Sheets[name];
        let ans = xlsx.utils.sheet_to_json(excelData);
        return ans;
    }
}

// This function is used to write inside a excel file.
function excelWriter(filePath, json, name) {
    // console.log(xlsx.readFile(filePath));
    let newWB = xlsx.utils.book_new();
    let newWS = xlsx.utils.json_to_sheet(json);
    xlsx.utils.book_append_sheet(newWB, newWS, name);
    xlsx.writeFile(newWB, filePath);
}

// This function is used to create new directory it gets a folder's path 
// and then it checks if the folder aldready exists then it don't do any thing 
// but if the folder is not present it creates the folder.
function isDirrectory(FolderPath) {
    if(fs.existsSync(FolderPath)== false){
        fs.mkdirSync(FolderPath);
    }
}