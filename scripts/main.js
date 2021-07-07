let income = 0;
let bucketWeightPairs = [];
getCookie();

function getCookie() {
  let cEntries = document.cookie.split(';');
  let cBucketWeightPairs = [];
  let cIncome = 0;
  for (let i=0; i<cEntries.length; i++){
    let cPair = cEntries[i].split("=");
    if (cPair[0].includes('income') == 1){
      cIncome = parseFloat(cEntries[i].split('=')[1]);
    }
    else if (cPair[0].includes('undefined') != 1){
      let pair = {
        bucket: cPair[0],
        weight: parseFloat(cPair[1])
      };
      cBucketWeightPairs.push(pair);
    }
  }
  if ((cIncome != 0) && (!isNaN(cIncome))){ // cookie found!
    applyCookie(cIncome,cBucketWeightPairs);
  }
}

function setCookie() {
  document.cookie = "income=" + income + ";";
  for (let i=0;i<Object.keys(bucketWeightPairs).length;i++){
    document.cookie = bucketWeightPairs[i]["bucket"] + "=" + bucketWeightPairs[i]["weight"] + ";";
  }
} 

function applyCookie(cIncome, cBucketWeightPairs) {
  income = cIncome;
  bucketWeightPairs = cBucketWeightPairs;
  document.getElementById('income').value = Math.round(income / 26).toFixed(2);
  document.getElementById('setincome').innerText = `Your income is set to $${Math.round(income / 26).toFixed(2)}`
  document.getElementById('t1div').style.display = 'block';
  document.getElementById('b3').style.display = 'block';
  document.getElementById('b4').style.display = 'block';
  document.getElementById('b5').style.display = 'block';
  document.getElementById('plotbox').style.display = 'block';
  document.getElementById('tableblock').style.display = 'block';
  populateIncomeTable();
  generateTallies();
  createBucketList();
  populateTable();
  drawPlot();
}

