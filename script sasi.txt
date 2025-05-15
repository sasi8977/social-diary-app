document.addevenlistener('domcontentloaded',function(){
//dom elements
const currentdate E1=document.getelementbyId('current date');
const newentry btn=document.getelementbyId('newentrybtn');
const viewentriesbtn=document.getelementbyId('viewentriesbtn');
const statsbtn=document.getelementbyId('statsbtn');
const settingbtn=document.getelementbyId('settingsbtn');
const backtolistbtn=document.getelementbyId('bacttolistbtn');
const sections=document.queryselectorAll('.section');
const navlinks=document.queryselectorAll('.sidebarnavul li');
const moodoptions=document.queryselectorall('.mood-option');
const selectedmoodEl=document.getelementbyId('selected mood');
const diaryform=document.getelementbyId('diaryform');
const entrydate=document.getelementbyId('entrydate');
const entrytitle=document.getelementbyId('entry title);
const entrycontent=document.getelementbyId('entrycontent');
const taginput=document.getelementbyId('taginput');
const addtagbtn=document.getelementbyId('addtagbtn');
const tagsdisplay=document.getelementbyId('tagsdisplay');
const entrieslist=document.getelementbyId('entrieslist');
const searchentries=document.getelementbyId('searchentries');
const filterbymood=document.getelementbyId('filterbymood');
const filterbydate=document.getelementbyId('filterbydate');
const detailentrytitle=document.getelementbyId('detailentrytitle');
const detailentrydate=document.getelementbyId('detailentrydate');
const detailentrymood=document.getelementbyId('detailentrymood');
const detailentrycintent=document.getelementbyId('detailentrycontent');
const detailentrytags=document.getelementbyId('detailentrytags');
const editentrybtn=document.getelementbyId('editentrybtn');
const deleteentrybtn=document.getelementbyId('deleteentrybtn');
const totalentriesE1=document.getelementbyId('totalebtries');
const mostactivedayE1=document.getelementbyId('mostactiveday');
const moodchartE1=document.getelementbyId('mood chart');
const wordcloudE1=document.getelementbyId('word cloud');
const settingsform=document.getelementbyId('settingsform');
const username=document.getelementbyId('username');
const diarytheme=document.getelementbyId('diarytheme');
const notifications=document.getelementbyId('notifications');
const remindertime=document.getelementbyId('remindertime');
const exportdatabtn=document.getelementbyId('exportdatabtn');
const importdatabtn=document.getelementbyId('importdatabtn');
const notificationsE1=document.getelementbyId('notifications');
const usernameE1=document.getelementbyId('uesrname');
//state
letentries=json.parse(localstorage.getitem('diaryentries'))||[];
lettags=[];
letcurrentmood='';
letcurrententryId=null;
letsettings=json.parse(localstorage.getitem('diarysettings'))||{
username:'user',
theme:'light',
notifications:false,
remindertime:'20:00'
};
//initializetheapp
function init(){
updatecurrentdate();
loadentries();
setupeventlisteners();
}
//updatecurrentdatedisplay
functionupdatecurrentdate(){
const now=newdate();
const options={weekday:'long',year:'numeric',month:'long',day:'numeric'
};
currentdateE1.textcontent=now.tolocaldatestring('en-us',options);
entrydate.valueasdate=now;
}
//load settings
functionloadsetting(){
username.value=settings.username;
diarytheme.value=settings.theme;
notifications.checked=settings.notifications;
remindertime.value=settings.remindertime;
usernameE1.textcontent=settings.username;
//apply theme
document.documentelement-setattribute('date-theme',settings.theme);
}
//save settings
functionsavesettings(){
settings={
username:username.value.
theme:diarytheme:value,
notifications:notifications.checked,
remindertime:remindertime.value
};
localstorage.setitem('diarysettimgs',json.stringify(settings));
usernameE1.textcontent=settings.username;
document.documentelement.setattribute('data-theme',settings.theme);
shownotifications('settingssavedsuccessfully!');
}
//load entries from localstorage
functionloadentries(){
constsavedentries=localstorage.getitem('diaryentries');
if(savedentries){
entries=json.parse(savedebtries);
}
}
//save entries to localstorage
functionsaveentries(){
localstorage.setitem('diaryentries',json.stringify(entries));
}
//setup event listeners
fucntionsetupeventlistener(){
//navigation
newentrybtn.addeventlistener('click',(e)=>{
e.preventdefault();
showsection('newentrysection');
setactivenavlink(newentrybtn.parentelement);
});
viewentriesbtn.addeventlistener('click',(e)=>{
e.preventdefault();
showsection('viewebtriessection');
setactivenavlink(viewentriesbtn.parentelement);
renderentrieslist();
});
statsbtn.addeventlistener('click',(e)=>{
e.preventdefault():
showsection('statssection');
setactivenavlink(statsbtn.parentelement);
renderstatistics();
});
settingsbtn.addeventlistener('click',(e)=>{
e.preventdefault();
showsection('settingssection');
setactivenavlink(settingsbtn.parentelement);
});
backtolistbtn.addeventlistener('click',()=>{
showsection('viewentriessection');
});
//mood selection
moodoptions.foreach(option=>{
option.addeventlistener('click',()=>{
currentmood=option.dataset.mood;
selectmoodE1.textcontent=option.textcontent+currentmood.chartat(0).touppercase()+currentmood.slice(1);
});
});
//diaryform
diaryform.addeventlistener('submit',saveentry);
//tags
addtagbtn.addeventlistenet('click',addtag);
taginput.addeventlistener('keypress',(e)=>{
if(e.key==='enter'){
e.preventdefault();
addtag();
}
});
//entry list interactions
searchentries.addeventlistener('input',renderentrieslist);
filterbymood.addeventlistener('change',renderentrieslist);
filterbydate.addeventlistener('change',renderentrieslist);
//entryactions
editentrybtn.addeventlistener('click',editentry);
deleteentrybtn.addeventlistener('click',deleteentry);
//settings form
settingsform.addeventlistener('submit',(e)=>{
e.preventdefault():
save settings();
});
//data import/export
exportdatabtn.addeventlistener('click',exportdata);
importdatabtn.addeventlistener('click',()=>importdatainput.click());
importdatainput.addeventlistener('change',importdata);
}
//show a specfic section
functionshowsection(sectionId){
section.foreach(section=>{
section.classlist.remove('active-section');
});
document.getelementbyId(sectionId).classlist.add('active-section');
}
//set active navigation link
functionsetactivenavlink(link){
navlinks.foreach(navlink=>{
navlinks.classlist.remove('active');
});
link.classlist.add('active');
}
//add a tag
functionaddtag(){
consttagtext=taginput.value.trim();
if(tagtext&&!tags.includes(tagtext)){
tags.push(tagtext);
rendertags();
taginput.value=",
}
}
//remove a tag
functionremovetag(tagtext){
tags=tags.filter(tag=>tag!==tagtext);
render tags();
}
//render tags
function rendertags(){
tagsdisplay.innerHTML=";
tags.foreach(tag=>{
consttagE1=document.createelement('div");
tagE1.classname='tag';
tagE1.innerHTML='
${tag}
<span class="remote-tag"data-tag="${tag}">&times;</span>
;
tagsdisplay.appendchild(tagE1);
});
//add event listeners to remove buttons
document.querysectionall('.remove-tag').foreach(btn=>{
btn.addeventlistener('click',(e)=>{
removetag(e.target.dataset.tag);
});
});
}
//save a new entry
function.save entry(e){
e.preventdefault();
constentry={
id:date.now().tostring(),
data:entrydate.value,
title:entrytitle.value,
content:entrycontent.value,
mood:currentmood,
tags:[...tags],
createdat:newdate().toISOstring
};
entries.unshift(entry);
saveentries();
//reset form
diaryform.rest();
tags=[];
rendertags();
current mood=";
selectedmoodE1.textcontent=";
shownotification('entrysavedsuccessfully!');
renderentrieslist();
}
//render entrieslist
functionrenderentrieslist(){
constsearchterm=searchentries.value.tolowercase();
constmoodfilter=filterbymood.value;
constdatefilter=filterbydate.value;
letfilteredentries=[...entries];
//apply filters
if(searchterm){
filtered entreies=filteredentries.filter(entry=>
entry.title.tolowercase().includes(searchterm)||
entry.content.tolowercase().includes(searchterm)||
);
}
if(moodfilter){
filteredentries=filteredentries.filter(entry=>entry.mood===moodfilter);
}
if(datefilter){
constnow=newdate();
consttoday=newdate(now.getfullyear(),now.getmonth(),now.getdate());
constoneweekago=newdate(today);
oneweekago.setdate(oneweekago.getdate()-7);
constonemonthago.setmonth(onemonthago.getmonth()-1);
filteredentries=filteredentries.filter(entry=>{
constentrydate=newdate(entry.date);
if(datafilter==='today'){
returnentrydate>=today;
}elseif(datafilter==='week'){
returnentrydate>=oneweekago;
}elseif(datefilter==='month'){
returnentrydates=onemonthago;
}
returntrue;
});
}
//render entries
entrieslist.innerHTML=";
if(filteredentries.length===0){
entrieslist.innerHTML='<p>noentriesfound.stortbycreating a newentry!
</p>;
return;
}
filteredentries.foreach(entry=>{
const entryE1=document.createelement('div');
entryE1.classname='entry.card';
entryE1.dataset.id=entry.id;
const date=newdate(entry.date);
constoptions={year:'numeric',month:'short',day:'numeric'};
constformatteddate=date.tolocaledatestring('en-us',options);
lefmoodemoji=";
if(entry.mood){
moodemoji=getmoodemoji(entry.mood)+";
}
entryE1.innerHTML='
<h3>${entry.title}</h3>
<divclass="entry-meta">
<span>${formatted date}</span>
<span>${moodemoji}${entry.mood?entry.mood.chart(0).touppercase()+entry.mood.slice(1):"}</span>
</div>
<divclass="entry-content-previes">${entry.content.substring(0,150)}${entry.content.length>150?'...':"}</div>
<divclass="entry-tags">
${entry.tags.map(tag=>'<spanclass="tags">${tag}</span>').join('')}
</div>
';
entryE1.addeventlistener('click',()=>viewentrydetail(entry.id));
entrieslist.appendchild(entryE1);
});
}
//view entry detail
functionviewentrydetail(entryId){
constentry=entries.find(e=>e.id===entryId);
if(!entry)return;
currententryId=entryId;
constdate=newdate(entry.date);
constoptions={weekday:'long',year:'numeric',month:'long',day:'numeric'};
};
constformatteddate=date.tolocaledatestring('en-us',options);
detailentrytitle.textcontent=entry.title;
detailentrydate.textcontent=formatted date;
if(entry.mood){
detailentrymood.textcontent=getmoodemoji(entry.mood)+''+entry.mood.charat(0).touppercase()+entry.mood.slice(1);
}else{
detailentrymood.textcontent=";
}
detailentrycontent.textcontent=entry.content;
detailentrytags.innerHTML=entry.tags.map(tag=>'<spanclass="tag">$
{tag}</span>').join('');
showsection('entrydetailsection');
}
//edit entry
funtioneditentry(){
constentry=entries.find(e=>e.id===currententryId);
if(!entry)return;
//fill the form with entrydata
entrydate.value=entry.date;
entrytitle.value=entry.title;
entrycontent.value=entry.content;
currentmood=entry.mood;
tags=[...entry.tags];
if(entry.mood){
selectedmoodE1.textcontent=getmoodemoji(entry.mood)+''+entry.mood.chart(0).touppercase()+entry.mood.slice(1);
}
rendertags();
//remove the old entry
entries=entries.filter(e=>e.id!==currententryId);
saveentries();
showsection('newentrysection');
shownotification('entryloadedforediting.makeyourchangesandsave');
}
delete entry
functiondeleteemtry(){
if(confirm('areyousureyouwanttodeletethisentry?')){
entries=entries.filter(e=>e.id!==currententryid);
save entries();
shownotification('entrydeletedsuccessfully!');
renderentrieslist();
showsection('viewentriessection');
}
}
//render statistics
functionrenderstatistics(){
//total entries
totalentriesE1.textcontent=entries.length;
//most activeday
if(entries.length>0){
constdaycounts={};
entries.foreach(entry=>{
constdate=newdate(entry.date);
constday=date.tolocaledatestring('en-us',{weekday:'long'});
daycounts[day]=(daycounts[day]||0)+1;
});
letmostactiveday=";
letmaxcount=0;
for(constdayindaycounts){
if(daycounts[day]>maxcount){
mostactiveday=day;
maxcount=daycounts[day];
}
}
mostactivedayE1.textcontent='${mostactiveday}(${maxcount}entries);
}else{
mostactivedayE1.textcontent='-';
}
//mood chart(simple text version)
if(entries.length>0){
constmoodcounts={};
entries.foreach(entry=>{
constmood=entry.mood//"unknown';
moodcounts[mood]=(moodcounts[mood]||0)+1;
});
letchartHTML='<div>';
for(constmoodinmoodcounts){
constcount=moodcounts[mood];
constpercentage=(count(entries.length*100).tofixed(1);
constemoji=mood!=='unknown'?getmoodemoji(mood)!'';
chartHTML+='
<divstyle="margin-bottom:0.5rem;">
<divstyle="display:flex;justifx-content:space-between;margin-bottom:0.2rem;">
<span>${emoji}${mood.chart(0).touppercase()+mood.slice(1)}
</span>
<span>${percentage}%(${count})</span>
<div>
<divstyle='height:8px;background-color:#eee;border-radius:upx;">
<divstyle="height:100%;width${percentage}%;background-color:var(---primary-color);border-radius:upx;"></div>
</div>
</div>
';
}
chartHtml+='</div>';
moodchartE1.innerHTML=chartHTML;
}else{
moodchartE1.innerHTML='<p>nodataavailable</p>';
}
//word cloud(simplified)
if(entries.lenght>0){
constwordcounts={};
entries.foreach(entry=>{
constwords=entry.content.tolowercase().split(/\s+1);
words.foreach(word=>{
//remove punctuation and filter shortwords
constcleanword=word.replace(/[.,\/#!$%\^&\*;:{}=\-_'~()]/g,");
if(cleanword.length>3){
wordcounts[cleanword]=(wordcounts[cleanword]110)+1;
}
});
});
//get top 20 words
const topwords=object.entries(wordcounts)
.sort((a,b)=>b[1]-a[1])
.slice(0,20);
wordcloudE1.innerHTML=";
topwords.foreach(([word,count])=>{
constsize=match.min(24,12+count*2);
constwordE1=document.createelement('div');
wordE1.classname='word-cloud-item';
wordE1.textcontent=word;
wordE1.style.fontsize='${size}px';
wordE1.style.opacity=0.7+(count\topwords[0][1])*0.3;
wordcloudE1.appendchild(wordE1);
});
}else{
wordcloudE1.innerHTML='<p>nodataavailable</p>';
}
}
//export data
functionexportdata(){
constdata={
entries:entries,
settings:settings
};
constblob=newblob([json.stringify(data,null,2)],{type;'application/json'
});
constur1=url.createobjectURL(blob);
consta=document.createelement('a');
a.herf=URL;
a.download='social-diary-backup-${newdate().toisistring().split('T')[0]}json';
document.body.appendchild(a);
a.click():
document.body.removechild(a);
URL.revokeobjectURL(url);
shownotification('dataexportedsuccessfully!');
}
//import data
functionimportdata(e){
constfile=e.target.files[0];
if(!file)return;
constreader=newfilereader();
reader.onload=(event)=>{
try{
constdata=json.parse(event.target.result);
if(data.entries&&array.isarray(data.entries)){
if(confirm('importingwillreplaceyourcurrntdiaryentries.continue?')){
entries=data.entries;
saveentries();
renderentrieslist();
}
}
if(data,settings){
if(confirm('doyouwanttoimportsettingsaswell?')){
settings=data.settings;
localstorage.setitem('diarysettings',json.stringify(settings));
loadsettings();
}
}
shownotification('dataimportedsuccessfully!');
}catch(error){
console.erroe('errorimportingdata:',error);
shownotification('errorimportingdata.pleasecheckthefileformat','error');
}
};
reader.readastext(file);
//reser the input to allow re-importing the samefile
e.target.value=";
}
//show notification
functionshownotification(message,type='success'){
notificationE1.textcontent=message;
notificationE1.classname='notification';
if(type==='success'){
notificationE1.style.background='var(--succcess-color)';
}elseif(type==='error'){
notificationE1.style.backgroundcolor='var(--danger-color)';
}
notificationE1.classlist.add('show');
settimeout(()=>{
notificationE1.classlist.remove('show');
},3000);
}
//get mood emoji
functiongetmoodemoji(mood){
constmoodemoji={
happy:'[]',
neutral:'[]',
sad:'[]',
angry:'[]',
excited:'[]',
};
returnmoodemojis[mood]||";
}
//intialize the app
init();
});