function deleteCookie() {
  let cEntries = document.cookie.split(';');
  for (let i=0; i<cEntries.length; i++){
    let cPair = cEntries[i].split("=");
    document.cookie = `${cPair[0]}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  }
}

function commas(str) {
  return (str+"").replace(/.(?=(?:[0-9]{3})+\b)/g, '$&,');
}

function insertTableEntry(row, column, amount) {
  let entry = row.insertCell(column);
  entry.append(amount);
}

function convertIncome(income, factor) {
  let incomes = [   
    commas((factor * (income / 365)).toFixed(2)), // daily
    commas((factor * (income / 52)).toFixed(2)), // weekly
    commas((factor * (income / 26)).toFixed(2)), // fortnightly
    commas((factor * (income / 12)).toFixed(2)), // monthly
    commas(Math.round(factor * income)), // yearly
    commas(Math.round(factor * 2 * income)), // 2 yearly
    commas(Math.round(factor * 5 * income)), // 5 yearly
    commas(Math.round(factor * 10 * income)), // 10 yearly
    commas(Math.round(factor * 20 * income)), // 20 yearly
    commas(Math.round(factor * 30 * income)) // 30 yearly
];
  return incomes;
}
  
function optionsCheckbox(id) { 
  // only let one income period option to be checked 
  for (let i = 1;i <= 5; i++)
  {
    document.getElementById("o" + i).checked = false;
  }
  document.getElementById(id).checked = true;
}  

function calculateIncome(e){
  if ((e.keyCode == 13) || (e.keyCode == null)) {
    for (let i = 1;i <= 5; i++)
    {
      if(document.getElementById("o" + i).checked){
        period = " per " + document.getElementById("o" + i).name;
      }
    }
    income = parseFloat(document.getElementById("income").value);
    document.getElementById("setincome").innerText = "Your income is set to: $" + commas(income.toFixed(2)) + period;
    switch(period) {
      case " per month":
        income = income * 12;
        break;
      case " per fortnight":
        income = income * 26;
        break;
      case " per week":
        income = income * 52;     
        break;
      case " per day":
        income = income * 365;
    } 
    // fill out income table
    populateIncomeTable();
    
    // display income table and block 3
    deleteCookie();
    setCookie();
    document.getElementById("t1div").style.display = "block"; // display income table
    document.getElementById("b3").style.display = "block"; // display bucket tree
    return false;
  }
}

function populateIncomeTable() {
  // fill out income table
  let tab1 = document.getElementById("tbody1");
  tab1.innerHTML = "";
  let row1 = tab1.insertRow();
  for (let i=0;i<5;i++){
    insertTableEntry(row1, i, "$" + convertIncome(income,1)[i]);  
  }
  row1 = tab1.insertRow();
  let tab2 = document.getElementById("tbody2");
  tab2.innerHTML = "";
  let row2 = tab2.insertRow();
  for (let i=0;i<5;i++){
    insertTableEntry(row2, i, "$" + convertIncome(income,1)[i+5]);  
  }
  row2 = tab2.insertRow();   
}

function addEntry(e,lid,fid) {
  // add new buckets to the bucket tree
  if (e.keyCode == 13) {
    let li = document.getElementById(lid);
    let input = document.getElementById(fid).value;
    let node = document.createElement("div");
    node.innerHTML = '<li> <input name="bucket" value="' + input + '" type="checkbox">' +  input + '</li>'; 
    li.appendChild(node);    
    return false;
  }
}

document.getElementById("chosenbuckets").addEventListener("click", function(){
  // get chosen buckets from the bucket tree
  let checkboxes = document.getElementsByName('bucket');
  bucketWeightPairs = [];
  for (let i=0; i<checkboxes.length; i++) {
     if (checkboxes[i].checked) {
      let pair = {
         bucket: checkboxes[i].value,
         weight: 0
       };
       
        bucketWeightPairs.push(pair);
     }
  }
  generateTallies();
  createBucketList();
  return False;
});

function generateTallies(){
  // generate optional tallies to aid in choosing weights
  let listBox = document.getElementById("b5");
  listBox.style.display = "block";
  let listArea = document.getElementById("listblock");
  let listFlex = document.createElement("article");
  listFlex.className = "listflex";
  while(listArea.firstChild){
    listArea.removeChild(listArea.firstChild);
  }
  for (let i=0;i<Object.keys(bucketWeightPairs).length;i++){
    let listDiv=document.createElement('div'); 
    listDiv.className = "flexitem";
    let listName=document.createElement('p');
    listName.innerHTML = bucketWeightPairs[i].bucket + ": $0";
    listName.id = "title" + i;
    listName.style.color = "ivory";
    listDiv.appendChild(listName);
    let list = document.createElement("ul");
    list.id = "tally" + i;
    let listEntry = document.createElement("li");
    listEntry.className = "newentry";
    listEntry.innerHTML = `<div><input placeholder="Item" id='item${i}' size="10"> \
                          <input placeholder="$" id='val${i}' size="1"><button type="button" \
                          onclick="addTallyEntry('${i}','tally${i}')">Add</button></div>`;
    list.appendChild(listEntry);
    listDiv.appendChild(list);
    listFlex.appendChild(listDiv);
  }
  listArea.appendChild(listFlex);

  if (!document.getElementById('reset')){
    let linebreak = document.createElement("br");
    listBox.appendChild(linebreak);
    let button = document.createElement("button");
    button.innerHTML = "Reset Tallies";
    button.id = "reset";
    button.onclick = function() {resetTallies()}
    listBox.appendChild(button);
  }
}

function resetTallies(){
  // remove items from tallies and reset
  for (let i=0;i<Object.keys(bucketWeightPairs).length;i++){
    let tallyID = 'tally' + i;
    let titleID = 'title' + i;
    let tally = document.getElementById(tallyID);
    while(tally.childNodes.length > 1){
      tally.removeChild(tally.firstChild);
    }
    let listName = document.getElementById(titleID);
    listName.innerHTML = bucketWeightPairs[i].bucket + ": $0";
  }
}

function addTallyEntry(liID,ulID){
  // add item to tally
  let list = document.getElementById(ulID);
  let item = document.getElementById('item'+liID).value;
  let value = document.getElementById('val'+liID).value;
  let listEntry = document.createElement("li");
  listEntry.id = item;
  listEntry.style.color = "ivory";
  listEntry.innerHTML = `<div> ${item}: $${value}   <button type="button" \
                        onclick="deleteTallyEntry('${item}','${value}','title${liID}')">Delete</button></div>`;
  list.insertBefore(listEntry,list.lastChild);

  // update total tally and weight
  let listPara = document.getElementById('title'+liID);
  let listTitle = listPara.innerHTML;
  let ind = listTitle.indexOf("$");
  let currentTotal = parseFloat(listTitle.slice(ind+1));
  currentTotal = currentTotal + parseFloat(value);
  listPara.innerText = listTitle.slice(0,ind+1) + currentTotal + ", weight: " + (currentTotal/(income/52)).toFixed(2);
  
  // reset form
  document.getElementById('item'+liID).value = "";
  document.getElementById('val'+liID).value = "";
  return false;
}

function deleteTallyEntry(liID,value,titleID) {
  document.getElementById(liID).remove();
 
  // update total tally and weight
  let listPara = document.getElementById(titleID);
  listTitle = listPara.innerHTML;
  let ind = listTitle.indexOf("$");
  let currentTotal = parseFloat(listTitle.slice(ind+1));
  currentTotal = currentTotal - parseFloat(value);
  listPara.innerText = listTitle.slice(0,ind+1) + currentTotal + ", weight: " + (currentTotal/(income/52)).toFixed(2);
}

function createBucketList() { 
  // generate bucket list for choosing weights
  let block = document.getElementById("b4"); 
  block.style.display = "block" // display bucket/weight list box
  let bl = document.getElementById("bucketList");  
  let para = document.createElement("div");
  while(bl.firstChild){
    bl.removeChild(bl.firstChild );
  }
  para.innerHTML = "<p>Input weights so the sum equals 1. </p>";
  para.id = "weightpara";
  bl.appendChild(para);
  for (let i=0;i<Object.keys(bucketWeightPairs).length;i++){
    let node = document.createElement("div");
    if ((bucketWeightPairs[i].weight == 0) || (isNaN(bucketWeightPairs[i].weight)))
    {
      node.innerHTML = `<li class="newBucket"> <input name="chosenBucket" placeholder="Add weight. Eg. 0.3"> ${bucketWeightPairs[i].bucket}</li>`; 
    }
    else
    {
      node.innerHTML = `<li class="newBucket"> <input name="chosenBucket" value="${bucketWeightPairs[i].weight}"> ${bucketWeightPairs[i].bucket}</li>`;
    }
    bl.appendChild(node);
  }
  let chosenBuckets = document.getElementsByClassName("newBucket");
  for (let i=0;i<chosenBuckets.length;i++){
    chosenBuckets[i].style.listStyleType = "none";
  }
  if (!document.getElementById('donebutton')){
    let button = document.createElement("button");
    button.innerHTML = "Done";
    button.id = "donebutton";
    button.onclick = function() {saveWeightBucketPairs()}
    block.appendChild(button);
  }
}

function saveWeightBucketPairs() {
  // save chosen weights for chosen buckets
  let totalweight = 0;
  let weights = document.getElementsByName("chosenBucket");  
  for (let i=0;i<Object.keys(bucketWeightPairs).length;i++){
    bucketWeightPairs[i].weight = parseFloat(weights[i].value);
    totalweight = totalweight + parseFloat(weights[i].value);
  }
  let para = document.getElementById("weightpara");
  para.innerText = "Weight sum = " + totalweight;

  deleteCookie();
  setCookie();
  populateTable();
  drawPlot();
}

function populateTable() {
  // generate bucket/income table
  document.getElementById("tableblock").style.display = "block"; // display table box
  let table = document.getElementById("tbody");
  table.innerHTML = "";
  for (let i=0;i<Object.keys(bucketWeightPairs).length;i++){
    let row = table.insertRow();
    insertTableEntry(row, 0, bucketWeightPairs[i].bucket) // bucket name
    for (let j=0;j<10;j++){
      insertTableEntry(row, j+1, (convertIncome(income,bucketWeightPairs[i].weight)[j])) 
    }
  }
}

function plotCheckbox(id) {
  // get latest checkbox and plot
  for (let i = 1;i <= 10; i++)
  {
      document.getElementById("ch" + i).checked = false;
  }
  document.getElementById(id).checked = true;
  drawPlot();
}

function drawPlot() { 
  document.getElementById("plotbox").style.display = "block";  // display plot box
  let unit = 1;
  let time = "";
  let multiplier = 1;
  for (let i=1;i<=10;i++)
  {
    if (document.getElementById("ch" + i).checked) {
      time = document.getElementById("ch" + i).name;
      unit = parseFloat(document.getElementById("ch" + i).value);
      multiplier = eval(document.getElementById("ch" + i).title);
    }
  }
  let data = [];
  let mult = 0;
  let colours = ['black','blue','brown','red','aqua','crimson','cyan','pink','orange','yellow','purple','grey','green'];
  for (let i=0;i<Object.keys(bucketWeightPairs).length;i++){
    if ((i+1) % (colours.length+1) == 0){
      mult+=colours.length;
    }
    let pair = {};
    pair["label"] = bucketWeightPairs[i]["bucket"]
    pair["data"] = [];
    pair["data"].push([0,0]);
    pair["data"].push([unit, bucketWeightPairs[i]["weight"] * multiplier * income]);
    pair["points"] = {symbol: "circle"};
    pair["color"] = colours[i - mult];
    data.push(pair);
  }
  let xlabel = document.head.appendChild(document.createElement('style'));
  xlabel.innerHTML = `#flotcontainer:before {content: 'Time (${time})'`;
  $.plot($("#flotcontainer"), data, {legend : {position: "nw"}});

  document.getElementById("resetall").style.display = "block";
}

document.getElementById("resetall").addEventListener("click", function(){
  deleteCookie();
  location.reload();
});

income.focus();