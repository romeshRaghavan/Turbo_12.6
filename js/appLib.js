 var appPageHistory = [];
 var jsonToBeSend = new Object();
 var jsonBEArr = [];
 var budgetingStatus;
 var gradeId;
 var unitId;
 var employeeId;
 var empFirstName;
 var successSyncStatusBE = false;
 var successSyncStatusTR = false;

 var successMsgForCurrency = "Currency synchronized successfully.";
 var errorMsgForCurrency = "Currency not synchronized successfully.";

 var app = {
     // Application Constructor
     initialize: function() {
         this.bindEvents();
     },
     // Bind Event Listeners
     //
     // Bind any events that are required on startup. Common events are:
     // 'load', 'deviceready', 'offline', and 'online'.
     bindEvents: function() {
         document.addEventListener("deviceready", this.onDeviceReady, false);
     },

     onDeviceReady: function() {
         if (navigator.notification) { // Override default HTML alert with native dialog
             window.alert = function(message) {
                 navigator.notification.alert(
                     message, // message
                     null, // callback
                     "Alert", // title
                     'OK' // buttonName
                 );
             };
         }
         document.addEventListener("backbutton", function(e) {
             goBackEvent();
         }, false);
         validateValidMobileUser();
         document.addEventListener('onSMSArrive', function(e) {
             saveIncomingSMSOnLocal(e);
         }, false);
     }
 };

 function goBack() {
     var currentUser = getUserID();
     var loginPath = defaultPagePath + 'loginPage.html';
     var headerBackBtn = defaultPagePath + 'backbtnPage.html';
     var headerCatMsg = defaultPagePath + 'categoryMsgPage.html';

     if (currentUser == '') {
         j('#mainContainer').load(loginPath);
     } else {
         //To check if the page that needs to be displayed is login page. So 'historylength-2'
         var historylength = appPageHistory.length;
         var goToPage = appPageHistory[historylength - 2];

         if (goToPage !== null && goToPage == loginPath) {
             return 0;
         } else {
             appPageHistory.pop();
             var len = appPageHistory.length;
             var pg = appPageHistory[len - 1];

                 if (pg == "app/pages/addAnExpense.html" || pg == "app/pages/addTravelSettlement.html") {

                     j('#mainHeader').load(headerBackBtn);
                 } else if (pg == "app/pages/category.html") {
                     j('#mainHeader').load(headerCatMsg);
                 }else if (pg == "app/pages/businessExpenseEditPage.html") {
                     var result = arrayRemove(appPageHistory, "app/pages/businessExpenseEditPage.html");
                     var lenTemp = result.length;
                     pg = result[lenTemp - 1];
                     appPageHistory.pop();
                     j('#mainHeader').load(headerBackBtn);
                     j('#mainContainer').load(pg);
                 }else if(pg == "app/pages/voucherDetails.html"){
                    var result = arrayRemove(appPageHistory, "app/pages/voucherDetails.html");
                     var lenTemp = result.length;
                     pg = result[lenTemp - 1];
                     appPageHistory.pop();
                     j('#mainHeader').load(headerBackBtn);
                     j('#mainContainer').load(pg);
                 }
                 if (!(pg == null)) {
                     j('#mainContainer').load(pg);
                 }
         }
     }
 }

 //Method added for Removing element from array
function arrayRemove(arr, value) {

   return arr.filter(function(ele){
       return ele != value;
   });

}

 function goBackEvent() {
     var currentUser = getUserID();
     var loginPath = defaultPagePath + 'loginPage.html';
     var headerBackBtn = defaultPagePath + 'backbtnPage.html';
     var headerCatMsg = defaultPagePath + 'categoryMsgPage.html';

     if (currentUser == '') {
         j('#mainContainer').load(loginPath);
     } else {
         //To check if the page that needs to be displayed is login page. So 'historylength-2'
         var historylength = appPageHistory.length;
         var goToPage = appPageHistory[historylength - 2];

         if (goToPage !== null && goToPage == loginPath) {
             return 0;
         } else {
             appPageHistory.pop();
             var len = appPageHistory.length;
             if (len == 0) {
                 navigator.app.exitApp();
                 //navigator.notification.confirm("Are you sure want to exit from App?", onConfirmExit, "Confirmation", "Yes,No");
             } else {
                 var pg = appPageHistory[len - 1];
                 if (pg == "app/pages/addAnExpense.html") {

                     j('#mainHeader').load(headerBackBtn);
                 } else if (pg == "app/pages/category.html") {

                     j('#mainHeader').load(headerCatMsg);
                     forceCloseDropdown();
                 }
                 if (!(pg == null)) {
                     j('#mainContainer').load(pg);
                 }
             }
         }
     }
 }

 function onConfirmExit(button) {
     if (button == 2) { //If User select a No, then return back;
         return;
     } else {
         navigator.app.exitApp(); // If user select a Yes, quit from the app.
     }
 }

 //Local Database Create,Save,Display

 //Test for browser compatibility
 if (window.openDatabase) {

     //Create the database the parameters are 1. the database name 2.version number 3. a description 4. the size of the database (in bytes) 1024 x 1024 = 1MB
     var mydb = openDatabase("Expenzing", "0.1", "Expenzing", 1024 * 1024);
     //create All tables using SQL for the database using a transaction
     mydb.transaction(function(t) {
         //t.executeSql("CREATE TABLE IF NOT EXISTS employeeDetails (id INTEGER PRIMARY KEY ASC, firstName TEXT, lastName TEXT, gradeId INTEGER, budgetingStatus CHAR(1),unitId INTEGER, status TEXT)");
         t.executeSql("CREATE TABLE IF NOT EXISTS currencyMst (currencyId INTEGER PRIMARY KEY ASC, currencyName TEXT)");
         t.executeSql("CREATE TABLE IF NOT EXISTS accountHeadMst (accountHeadId INTEGER PRIMARY KEY ASC, accHeadName TEXT)");
         t.executeSql("CREATE TABLE IF NOT EXISTS expNameMst (id INTEGER PRIMARY KEY ASC,expNameMstId INTEGER, expName TEXT, expIsFromToReq CHAR(1),accCodeId INTEGER NOT NULL,accHeadId INTEGER NOT NULL,  expIsUnitReq CHAR(1),expRatePerUnit Double, expFixedOrVariable CHAR(1), expFixedLimitAmt Double,expPerUnitActiveInative CHAR(1),isErReqd CHAR(1),limitAmountForER Double,isAttachmentReq CHAR(1),isEntiLineOrVoucherLevel CHAR(1),periodicity TEXT,isUnitPeriodic TEXT)");
         t.executeSql("CREATE TABLE IF NOT EXISTS businessExpDetails (busExpId INTEGER PRIMARY KEY ASC, accHeadId INTEGER REFERENCES accountHeadMst(accHeadId), expNameId INTEGER REFERENCES expNameMst(expNameId),expDate DATE, expFromLoc TEXT, expToLoc TEXT, expNarration TEXT, expUnit INTEGER, expAmt Double, currencyId INTEGER REFERENCES currencyMst(currencyId),isEntitlementExceeded TEXT,busExpAttachment BLOB,wayPointunitValue TEXT)");
         t.executeSql("CREATE TABLE IF NOT EXISTS walletMst (walletId INTEGER PRIMARY KEY ASC AUTOINCREMENT, walletAttachment  BLOB)");
         t.executeSql("CREATE TABLE IF NOT EXISTS travelModeMst (travelModeId INTEGER PRIMARY KEY ASC, travelModeName TEXT)");
         t.executeSql("CREATE TABLE IF NOT EXISTS travelCategoryMst (travelCategoryId INTEGER PRIMARY KEY ASC, travelCategoryName TEXT,travelModeId INTEGER)");
         t.executeSql("CREATE TABLE IF NOT EXISTS cityTownMst (cityTownId INTEGER PRIMARY KEY ASC, cityTownName TEXT, cityTownTypeId INTEGER)");
         t.executeSql("CREATE TABLE IF NOT EXISTS travelTypeMst (travelTypeId INTEGER PRIMARY KEY ASC, travelTypeName TEXT)");
         t.executeSql("CREATE TABLE IF NOT EXISTS travelAccountHeadMst (id INTEGER PRIMARY KEY ASC,accHeadId INTEGER, accHeadName TEXT, processId INTEGER)");
         t.executeSql("CREATE TABLE IF NOT EXISTS travelExpenseNameMst (id INTEGER PRIMARY KEY ASC,expenseNameId INTEGER, expenseName TEXT, isModeCategory char(1),accountCodeId INTEGER,accHeadId INTEGER REFERENCES travelAccountHeadMst(accHeadId))");
         t.executeSql("CREATE TABLE IF NOT EXISTS travelSettleExpDetails (tsExpId INTEGER PRIMARY KEY ASC,travelRequestId INTEGER, accHeadId INTEGER REFERENCES travelAccountHeadMst(accHeadId), expNameId INTEGER REFERENCES travelExpenseNameMst(expenseNameId),expDate DATE,expNarration TEXT, expUnit INTEGER, expAmt Double, currencyId INTEGER REFERENCES currencyMst(currencyId),travelModeId INTEGER REFERENCES travelModeMst(travelModeId), travelCategoryId INTEGER REFERENCES travelCategoryMst(travelCategoryId), cityTownId INTEGER REFERENCES cityTownMst(cityTownId),tsExpAttachment BLOB,isEntitlementExceeded TEXT)");
         t.executeSql("CREATE TABLE IF NOT EXISTS travelRequestDetails (travelRequestId INTEGER PRIMARY KEY ASC, travelRequestNo TEXT,title TEXT, accountHeadId INTEGER,travelStartDate DATE,travelEndDate DATE,travelDomOrInter CHAR(1), advanceRequested TEXT,advanceAmount INTEGER,travelSelfAmount INTEGER)");
         /*         t.executeSql("CREATE TABLE IF NOT EXISTS travelRequestDetails (travelRequestId INTEGER PRIMARY KEY ASC, travelRequestNo TEXT,title TEXT, accountHeadId INTEGER,travelStartDate DATE,travelEndDate DATE,travelDomOrInter CHAR(1))");
          */
         t.executeSql("CREATE TABLE IF NOT EXISTS accountHeadEAMst (accountHeadId INTEGER PRIMARY KEY ASC, accHeadName TEXT)");
         t.executeSql("CREATE TABLE IF NOT EXISTS advanceType (advancetypeID INTEGER PRIMARY KEY ASC, advancetype TEXT)");
         t.executeSql("CREATE TABLE IF NOT EXISTS employeeAdvanceDetails (empAdvID INTEGER PRIMARY KEY ASC, emplAdvVoucherNo TEXT,empAdvTitle TEXT,Amount Double)");
         t.executeSql("CREATE TABLE IF NOT EXISTS currencyConversionMst (currencyCovId INTEGER PRIMARY KEY ASC, currencyId INTEGER REFERENCES currencyMst(currencyId), defaultcurrencyId INTEGER ,conversionRate Double)");
         t.executeSql("CREATE TABLE IF NOT EXISTS smsMaster (smsId INTEGER PRIMARY KEY ASC, smsText TEXT,senderAddr TEXT,smsSentDate TEXT,smsAmount TEXT)");
         t.executeSql("CREATE TABLE IF NOT EXISTS smsScrutinizerMst (ID INTEGER PRIMARY KEY ASC, filterText TEXT, filterFlag TEXT, status TEXT)");
         t.executeSql("CREATE TABLE IF NOT EXISTS delayMst (ID INTEGER PRIMARY KEY ASC, processId INTEGER, noOfDays INTEGER, restrictionStatus CHAR(1), status CHAR(1), moduleId INTEGER)");
         t.executeSql("CREATE TABLE IF NOT EXISTS perDiemTravelMst (ID INTEGER PRIMARY KEY ASC, companyId INTEGER, gradeId INTEGER, amount INTEGER, domCityTownId INTEGER, expenseHeadId INTEGER, currencyId INTEGER)");
         t.executeSql("CREATE TABLE IF NOT EXISTS profileMst (profileId INTEGER PRIMARY KEY ASC AUTOINCREMENT,empId INTEGER, profileAttachment  BLOB)");

        // ****************     Approval Table      ***************** //

         t.executeSql("CREATE TABLE IF NOT EXISTS BEHeader ( busExpHeaderId INTEGER ,busExpNumber TEXT,accHeadId INTEGER REFERENCES accountHeadMst(accHeadId),accHeadDesc TEXT,voucherDate DATE,startDate DATE,endDate DATE,currencyId INTEGER REFERENCES currencyMst(currencyId),currencyName TEXT,editorTotalAmt DOUBLE,vocherStatus TEXT, currentOwnerId INTEGER, currentOwnerName TEXT,  createdById INTEGER, creatorName TEXT,rejectionComments TEXT,query TEXT,queryId INTEGER,queryAns TEXT , workflowToBeFollowed TEXT)");
         t.executeSql("CREATE TABLE IF NOT EXISTS BEDetails (busExpDetailId INTEGER ,busExpHeaId INTEGER , expNameId INTEGER REFERENCES expNameMst(expNameId), expName  TEXT,expDate DATE,currencyId INTEGER REFERENCES currencyMst(currencyId),currencyName TEXT, perUnit INTEGER,fromLocation TEXT,toLocation TEXT,convertedAmt DOUBLE ,expAttachment BLOB)");
         t.executeSql("CREATE TABLE IF NOT EXISTS TravelHeader (headerId INTEGER ,voucherNumber TEXT,accHeadId INTEGER REFERENCES accountHeadMst(accHeadId),accHeadDesc TEXT,voucherDate DATE,startDate DATE,endDate DATE,currencyId INTEGER REFERENCES currencyMst(currencyId),currencyName TEXT,editorTotalAmt DOUBLE,vocherStatus TEXT, currentOwnerId INTEGER, currentOwnerName TEXT,  createdById INTEGER, creatorName TEXT,rejectionComments TEXT, iternaryType TEXT , toLocation TEXT, fromLocation TEXT, travelType TEXT, travelTitle TEXT, query TEXT,queryId INTEGER,queryAns TEXT, workflowToBeFollowed TEXT)");

     });
 } else {
     alert(window.lang.translate('WebSQL is not supported by your browser!'));
 }

 //function to remove a employeeDetails from the database, passed the row id as it's only parameter
 function saveBusinessDetails(status) {
     exceptionMessage = '';
     if (mydb) {
         //get the values of the text inputs
         var exp_date = document.getElementById('expDate').value;
         var exp_from_loc = document.getElementById('expFromLoc').value;
         var exp_to_loc = document.getElementById('expToLoc').value;
         var exp_narration = document.getElementById('expNarration').value;
         var exp_unit = document.getElementById('expUnit').value;
         var way_points = document.getElementById('wayPointunitValue').value;
         var exp_amt = document.getElementById('expAmt').value;
         var entitlement_exceeded = exceptionStatus;
         exceptionStatus = "N";
         var acc_head_id;
         var acc_head_val;
         var exp_name_id;
         var exp_name_val;
         var currency_id;
         var currency_val;
         var file;
         if (j("#accountHead").select2('data') != null) {
             acc_head_id = j("#accountHead").select2('data').id;
             acc_head_val = j("#accountHead").select2('data').name;
         } else {
             acc_head_id = '-1';
         }
         if (j("#expenseName").select2('data') != null) {
             exp_name_id = j("#expenseName").select2('data').id;
             exp_name_val = j("#expenseName").select2('data').name;
         } else {
             exp_name_id = '-1';
         }

         if (j("#currency").select2('data') != null) {
             currency_id = j("#currency").select2('data').id;
             currency_val = j("#currency").select2('data').name;
         } else {
             currency_id = '-1';
         }

         if (fileTempGalleryBE == undefined || fileTempGalleryBE == "") {

         } else {
             file = fileTempGalleryBE;
         }

         if (fileTempCameraBE == undefined || fileTempCameraBE == "") {

         } else {
             file = fileTempCameraBE;
         }

         if (validateExpenseDetails(exp_date, exp_from_loc, exp_to_loc, exp_narration, exp_unit, exp_amt, acc_head_id, exp_name_id, currency_id, file)) {

             j('#loading_Cat').show();

             if (file == undefined) {
                 file = "";
             }

             mydb.transaction(function(t) {
                 t.executeSql("INSERT INTO businessExpDetails (expDate, accHeadId,expNameId,expFromLoc, expToLoc, expNarration, expUnit,expAmt,currencyId,isEntitlementExceeded,busExpAttachment,wayPointunitValue) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [exp_date, acc_head_id, exp_name_id, exp_from_loc, exp_to_loc, exp_narration, exp_unit, exp_amt, currency_id, entitlement_exceeded, file, way_points]);

                 if (status == "0") {

                     document.getElementById('expDate').value = "";
                     document.getElementById('expFromLoc').value = "";
                     document.getElementById('expToLoc').value = "";
                     document.getElementById('expNarration').value = "";
                     document.getElementById('expUnit').value = "";
                     document.getElementById('expAmt').value = "";
                     document.getElementById('wayPointunitValue').value = "";
                     smallImageBE.style.display = 'none';
                     smallImageBE.src = "";
                     j('#errorMsgArea').children('span').text("");
                     j('#accountHead').select2('data', '');
                     j('#expenseName').select2('data', '');
                     //j('#currency').select2('data', '');
                     j('#loading_Cat').hide();
                     //j('#syncSuccessMsg').empty();
                     document.getElementById("syncSuccessMsg").innerHTML = "Expenses added successfully.";
                     j('#syncSuccessMsg').hide().fadeIn('slow').delay(300).fadeOut('slow');
                     resetImageData();
                     //createBusinessExp();
                 } else {
                     viewBusinessExp();
                 }
             });

         } else {
             return false;
         }
     } else {
         alert(window.lang.translate('Database not found, your browser does not support web sql!'));

     }
 }

 function saveTravelSettleDetails(status) {
    // exceptionStatus = 'N';
     exceptionMessage = '';

     if (mydb) {
         //get the values of the text inputs
         var exp_date = document.getElementById('expDate').value;
         var exp_narration = document.getElementById('expNarration').value;
         var exp_unit = document.getElementById('expUnit').value;
         var exp_amt = document.getElementById('expAmt').value;
         var travelRequestId;
         var acc_head_val;
         var exp_name_id;
         var exp_name_val;
         var currency_id;
         var currency_val;
         var travelMode_id;
         var travelMode_val;
         var travelCategory_id;
         var travelCategory_val;
         var cityTown_id;
         var cityTown_val;
         var file;
         
         if (j("#travelRequestName").select2('data') != null) {
             travelRequestId = j("#travelRequestName").select2('data').id;
             travelRequestNo = j("#travelRequestName").select2('data').name;
         } else {
             travelRequestId = '-1';
         }

         if (j("#travelExpenseName").select2('data') != null) {
             exp_name_id = j("#travelExpenseName").select2('data').id;
             exp_name_val = j("#travelExpenseName").select2('data').name;
         } else {
             exp_name_id = '-1';
         }

         if (j("#currency").select2('data') != null) {
             currency_id = j("#currency").select2('data').id;
             currency_val = j("#currency").select2('data').name;
         } else {
             currency_id = '-1';
         }
         if (j("#travelModeForTS").select2('data') != null) {
             travelMode_id = j("#travelModeForTS").select2('data').id;
             travelMode_val = j("#travelModeForTS").select2('data').name;
         } else {
             travelMode_id = '-1';
         }
         if (j("#travelCategoryForTS").select2('data') != null) {
             travelCategory_id = j("#travelCategoryForTS").select2('data').id;
             travelCategory_val = j("#travelCategoryForTS").select2('data').name;
         } else {
             travelCategory_id = '-1';
         }
         if (j("#Citytown").select2('data') != null) {
             cityTown_id = j("#Citytown").select2('data').id;
             cityTown_val = j("#Citytown").select2('data').name;
         } else {
             cityTown_id = '-1';
         }
         if (fileTempGalleryTS == undefined || fileTempGalleryTS == "") {

         } else {
             file = fileTempGalleryTS;
         }

         if (fileTempCameraTS == undefined || fileTempCameraTS == "") {

         } else {
             file = fileTempCameraTS;
         }

         if (validateTSDetails(exp_date, exp_narration, exp_unit, exp_amt, travelRequestId, exp_name_id, currency_id, travelMode_id, travelCategory_id, cityTown_id)) {
             j('#loading_Cat').show();

             if (file == undefined) {
                 file = "";
             }
            
             mydb.transaction(function(t) {
                 t.executeSql("INSERT INTO travelSettleExpDetails  (expDate, travelRequestId,expNameId,expNarration, expUnit,expAmt,currencyId,travelModeId,travelCategoryId,cityTownId,tsExpAttachment,isEntitlementExceeded) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [exp_date, travelRequestId, exp_name_id, exp_narration, exp_unit, exp_amt, currency_id, travelMode_id, travelCategory_id, cityTown_id, file,exceptionStatus]);

                 if (status == "0") {
                     document.getElementById('expDate').value = "";
                     document.getElementById('expNarration').value = "";
                     document.getElementById('expUnit').value = "";
                     document.getElementById('expAmt').value = "";
                     j('#travelRequestName').select2('data', '');
                     j('#travelExpenseName').select2('data', '');
                     j('#travelModeForTS').select2('data', '');
                     j('#travelCategoryForTS').select2('data', '');
                     j('#Citytown').select2('data', '');
                     j("label[for='startDate']").html("");
                     j("label[for='endDate']").html("");
                     smallImageTS.style.display = 'none';
                     smallImageTS.src = "";
                     j('#loading_Cat').hide();
                     //j('#syncSuccessMsg').empty();
                     document.getElementById("syncSuccessMsg").innerHTML = "Expenses added successfully.";
                     j('#syncSuccessMsg').hide().fadeIn('slow').delay(300).fadeOut('slow');
                     resetImageData();
                 } else {
                     viewTravelSettlementExp();
                 }
             });

         } else {
             return false;
         }
     } else {
         alert(window.lang.translate('Database not found, your browser does not support web sql!'));
     }
 }

 function create_blob(file, callback) {
     var reader = new FileReader();
     reader.onload = function() {
         callback(reader.result);
     };
     if (typeof file == 'undefined') {
         file = new Blob();
     }
     reader.readAsDataURL(file);
 }

 var jsonExpenseDetailsArr = [];

 function fetchExpenseClaim() {
     mytable = j('<table></table>').attr({
         id: "source",
         class: ["table", "table-striped", "table-bordered"].join(' ')
     });
     var rowThead = j("<thead></thead>").appendTo(mytable);
     var rowTh = j('<tr></tr>').attr({
         class: ["test"].join(' ')
     }).appendTo(rowThead);

     j('<th lang=\'en\'></th>').text("Date").appendTo(rowTh);
     j('<th lang=\'en\'></th>').text("Expense Name").appendTo(rowTh);
     j('<th lang=\'en\'></th>').text("Narration From/To Loc").appendTo(rowTh);
     j('<th lang=\'en\'></th>').text("Amt").appendTo(rowTh);
     var cols = new Number(5);

     mydb.transaction(function(t) {
         var headerOprationBtn;
         t.executeSql('SELECT * FROM businessExpDetails INNER JOIN expNameMst ON businessExpDetails.expNameId =expNameMst.id INNER JOIN currencyMst ON businessExpDetails.currencyId =currencyMst.currencyId INNER JOIN accountHeadMst ON businessExpDetails.accHeadId =accountHeadMst.accountHeadId;', [],
             function(transaction, result) {
                 if (result != null && result.rows != null) {

                     for (var i = 0; i < result.rows.length; i++) {

                         var row = result.rows.item(i);
                         var shrinkFromTo;
                         var newDateFormat = reverseConvertDate(row.expDate.substring(0, 2)) + "-" + row.expDate.substring(3, 5) + " " + row.expDate.substring(6, 10);

                         if (window.localStorage.getItem("MobileMapRole") == 'true') {
                             if (row.expFromLoc != '' && row.expToLoc != '') {
                                 var shrinkNarration = row.expNarration.substring(0, row.expNarration.indexOf("--"))
                                 srinckFromTo = row.expFromLoc.substring(0, row.expFromLoc.indexOf(",")) + "/" + row.expToLoc.substring(0, row.expToLoc.indexOf(","));
                                 srinckFromTo = srinckFromTo.concat("...");
                             }
                         }

                         var rowss = j('<tr></tr>').attr({
                             class: ["test"].join(' ')
                         }).appendTo(mytable);

                         j('<td></td>').attr({
                             class: ["expDate"].join(' ')
                         }).html('<p style="color: black;">' + newDateFormat + '</P>').appendTo(rowss);
                         j('<td></td>').attr({
                             class: ["expName"].join(' ')
                         }).html('<p style="color: black;">' + row.expName + '</P>').appendTo(rowss).appendTo(rowss);
                         if (window.localStorage.getItem("MobileMapRole") == 'true') {
                             if (row.expFromLoc != '' && row.expToLoc != '') {
                                 j('<td></td>').attr({
                                     class: ["expNarration"].join(' ')
                                 }).html('<p style="color: black;">' + shrinkNarration + '</br>' + srinckFromTo + '</P>').appendTo(rowss);
                             } else {
                                 j('<td></td>').attr({
                                     class: ["expNarration"].join(' ')
                                 }).html('<p style="color: black;">' + row.expNarration + '</br>' + row.expFromLoc + "" + row.expToLoc + '</P>').appendTo(rowss);
                             }
                         } else {
                             if (row.expFromLoc != '' && row.expToLoc != '') {
                                 j('<td></td>').attr({
                                     class: ["expNarration"].join(' ')
                                 }).html('<p style="color: black;">' + row.expNarration + '</br>' + row.expFromLoc + "/" + row.expToLoc + '</P>').appendTo(rowss);
                             } else {
                                 j('<td></td>').attr({
                                     class: ["expNarration"].join(' ')
                                 }).html('<p style="color: black;">' + row.expNarration + '</br>' + row.expFromLoc + "" + row.expToLoc + '</P>').appendTo(rowss);
                             }
                         }

                         if (row.busExpAttachment.length == 0) {
                             j('<td></td>').attr({
                                 class: ["expAmt"].join(' ')
                             }).html('<p style="color: black;">' + row.expAmt + ' ' + row.currencyName + '</P>').appendTo(rowss);
                         } else {
                             j('<td></td>').attr({
                                 class: ["expAmt"].join(' ')
                             }).html('<p style="color: black;">' + row.expAmt + ' ' + row.currencyName + '</P><img src="images/attach.png" width="25px" height="25px">').appendTo(rowss);
                         }
                         j('<td></td>').attr({
                             class: ["expDate1", "displayNone"].join(' ')
                         }).text(row.expDate).appendTo(rowss);
                         j('<td></td>').attr({
                             class: ["expFromLoc1", "displayNone"].join(' ')
                         }).text(row.expFromLoc).appendTo(rowss);
                         j('<td></td>').attr({
                             class: ["expToLoc1", "displayNone"].join(' ')
                         }).text(row.expToLoc).appendTo(rowss);
                         j('<td></td>').attr({
                             class: ["expNarration1", "displayNone"].join(' ')
                         }).text(row.expNarration).appendTo(rowss);
                         j('<td></td>').attr({
                             class: ["expAmt1", "displayNone"].join(' ')
                         }).text(row.expAmt).appendTo(rowss);
                         j('<td></td>').attr({
                             class: ["busAttachment", "displayNone"].join(' ')
                         }).text(row.busExpAttachment).appendTo(rowss);
                         j('<td></td>').attr({
                             class: ["accHeadId", "displayNone"].join(' ')
                         }).text(row.accHeadId).appendTo(rowss);
                         j('<td></td>').attr({
                             class: ["expNameId", "displayNone"].join(' ')
                         }).text(row.expNameMstId).appendTo(rowss);
                         j('<td></td>').attr({
                             class: ["expUnit", "displayNone"].join(' ')
                         }).text(row.expUnit).appendTo(rowss);
                         j('<td></td>').attr({
                             class: ["currencyId", "displayNone"].join(' ')
                         }).text(row.currencyId).appendTo(rowss);
                         j('<td></td>').attr({
                             class: ["accountCodeId", "displayNone"].join(' ')
                         }).text(row.accCodeId).appendTo(rowss);
                         //j('<td></td>').attr({ class: ["expName","displayNone"].join(' ') }).text(row.expName).appendTo(rowss);       
                         j('<td></td>').attr({
                             class: ["busExpId", "displayNone"].join(' ')
                         }).text(row.busExpId).appendTo(rowss);
                         j('<td></td>').attr({
                             class: ["isErReqd", "displayNone"].join(' ')
                         }).text(row.isErReqd).appendTo(rowss);
                         j('<td></td>').attr({
                             class: ["ERLimitAmt", "displayNone"].join(' ')
                         }).text(row.limitAmountForER).appendTo(rowss);
                         j('<td></td>').attr({
                             class: ["isEntitlementExceeded", "displayNone"].join(' ')
                         }).text(row.isEntitlementExceeded).appendTo(rowss);
                         j('<td></td>').attr({
                             class: ["wayPoint", "displayNone"].join(' ')
                         }).text(row.wayPointunitValue).appendTo(rowss);
                         j('<td></td>').attr({
                             class: ["isAttachmentReq", "displayNone"].join(' ')
                         }).text(row.isAttachmentReq).appendTo(rowss);
                         j('<td></td>').attr({
                             class: ["isEntiLineOrVoucherLevel", "displayNone"].join(' ')
                         }).text(row.isEntiLineOrVoucherLevel).appendTo(rowss);
                         j('<td></td>').attr({
                             class: ["expFixedLimitAmt", "displayNone"].join(' ')
                         }).text(row.expFixedLimitAmt).appendTo(rowss);
                     }

                     j("#source tr").click(function() {
                         headerOprationBtn = defaultPagePath + 'headerPageForBEOperation.html';
                         if (j(this).hasClass("selected")) {
                             var headerBackBtn = defaultPagePath + 'headerPageForBEOperation.html';
                             j(this).removeClass('selected');
                             j('#mainHeader').load(headerBackBtn);
                         } else {
                             if (j(this).text() == 'DateExpense NameNarration From/To LocAmt') {

                             } else {
                                 j('#mainHeader').load(headerOprationBtn);
                                 j(this).addClass('selected');
                             }
                         }
                     });
                 }
             });
     });
     mytable.appendTo("#box");
     var header = defaultPagePath + 'backbtnPage.html';
     j('#mainHeader').load(header);
 }

 function validateAccountHead() {
     var map = new Map();

     if (j("#source tr.selected").hasClass("selected")) {
         j("#source tr.selected").each(function(index, row) {

             var currentAccountHeadID = j(this).find('td.accHeadId').text();

             if (map.has(currentAccountHeadID)) {
                 var value = map.get(currentAccountHeadID);

                 map.set(currentAccountHeadID, currentAccountHeadID);
             } else {
                 map.set(currentAccountHeadID, currentAccountHeadID);
             }

         });
     }
     if (map.size == 1) {
         return true;
     } else {
         return false;
     }
 }

 function fetchTravelSettlementExp() {

     mytable = j('<table></table>').attr({
         id: "source",
         class: ["table", "table-striped", "table-bordered" ],
         style:["overflow-x: auto;display: inline-table;"].join(' ')
     });

     var rowThead = j("<thead></thead>").appendTo(mytable);
     var rowTh = j('<tr></tr>').attr({
         class: ["test"].join(' ')
     }).appendTo(rowThead);

     j('<th lang=\'en\'></th>').text("Date").appendTo(rowTh);
     j('<th lang=\'en\'></th>').text("TR").appendTo(rowTh);
     j('<th lang=\'en\'></th>').text("Expense Name").appendTo(rowTh);
     j('<th lang=\'en\'></th>').text("Amt").appendTo(rowTh);
     j('<th lang=\'en\'></th>').text("CityTown").appendTo(rowTh);
     j('<th lang=\'en\'></th>').text("Narration").appendTo(rowTh);

     var cols = new Number(4);

     mydb.transaction(function(t) {

         t.executeSql('select * from travelSettleExpDetails inner join cityTownMst on cityTownMst.cityTownId = travelSettleExpDetails.cityTownId inner join currencyMst on travelSettleExpDetails.currencyId = currencyMst.currencyId inner join travelExpenseNameMst on travelExpenseNameMst.id = travelSettleExpDetails.expNameId  inner join travelRequestDetails on travelRequestDetails.travelRequestId = travelSettleExpDetails.travelRequestId;', [],
             function(transaction, result) {

                 if (result != null && result.rows != null) {

                     for (var i = 0; i < result.rows.length; i++) {

                         var row = result.rows.item(i);

                        var newDateFormat = getDateForDetailLine(row.expDate);
                        var length = row.travelRequestNo.length;
                        var trNo = (row.travelRequestNo).substr(length-2);

                        var narration = row.expNarration;

                        if(narration > '8'){
                           narration = narration.substring(0,5)+"..";
                        }

                        var attachmentLength = row.tsExpAttachment.length;
                        //attachmentLength = attachmentLength+1;

                        var cityTown = row.cityTownName;

                        if(cityTown > '9'){
                           cityTown = cityTown.substring(0,6)+"..";
                        }

                         var rowss = j('<tr></tr>').attr({
                             class: ["test"].join(' ')
                         }).appendTo(mytable);

                         j('<td></td>').attr({
                             class: ["expDate"].join(' ')
                         }).html('<p style="color: black;">' + newDateFormat + '</P>').appendTo(rowss);
                         j('<td></td>').attr({
                             class: ["trNo"].join(' ')
                         }).html('<p style="color: black;">' + trNo + '</P>').appendTo(rowss);
                         
                         j('<td></td>').attr({
                             class: ["expenseName"].join(' ')
                         }).html('<p style="color: black;">' + row.expenseName + '</P>').appendTo(rowss).appendTo(rowss);

                         j('<td></td>').attr({
                             class: ["expAmt"].join(' ')
                         }).html('<p style="color: black;">' + row.expAmt + ' ' + row.currencyName + '</P>').appendTo(rowss);
                         j('<td></td>').attr({
                             class: ["cityTownName"].join(' ')
                         }).html('<p style="color: black;">' + cityTown + '</P>').appendTo(rowss);

                         if (attachmentLength == 0) {
                             j('<td></td>').attr({
                                 class: ["expNarration"].join(' ')
                             }).html('<p style="color: black;">' + narration + '</P>').appendTo(rowss);
                         } else {
                             j('<td></td>').attr({
                                 class: ["expNarration"].join(' ')
                             }).html('<p style="color: black;">' + narration + '</P><img src="images/attach.png" width="25px" height="25px">').appendTo(rowss);
                         }
                         j('<td></td>').attr({
                             class: ["expDate1", "displayNone"].join(' ')
                         }).text(row.expDate).appendTo(rowss);
                         j('<td></td>').attr({
                             class: ["expAmt1", "displayNone"].join(' ')
                         }).text(row.expAmt).appendTo(rowss);
                         j('<td></td>').attr({
                             class: ["expNarration1", "displayNone"].join(' ')
                         }).text(row.expNarration).appendTo(rowss);
                         j('<td></td>').attr({
                             class: ["travelRequestId", "displayNone"].join(' ')
                         }).text(row.travelRequestId).appendTo(rowss);
                         j('<td></td>').attr({
                             class: ["tsExpAttachment", "displayNone"].join(' ')
                         }).text(row.tsExpAttachment).appendTo(rowss);
                         j('<td></td>').attr({
                             class: ["expNameId", "displayNone"].join(' ')
                         }).text(row.expenseNameId).appendTo(rowss);
                         j('<td></td>').attr({
                             class: ["expUnit", "displayNone"].join(' ')
                         }).text(row.expUnit).appendTo(rowss);
                         j('<td></td>').attr({
                             class: ["currencyId", "displayNone"].join(' ')
                         }).text(row.currencyId).appendTo(rowss);
                         j('<td></td>').attr({
                             class: ["modeId", "displayNone"].join(' ')
                         }).text(row.travelModeId).appendTo(rowss);
                         j('<td></td>').attr({
                             class: ["categoryId", "displayNone"].join(' ')
                         }).text(row.travelCategoryId).appendTo(rowss);
                         j('<td></td>').attr({
                             class: ["fromcityTownId", "displayNone"].join(' ')
                         }).text(row.cityTownId).appendTo(rowss);
                         j('<td></td>').attr({
                             class: ["accountCodeId", "displayNone"].join(' ')
                         }).text(row.accCodeId).appendTo(rowss);
                         j('<td></td>').attr({
                             class: ["expName", "displayNone"].join(' ')
                         }).text(row.expenseName).appendTo(rowss);
                         j('<td></td>').attr({
                             class: ["tsExpId", "displayNone"].join(' ')
                         }).text(row.tsExpId).appendTo(rowss);
                         j('<td></td>').attr({
                             class: ["isModeCategory", "displayNone"].join(' ')
                         }).text(row.isModeCategory).appendTo(rowss);
                         j('<td></td>').attr({
                             class: ["accountCodeId", "displayNone"].join(' ')
                         }).text(row.accountCodeId).appendTo(rowss);
                         j('<td></td>').attr({
                             class: ["isEntitlementExceeded", "displayNone"].join(' ')
                         }).text(row.isEntitlementExceeded).appendTo(rowss);
                     }

                     j("#source tr").click(function() {
                         headerOprationBtn = defaultPagePath + 'headerPageForTSOperation.html';
                         if (j(this).hasClass("selected")) {
                             var headerBackBtn = defaultPagePath + 'headerPageForTSOperation.html';
                             j(this).removeClass('selected');
                             populateTSAmount();
                             j('#mainHeader').load(headerBackBtn);
                         } else {
                             if (j(this).text() == 'DateExpense NameAmtcityTownNarration') {

                             } else {
                                 j('#mainHeader').load(headerOprationBtn);
                                 j(this).addClass('selected');
                                 populateTSAmount();
                             }
                         }
                     });
                 }
             });
     });
     mytable.appendTo("#box");
     var header = defaultPagePath + 'backbtnPage.html';
     j('#mainHeader').load(header);
 }

 function synchronizeBEMasterData() {
     var jsonSentToSync = new Object();

     jsonSentToSync["BudgetingStatus"] = window.localStorage.getItem("BudgetingStatus");
     jsonSentToSync["EmployeeId"] = window.localStorage.getItem("EmployeeId");
     jsonSentToSync["GradeId"] = window.localStorage.getItem("GradeID");
     jsonSentToSync["UnitId"] = window.localStorage.getItem("UnitId");
     j('#loading_Cat').show();
     if (mydb) {
         j.ajax({
             url: window.localStorage.getItem("urlPath") + "SyncAccountHeadWebService",
             type: 'POST',
             dataType: 'json',
             crossDomain: true,
             data: JSON.stringify(jsonSentToSync),
             success: function(data) {
                 if (data.Status == 'Success') {
                     mydb.transaction(function(t) {
                         t.executeSql("DELETE FROM accountHeadMst");
                         var accountHeadArray = data.AccountHeadArray;

                         if (accountHeadArray != null && accountHeadArray.length > 0) {
                             for (var i = 0; i < accountHeadArray.length; i++) {
                                 var stateArr = new Array();
                                 stateArr = accountHeadArray[i];
                                 var acc_head_id = stateArr.Value;
                                 var acc_head_name = stateArr.Label;
                                 t.executeSql("INSERT INTO accountHeadMst (accountHeadId,accHeadName) VALUES (?, ?)", [acc_head_id, acc_head_name]);

                             }
                         }
                     });

                     mydb.transaction(function(t) {
                         t.executeSql("DELETE FROM expNameMst");
                         var expNameArray = data.ExpenseNameArray;
                         if (expNameArray != null && expNameArray.length > 0) {
                             for (var i = 0; i < expNameArray.length; i++) {
                                 var stateArr = new Array();
                                 stateArr = expNameArray[i];
                                 var exp_id = stateArr.ExpenseID;
                                 var exp_name = stateArr.ExpenseName;
                                 var exp_is_from_to_req = stateArr.IsFromToRequired;
                                 var acc_code_id = stateArr.AccountCodeId;
                                 var acc_head_id = stateArr.AccountHeadId;
                                 var isErReqd;
                                 var limitAmountForER;
                                 var exp_is_unit_req;
                                 var exp_per_unit;
                                 var exp_fixed_or_var;
                                 var exp_fixed_limit_amt;
                                 var isAttachmentReq;
                                 var isEntiLineOrVoucherLevel;
                                 var periodicity;
                                 var isUnitPeriodic;

                                 if (typeof stateArr.FixedOrVariable != 'undefined') {
                                     exp_fixed_or_var = stateArr.FixedOrVariable;
                                 } else {
                                     exp_fixed_or_var = 'V';
                                 }

                                 if (typeof stateArr.IsUnitRequired != 'undefined') {
                                     exp_is_unit_req = stateArr.IsUnitRequired;
                                     if (exp_is_unit_req == 'N')
                                         exp_fixed_or_var = 'V';
                                 } else {
                                     exp_is_unit_req = 'N';
                                 }

                                 if (typeof stateArr.RatePerUnit != 'undefined') {
                                     exp_per_unit = stateArr.RatePerUnit;
                                 } else {
                                     exp_per_unit = 0.0;
                                 }

                                 if (typeof stateArr.ActiveInactive != 'undefined') {
                                     exp_per_unit_active_inactive = stateArr.ActiveInactive;
                                 } else {
                                     exp_per_unit_active_inactive = 0;
                                 }

                                 if (typeof stateArr.FixedLimitAmount != 'undefined') {
                                     exp_fixed_limit_amt = stateArr.FixedLimitAmount;
                                 } else {
                                     exp_fixed_limit_amt = 0.0;
                                 }
                                 if (typeof stateArr.IsErReqd != 'undefined') {
                                     isErReqd = stateArr.IsErReqd;
                                 } else {
                                     isErReqd = 'N';
                                 }
                                 if (typeof stateArr.LimitAmountForER != 'undefined') {
                                     limitAmountForER = stateArr.LimitAmountForER;
                                 } else {
                                     limitAmountForER = 0.0;
                                 }
                                 if (typeof stateArr.IsAttachmentReq != 'undefined') {
                                     isAttachmentReq = stateArr.IsAttachmentReq;
                                 } else {
                                     isAttachmentReq = 'N';
                                 }
                                 if (typeof stateArr.IsEntiLineOrVoucherLevel != 'undefined') {
                                     isEntiLineOrVoucherLevel = stateArr.IsEntiLineOrVoucherLevel;
                                 } else {
                                     isEntiLineOrVoucherLevel = 'V';
                                 }

                                 if (typeof stateArr.Periodicity != 'undefined') {
                                     periodicity = stateArr.Periodicity;
                                 } else {
                                     periodicity = 'N';
                                 }
                                 if (typeof stateArr.IsUnitPeriodic != 'undefined') {
                                     isUnitPeriodic = stateArr.IsUnitPeriodic;
                                 } else {
                                     isUnitPeriodic = 'N';
                                 }
                                 //console.log("exp_id:"+exp_id+"  -exp_name:"+exp_name+"  -exp_is_from_to_req:"+exp_is_from_to_req+"  -acc_code_id:"+acc_code_id+"  -acc_head_id:"+acc_head_id+"  -exp_is_unit_req:"+exp_is_unit_req+"  -exp_per_unit:"+exp_per_unit+"  -exp_fixed_or_var:"+exp_fixed_or_var+"  -exp_fixed_limit_amt:"+exp_fixed_limit_amt)                                        
                                 t.executeSql("INSERT INTO expNameMst ( expNameMstId,expName, expIsFromToReq , accCodeId , accHeadId , expIsUnitReq , expRatePerUnit, expFixedOrVariable , expFixedLimitAmt,expPerUnitActiveInative,isErReqd,limitAmountForER,isAttachmentReq,isEntiLineOrVoucherLevel,periodicity,isUnitPeriodic) VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [exp_id, exp_name, exp_is_from_to_req, acc_code_id, acc_head_id, exp_is_unit_req, exp_per_unit, exp_fixed_or_var, exp_fixed_limit_amt, exp_per_unit_active_inactive, isErReqd, limitAmountForER, isAttachmentReq, isEntiLineOrVoucherLevel, periodicity, isUnitPeriodic]);
                             }
                         }
                     });

                     mydb.transaction(function(t) {
                         t.executeSql("DELETE FROM currencyConversionMst");
                         var currencyConvArray = data.CurrencyConvArray;
                         if (currencyConvArray != null && currencyConvArray.length > 0) {
                             for (var i = 0; i < currencyConvArray.length; i++) {
                                 var stateArr = new Array();
                                 stateArr = currencyConvArray[i];
                                 var currencyCovId = stateArr.currencyCovId;
                                 var currencyId = stateArr.currencyId;
                                 var defaultcurrencyId = stateArr.defaultcurrencyId;
                                 var conversionRate = stateArr.conversionRate;
                                 t.executeSql("INSERT INTO currencyConversionMst (currencyCovId,currencyId,defaultcurrencyId,conversionRate) VALUES (?, ?, ?, ?)", [currencyCovId, currencyId, defaultcurrencyId, conversionRate]);

                             }
                         }
                     });

                     j('#loading_Cat').hide();
                     document.getElementById("syncSuccessMsg").innerHTML = "Business Expenses synchronized successfully.";
                     j('#syncSuccessMsg').hide().fadeIn('slow').delay(500).fadeOut('slow');

                 } else {
                     j('#loading_Cat').hide();
                     document.getElementById("syncFailureMsg").innerHTML = "Business Expenses not synchronized successfully.";
                     j('#syncFailureMsg').hide().fadeIn('slow').delay(300).fadeOut('slow');

                 }

             },
             error: function(data) {
                 alert(window.lang.translate('Error: Oops something is wrong, Please Contact System Administer'));
             }
         });

         j.ajax({
             url: window.localStorage.getItem("urlPath") + "CurrencyService",
             type: 'POST',
             dataType: 'json',
             crossDomain: true,
             data: JSON.stringify(jsonSentToSync),
             success: function(data) {
                 if (data.Status == 'Success') {
                     var currencyArray = data.CurrencyArray;
                     mydb.transaction(function(t) {
                         t.executeSql("DELETE FROM currencyMst");
                         if (currencyArray != null && currencyArray.length > 0) {
                             for (var i = 0; i < currencyArray.length; i++) {
                                 var stateArr = new Array();
                                 stateArr = currencyArray[i];
                                 var curr_id = stateArr.Value;
                                 var curr_name = stateArr.Label;
                                 t.executeSql("INSERT INTO currencyMst (currencyId,currencyName) VALUES (?, ?)", [curr_id, curr_name]);

                             }
                         }
                     });
                     j('#loading_Cat').hide();
                     document.getElementById("syncFailureMsg").innerHTML = successMsgForCurrency;
                     j('#syncFailureMsg').hide().fadeIn('slow').delay(300).fadeOut('slow');

                 } else {
                     j('#loading_Cat').hide();
                     document.getElementById("syncFailureMsg").innerHTML = "Currency not synchronized successfully.";;
                     j('#syncFailureMsg').hide().fadeIn('slow').delay(300).fadeOut('slow');

                 }

             },
             error: function(data) {
                 alert(window.lang.translate('Error: Oops something is wrong, Please Contact System Administer'));
             }
         });

     } else {

         alert(window.lang.translate('Database not found, your browser does not support web sql!'));
     }

 }

 function synchronizeTRMasterData() {
     var jsonSentToSync = new Object();
     j('#loading_Cat').show();
     jsonSentToSync["BudgetingStatus"] = window.localStorage.getItem("BudgetingStatus");
     jsonSentToSync["EmployeeId"] = window.localStorage.getItem("EmployeeId");
     jsonSentToSync["GradeId"] = window.localStorage.getItem("GradeID");
     jsonSentToSync["UnitId"] = window.localStorage.getItem("UnitId");

     if (mydb) {
         j.ajax({
             url: window.localStorage.getItem("urlPath") + "SyncTravelAccountHeadWebService",
             type: 'POST',
             dataType: 'json',
             crossDomain: true,
             data: JSON.stringify(jsonSentToSync),
             success: function(data) {
                 if (data.Status == 'Success') {
                     mydb.transaction(function(t) {
                         t.executeSql("DELETE FROM travelAccountHeadMst");

                         var accountHeadArray = data.AccountHeadArray;
                         if (accountHeadArray != null && accountHeadArray.length > 0) {
                             for (var i = 0; i < accountHeadArray.length; i++) {
                                 var stateArr = new Array();
                                 stateArr = accountHeadArray[i];
                                 var acc_head_id = stateArr.AccountHeadId;
                                 var acc_head_name = stateArr.AccountHeadName;
                                 var process_id = stateArr.ProcessId;
                                 t.executeSql("INSERT INTO travelAccountHeadMst (accHeadId,accHeadName,processId) VALUES (?, ?, ?)", [acc_head_id, acc_head_name, process_id]);
                             }
                         }
                         t.executeSql("DELETE FROM travelExpenseNameMst");
                         var expenseNameArray = data.ExpenseHeadArray;
                         if (expenseNameArray != null && expenseNameArray.length > 0) {
                             for (var i = 0; i < expenseNameArray.length; i++) {
                                 var stateArr = new Array();
                                 stateArr = expenseNameArray[i];
                                 var expense_id = stateArr.ExpenseHeadId;
                                 var expense_name = stateArr.ExpenseHeadName;
                                 var account_code_id = stateArr.AccountCodeId;
                                 var is_mode_cotegory = stateArr.isModeCategory;
                                 var account_head_id = stateArr.AccountHeadId;
                                 t.executeSql("INSERT INTO travelExpenseNameMst (expenseNameId ,expenseName ,accountCodeId,isModeCategory,accHeadId) VALUES (?, ?, ?, ?,?)", [expense_id, expense_name, account_code_id, is_mode_cotegory, account_head_id]);
                             }
                         }
                     });
                     //j('#syncSuccessMsg').empty();
                     //document.getElementById("syncSuccessMsg").innerHTML = "Account Head synchronized Successfully.";
                     // j('#syncSuccessMsg').hide().fadeIn('slow').delay(300).fadeOut('slow');

                 } else {

                     document.getElementById("syncFailureMsg").innerHTML = "Account Head Not synchronized Successfully.";
                     j('#syncFailureMsg').hide().fadeIn('slow').delay(300).fadeOut('slow');
                 }
             },
             error: function(data) {
                 alert(window.lang.translate('Error: Oops something is wrong, Please Contact System Administer'));
             }

         });

         j.ajax({
             url: window.localStorage.getItem("urlPath") + "CurrencyService",
             type: 'POST',
             dataType: 'json',
             crossDomain: true,
             data: JSON.stringify(jsonSentToSync),
             success: function(data) {
                 if (data.Status == 'Success') {
                     var currencyArray = data.CurrencyArray;
                     mydb.transaction(function(t) {
                         t.executeSql("DELETE FROM currencyMst");
                         if (currencyArray != null && currencyArray.length > 0) {
                             for (var i = 0; i < currencyArray.length; i++) {
                                 var stateArr = new Array();
                                 stateArr = currencyArray[i];
                                 var curr_id = stateArr.Value;
                                 var curr_name = stateArr.Label;
                                 t.executeSql("INSERT INTO currencyMst (currencyId,currencyName) VALUES (?, ?)", [curr_id, curr_name]);

                             }
                         }
                     });
                     document.getElementById("syncSuccessMsg").innerHTML = successMsgForCurrency;
                     j('#syncSuccessMsg').hide().fadeIn('slow').delay(300).fadeOut('slow');

                 } else {

                     document.getElementById("syncFailureMsg").innerHTML = errorMsgForCurrency;
                     j('#syncFailureMsg').hide().fadeIn('slow').delay(300).fadeOut('slow');

                 }

             },
             error: function(data) {
                 alert(window.lang.translate('Error: Oops something is wrong, Please Contact System Administer'));
             }
         });

         j.ajax({
             url: window.localStorage.getItem("urlPath") + "SyncTravelMaster",
             type: 'POST',
             dataType: 'json',
             crossDomain: true,
             data: JSON.stringify(jsonSentToSync),
             success: function(data) {
                 if (data.Status == 'Success') {

                     // Used to store data when json object is returned in web service.
                     mydb.transaction(function(t) {
                         t.executeSql("DELETE FROM travelModeMst");
                         var modesJSONArray = data.ModesJSONArray;
                         if (modesJSONArray != null && modesJSONArray.length > 0) {
                             for (var i = 0; i < modesJSONArray.length; i++) {
                                 var stateArr = new Array();
                                 stateArr = modesJSONArray[i];
                                 var travel_mode_id = stateArr.TravelModeId;
                                 var travel_mode_name = stateArr.TravelModeName;
                                 t.executeSql("INSERT INTO travelModeMst (travelModeId,travelModeName) VALUES (?, ?)", [travel_mode_id, travel_mode_name]);

                             }
                         }
                     });

                     mydb.transaction(function(t) {
                         t.executeSql("DELETE FROM cityTownMst");
                         var cityTownJSONArray = data.CityTownJSONArray;
                         if (cityTownJSONArray != null && cityTownJSONArray.length > 0) {
                             for (var i = 0; i < cityTownJSONArray.length; i++) {
                                 var stateArr = new Array();
                                 stateArr = cityTownJSONArray[i];
                                 var citytown_id = stateArr.CityTownId;
                                 var citytown_name = stateArr.CityTownName;
                                 var cityTownTypeId = stateArr.CityTownTypeId;
                                 t.executeSql("INSERT INTO cityTownMst (cityTownId,cityTownName,cityTownTypeId) VALUES (?, ?, ?)", [citytown_id, citytown_name, cityTownTypeId]);

                             }
                         }
                     });

                     mydb.transaction(function(t) {
                         t.executeSql("DELETE FROM travelCategoryMst");
                         var categoryJSONArray = data.CategoryJSONArray;
                         if (categoryJSONArray != null && categoryJSONArray.length > 0) {
                             for (var i = 0; i < categoryJSONArray.length; i++) {
                                 var stateArr = new Array();
                                 stateArr = categoryJSONArray[i];
                                 var trabel_category_id = stateArr.TravelCategoryId;
                                 var travel_category_name = stateArr.TravelCategoryName;
                                 var trabel_mode_id = stateArr.TravelModeId;
                                 t.executeSql("INSERT INTO travelCategoryMst (travelCategoryId,travelCategoryName,travelModeId) VALUES (?, ?, ?)", [trabel_category_id, travel_category_name, trabel_mode_id]);

                             }
                         }
                     });
                     document.getElementById("syncFailureMsg").innerHTML = "Category/CityTown Master synchronized successfully.";
                     j('#syncFailureMsg').hide().fadeIn('slow').delay(200).fadeOut('slow');
                     mydb.transaction(function(t) {
                         t.executeSql("DELETE FROM travelTypeMst");
                         var travelTypeJSONArray = data.TravelTypeJSONArray;
                         if (travelTypeJSONArray != null && travelTypeJSONArray.length > 0) {
                             for (var i = 0; i < travelTypeJSONArray.length; i++) {
                                 var stateArr = new Array();
                                 stateArr = travelTypeJSONArray[i];
                                 var travel_type_id = stateArr.TravelTypeId;
                                 var travel_type_name = stateArr.TravelTypeName;
                                 t.executeSql("INSERT INTO travelTypeMst (travelTypeId,travelTypeName) VALUES (?, ?)", [travel_type_id, travel_type_name]);

                             }
                         }
                     });
                     // *********************************   Delay - Master - Start   *******************************************************//
                     mydb.transaction(function(t) {
                         t.executeSql("DELETE FROM delayMst");
                         var delayMasterJSONArray = data.DelayMasterJSONArray;
                         if (delayMasterJSONArray != null && delayMasterJSONArray.length > 0) {
                             for (var i = 0; i < delayMasterJSONArray.length; i++) {
                                 var delayMstArr = new Array();
                                 delayMstArr = delayMasterJSONArray[i];
                                 var process_id = delayMstArr.ProcessId;
                                 var no_Of_Days = delayMstArr.NoOfDaysAllowed;
                                 var restriction_Status = delayMstArr.RestrictionStatus;
                                 var status = delayMstArr.Status;
                                 var module_Id = delayMstArr.ModuleId;

                                 t.executeSql("INSERT INTO delayMst (processId , noOfDays, restrictionStatus, status, moduleId ) VALUES (?, ?, ?, ?, ?)", [process_id, no_Of_Days, restriction_Status, status, module_Id]);

                             }
                         }
                     });
                     // *********************************   Delay - Master - End   *******************************************************//

                     // *********************************   Travel PerDiem - Master - Start   *******************************************************//
                     mydb.transaction(function(t) {
                         t.executeSql("DELETE FROM perDiemTravelMst");
                         var perDiemDomesticJSONArray = data.PerDiemDomesticJSONArray;
                         if (perDiemDomesticJSONArray != null && perDiemDomesticJSONArray.length > 0) {
                             for (var i = 0; i < perDiemDomesticJSONArray.length; i++) {
                                 var perDiemMstArr = new Array();
                                 perDiemMstArr = perDiemDomesticJSONArray[i];
                                 var company_id = perDiemMstArr.CompanyId;
                                 var grade_Id = perDiemMstArr.GradeId;
                                 var amount = perDiemMstArr.Amount;
                                 var dom_City_Town_Id = perDiemMstArr.DomCityTownId;
                                 var exp_Head_Id = perDiemMstArr.ExpenseHeadId;
                                 var currency_Id = perDiemMstArr.CurrencyId;

                                 t.executeSql("INSERT INTO perDiemTravelMst (companyId , gradeId, amount, domCityTownId, expenseHeadId, currencyId ) VALUES (?, ?, ?, ?, ?, ?)", [company_id, grade_Id, amount, dom_City_Town_Id, exp_Head_Id, currency_Id]);

                             }
                         }
                     });
                     // *********************************   Travel PerDiem - Master - End   *******************************************************//

                     j('#loading_Cat').hide();

                 } else {
                     j('#loading_Cat').hide();
                     document.getElementById("syncFailureMsg").innerHTML = "Travel Required master Expenses not synchronized successfully.";
                     j('#syncFailureMsg').hide().fadeIn('slow').delay(300).fadeOut('slow');
                 }
             },
             error: function(data) {
                 alert(window.lang.translate('Error: Oops something is wrong, Please Contact System Administer'));
             }
         });

     } else {
         alert(window.lang.translate('Database not found, your browser does not support web sql!'));
     }
 }

 function onloadExpense() {
     if (mydb) {
         mydb.transaction(function(t) {
             t.executeSql("SELECT * FROM accountHeadMst", [], getAccHeadList);
             t.executeSql("SELECT * FROM currencyMst", [], getCurrencyList);
             t.executeSql("SELECT * FROM expNameMst", [], getExpNameList);
         });
     } else {
         alert(window.lang.translate('Database not found, your browser does not support web sql!'));
     }
 }

 function getAccHeadList(transaction, results) {
     var i;
     var jsonAccHeadArr = [];
     for (i = 0; i < results.rows.length; i++) {
         var row = results.rows.item(i);
         var jsonFindAccHead = new Object();
         jsonFindAccHead["Label"] = row.accountHeadId;
         jsonFindAccHead["Value"] = row.accHeadName;
         jsonAccHeadArr.push(jsonFindAccHead);
     }
     createAccHeadDropDown(jsonAccHeadArr);
 }

 function getTrAccHeadList(transaction, results) {
     var i;
     var jsonAccHeadArr = [];
     for (i = 0; i < results.rows.length; i++) {
         var row = results.rows.item(i);
         var jsonFindAccHead = new Object();
         jsonFindAccHead["Label"] = row.accHeadId;
         jsonFindAccHead["Value"] = row.accHeadName;
         jsonAccHeadArr.push(jsonFindAccHead);
     }
     createTRAccHeadDropDown(jsonAccHeadArr);
 }

 function getExpNameList(transaction, results) {
     var i;
     var jsonExpNameArr = [];

     for (i = 0; i < results.rows.length; i++) {
         var row = results.rows.item(i);
         var jsonFindExpNameHead = new Object();

         jsonFindExpNameHead["ExpenseID"] = row.id;
         jsonFindExpNameHead["ExpenseName"] = row.expName;
         jsonExpNameArr.push(jsonFindExpNameHead);
     }
     createExpNameDropDown(jsonExpNameArr);
 }

 function getCurrencyList(transaction, results) {
     var i;
     var jsonCurrencyArr = [];

     for (i = 0; i < results.rows.length; i++) {
         var row = results.rows.item(i);
         var jsonFindCurrHead = new Object();
         jsonFindCurrHead["Value"] = row.currencyId;
         jsonFindCurrHead["Label"] = row.currencyName;

         jsonCurrencyArr.push(jsonFindCurrHead);
     }
     createCurrencyDropDown(jsonCurrencyArr)
 }

 function onloadTravelData() {
     if (mydb) {
         mydb.transaction(function(t) {
             t.executeSql("SELECT * FROM travelModeMst", [], fetchTravelModeList);
             t.executeSql("SELECT * FROM travelCategoryMst", [], fetchTrvlCategoryList);
             t.executeSql("SELECT * FROM cityTownMst", [], fetchCityTownList);
             t.executeSql("SELECT * FROM travelTypeMst", [], fetchTrvlTypeList);
             t.executeSql("SELECT * FROM travelAccountHeadMst where processId=3", [], getTrAccHeadList);
         });
     } else {
         alert(window.lang.translate('Database not found, your browser does not support web sql!'));
     }
 }

 function fetchTravelModeList(transaction, results) {
     var i;
     var jsonTrvlModeArr = [];
     for (i = 0; i < results.rows.length; i++) {
         var row = results.rows.item(i);
         var jsonFindMode = new Object();
         jsonFindMode["Value"] = row.travelModeId;
         jsonFindMode["Label"] = row.travelModeName;

         jsonTrvlModeArr.push(jsonFindMode);
     }
     createTravelModeDown(jsonTrvlModeArr);
 }

 function fetchTrvlCategoryList(transaction, results) {
     var i;
     var jsonCategoryArr = [];

     for (i = 0; i < results.rows.length; i++) {
         var row = results.rows.item(i);
         var jsonFindCategory = new Object();
         jsonFindCategory["Value"] = row.travelCategoryId;
         jsonFindCategory["Label"] = row.travelCategoryName;

         jsonCategoryArr.push(jsonFindCategory);
     }
     createCategoryDropDown(jsonCategoryArr);
 }

 function fetchCityTownList(transaction, results) {
     var i;
     var jsonCityTownArr = [];

     for (i = 0; i < results.rows.length; i++) {
         var row = results.rows.item(i);
         var jsonFindCityTown = new Object();
         jsonFindCityTown["Value"] = row.cityTownId;
         jsonFindCityTown["Label"] = row.cityTownName;

         jsonCityTownArr.push(jsonFindCityTown);
     }
     createCitytownDropDown(jsonCityTownArr);
 }

 function fetchTrvlTypeList(transaction, results) {
     var i;
     var jsonTravelTypeArr = [];

     for (i = 0; i < results.rows.length; i++) {
         var row = results.rows.item(i);
         var jsonFindTravelType = new Object();
         jsonFindTravelType["Value"] = row.travelTypeId;
         jsonFindTravelType["Label"] = row.travelTypeName;

         jsonTravelTypeArr.push(jsonFindTravelType);
     }
     createTravelTypeDropDown(jsonTravelTypeArr)
 }

 function resetUserSessionDetails() {
     window.localStorage.removeItem("TrRole");
     window.localStorage.removeItem("EmployeeId");
     window.localStorage.removeItem("FirstName");
     window.localStorage.removeItem("LastName");
     window.localStorage.removeItem("GradeID");
     window.localStorage.removeItem("BudgetingStatus");
     window.localStorage.removeItem("UnitId");
     window.localStorage.removeItem("UserName");
     window.localStorage.removeItem("Password");
     window.localStorage.removeItem("MobileMapRole");
     window.localStorage.removeItem("EaInMobile");
     window.localStorage.removeItem("multiLangInMobile");
     window.localStorage.removeItem("localLanguage");
     window.localStorage.removeItem("mobileEC");
     window.localStorage.removeItem("MapProvider");
     dropAllTableDetails();
 }

 function setUserSessionDetails(val, userJSON) {
     window.localStorage.setItem("TravelDesk", val.travelDesk);
     window.localStorage.setItem("TrRole", val.TrRole);
     window.localStorage.setItem("EmployeeId", val.EmpId);
     window.localStorage.setItem("FirstName", val.FirstName);
     window.localStorage.setItem("LastName", val.LastName);
     window.localStorage.setItem("GradeID", val.GradeID);
     window.localStorage.setItem("BudgetingStatus", val.BudgetingStatus);
     window.localStorage.setItem("UnitId", val.UnitId);
     window.localStorage.setItem("MapProvider", val.MapProvider);

     if (!val.hasOwnProperty('APPLICATION_VERSION')) {
         window.localStorage.setItem("APPLICATION_VERSION", false);
     } else {
         window.localStorage.setItem("APPLICATION_VERSION", val.APPLICATION_VERSION);
         var versionNumber = parseFloat(val.APPLICATION_VERSION.match(/[\d\.]+/));
         window.localStorage.setItem("versionNumber", versionNumber);
     }     //For Mobile Google Map Role Start
     //End
     if (!val.hasOwnProperty('MobileMapRole')) {
         window.localStorage.setItem("MobileMapRole", false);
     } else {
         window.localStorage.setItem("MobileMapRole", val.MobileMapRole);
     }
     //For EA in mobile
     if (!val.hasOwnProperty('EaInMobile')) {
         window.localStorage.setItem("EaInMobile", false);
     } else {
         window.localStorage.setItem("EaInMobile", val.EaInMobile);
     }
     if (!val.hasOwnProperty('smartClaimsViaSMSOnMobile')) {
         window.localStorage.setItem("smartClaimsViaSMSOnMobile", false);
     } else {
         window.localStorage.setItem("smartClaimsViaSMSOnMobile", val.smartClaimsViaSMSOnMobile);
     }
     if (!val.hasOwnProperty('multiLangInMobile')) {
         window.localStorage.setItem("multiLangInMobile", false);
     } else {
         window.localStorage.setItem("multiLangInMobile", val.multiLangInMobile);
     }
     if (!val.hasOwnProperty('mobileEC')) {
         window.localStorage.setItem("mobileEC", true);
     } else {
         window.localStorage.setItem("mobileEC", val.mobileEC);
     }
     /*if(!val.hasOwnProperty('MapProvider')){
       window.localStorage.setItem("MapProvider","MAPMYINDIA");
     }else{
      window.localStorage.setItem("MapProvider",val.MapProvider); 
     } */
     //End
     window.localStorage.setItem("UserName", userJSON["user"]);
     window.localStorage.setItem("Password", userJSON["pass"]);
     window.localStorage.setItem("localLanguage", 0);

     //***************************** Profile Image -- Start *******************************************************//

     try {
         var empId = window.localStorage.getItem("EmployeeId");

         if (mydb) {

                      mydb.transaction(function(t) {
                         t.executeSql("DELETE FROM profileMst");
                     });

             if (val.ProfileImageData != "" && val.ProfileImageData != null) {
                 mydb.transaction(function(t) {
                     t.executeSql("INSERT INTO profileMst (empId,profileAttachment) VALUES (?,?)", [empId, val.ProfileImageData]);
                 });
             }
         } else {
             alert(window.lang.translate('Database not found, your browser does not support web sql!'));
         }
     } catch (e) {
         console.log(e);
     }

     //***************************** Profile Image -- End *******************************************************//

 }

 function setUserStatusInLocalStorage(status) {
     window.localStorage.setItem("UserStatus", status);
 }

 function setUrlPathLocalStorage(url) {
     window.localStorage.setItem("urlPath", url);
 }

 function dropAllTableDetails() {

     mydb.transaction(function(t) {

         t.executeSql("delete from currencyMst");
         t.executeSql("delete from accountHeadMst");
         t.executeSql("delete from expNameMst");
         t.executeSql("delete from businessExpDetails");
         t.executeSql("delete from walletMst");
         t.executeSql("delete from travelModeMst");
         t.executeSql("delete from travelCategoryMst");
         t.executeSql("delete from cityTownMst");
         t.executeSql("delete from travelTypeMst");
         t.executeSql("delete from travelAccountHeadMst");
         t.executeSql("delete from travelExpenseNameMst");
         t.executeSql("delete from travelSettleExpDetails");
         t.executeSql("delete from travelRequestDetails");
         t.executeSql("delete from accountHeadEAMst");
         t.executeSql("delete from advanceType");
         t.executeSql("delete from employeeAdvanceDetails");
         t.executeSql("delete from currencyConversionMst");
         t.executeSql("delete from smsMaster");
         t.executeSql("delete from smsScrutinizerMst");
         t.executeSql("delete from profileMst");
         

     });

 }

  function dropDetailTables() {

     mydb.transaction(function(t) {

         t.executeSql("delete from businessExpDetails");
         t.executeSql("delete from walletMst");
         t.executeSql("delete from travelSettleExpDetails");      
     });

 }

 function getUserID() {
     userKey = window.localStorage.getItem("EmployeeId");
     if (userKey == null) return "";
     else return userKey;
 }

 function deleteSelectedExpDetails(businessExpDetailId) {
     mydb.transaction(function(t) {
         t.executeSql("DELETE FROM businessExpDetails WHERE busExpId=?", [businessExpDetailId]);
     });
 }

 function deleteSelectedTSExpDetails(travelSettleExpDetailId) {
     mydb.transaction(function(t) {
         t.executeSql("DELETE FROM travelSettleExpDetails WHERE tsExpId=?", [travelSettleExpDetailId]);
     });
 }

 function fetchWalletImage() {
     var rowsWallet;
     mytable = j('<table></table>').attr({
         id: "walletSource",
         class: ["table", "table-striped", "table-bordered-wallet"].join(' ')
     });

     mydb.transaction(function(t) {

         t.executeSql('SELECT * FROM walletMst;', [],
             function(transaction, result) {

                 if (result != null && result.rows != null) {

                     for (var i = 0; i < result.rows.length; i++) {

                         var row = result.rows.item(i);

                         if (i % 2 == 0) {
                             rowsWallet = j('<tr></tr>').attr({
                                 class: ["test"].join(' ')
                             }).appendTo(mytable);
                         }

                         //alert("row.walletAttachment : " + row.walletAttachment + "  row.walletId: " +row.walletId+ "  row.walletAttachment: " +row.walletAttachment);
                         j('<td></td>').attr({
                             class: ["walletattach"].join(' ')
                         }).html('<text style="display: none">' + row.walletAttachment + '</text>' + '<p id="para" style="display: none">' + row.walletId + '</p>' + '<img src="' + row.walletAttachment + '">').appendTo(rowsWallet);

                     }
                     j("#walletSource td").click(function() {
                         headerOprationBtn = defaultPagePath + 'headerPageForWalletOperation.html';
                         if (j(this).hasClass("selected")) {
                             j(this).removeClass('selected');
                             j('#mainHeader').load(headerOprationBtn);
                         } else {
                             j('#mainHeader').load(headerOprationBtn);
                             j(this).addClass('selected');
                         }
                     });
                 }
             });
     });
     mytable.appendTo("#walletBox");
 }

 function deleteSelectedWallets(walletID) {
     mydb.transaction(function(t) {
         t.executeSql("DELETE FROM walletMst WHERE walletId=?", [walletID]);
     });
 }

 function saveWalletAttachment(status) {
     j('#loading_Cat').show();
     try {
         if (mydb) {
             //get the values of the text inputs

             //var file = document.getElementById('imageWallet').files[0];
             var file = document.getElementById("imageWallet").src;

             if (file != "") {
                 mydb.transaction(function(t) {
                     t.executeSql("INSERT INTO walletMst (walletAttachment) VALUES (?)", [file]);
                     if (status == "0") {
                         document.getElementById('imageWallet').value = "";
                         createWallet();
                     } else {
                         createWallet();
                     }
                 });
                 j('#loading_Cat').hide();
             } else {
                 j('#loading_Cat').hide();
                 alert(window.lang.translate('You must enter inputs!'));
             }
         } else {
             alert(window.lang.translate('Database not found, your browser does not support web sql!'));
         }
     } catch (e) {
         alert("Exception in saveWalletAttachment : " + e);
     }
 }

 function getExpenseNamesfromDB(accountHeadId) {
     j('#errorMsgArea').children('span').text("");
     if (mydb) {
         //Get all the employeeDetails from the database with a select statement, set outputEmployeeDetails as the callback function for the executeSql command
         mydb.transaction(function(t) {
             t.executeSql("SELECT * FROM expNameMst where accHeadId=" + accountHeadId, [], getExpNameList);
         });
     } else {
         alert(window.lang.translate('Database not found, your browser does not support web sql!'));
     }
 }

 function getExpenseNamesfromDBTravel(travelRequestId) {
     if (mydb) {
         //Get all the employeeDetails from the database with a select statement, set outputEmployeeDetails as the callback function for the executeSql command
         mydb.transaction(function(t) {
             t.executeSql("SELECT * FROM travelExpenseNameMst where accHeadId=(select accountHeadId from travelRequestDetails where travelRequestId=" + travelRequestId + ")", [], fetchTravelExpeseName);
             //t.executeSql("SELECT * FROM travelExpenseNameMst where travelAccountHeadId="+accountHeadId, [],fetchTravelExpeseName);
         });
     } else {
         alert(window.lang.translate('Database not found, your browser does not support web sql!'));
     }
 }

 function getStartEndDatefromDBTravel(travelRequestId) {
     if (mydb) {
         //Get all the employeeDetails from the database with a select statement, set outputEmployeeDetails as the callback function for the executeSql command
         mydb.transaction(function(t) {
             var result = t.executeSql("select travelStartDate,travelEndDate from travelRequestDetails where travelRequestId=" + travelRequestId, [], fetchTravelStartEndDate);
         });
     } else {
         alert(window.lang.translate('Database not found, your browser does not support web sql!'));
     }
 }

 function getCurrencyDBTravel(travelRequestId) {
     if (mydb) {
         //Get all the employeeDetails from the database with a select statement, set outputEmployeeDetails as the callback function for the executeSql command
         mydb.transaction(function(t) {
             t.executeSql("select travelDomOrInter from travelRequestDetails where travelRequestId=" + travelRequestId, [], fetchTravelDomOrInterDate);

         });
     } else {
         alert(window.lang.translate('Database not found, your browser does not support web sql!'));
     }
 }

 function onloadTravelSettleData() {
     if (mydb) {
         mydb.transaction(function(t) {
             t.executeSql("SELECT * FROM travelModeMst", [], fetchTravelModeList);
             t.executeSql("SELECT * FROM travelCategoryMst", [], fetchTrvlCategoryList);
             t.executeSql("SELECT * FROM cityTownMst", [], fetchCityTownList);
             t.executeSql("SELECT * FROM travelRequestDetails", [], fetchTravelRequestNumberList);
             t.executeSql("SELECT * FROM travelExpenseNameMst", [], fetchTravelExpeseName);
             t.executeSql("SELECT * FROM currencyMst", [], getCurrencyList);
         });
     } else {
         alert(window.lang.translate('Database not found, your browser does not support web sql!'));
     }
 }

 function fetchTravelExpeseName(transaction, results) {
     var i;
     var jsonExpenseNameArr = [];
     for (i = 0; i < results.rows.length; i++) {
         var row = results.rows.item(i);
         var jsonFindTravelType = new Object();
         jsonFindTravelType["ExpenseNameId"] = row.id;
         jsonFindTravelType["ExpenseName"] = row.expenseName;
         jsonExpenseNameArr.push(jsonFindTravelType);
     }
     createTravelExpenseNameDropDown(jsonExpenseNameArr)
 }

 function fetchTravelStartEndDate(transaction, results) {
     var monthVal = ""
     var i;
     var jsonExpenseNameArr = [];
     for (i = 0; i < results.rows.length; i++) {
         var row = results.rows.item(i);

     }
     $(function() {
         var startDate = row.travelStartDate;
         j("label[for='startDate']").html(startDate);
         var endDate = row.travelEndDate;
         j("label[for='endDate']").html(endDate);
         var startdate_day = startDate.substring(0, 2);
         var startdate_month = convertDate(startDate.substring(3, 6));
         var startdate_year = startDate.substring(7, 11);
         var endDate_day = endDate.substring(0, 2);
         var endDate_month = convertDate(endDate.substring(3, 6));
         var endDate_year = endDate.substring(7, 11);
         var date = new Date();
         var currentMonth = date.getMonth();
         var currentDate = date.getDate();
         var currentYear = date.getFullYear();

         $('#expDate').datepicker({
             maxDate: new Date(endDate_year, endDate_month, endDate_day),
             minDate: new Date(startdate_year, startdate_month, startdate_day)
         });
     });
 }

 function fetchTravelDomOrInterDate(transaction, results) {
     var monthVal = ""
     var i;
     var jsonExpenseNameArr = [];
     for (i = 0; i < results.rows.length; i++) {
         var row = results.rows.item(i);
         var DomOrInter = row.travelDomOrInter;
         if (DomOrInter == 'D') {
             j('#currency').select2('disable');
         } else {
             j('#currency').select2('enable');
             if (mydb) {
                 mydb.transaction(function(t) {
                     t.executeSql("SELECT * FROM currencyMst", [], getCurrencyList);
                 });
             } else {
                 alert(window.lang.translate('Database not found, your browser does not support web sql!'));
             }
         }
     }

 }

 function getPerUnitFromDB(expenseNameID) {
     j('#errorMsgArea').children('span').text("");
     if (mydb) {
         //Get all the employeeDetails from the database with a select statement, set outputEmployeeDetails as the callback function for the executeSql command
         mydb.transaction(function(t) {
             t.executeSql("SELECT * FROM expNameMst where id=" + expenseNameID, [], setPerUnitDetails);
         });
     } else {
         alert(window.lang.translate('Database not found, your browser does not support web sql!'));
     }
 }

 function getModecategoryFromDB(expenseNameID) {
     if (mydb) {
         //Get all the employeeDetails from the database with a select statement, set outputEmployeeDetails as the callback function for the executeSql command
         mydb.transaction(function(t) {
             t.executeSql("SELECT * FROM travelExpenseNameMst where id=" + expenseNameID, [], setModeCategroyDetails);
         });
     } else {
         alert(window.lang.translate('Database not found, your browser does not support web sql!'));
     }
 }

 function getCategoryFromDB(modeID) {
     if (mydb) {
         //Get all the employeeDetails from the database with a select statement, set outputEmployeeDetails as the callback function for the executeSql command
         mydb.transaction(function(t) {
             t.executeSql("SELECT * FROM travelCategoryMst where travelModeId=" + modeID, [], fetchTrvlCategoryList);
         });
     } else {
         alert(window.lang.translate('Database not found, your browser does not support web sql!'));
     }
 }

 function synchronizeTRForTS() {
     var jsonSentToSync = new Object();
     jsonSentToSync["EmployeeId"] = window.localStorage.getItem("EmployeeId");
     j('#loading_Cat').show();
     if (mydb) {
         j.ajax({
             url: window.localStorage.getItem("urlPath") + "FetchTRForTSWebService",
             type: 'POST',
             dataType: 'json',
             crossDomain: true,
             data: JSON.stringify(jsonSentToSync),
             success: function(data) {
                 if (data.Status == 'Success') {
                     mydb.transaction(function(t) {
                         t.executeSql("DELETE FROM travelRequestDetails");
                         var travelRequestArray = data.TravelReqJSONArray;
                         if (travelRequestArray != null && travelRequestArray.length > 0) {
                             for (var i = 0; i < travelRequestArray.length; i++) {
                                 var stateArr = new Array();
                                 stateArr = travelRequestArray[i];
                                 var travel_request_id = stateArr.TravelRequestId;
                                 var travel_request_no = stateArr.TravelRequestNo;
                                 var title = stateArr.Title;
                                 var ac_head_id = stateArr.AcHeadId;
                                 var tr_end_date = stateArr.TravelEndDate;
                                 var tr_start_date = stateArr.TravelStartDate;
                                 var tr_DomOrInter = stateArr.TravelDoMOrInter;
                                 var adv_Requested = stateArr.AdvanceRequested;
                                 var adv_Requested_Amount = stateArr.AdvanceAmount;
                                 var travelSelfAmount = stateArr.TravelSelfAmount;

                                 t.executeSql("INSERT INTO travelRequestDetails (travelRequestId,travelRequestNo,title,accountHeadId,travelEndDate,travelStartDate,travelDomOrInter,advanceRequested,advanceAmount,travelSelfAmount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [travel_request_id, travel_request_no, title, ac_head_id, tr_end_date, tr_start_date, tr_DomOrInter, adv_Requested, adv_Requested_Amount, travelSelfAmount]);

                             }
                         }
                     });
                     onloadTravelSettleData();
                     j('#loading_Cat').hide();

                     document.getElementById("syncSuccessMsg").innerHTML = "Travel Request Details synchronized successfully.";
                     j('#syncSuccessMsg').hide().fadeIn('slow').delay(500).fadeOut('slow');
                 } else {
                     j('#loading_Cat').hide();
                     document.getElementById("syncFailureMsg").innerHTML = "Travel Required Expenses not synchronized successfully.";
                     j('#syncFailureMsg').hide().fadeIn('slow').delay(300).fadeOut('slow');
                 }

             },
             error: function(data) {
                 alert(window.lang.translate('Error: Oops something is wrong, Please Contact System Administer'));
             }
         });

     } else {
         alert(window.lang.translate('Database not found, your browser does not support web sql!'));
     }
 }

 function fetchTravelRequestNumberList(transaction, results) {

     var i;
     var jsonExpenseNameArr = [];
     for (i = 0; i < results.rows.length; i++) {
         var row = results.rows.item(i);
         var jsonFindTravelType = new Object();
         jsonFindTravelType["TravelRequestId"] = row.travelRequestId;
         jsonFindTravelType["Title"] = row.title;
         jsonFindTravelType["TravelRequestNumber"] = row.travelRequestNo;
         jsonExpenseNameArr.push(jsonFindTravelType);

     }
     createTravelRequestNoDropDown(jsonExpenseNameArr)
 }

 function forceCloseDropdown() {
     j('#accountHead').select2('close');
     j('#expenseName').select2('close');
     j('#currency').select2('close');
     j('#travelType').select2('close');
     j('#fromCitytown').select2('close');
     j('#toCitytown').select2('close');
     j('#travelMode').select2('close');
     j('#travelCategory').select2('close');
     j('#roundTripMode').select2('close');
     j('#roundTripCategory').select2('close');
     j('#travelRequestName').select2('close');
     j('#travelExpenseName').select2('close');
 }

 function showHelpMenu() {
     var headerBackBtn = defaultPagePath + 'backbtnPage.html';
     // var pageRef=defaultPagePath+'helpMenuPage.html';
     var pageRef = defaultPagePath + 'underConstruction.html';
     j(document).ready(function() {
         j('#mainHeader').load(headerBackBtn);
         j('#mainContainer').load(pageRef);
     });
     appPageHistory.push(pageRef);
 }

 function showBEBRBHelp() {
     var headerBackBtn = defaultPagePath + 'backbtnPage.html';
     var pageRef = defaultPagePath + 'helpBEBRPage.html';
     j(document).ready(function() {
         j('#mainHeader').load(headerBackBtn);
         j('#mainContainer').load(pageRef);
     });
     appPageHistory.push(pageRef);
 }

 function showTRTSHelp() {
     var headerBackBtn = defaultPagePath + 'backbtnPage.html';
     var pageRef = defaultPagePath + 'helpTRTSPage.html';
     j(document).ready(function() {
         j('#mainHeader').load(headerBackBtn);
         j('#mainContainer').load(pageRef);
     });
     appPageHistory.push(pageRef);
 }

 function showWalletHelp() {
     var headerBackBtn = defaultPagePath + 'backbtnPage.html';
     var pageRef = defaultPagePath + 'helpWalletPage.html';
     j(document).ready(function() {
         j('#mainHeader').load(headerBackBtn);
         j('#mainContainer').load(pageRef);
     });
     appPageHistory.push(pageRef);
 }

 //applib.js   changes by Dinesh

 function synchronizeEAMasterData() {
     var jsonSentToSync = new Object();
     jsonSentToSync["BudgetingStatus"] = window.localStorage.getItem("BudgetingStatus");
     jsonSentToSync["EmployeeId"] = window.localStorage.getItem("EmployeeId");
     jsonSentToSync["GradeId"] = window.localStorage.getItem("GradeID");
     jsonSentToSync["UnitId"] = window.localStorage.getItem("UnitId");
     j('#loading_Cat').show();
     if (mydb) {
         j.ajax({
             url: window.localStorage.getItem("urlPath") + "SyncAccountHeadEAWebService",
             type: 'POST',
             dataType: 'json',
             crossDomain: true,
             data: JSON.stringify(jsonSentToSync),
             success: function(data) {
                 if (data.Status == 'Success') {
                     mydb.transaction(function(t) {
                         t.executeSql("DELETE FROM accountHeadEAMst");
                         var accountHeadArray = data.AccountHeadArray;
                         if (accountHeadArray != null && accountHeadArray.length > 0) {
                             for (var i = 0; i < accountHeadArray.length; i++) {
                                 var stateArr = new Array();
                                 stateArr = accountHeadArray[i];
                                 var acc_head_id = stateArr.Value;
                                 var acc_head_name = stateArr.Label;
                                 t.executeSql("INSERT INTO accountHeadEAMst (accountHeadId,accHeadName) VALUES (?, ?)", [acc_head_id, acc_head_name]);

                             }
                         }
                     });

                     mydb.transaction(function(t) {
                         t.executeSql("DELETE FROM advanceType");
                         var advanceTypeArray = data.AdvanceTypeArray;
                         if (advanceTypeArray != null && advanceTypeArray.length > 0) {
                             for (var i = 0; i < advanceTypeArray.length; i++) {
                                 var stateArr = new Array();
                                 stateArr = advanceTypeArray[i];
                                 var advTypeId = stateArr.Value;
                                 var advTypeName = stateArr.Label;

                                 t.executeSql("INSERT INTO advanceType (advancetypeID,advancetype) VALUES ( ?, ?)", [advTypeId, advTypeName]);
                             }
                         }
                     });
                     mydb.transaction(function(t) {
                         t.executeSql("DELETE FROM employeeAdvanceDetails");
                         var empAdvArray = data.EmpAdvArray;
                         if (empAdvArray != null && empAdvArray.length > 0) {
                             for (var i = 0; i < empAdvArray.length; i++) {
                                 var stateArr = new Array();
                                 stateArr = empAdvArray[i];
                                 var empAdvId = stateArr.Value;
                                 var empAdvVoucherNo = stateArr.EmpAdvaucherNo;
                                 var empAdvTitle = stateArr.VoucherTitle;
                                 var empAdvAmount = stateArr.Amount;

                                 t.executeSql("INSERT INTO employeeAdvanceDetails (empAdvID,emplAdvVoucherNo,empAdvTitle,Amount) VALUES ( ?, ?, ?, ?)", [empAdvId, empAdvVoucherNo, empAdvTitle, empAdvAmount]);
                             }
                         }
                     });
                     window.localStorage.setItem("EmpAdvDate", data.EmpAdvDate);
                     window.localStorage.setItem("DefaultAdvType", data.DefaultAdvType);
                     window.localStorage.setItem("DefaultAccontHead", data.DefaultAccontHead);
                     window.localStorage.setItem("DefaultCurrencyName", data.DefaultCurrencyName);

                     j('#loading_Cat').hide();

                     document.getElementById("syncSuccessMsg").innerHTML = "Employee Advance synchronized successfully.";
                     j('#syncSuccessMsg').hide().fadeIn('slow').delay(800).fadeOut('slow');

                 } else {
                     j('#loading_Cat').hide();
                     document.getElementById("syncFailureMsg").innerHTML = "Employee Advance not synchronized successfully.";
                     j('#syncFailureMsg').hide().fadeIn('slow').delay(300).fadeOut('slow');

                 }

             },
             error: function(data) {
                 alert(window.lang.translate('Error: Oops something is wrong, Please Contact System Administer'));
             }
         });
     }
 }

 //applib.js   changes by Dinesh end

 //amit applib.js changes start
 function onloadEAData() {
     var EmpAdvDate = window.localStorage.getItem("EmpAdvDate");
     document.getElementById("empAdvDate").value = EmpAdvDate;

     if (mydb) {
         mydb.transaction(function(t) {
             t.executeSql("SELECT * FROM advanceType", [], fetchAdvanceTypeList);
             t.executeSql("SELECT * FROM accountHeadEAMst", [], fetchAccountHeadList);
         });
     } else {
         alert(window.lang.translate('Database not found, your browser does not support web sql!'));
     }
 }

 function fetchAdvanceTypeList(transaction, results) {
     var i;
     var jsonAdvanceTypeArr = [];
     for (i = 0; i < results.rows.length; i++) {
         var row = results.rows.item(i);
         var jsonFindAdvanceType = new Object();
         jsonFindAdvanceType["Value"] = row.advancetypeID;
         jsonFindAdvanceType["Label"] = row.advancetype;

         jsonAdvanceTypeArr.push(jsonFindAdvanceType);
     }
     createAdvanceTypeDropDown(jsonAdvanceTypeArr)
 }

 function getAdvanceTypeFromDB(AdvancetypeID) {
     if (mydb) {
         //Get all the employeeDetails from the database with a select statement, set outputEmployeeDetails as the callback function for the executeSql command
         mydb.transaction(function(t) {
             t.executeSql("SELECT * FROM advanceType where advancetypeID=" + AdvancetypeID, [], fetchAdvanceTypeList);
         });
     } else {
         alert(window.lang.translate('Database not found, your browser does not support web sql!'));
     }
 }

 function fetchAccountHeadList(transaction, results) {
     var i;
     var jsonAccountHeadArr = [];
     for (i = 0; i < results.rows.length; i++) {
         var row = results.rows.item(i);
         var jsonFindAccountHead = new Object();
         jsonFindAccountHead["Value"] = row.accountHeadId;
         jsonFindAccountHead["Label"] = row.accHeadName;

         jsonAccountHeadArr.push(jsonFindAccountHead);
     }
     createAccountHeadDropDown(jsonAccountHeadArr)
 }

 function getAccountHeadFromDB(AccountHeadID) {
     if (mydb) {
         mydb.transaction(function(t) {
             t.executeSql("SELECT * FROM accountHeadEAMst where accountHeadId=" + AccountHeadID, [], fetchAccountHeadList);
         });
     } else {
         alert(window.lang.translate('Database not found, your browser does not support web sql!'));
     }
 }

 function populateEATitle() {

     var EmpAdvDate = document.getElementById("empAdvDate").value;
     var EmpAdvType = j("#empAdvType").select2('data').name;

     document.getElementById("empAdvTitle").value = EmpAdvType + '/' + EmpAdvDate;

 }

 function fetchEmployeeAdvance() {

     mytable = j('<table></table>').attr({
         id: "source",
         class: ["table", "table-striped", "table-bordered"].join(' ')
     });
     var rowThead = j("<thead></thead>").appendTo(mytable);
     var rowTh = j('<tr></tr>').attr({
         class: ["test"].join(' ')
     }).appendTo(rowThead);

     j('<th lang=\'en\'></th>').text("Date").appendTo(rowTh);
     j('<th lang=\'en\'></th>').text("Expense Name").appendTo(rowTh);
     j('<th lang=\'en\'></th>').text("Narration From/To Loc").appendTo(rowTh);
     j('<th lang=\'en\'></th>').text("Amt").appendTo(rowTh);
     var cols = new Number(5);

     mydb.transaction(function(t) {
         var headerOprationBtn;
         t.executeSql('SELECT * FROM businessExpDetails INNER JOIN expNameMst ON businessExpDetails.expNameId =expNameMst.id INNER JOIN currencyMst ON businessExpDetails.currencyId =currencyMst.currencyId  INNER JOIN currencyConversionMst ON businessExpDetails.currencyId = currencyConversionMst.currencyId INNER JOIN accountHeadMst ON businessExpDetails.accHeadId =accountHeadMst.accountHeadId;', [],
             function(transaction, result) {
                 if (result != null && result.rows != null) {

                     for (var i = 0; i < result.rows.length; i++) {

                         var row = result.rows.item(i);
                         var shrinkFromTo;
                         var newDateFormat = reverseConvertDate(row.expDate.substring(0, 2)) + "-" + row.expDate.substring(3, 5) + " " + row.expDate.substring(6, 10);

                         if (window.localStorage.getItem("MobileMapRole") == 'true') {
                             if (row.expFromLoc != '' && row.expToLoc != '') {
                                 var shrinkNarration = row.expNarration.substring(0, row.expNarration.indexOf("--"))
                                 srinckFromTo = row.expFromLoc.substring(0, row.expFromLoc.indexOf(",")) + "/" + row.expToLoc.substring(0, row.expToLoc.indexOf(","));
                                 srinckFromTo = srinckFromTo.concat("...");
                             }
                         }

                         var rowss = j('<tr></tr>').attr({
                             class: ["test"].join(' ')
                         }).appendTo(mytable);
                         j('<td></td>').attr({
                             class: ["expDate"].join(' ')
                         }).html('<p style="color: black;">' + newDateFormat + '</P>').appendTo(rowss);
                         j('<td></td>').attr({
                             class: ["expName"].join(' ')
                         }).html('<p style="color: black;">' + row.expName + '</P>').appendTo(rowss).appendTo(rowss);
                         if (window.localStorage.getItem("MobileMapRole") == 'true') {
                             if (row.expFromLoc != '' && row.expToLoc != '') {
                                 j('<td></td>').attr({
                                     class: ["expNarration"].join(' ')
                                 }).html('<p style="color: black;">' + shrinkNarration + '</br>' + srinckFromTo + '</P>').appendTo(rowss);
                             } else {
                                 j('<td></td>').attr({
                                     class: ["expNarration"].join(' ')
                                 }).html('<p style="color: black;">' + row.expNarration + '</br>' + row.expFromLoc + "" + row.expToLoc + '</P>').appendTo(rowss);
                             }
                         } else {
                             if (row.expFromLoc != '' && row.expToLoc != '') {
                                 j('<td></td>').attr({
                                     class: ["expNarration"].join(' ')
                                 }).html('<p style="color: black;">' + row.expNarration + '</br>' + row.expFromLoc + "/" + row.expToLoc + '</P>').appendTo(rowss);
                             } else {
                                 j('<td></td>').attr({
                                     class: ["expNarration"].join(' ')
                                 }).html('<p style="color: black;">' + row.expNarration + '</br>' + row.expFromLoc + "" + row.expToLoc + '</P>').appendTo(rowss);
                             }

                         }

                         if (row.busExpAttachment.length == 0) {
                             j('<td></td>').attr({
                                 class: ["expAmt"].join(' ')
                             }).html('<p style="color: black;">' + row.expAmt + ' ' + row.currencyName + '</P>').appendTo(rowss);
                         } else {
                             j('<td></td>').attr({
                                 class: ["expAmt"].join(' ')
                             }).html('<p style="color: black;">' + row.expAmt + ' ' + row.currencyName + '</P><img src="images/attach.png" width="25px" height="25px">').appendTo(rowss);
                         }
                         j('<td></td>').attr({
                             class: ["expDate1", "displayNone"].join(' ')
                         }).text(row.expDate).appendTo(rowss);
                         j('<td></td>').attr({
                             class: ["expFromLoc1", "displayNone"].join(' ')
                         }).text(row.expFromLoc).appendTo(rowss);
                         j('<td></td>').attr({
                             class: ["expToLoc1", "displayNone"].join(' ')
                         }).text(row.expToLoc).appendTo(rowss);
                         j('<td></td>').attr({
                             class: ["expNarration1", "displayNone"].join(' ')
                         }).text(row.expNarration).appendTo(rowss);
                         j('<td></td>').attr({
                             class: ["expAmt1", "displayNone"].join(' ')
                         }).text(row.expAmt).appendTo(rowss);
                         j('<td></td>').attr({
                             class: ["busAttachment", "displayNone"].join(' ')
                         }).text(row.busExpAttachment).appendTo(rowss);
                         j('<td></td>').attr({
                             class: ["accHeadId", "displayNone"].join(' ')
                         }).text(row.accHeadId).appendTo(rowss);
                         j('<td></td>').attr({
                             class: ["expNameId", "displayNone"].join(' ')
                         }).text(row.expNameMstId).appendTo(rowss);
                         j('<td></td>').attr({
                             class: ["expUnit", "displayNone"].join(' ')
                         }).text(row.expUnit).appendTo(rowss);
                         j('<td></td>').attr({
                             class: ["currencyId", "displayNone"].join(' ')
                         }).text(row.currencyId).appendTo(rowss);
                         j('<td></td>').attr({
                             class: ["conversionRate", "displayNone"].join(' ')
                         }).text(row.conversionRate).appendTo(rowss);
                         j('<td></td>').attr({
                             class: ["accountCodeId", "displayNone"].join(' ')
                         }).text(row.accCodeId).appendTo(rowss);
                         //j('<td></td>').attr({ class: ["expName","displayNone"].join(' ') }).text(row.expName).appendTo(rowss);       
                         j('<td></td>').attr({
                             class: ["busExpId", "displayNone"].join(' ')
                         }).text(row.busExpId).appendTo(rowss);
                         j('<td></td>').attr({
                             class: ["isErReqd", "displayNone"].join(' ')
                         }).text(row.isErReqd).appendTo(rowss);
                         j('<td></td>').attr({
                             class: ["ERLimitAmt", "displayNone"].join(' ')
                         }).text(row.limitAmountForER).appendTo(rowss);
                         j('<td></td>').attr({
                             class: ["isEntitlementExceeded", "displayNone"].join(' ')
                         }).text(row.isEntitlementExceeded).appendTo(rowss);
                         j('<td></td>').attr({
                             class: ["wayPoint", "displayNone"].join(' ')
                         }).text(row.wayPointunitValue).appendTo(rowss);
                         j('<td></td>').attr({
                             class: ["isAttachmentReq", "displayNone"].join(' ')
                         }).text(row.isAttachmentReq).appendTo(rowss);
                         j('<td></td>').attr({
                             class: ["isEntiLineOrVoucherLevel", "displayNone"].join(' ')
                         }).text(row.isEntiLineOrVoucherLevel).appendTo(rowss);
                         j('<td></td>').attr({
                             class: ["expFixedLimitAmt", "displayNone"].join(' ')
                         }).text(row.expFixedLimitAmt).appendTo(rowss);
                     }

                     j("#source tr").click(function() {
                         headerOprationBtn = defaultPagePath + 'headerPageForBEOperation.html';
                         if (j(this).hasClass("selected")) {;
                             var headerBackBtn = defaultPagePath + 'headerPageForBEOperation.html';
                             j(this).removeClass('selected');
                             populateBEAmount();
                             j('#mainHeader').load(headerBackBtn);
                         } else {
                             if (j(this).text() == 'DateExpense NameNarration From/To LocAmt') {

                             } else {
                                 j('#mainHeader').load(headerOprationBtn);
                                 j(this).addClass('selected');
                                 populateBEAmount();
                             }
                         }
                     });
                 }
             });
     });
     mytable.appendTo("#box");

     mainTable = j('<table></table>').attr({
         class: ["table", "table-striped", "table-bordered"].join(' ')
     });
     table1 = j('<table></table>').attr({
         class: ["table", "table1", "table-striped", "table-bordered"].join(' ')
     }).appendTo(mainTable);
     var rowThead = j("<thead></thead>").appendTo(table1);
     var rowTh = j('<tr></tr>').attr({
         class: ["test"].join(' ')
     }).appendTo(rowThead);

     j('<th lang=\'en\'></th>').text("Voucher No.").appendTo(rowTh);
     //j('<th></th>').text("Title").appendTo(rowTh);
     j('<th lang=\'en\'></th>').text("Amount").appendTo(rowTh);

     table2 = j('<table></table>').attr({
         id: "source1",
         class: ["table", "table-striped", "table-bordered"].join(' ')
     }).appendTo(mainTable);
     var rowThead1 = j("<thead></thead>").appendTo(table2);
     mydb.transaction(function(t) {
         var headerOprationBtn;
         t.executeSql('SELECT * FROM employeeAdvanceDetails;', [],
             function(transaction, result) {
                 if (result != null && result.rows != null) {

                     for (var i = 0; i < result.rows.length; i++) {

                         var row = result.rows.item(i);

                         var rowss = j('<tr></tr>').attr({
                             class: ["test"].join(' ')
                         }).appendTo(rowThead1);

                         j('<td></td>').attr({
                             class: ["empAdvID", "displayNone"].join(' ')
                         }).text(row.empAdvID).appendTo(rowss);
                         j('<td></td>').attr({
                             class: ["emplAdvVoucherNo"].join(' ')
                         }).text(row.emplAdvVoucherNo).appendTo(rowss);
                         j('<td></td>').attr({
                             class: ["empAdvTitle", "displayNone"].join(' ')
                         }).text(row.empAdvTitle).appendTo(rowss);
                         j('<td></td>').attr({
                             class: ["Amount"].join(' ')
                         }).text(row.Amount).appendTo(rowss);
                     }
                     $("#header tr").click(function() {
                         $("tr").attr('onclick', '');
                     });

                     j("#source1 tr").click(function() {
                         if (j(this).hasClass("selected")) {
                             j(this).removeClass('selected');
                             populateEAAmount();
                             calculateAmount();
                         } else {
                             j(this).addClass('selected');
                             populateEAAmount();
                             calculateAmount();
                         }
                     });
                 }
             });
     });
     mainTable.appendTo("#box1");
     var header = defaultPagePath + 'backbtnPage.html';
     j('#mainHeader').load(header);
 }

 function deleteSelectedEmplAdv(employeeAdvDetailId) {
     mydb.transaction(function(t) {
         t.executeSql("DELETE FROM employeeAdvanceDetails WHERE empAdvID=?", [employeeAdvDetailId]);
     });
 }

 function showSyncMaster() {
     var headerBackBtn = defaultPagePath + 'backbtnPage.html';
     var pageRef = defaultPagePath + 'syncMaster.html';
     j(document).ready(function() {
         j('#mainHeader').load(headerBackBtn);
         j('#mainContainer').load(pageRef);
     });
     appPageHistory.push(pageRef);
 }

 function fetchBusinessExpNdEmployeeAdv() {
     j('#source').remove();
     mytable = j('<table></table>').attr({
         id: "source",
         class: ["table", "table-striped", "table-bordered"].join(' ')
     });
     var rowThead = j("<thead></thead>").appendTo(mytable);
     var rowTh = j('<tr></tr>').attr({
         class: ["test"].join(' ')
     }).appendTo(rowThead);

     j('<th lang=\'en\'></th>').text("Date").appendTo(rowTh);
     j('<th lang=\'en\'></th>').text("Expense Name").appendTo(rowTh);
     j('<th lang=\'en\'></th>').text("Narration From/To Loc").appendTo(rowTh);
     j('<th lang=\'en\'></th>').text("Amt").appendTo(rowTh);
     var cols = new Number(5);

     mydb.transaction(function(t) {
         var headerOprationBtn;
         t.executeSql('SELECT * FROM businessExpDetails INNER JOIN expNameMst ON businessExpDetails.expNameId =expNameMst.id INNER JOIN currencyMst ON businessExpDetails.currencyId =currencyMst.currencyId  INNER JOIN currencyConversionMst ON businessExpDetails.currencyId = currencyConversionMst.currencyId INNER JOIN accountHeadMst ON businessExpDetails.accHeadId =accountHeadMst.accountHeadId;', [],
             function(transaction, result) {
                 if (result != null && result.rows != null) {

                     for (var i = 0; i < result.rows.length; i++) {

                         var row = result.rows.item(i);
                         var shrinkFromTo;
                         var newDateFormat = reverseConvertDate(row.expDate.substring(0, 2)) + "-" + row.expDate.substring(3, 5) + " " + row.expDate.substring(6, 10);

                         if (window.localStorage.getItem("MobileMapRole") == 'true') {
                             if (row.expFromLoc != '' && row.expToLoc != '') {
                                 var shrinkNarration = row.expNarration.substring(0, row.expNarration.indexOf("--"))
                                 srinckFromTo = row.expFromLoc.substring(0, row.expFromLoc.indexOf(",")) + "/" + row.expToLoc.substring(0, row.expToLoc.indexOf(","));
                                 srinckFromTo = srinckFromTo.concat("...");
                             }
                         }

                         var rowss = j('<tr></tr>').attr({
                             class: ["test"].join(' ')
                         }).appendTo(mytable);
                         j('<td></td>').attr({
                             class: ["expDate"].join(' ')
                         }).html('<p style="color: black;">' + newDateFormat + '</P>').appendTo(rowss);
                         j('<td></td>').attr({
                             class: ["expName"].join(' ')
                         }).html('<p style="color: black;">' + row.expName + '</P>').appendTo(rowss).appendTo(rowss);

                         if (window.localStorage.getItem("MobileMapRole") == 'true') {
                             if (row.expFromLoc != '' && row.expToLoc != '') {
                                 j('<td></td>').attr({
                                     class: ["expNarration"].join(' ')
                                 }).html('<p>' + shrinkNarration + '</br>' + srinckFromTo + '</P>').appendTo(rowss);
                             } else {
                                 j('<td></td>').attr({
                                     class: ["expNarration"].join(' ')
                                 }).html('<p>' + row.expNarration + '</br>' + row.expFromLoc + "" + row.expToLoc + '</P>').appendTo(rowss);
                             }
                         } else {
                             if (row.expFromLoc != '' && row.expToLoc != '') {
                                 j('<td></td>').attr({
                                     class: ["expNarration"].join(' ')
                                 }).html('<p style="color: black;">' + row.expNarration + '</br>' + row.expFromLoc + "/" + row.expToLoc + '</P>').appendTo(rowss);
                             } else {
                                 j('<td></td>').attr({
                                     class: ["expNarration"].join(' ')
                                 }).html('<p style="color: black;">' + row.expNarration + '</br>' + row.expFromLoc + "" + row.expToLoc + '</P>').appendTo(rowss);
                             }
                         }

                         if (row.busExpAttachment.length == 0) {
                             j('<td></td>').attr({
                                 class: ["expAmt"].join(' ')
                             }).html('<p>' + row.expAmt + ' ' + row.currencyName + '</P>').appendTo(rowss);
                         } else {
                             j('<td></td>').attr({
                                 class: ["expAmt"].join(' ')
                             }).html('<p>' + row.expAmt + ' ' + row.currencyName + '</P><img src="images/attach.png" width="25px" height="25px">').appendTo(rowss);
                         }
                         j('<td></td>').attr({
                             class: ["expDate1", "displayNone"].join(' ')
                         }).text(row.expDate).appendTo(rowss);
                         j('<td></td>').attr({
                             class: ["expFromLoc1", "displayNone"].join(' ')
                         }).text(row.expFromLoc).appendTo(rowss);
                         j('<td></td>').attr({
                             class: ["expToLoc1", "displayNone"].join(' ')
                         }).text(row.expToLoc).appendTo(rowss);
                         j('<td></td>').attr({
                             class: ["expNarration1", "displayNone"].join(' ')
                         }).text(row.expNarration).appendTo(rowss);
                         j('<td></td>').attr({
                             class: ["expAmt1", "displayNone"].join(' ')
                         }).text(row.expAmt).appendTo(rowss);
                         j('<td></td>').attr({
                             class: ["busAttachment", "displayNone"].join(' ')
                         }).text(row.busExpAttachment).appendTo(rowss);
                         j('<td></td>').attr({
                             class: ["accHeadId", "displayNone"].join(' ')
                         }).text(row.accHeadId).appendTo(rowss);
                         j('<td></td>').attr({
                             class: ["expNameId", "displayNone"].join(' ')
                         }).text(row.expNameMstId).appendTo(rowss);
                         j('<td></td>').attr({
                             class: ["expUnit", "displayNone"].join(' ')
                         }).text(row.expUnit).appendTo(rowss);
                         j('<td></td>').attr({
                             class: ["currencyId", "displayNone"].join(' ')
                         }).text(row.currencyId).appendTo(rowss);
                         j('<td></td>').attr({
                             class: ["conversionRate", "displayNone"].join(' ')
                         }).text(row.conversionRate).appendTo(rowss);
                         j('<td></td>').attr({
                             class: ["accountCodeId", "displayNone"].join(' ')
                         }).text(row.accCodeId).appendTo(rowss);
                         //j('<td></td>').attr({ class: ["expName","displayNone"].join(' ') }).text(row.expName).appendTo(rowss);       
                         j('<td></td>').attr({
                             class: ["busExpId", "displayNone"].join(' ')
                         }).text(row.busExpId).appendTo(rowss);
                         j('<td></td>').attr({
                             class: ["isErReqd", "displayNone"].join(' ')
                         }).text(row.isErReqd).appendTo(rowss);
                         j('<td></td>').attr({
                             class: ["ERLimitAmt", "displayNone"].join(' ')
                         }).text(row.limitAmountForER).appendTo(rowss);
                         j('<td></td>').attr({
                             class: ["isEntitlementExceeded", "displayNone"].join(' ')
                         }).text(row.isEntitlementExceeded).appendTo(rowss);
                         j('<td></td>').attr({
                             class: ["wayPoint", "displayNone"].join(' ')
                         }).text(row.wayPointunitValue).appendTo(rowss);
                         j('<td></td>').attr({
                             class: ["isAttachmentReq", "displayNone"].join(' ')
                         }).text(row.isAttachmentReq).appendTo(rowss);
                         j('<td></td>').attr({
                             class: ["isEntiLineOrVoucherLevel", "displayNone"].join(' ')
                         }).text(row.isEntiLineOrVoucherLevel).appendTo(rowss);
                         j('<td></td>').attr({
                             class: ["expFixedLimitAmt", "displayNone"].join(' ')
                         }).text(row.expFixedLimitAmt).appendTo(rowss);
                     }

                     j("#source tr").click(function() {
                         headerOprationBtn = defaultPagePath + 'headerPageForBEOperation.html';
                         if (j(this).hasClass("selected")) {
                             j(this).removeClass('selected');
                             populateBEAmount();
                             j('#mainHeader').load(headerOprationBtn);
                         } else {
                             if (j(this).text() == 'DateExpense NameNarration From/To LocAmt') {

                             } else {
                                 j(this).addClass('selected');
                                 populateBEAmount();
                                 j('#mainHeader').load(headerOprationBtn);
                             }
                         }
                     });
                 }
             });
     });
     mytable.appendTo("#box");
     j('#abc').remove();
     mainTable = j('<table></table>').attr({
         id: "abc",
         class: ["table", "table-striped", "table-bordered"].join(' ')
     });
     table1 = j('<table></table>').attr({
         class: ["table", "table1", "table-striped", "table-bordered"].join(' ')
     }).appendTo(mainTable);
     var rowThead = j("<thead></thead>").appendTo(table1);
     var rowTh = j('<tr></tr>').attr({
         class: ["test"].join(' ')
     }).appendTo(rowThead);

     j('<th lang=\'en\' ></th>').text("Voucher No.").appendTo(rowTh);
     //j('<th></th>').text("Title").appendTo(rowTh);
     j('<th lang=\'en\' ></th>').text("Amount").appendTo(rowTh);

     table2 = j('<table></table>').attr({
         id: "source1",
         class: ["table", "table-striped", "table-bordered"].join(' ')
     }).appendTo(mainTable);
     var rowThead1 = j("<thead></thead>").appendTo(table2);
     mydb.transaction(function(t) {
         var headerOprationBtn;
         t.executeSql('SELECT * FROM employeeAdvanceDetails;', [],
             function(transaction, result) {
                 if (result != null && result.rows != null) {

                     for (var i = 0; i < result.rows.length; i++) {

                         var row = result.rows.item(i);

                         var rowss = j('<tr></tr>').attr({
                             class: ["test"].join(' ')
                         }).appendTo(rowThead1);

                         j('<td></td>').attr({
                             class: ["empAdvID", "displayNone"].join(' ')
                         }).text(row.empAdvID).appendTo(rowss);
                         j('<td></td>').attr({
                             class: ["emplAdvVoucherNo"].join(' ')
                         }).text(row.emplAdvVoucherNo).appendTo(rowss);
                         j('<td></td>').attr({
                             class: ["empAdvTitle", "displayNone"].join(' ')
                         }).text(row.empAdvTitle).appendTo(rowss);
                         j('<td></td>').attr({
                             class: ["Amount"].join(' ')
                         }).text(row.Amount).appendTo(rowss);
                     }
                     $("#header tr").click(function() {
                         $("tr").attr('onclick', '');
                     });

                     j("#source1 tr").click(function() {
                         if (j(this).hasClass("selected")) {
                             j(this).removeClass('selected');
                             populateEAAmount();
                             calculateAmount();
                         } else {
                             j(this).addClass('selected');
                             populateEAAmount();
                             calculateAmount();
                         }
                     });
                 }
             });
     });
     mainTable.appendTo("#box1");
     var header = defaultPagePath + 'backbtnPage.html';
     j('#mainHeader').load(header);
 }

 function fetchExpenseClaimFromMain() {
     j('#source').remove();
     mytable = j('<table></table>').attr({
         id: "source",
         class: ["table", "table-striped", "table-bordered"].join(' ')
     });
     var rowThead = j("<thead></thead>").appendTo(mytable);
     var rowTh = j('<tr></tr>').attr({
         class: ["test"].join(' ')
     }).appendTo(rowThead);

     j('<th lang=\'en\'></th>').text("Date").appendTo(rowTh);
     j('<th lang=\'en\'></th>').text("Expense Name").appendTo(rowTh);
     j('<th lang=\'en\'></th>').text("Narration From/To Loc").appendTo(rowTh);
     j('<th lang=\'en\'></th>').text("Amt").appendTo(rowTh);
     var cols = new Number(5);

     mydb.transaction(function(t) {
         var headerOprationBtn;
         t.executeSql('SELECT * FROM businessExpDetails INNER JOIN expNameMst ON businessExpDetails.expNameId =expNameMst.id INNER JOIN currencyMst ON businessExpDetails.currencyId =currencyMst.currencyId INNER JOIN accountHeadMst ON businessExpDetails.accHeadId =accountHeadMst.accountHeadId;', [],
             function(transaction, result) {
                 if (result != null && result.rows != null) {

                     for (var i = 0; i < result.rows.length; i++) {

                         var row = result.rows.item(i);
                         var shrinkFromTo;
                         var newDateFormat = reverseConvertDate(row.expDate.substring(0, 2)) + "-" + row.expDate.substring(3, 5) + " " + row.expDate.substring(6, 10);

                         if (window.localStorage.getItem("MobileMapRole") == 'true') {
                             if (row.expFromLoc != '' && row.expToLoc != '') {
                                 var shrinkNarration = row.expNarration.substring(0, row.expNarration.indexOf("--"))
                                 srinckFromTo = row.expFromLoc.substring(0, row.expFromLoc.indexOf(",")) + "/" + row.expToLoc.substring(0, row.expToLoc.indexOf(","));
                                 srinckFromTo = srinckFromTo.concat("...");
                             }
                         }

                         var rowss = j('<tr></tr>').attr({
                             class: ["test"].join(' ')
                         }).appendTo(mytable);

                         j('<td></td>').attr({
                             class: ["expDate"].join(' ')
                         }).html('<p style="color: black;">' + newDateFormat + '</P>').appendTo(rowss);
                         j('<td></td>').attr({
                             class: ["expName"].join(' ')
                         }).html('<p style="color: black;">' + row.expName + '</P>').appendTo(rowss).appendTo(rowss);
                         if (window.localStorage.getItem("MobileMapRole") == 'true') {
                             if (row.expFromLoc != '' && row.expToLoc != '') {
                                 j('<td></td>').attr({
                                     class: ["expNarration"].join(' ')
                                 }).html('<p style="color: black;">' + shrinkNarration + '</br>' + srinckFromTo + '</P>').appendTo(rowss);
                             } else {
                                 j('<td></td>').attr({
                                     class: ["expNarration"].join(' ')
                                 }).html('<p style="color: black;">' + row.expNarration + '</br>' + row.expFromLoc + "" + row.expToLoc + '</P>').appendTo(rowss);
                             }
                         } else {
                             if (row.expFromLoc != '' && row.expToLoc != '') {
                                 j('<td></td>').attr({
                                     class: ["expNarration"].join(' ')
                                 }).html('<p style="color: black;">' + row.expNarration + '</br>' + row.expFromLoc + "/" + row.expToLoc + '</P>').appendTo(rowss);
                             } else {
                                 j('<td></td>').attr({
                                     class: ["expNarration"].join(' ')
                                 }).html('<p style="color: black;">' + row.expNarration + '</br>' + row.expFromLoc + "" + row.expToLoc + '</P>').appendTo(rowss);
                             }
                         }

                         if (row.busExpAttachment.length == 0) {
                             j('<td></td>').attr({
                                 class: ["expAmt"].join(' ')
                             }).html('<p style="color: black;">' + row.expAmt + ' ' + row.currencyName + '</P>').appendTo(rowss);
                         } else {
                             j('<td></td>').attr({
                                 class: ["expAmt"].join(' ')
                             }).html('<p style="color: black;">' + row.expAmt + ' ' + row.currencyName + '</P><img src="images/attach.png" width="25px" height="25px">').appendTo(rowss);
                         }
                         j('<td></td>').attr({
                             class: ["expDate1", "displayNone"].join(' ')
                         }).text(row.expDate).appendTo(rowss);
                         j('<td></td>').attr({
                             class: ["expFromLoc1", "displayNone"].join(' ')
                         }).text(row.expFromLoc).appendTo(rowss);
                         j('<td></td>').attr({
                             class: ["expToLoc1", "displayNone"].join(' ')
                         }).text(row.expToLoc).appendTo(rowss);
                         j('<td></td>').attr({
                             class: ["expNarration1", "displayNone"].join(' ')
                         }).text(row.expNarration).appendTo(rowss);
                         j('<td></td>').attr({
                             class: ["expAmt1", "displayNone"].join(' ')
                         }).text(row.expAmt).appendTo(rowss);
                         j('<td></td>').attr({
                             class: ["busAttachment", "displayNone"].join(' ')
                         }).text(row.busExpAttachment).appendTo(rowss);
                         j('<td></td>').attr({
                             class: ["accHeadId", "displayNone"].join(' ')
                         }).text(row.accHeadId).appendTo(rowss);
                         j('<td></td>').attr({
                             class: ["expNameId", "displayNone"].join(' ')
                         }).text(row.expNameMstId).appendTo(rowss);
                         j('<td></td>').attr({
                             class: ["expUnit", "displayNone"].join(' ')
                         }).text(row.expUnit).appendTo(rowss);
                         j('<td></td>').attr({
                             class: ["currencyId", "displayNone"].join(' ')
                         }).text(row.currencyId).appendTo(rowss);
                         j('<td></td>').attr({
                             class: ["accountCodeId", "displayNone"].join(' ')
                         }).text(row.accCodeId).appendTo(rowss);
                         //j('<td></td>').attr({ class: ["expName","displayNone"].join(' ') }).text(row.expName).appendTo(rowss);       
                         j('<td></td>').attr({
                             class: ["busExpId", "displayNone"].join(' ')
                         }).text(row.busExpId).appendTo(rowss);
                         j('<td></td>').attr({
                             class: ["isErReqd", "displayNone"].join(' ')
                         }).text(row.isErReqd).appendTo(rowss);
                         j('<td></td>').attr({
                             class: ["ERLimitAmt", "displayNone"].join(' ')
                         }).text(row.limitAmountForER).appendTo(rowss);
                         j('<td></td>').attr({
                             class: ["isEntitlementExceeded", "displayNone"].join(' ')
                         }).text(row.isEntitlementExceeded).appendTo(rowss);
                         j('<td></td>').attr({
                             class: ["wayPoint", "displayNone"].join(' ')
                         }).text(row.wayPointunitValue).appendTo(rowss);
                         j('<td></td>').attr({
                             class: ["isAttachmentReq", "displayNone"].join(' ')
                         }).text(row.isAttachmentReq).appendTo(rowss);
                         j('<td></td>').attr({
                             class: ["isEntiLineOrVoucherLevel", "displayNone"].join(' ')
                         }).text(row.isEntiLineOrVoucherLevel).appendTo(rowss);
                         j('<td></td>').attr({
                             class: ["expFixedLimitAmt", "displayNone"].join(' ')
                         }).text(row.expFixedLimitAmt).appendTo(rowss);
                     }

                     j("#source tr").click(function() {
                         headerOprationBtn = defaultPagePath + 'headerPageForBEOperation.html';
                         if (j(this).hasClass("selected")) {
                             j(this).removeClass('selected');
                             j('#mainHeader').load(headerOprationBtn);
                         } else {
                             if (j(this).text() == 'DateExpense NameNarration From/To LocAmt') {

                             } else {
                                 j('#mainHeader').load(headerOprationBtn);
                                 j(this).addClass('selected');
                             }
                         }
                     });

                     j(function() {
                         j("#source tr").on("swipe", swipeHandler);

                         function swipeHandler(event) {
                             alert("asd");
                         }
                     });

                 }
             });
     });
     mytable.appendTo("#box");
     var header = defaultPagePath + 'backbtnPage.html';
     j('#mainHeader').load(header);
 }

 function fetchTravelSettlementExpFromMain() {
     j('#source').remove();
     mytable = j('<table></table>').attr({
         id: "source",
         class: ["table", "table-striped", "table-bordered"],
         style:["overflow-x: auto;display: inline-table;"].join(' ')
     });

     var rowThead = j("<thead></thead>").appendTo(mytable);
     var rowTh = j('<tr></tr>').attr({
         class: ["test"].join(' ')
     }).appendTo(rowThead);

     j('<th lang=\'en\'></th>').text("Date").appendTo(rowTh);
     j('<th lang=\'en\'></th>').text("TR").appendTo(rowTh);
     j('<th lang=\'en\'></th>').text("Expense Name").appendTo(rowTh);
     j('<th lang=\'en\'></th>').text("Amt").appendTo(rowTh);
     j('<th lang=\'en\'></th>').text("CityTown").appendTo(rowTh);
     j('<th lang=\'en\'></th>').text("Narration").appendTo(rowTh);

     var cols = new Number(4);

     mydb.transaction(function(t) {

         t.executeSql('select * from travelSettleExpDetails inner join cityTownMst on cityTownMst.cityTownId = travelSettleExpDetails.cityTownId inner join currencyMst on travelSettleExpDetails.currencyId = currencyMst.currencyId inner join travelExpenseNameMst on travelExpenseNameMst.id = travelSettleExpDetails.expNameId inner join travelRequestDetails on travelRequestDetails.travelRequestId = travelSettleExpDetails.travelRequestId;', [],
             function(transaction, result) {

                 if (result != null && result.rows != null) {

                     for (var i = 0; i < result.rows.length; i++) {

                         var row = result.rows.item(i);

                        var narration = row.expNarration;

                        if(narration > '8'){
                           narration = narration.substring(0,5)+"..";
                        }

                        var attachmentLength = row.tsExpAttachment.length;
                        //attachmentLength = attachmentLength+1;

                        var newDateFormat = getDateForDetailLine(row.expDate);
                        var length = row.travelRequestNo.length;
                        var trNo = (row.travelRequestNo).substr(length-2);

                        var cityTown = row.cityTownName;

                        if(cityTown > '9'){
                           cityTown = cityTown.substring(0,6)+"..";
                        }

                         var rowss = j('<tr></tr>').attr({
                             class: ["test"].join(' ')
                         }).appendTo(mytable);

                         j('<td></td>').attr({
                             class: ["expDate"].join(' ')
                         }).html('<p style="color: black;">' + newDateFormat + '</P>').appendTo(rowss);
                         j('<td></td>').attr({
                             class: ["trNo"].join(' ')
                         }).html('<p style="color: black;">' + trNo + '</P>').appendTo(rowss);
                         j('<td></td>').attr({
                             class: ["expenseName"].join(' ')
                         }).html('<p style="color: black;">' + row.expenseName + '</P>').appendTo(rowss).appendTo(rowss);
                         j('<td></td>').attr({
                             class: ["expAmt"].join(' ')
                         }).html('<p>' + row.expAmt + ' ' + row.currencyName + '</P>').appendTo(rowss);
                         j('<td></td>').attr({
                             class: ["cityTownName"].join(' ')
                         }).html('<p style="color: black;">' + cityTown + '</P>').appendTo(rowss);

                         if (attachmentLength == 0) {
                             j('<td></td>').attr({
                                 class: ["expNarration"].join(' ')
                             }).html('<p>' + narration +'</P>').appendTo(rowss);
                         } else {
                             j('<td></td>').attr({
                                 class: ["expNarration"].join(' ')
                             }).html('<p>' + narration +'</P><img src="images/attach.png" width="25px" height="25px">').appendTo(rowss);
                         }
                         j('<td></td>').attr({
                             class: ["expDate1", "displayNone"].join(' ')
                         }).text(row.expDate).appendTo(rowss);
                         j('<td></td>').attr({
                             class: ["expAmt1", "displayNone"].join(' ')
                         }).text(row.expAmt).appendTo(rowss);
                         j('<td></td>').attr({
                             class: ["expNarration1", "displayNone"].join(' ')
                         }).text(row.expNarration).appendTo(rowss);
                         j('<td></td>').attr({
                             class: ["travelRequestId", "displayNone"].join(' ')
                         }).text(row.travelRequestId).appendTo(rowss);
                         j('<td></td>').attr({
                             class: ["tsExpAttachment", "displayNone"].join(' ')
                         }).text(row.tsExpAttachment).appendTo(rowss);
                         j('<td></td>').attr({
                             class: ["expNameId", "displayNone"].join(' ')
                         }).text(row.expenseNameId).appendTo(rowss);
                         j('<td></td>').attr({
                             class: ["expUnit", "displayNone"].join(' ')
                         }).text(row.expUnit).appendTo(rowss);
                         j('<td></td>').attr({
                             class: ["currencyId", "displayNone"].join(' ')
                         }).text(row.currencyId).appendTo(rowss);
                         j('<td></td>').attr({
                             class: ["modeId", "displayNone"].join(' ')
                         }).text(row.travelModeId).appendTo(rowss);
                         j('<td></td>').attr({
                             class: ["categoryId", "displayNone"].join(' ')
                         }).text(row.travelCategoryId).appendTo(rowss);
                         j('<td></td>').attr({
                             class: ["fromcityTownId", "displayNone"].join(' ')
                         }).text(row.cityTownId).appendTo(rowss);
                         j('<td></td>').attr({
                             class: ["accountCodeId", "displayNone"].join(' ')
                         }).text(row.accCodeId).appendTo(rowss);
                         j('<td></td>').attr({
                             class: ["expName", "displayNone"].join(' ')
                         }).text(row.expenseName).appendTo(rowss);
                         j('<td></td>').attr({
                             class: ["tsExpId", "displayNone"].join(' ')
                         }).text(row.tsExpId).appendTo(rowss);
                         j('<td></td>').attr({
                             class: ["isModeCategory", "displayNone"].join(' ')
                         }).text(row.isModeCategory).appendTo(rowss);
                         j('<td></td>').attr({
                             class: ["accountCodeId", "displayNone"].join(' ')
                         }).text(row.accountCodeId).appendTo(rowss);
                         j('<td></td>').attr({
                             class: ["isEntitlementExceeded", "displayNone"].join(' ')
                         }).text(row.isEntitlementExceeded).appendTo(rowss);
                     }

                     j("#source tr").click(function() {
                         headerOprationBtn = defaultPagePath + 'headerPageForTSOperation.html';
                         if (j(this).hasClass("selected")) {
                             var headerBackBtn = defaultPagePath + 'headerPageForTSOperation.html';
                             j(this).removeClass('selected');
                              populateTSAmount();
                             j('#mainHeader').load(headerBackBtn);
                         } else {
                             if (j(this).text() == 'DateExpense NameAmtcityTownNarration') {

                             } else {
                                 j('#mainHeader').load(headerOprationBtn);
                                 j(this).addClass('selected');
                                  populateTSAmount();
                             }
                         }
                     });
                 }
             });
     });
     mytable.appendTo("#box");
     var header = defaultPagePath + 'backbtnPage.html';
     j('#mainHeader').load(header);
 }

 //  SMS changes
 function saveSMS(sms) {
     j('#loading_Cat').show();
     if (mydb) {
         //save incoming sms
         var smsMsg = sms.body;
         var senderAddress = "" + sms.address;
         senderAddress = senderAddress.toLowerCase();
         var smsSentDate = getFormattedDateFromMillisec(parseInt(sms.date_sent));
         var smsAmount = parseIncomingSMSForAmount(smsMsg);
         if (smsMsg != "") {
             mydb.transaction(function(t) {
                 t.executeSql("INSERT INTO smsMaster (smsText,senderAddr,smsSentDate,smsAmount) VALUES (?,?,?,?)", [smsMsg, senderAddress, smsSentDate, smsAmount]);
             });
             j('#loading_Cat').hide();
         } else {
             j('#loading_Cat').hide();
         }
     } else {
         alert("db not found, your browser does not support web sql!");
     }
 }

 function fetchSMSClaim() {
     mytable = j('<table></table>').attr({
         id: "source",
         class: ["table", "table-striped", "table-bordered"].join(' ')
     });
     var rowThead = j("<thead></thead>").appendTo(mytable);
     var rowTh = j('<tr></tr>').attr({
         class: ["test"].join(' ')
     }).appendTo(rowThead);

     j('<th></th>').text("SMS Date").appendTo(rowTh);
     j('<th></th>').text("Expense type").appendTo(rowTh);
     j('<th></th>').text("Text").appendTo(rowTh);
     j('<th></th>').text("Amt").appendTo(rowTh);
     var cols = new Number(5);

     mydb.transaction(function(t) {
         /*      mydb.transaction(function (t) {
                          t.executeSql("INSERT INTO smsMaster (smsId,smsSentDate,senderAddr,smsText,smsAmount) VALUES (?, ?, ?, ?,?)", 
                                                    [1,"23-Dec-2016","VM_IPAYTM","successfully  Rs.600 ","600.00"]);
                        });*/
         var headerOprationBtn;
         t.executeSql('SELECT * FROM smsMaster;', [],
             function(transaction, result) {
                 if (result != null && result.rows != null) {

                     for (var i = 0; i < result.rows.length; i++) {
                         var row = result.rows.item(i);
                         var smsAmount = parseIncomingSMSForAmount(row.smsText);
                         var rowss = j('<tr></tr>').attr({
                             class: ["test"].join(' ')
                         }).appendTo(mytable);
                         j('<td></td>').attr({
                             class: ["smsSentDate", ""].join(' ')
                         }).text(row.smsSentDate).appendTo(rowss);
                         // j('<td></td>').attr({ class: ["senderAddr",""].join(' ') }).text(row.senderAddr).appendTo(rowss);
                         j(rowss).append('<td><img width="50px" height="50px" src="images/' + row.senderAddr + '.png"/></td>');
                         j('<td></td>').attr({
                             class: ["smsText", ""].join(' ')
                         }).text(row.smsText).appendTo(rowss);
                         j('<td></td>').attr({
                             class: ["smsAmount", ""].join(' ')
                         }).text(row.smsAmount).appendTo(rowss);
                         // j(rowss).append('<td><input type = "text"  id = "amt" value= "'+ smsAmount +'" style = "width: 50px;"/></td>');
                         j('<td></td>').attr({
                             class: ["smsId", "displayNone"].join(' ')
                         }).text(row.smsId).appendTo(rowss);
                         j('<td></td>').attr({
                             class: ["sender", "displayNone"].join(' ')
                         }).text(row.senderAddr).appendTo(rowss);
                     }

                     j("#source tr").click(function() {
                         headerOprationBtn = defaultPagePath + 'headerPageForSMSOperation.html';
                         if (j(this).hasClass("selected")) {
                             var headerBackBtn = defaultPagePath + 'headerPageForSMSOperation.html';
                             j(this).removeClass('selected');
                             j('#mainHeader').load(headerBackBtn);
                         } else {
                             if (j(this).text() == 'DateExpense expid From/To LocAmt') {

                             } else {
                                 j('#mainHeader').load(headerOprationBtn);
                                 j(this).addClass('selected');
                             }
                         }
                     });
                 }
             });
     });
     mytable.appendTo("#box");
 }

 function discardMessages(smsID) {
     mydb.transaction(function(t) {
         t.executeSql("DELETE FROM smsMaster WHERE smsId=?", [smsID]);
     });
 }

 function getFiltrationConstraints() {
     var blockedWordsList = "";
     var allowedWordsList = "";
     mydb.transaction(function(t) {
         t.executeSql('SELECT * FROM smsScrutinizerMst;', [],
             function(transaction, result) {
                 if (result != null && result.rows != null) {

                     for (var i = 0; i < result.rows.length; i++) {
                         var row = result.rows.item(i);
                         var status = row.status;
                         var flag = row.filterFlag;
                         var filterText = row.filterText;

                         if (status == 1) {
                             if (flag == 'b') {
                                 blockedWordsList += filterText + "$";
                             } else if (flag == 'w') {
                                 allowedWordsList += filterText + "$"
                             }
                         }

                     }
                 }
             });
     });
     setTimeout(function() {
         tempFilterStr = blockedWordsList + "@" + allowedWordsList;
         if (tempFilterStr) {
             filtersStr = tempFilterStr;
             window.localStorage.setItem("SMSFilterationStr", filtersStr);
         }
         return tempFilterStr
     }, 50);
 }

 function synchronizeWhiteListMasterData() {
     var jsonSentToSync = new Object();

     j('#loading_Cat').show();
     var blockedWordsList = "";
     var allowedWordsList = "";
     if (mydb) {
         j.ajax({
             url: window.localStorage.getItem("urlPath") + "SyncWhiteListMasterWebService",
             type: 'POST',
             dataType: 'json',
             crossDomain: true,
             data: JSON.stringify(jsonSentToSync),
             success: function(data) {
                 if (data.Status == 'Success') {
                     mydb.transaction(function(t) {
                         t.executeSql("DELETE FROM smsScrutinizerMst");
                         var whiteListArray = data.WhiteListArray;
                         if (whiteListArray != null && whiteListArray.length > 0) {
                             for (var i = 0; i < whiteListArray.length; i++) {
                                 var msgArr = new Array();
                                 msgArr = whiteListArray[i];
                                 var wbl_id = msgArr.ID;
                                 var filter_Text = msgArr.FilterText;
                                 var filter_Flag = msgArr.FilterFlag;
                                 var status = msgArr.Status;

                                 t.executeSql("INSERT INTO smsScrutinizerMst (ID, filterText, filterFlag, status) VALUES (?, ?, ?, ?)", [wbl_id, filter_Text, filter_Flag, status]);

                             }
                         }
                     });

                     j('#loading_Cat').hide();
                     document.getElementById("syncSuccessMsg").innerHTML = "SMS Status Master synchronized successfully.";
                     j('#syncSuccessMsg').hide().fadeIn('slow').delay(500).fadeOut('slow');
                     setTimeout(function() {
                         //console.log("before getFiltrationConstraints call")
                         getFiltrationConstraints();
                     }, 2000);
                 } else {
                     j('#loading_Cat').hide();
                     document.getElementById("syncFailureMsg").innerHTML = "SMS Status Master not synchronized successfully.";
                     j('#syncFailureMsg').hide().fadeIn('slow').delay(300).fadeOut('slow');

                 }

             },
             error: function(data) {
                 alert("Error: Oops something is wrong, Please Contact System Administer");
             }
         });
     } else {
         alert("db not found, your browser does not support web sql!");
     }

 }

 function showMultiLanguag() {
     var headerBackBtn = defaultPagePath + 'backbtnPage.html';
     // var pageRef=defaultPagePath+'helpMenuPage.html';
     var pageRef = defaultPagePath + 'multiLanguage.html';
     j(document).ready(function() {
         j('#mainHeader').load(headerBackBtn);
         j('#mainContainer').load(pageRef);
     });
     appPageHistory.push(pageRef);
 }

 function onSuccessBE(imageData) {
     try {
         setTimeout(function() {

             smallImageBE.style.display = 'block';
             document.getElementById('imageBE').setAttribute('src', "data:image/jpeg;base64," + imageData);
             smallImageBE.src = "data:image/jpeg;base64," + imageData;
             fileTempGalleryBE = "data:image/jpeg;base64," + imageData;
             fileTempCameraBE = "";
         }, 3000);
     } catch (e) {
         alert("Error gallery : " + e);
     }
 }

 function onFail(message) {
     alert('Failed because: ' + message);
 }

 //********************  Methods For Attachment -- Start ******************************//

 function showAttachmentmessage() {
     var isAttachmentRequired = perUnitDetailsJSON.isAttachmentReq;

     if (isAttachmentRequired == 'Y') {
         j('#errorMsgAreaForAttachment').children('span').text("Attachment is mandatory");
     } else {
         j('#errorMsgAreaForAttachment').children('span').text("");
     }
 }

 //********************  Methods For Attachment -- End ******************************//

 function validateExpenseAmtForVoucher(jsonToSaveEA) {

     var expenses = jsonToSaveEA.expenseDetails;
     var map = new Map();
     var msg = "";

     for (var i = 0; i < expenses.length; i++) {
         //alert("expenses[i].isEntiLineOrVoucherLevel : "+expenses[i].isEntiLineOrVoucherLevel);

         if (expenses[i].isEntiLineOrVoucherLevel == ("V") && expenses[i].expFixedLimitAmt != 0) {

             var expId = expenses[i].ExpenseId;
             var expName = expenses[i].ExpenseName;
             var isEntiLineOrVoucherLevel = expenses[i].isEntiLineOrVoucherLevel;
             var ERLimitAmt = expenses[i].ERLimitAmt;
             var amount = expenses[i].amount;
             var ERFixedLimit = expenses[i].expFixedLimitAmt;
             var keyForMap = expId + "$" + ERFixedLimit + "$" + expName;

             if (map.has(keyForMap)) {
                 var value = map.get(keyForMap);

                 map.set(keyForMap, parseInt(value) + parseInt(amount));
             } else {
                 map.set(keyForMap, parseInt(amount));
             }

         }

     }

     map.forEach(function(value, key, map) {

         var array = new Array();
         array = key.split("$");

         var expId = array[0];

         var expLimitAmt = array[1];

         var expName = array[2];

         console.log("expId expLimitAmt expName : " + expId + "" + expLimitAmt + "" + expName);

         if (parseInt(expLimitAmt) < parseInt(value)) {

             msg = msg + " Amount entered " + value + " exceeds defined entitled limit of " + expLimitAmt + " for Expense : " + expName;
             msg = msg + '\n';

         }

         console.log('key: "' + key + '", value: "' + value + '"');
     });

     if (msg != "") {
         var entitlementMsg = confirm(msg);

         if (entitlementMsg == true) {
             return true;
         } else {
             return false;
         }
     } else {
         return true;
     }

 }

 //********************  Methods For Entitlement Changes For Buss-Exp-EA -- Start ******************************//

 function validateMontlyAmtForVoucherForBEWithEA(jsonToSaveBE, busExpDetailsArr, empAdvArr, pageRefSuccess, pageRefFailure) {
     j('#loading_Cat').show();

     j.ajax({
         url: window.localStorage.getItem("urlPath") + "ValidateBusExpPeriodictyWebService",
         type: 'POST',
         dataType: 'json',
         crossDomain: true,
         data: JSON.stringify(jsonToSaveBE),
         success: function(data) {
             if (data.Status == "Success") {
                 if (data.hasOwnProperty('DelayStatus')) {
                     setDelayMessage(data, jsonToSaveBE, busExpDetailsArr);
                     j('#loading_Cat').hide();
                 } else {
                     successMessage = data.Message;

                     if (successMessage != "") {
                         var confirmBox = confirm(successMessage);

                         if (confirmBox == true) {
                             approvalServiceForBEwithEA(jsonToSaveBE, busExpDetailsArr, empAdvArr, pageRefSuccess, pageRefFailure);
                         } else {
                             entitlementMsg = false;
                         }
                     } else {
                         approvalServiceForBEwithEA(jsonToSaveBE, busExpDetailsArr, empAdvArr, pageRefSuccess, pageRefFailure);
                     }

                     requestRunning = false;
                     j('#loading_Cat').hide();
                     //j('#mainHeader').load(headerBackBtn);
                     //j('#mainContainer').load(pageRefSuccess);
                     // appPageHistory.push(pageRef);
                 }
             } else if (data.Status == "Failure") {
                 successMessage = data.Message;
                 requestRunning = false;
                 j('#loading_Cat').hide();
                 j('#mainHeader').load(headerBackBtn);
                 j('#mainContainer').load(pageRefFailure);
             } else {
                 j('#loading_Cat').hide();
                 successMessage = "Oops!! Something went wrong. Please contact system administrator.";
                 requestRunning = false;
                 j('#mainHeader').load(headerBackBtn);
                 j('#mainContainer').load(pageRefFailure);
             }
         },
         error: function(data) {
             j('#loading_Cat').hide();
             requestRunning = false;
             alert(window.lang.translate('Error: Oops something is wrong, Please Contact System Administer'));
         }
     });

     //}, 100);
 }

 function approvalServiceForBEwithEA(jsonToSaveBE, busExpDetailsArr, empAdvArr, pageRefSuccess, pageRefFailure) {
     j('#loading_Cat').show();
     var headerBackBtn = defaultPagePath + 'backbtnPage.html';

     j.ajax({
         url: window.localStorage.getItem("urlPath") + "SynchSubmitBusinessExpense",
         type: 'POST',
         dataType: 'json',
         crossDomain: true,
         data: JSON.stringify(jsonToSaveBE),
         success: function(data) {
             if (data.Status == "Success") {
                 if (data.hasOwnProperty('DelayStatus')) {
                     setDelayMessage(data, jsonToSaveBE, busExpDetailsArr);
                     j('#loading_Cat').hide();
                 } else {
                     successMessage = data.Message;
                     for (var i = 0; i < busExpDetailsArr.length; i++) {
                         var businessExpDetailId = busExpDetailsArr[i];
                         deleteSelectedExpDetails(businessExpDetailId);
                     }
                     for (var i = 0; i < empAdvArr.length; i++) {
                         var empAdvId = empAdvArr[i];
                         deleteSelectedEmplAdv(empAdvId);
                     }
                     requestRunning = false;
                     j('#loading_Cat').hide();
                     j('#mainHeader').load(headerBackBtn);
                     j('#mainContainer').load(pageRefSuccess);
                     // appPageHistory.push(pageRef);
                 }
             } else if (data.Status == "Failure") {
                 successMessage = data.Message;
                 requestRunning = false;
                 j('#loading_Cat').hide();
                 j('#mainHeader').load(headerBackBtn);
                 j('#mainContainer').load(pageRefFailure);
             } else {
                 j('#loading_Cat').hide();
                 successMessage = "Oops!! Something went wrong. Please contact system administrator.";
                 requestRunning = false;
                 j('#mainHeader').load(headerBackBtn);
                 j('#mainContainer').load(pageRefFailure);
             }
         },
         error: function(data) {
             j('#loading_Cat').hide();
             requestRunning = false;
             alert(window.lang.translate('Error: Oops something is wrong, Please Contact System Administer'));
         }
     });
 }

 //********************  Methods For Entitlement Changes For Buss-Exp-EA -- End ******************************//

 //********************  Methods For Entitlement Changes For Buss-Exp -- Start ******************************//

 function validateMontlyAmtForVoucherForBE(jsonToSaveBE, busExpDetailsArr, pageRefSuccess, pageRefFailure) {
     j('#loading_Cat').show();

     j.ajax({
         url: window.localStorage.getItem("urlPath") + "ValidateBusExpPeriodictyWebService",
         type: 'POST',
         dataType: 'json',
         crossDomain: true,
         data: JSON.stringify(jsonToSaveBE),
         success: function(data) {
             if (data.Status == "Success") {
                 if (data.hasOwnProperty('DelayStatus')) {
                     setDelayMessage(data, jsonToSaveBE, busExpDetailsArr);
                     j('#loading_Cat').hide();
                 } else {
                     successMessage = data.Message;

                     if (successMessage != "") {
                         var confirmBox = confirm(successMessage);

                         if (confirmBox == true) {
                             approvalServiceForBE(jsonToSaveBE, busExpDetailsArr, pageRefSuccess, pageRefFailure);
                         } else {
                             entitlementMsg = false;
                         }
                     } else {
                         approvalServiceForBE(jsonToSaveBE, busExpDetailsArr, pageRefSuccess, pageRefFailure);
                     }

                     requestRunning = false;
                     j('#loading_Cat').hide();
                     //j('#mainHeader').load(headerBackBtn);
                     //j('#mainContainer').load(pageRefSuccess);
                     // appPageHistory.push(pageRef);
                 }
             } else if (data.Status == "Failure") {
                 successMessage = data.Message;
                 requestRunning = false;
                 j('#loading_Cat').hide();
                 j('#mainHeader').load(headerBackBtn);
                 j('#mainContainer').load(pageRefFailure);
             } else {
                 j('#loading_Cat').hide();
                 successMessage = "Oops!! Something went wrong. Please contact system administrator.";
                 requestRunning = false;
                 j('#mainHeader').load(headerBackBtn);
                 j('#mainContainer').load(pageRefFailure);
             }
         },
         error: function(data) {
             j('#loading_Cat').hide();
             requestRunning = false;
             alert(window.lang.translate('Error: Oops something is wrong, Please Contact System Administer'));
         }
     });

     //}, 100);
 }

 function approvalServiceForBE(jsonToSaveBE, busExpDetailsArr, pageRefSuccess, pageRefFailure) {
     j('#loading_Cat').show();

     var headerBackBtn = defaultPagePath + 'backbtnPage.html';

     j.ajax({
         url: window.localStorage.getItem("urlPath") + "SynchSubmitBusinessExpense",
         type: 'POST',
         dataType: 'json',
         crossDomain: true,
         data: JSON.stringify(jsonToSaveBE),
         success: function(data) {
             if (data.Status == "Success") {
                 if (data.hasOwnProperty('DelayStatus')) {
                     setDelayMessage(data, jsonToSaveBE, busExpDetailsArr);
                     j('#loading_Cat').hide();
                 } else {
                     successMessage = data.Message;
                     for (var i = 0; i < busExpDetailsArr.length; i++) {
                         var businessExpDetailId = busExpDetailsArr[i];
                         deleteSelectedExpDetails(businessExpDetailId);
                     }
                     requestRunning = false;
                     j('#loading_Cat').hide();
                     j('#mainHeader').load(headerBackBtn);
                     j('#mainContainer').load(pageRefSuccess);
                     // appPageHistory.push(pageRef);
                 }
             } else if (data.Status == "Failure") {
                 successMessage = data.Message;
                 requestRunning = false;
                 j('#loading_Cat').hide();
                 j('#mainHeader').load(headerBackBtn);
                 j('#mainContainer').load(pageRefFailure);
             } else {
                 j('#loading_Cat').hide();
                 requestRunning = false;
                 successMessage = "Oops!! Something went wrong. Please contact system administrator.";
                 j('#mainHeader').load(headerBackBtn);
                 j('#mainContainer').load(pageRefFailure);
             }
         },
         error: function(data) {
             j('#loading_Cat').hide();
             requestRunning = false;
             alert(window.lang.translate('Error: Oops something is wrong, Please Contact System Administer'));

         }
     });

 }

 //********************  Methods For Entitlement Changes For Buss-Exp -- End ******************************//

 // *********************************  Upcoming Trips  -- Start *******************************************//

 function fetchDateForTrips() {
     var jsonForTrips = new Object();
     jsonForTrips["EmployeeId"] = window.localStorage.getItem("EmployeeId");
     ajaxCallForTripDates(jsonForTrips);
 }

 function ajaxCallForTripDates(jsonForTrips) {
     urlPath = window.localStorage.getItem("urlPath");
     j.ajax({
         url: urlPath + "FetchDateForTrips",
         type: 'POST',
         dataType: 'json',
         crossDomain: true,
         data: JSON.stringify(jsonForTrips),
         success: function(data) {
             if (data.Status == "Success") {
                 var travelRequestDetails = data.TravelRequestDetails;
                 setDynamicDate(travelRequestDetails);
             }
         },
         error: function(data) {
             alert(window.lang.translate('Error: Oops something is wrong, Please Contact System Administer'));
         }
     });
 }

 function setDynamicDate(travelRequestDetails) {
     if (travelRequestDetails != null && travelRequestDetails.length > 0) {
         j('#dateClaimsbox').empty();

         for (var i = 0; i < travelRequestDetails.length; i++) {

             var stateArr = new Array();
             stateArr = travelRequestDetails[i];
             var tripDate = stateArr.travelDate;
             var from_loc = stateArr.from;
             var to_loc = stateArr.to;
             var tr_title_upcomingtrip = stateArr.tr_title;
             var requestTripId = stateArr.travelRequestId;

             try {
                 var s =
                     "<li onclick ='fetchTripDetails(" + i + "," + requestTripId + ");'>" + "<div class='trippreflist'>" + "<span class='pull-left'>" + "<input class='abc' id='tripDate_" + i + "' type=button value=" + tripDate + " >" + "</span>" + "<div class='pull-left'>" + "<table class='uptripstxttable'>" + "<tr><td colspan='4'><input class='sltpreftrip' id='tr_title_upcomingtrip_" + i + "' readonly='true' value=\"" + tr_title_upcomingtrip + "\"></td></tr>" + "<tr><td>From: </td><td><input class='fligtprefdate' id='from_" + i + "' readonly='true' value=" + from_loc + "></td><td>To: </td><td><input class='fligtprefdate' id='to_" + i + "' readonly='true' value=" + to_loc + "></td></tr>" + "</table>" + "</div>" + "</div>" + "</li>";

             } catch (e) {
                 alert("exception in dynamic page : " + e);
             }

             j('#dateClaimsbox').append(s);
         }

     } else {
         if (document.getElementById('tabNoUpcomingDate') != null) {
             document.getElementById('tabNoUpcomingDate').style.display = '';
         }
     }

 }

 function formatDateNew(date1) {

     var d = new Date(date1),
         month = '' + (d.getMonth() + 1),
         day = '' + d.getDate(),
         year = d.getFullYear();

     if (month.length < 2) month = '0' + month;
     if (day.length < 2) day = '0' + day;

     return [year, month, day].join('-');

 }

 function fetchTripDetails(i, requestTripId) {

     document.getElementById('firstDiv').style.display = 'none';
     document.getElementById('tabTrip1').style.display = '';
     document.getElementById('tripdet').style.display = '';

     var jsonForTripDetails = new Object();
     jsonForTripDetails["travelRequestId"] = requestTripId;
     var dateFormat1 = document.getElementById("tripDate_" + i).value;
     dateNew = formatDateNew(dateFormat1);
     jsonForTripDetails["expStartDate"] = dateNew;
     ajaxCallForTripDetails(jsonForTripDetails);
 }

 function ajaxCallForTripDetails(jsonForTripDetails) {
     urlPath = window.localStorage.getItem("urlPath");
     j.ajax({
         url: urlPath + "FetchTripDetails",
         type: 'POST',
         dataType: 'json',
         crossDomain: true,
         data: JSON.stringify(jsonForTripDetails),
         success: function(data) {

             var TravelFlightDetails = data.TravelFlightDetails;

             var TravelCabDetails = data.TravelCabDetails;

             var TravelAccDetails = data.TravelAccDetails;

             setDynamicDetails(TravelFlightDetails, TravelCabDetails, TravelAccDetails);

         },
         error: function(data) {
             alert(window.lang.translate('Error: Oops something is wrong, Please Contact System Administer'));
         }
     });

 }

 function setDynamicDetails(TravelFlightDetails, TravelCabDetails, TravelAccDetails) {

     if (TravelFlightDetails != null && TravelFlightDetails.length > 0) {
         j('#tripList').empty();
         for (var i = 0; i < TravelFlightDetails.length; i++) {
             var stateArr1 = new Array();
             stateArr1 = TravelFlightDetails[i];

             var to_Flight = stateArr1.to;
             var from_Flight = stateArr1.from;
             var from_date_Flight = stateArr1.from_date;
             var to_date_Flight = stateArr1.to_date;
             var carrier_name_Flight = stateArr1.carrier_name;
             var flight_no_Flight = stateArr1.flight_no;
             var pnr_id_Flight = stateArr1.pnr_id;
             try {

                 var data1 = "<li class='airplan'>" + "<div class='trippreflist'>" + "<span class='pull-left tripreficon'><a href='#'><i class='fa fa-plane'></i></a></span>" + "<div class='pull-left triprefblock'>" + "<table class='uptripstxttable'>" + "<tr><td>From: </td><td><input class='uptripstxtfld' id='from_Flight_" + i + "' readonly='true' value=" + from_Flight + "></td><td>&nbsp;To: </td><td><input class='uptripstxtfld' id='to_Flight_" + i + "' readonly='true' value=" + to_Flight + "></td></tr>" + "<tr><td>From: </td><td><input class='uptripstxtfld' id='from_date_Flight_" + i + "' readonly='true' value=" + from_date_Flight + "></td><td>&nbsp;To: </td><td><input class='uptripstxtfld' id='to_date_Flight_" + i + "' readonly='true' value=" + to_date_Flight + "></td></tr>" + "<tr><td class='carriarnametd'>Carrier Name: </td><td><input class='uptripstxtfld' id='carrier_name_Flight_" + i + "' readonly='true' value= \"" + carrier_name_Flight + "\"></td><td class='carriarnametd'>&nbsp;Flight Number: </td><td><input class='uptripstxtfld' id='flight_no_Flight_" + i + "' readonly='true' value=" + flight_no_Flight + "></td></tr>" + "<tr><td>PNR Id: </td><td><input class='uptripstxtfld' id='pnr_id_Flight_" + i + "' readonly='true' value=" + pnr_id_Flight + "></td><td>&nbsp;</td><td>&nbsp;</td></tr>" + "</table>" + "</div>" + "</div>" + "</li>";

             } catch (e) {
                 alert("exception in dynamic page : " + e);
             }
             j('#tripList').append(data1);
         }

     }

     if (TravelCabDetails != null && TravelCabDetails.length > 0) {
         for (var i = 0; i < TravelCabDetails.length; i++) {
             var stateArr = new Array();
             stateArr = TravelCabDetails[i];
             var fromCab = stateArr.from;
             var toCab = stateArr.to;
             var from_dateCab = stateArr.from_date;
             var to_dateCab = stateArr.to_date;
             var carrier_name = stateArr.carrier_name;

             try {
                 var data2 = "<li class='carplan'>" + "<div class='trippreflist'>" + "<span class='pull-left tripreficon'><a href='#'><i class='fa fa-cab'></i></a></span>" + "<div class='pull-left triprefblock'>" + "<table class='uptripstxttable'>" + "<tr><td>From: </td><td><input class='uptripstxtfld' id='fromCab_" + i + "' readonly='true' value=" + fromCab + "></td><td>To: </td><td><input class='uptripstxtfld' id='todateCab_" + i + "'  readonly='true' value=" + toCab + "></td></tr>" + "<tr><td>From: </td><td><input class='uptripstxtfld' id='from_dateCab_" + i + "' readonly='true' value=" + from_dateCab + "></td><td>To: </td><td><input class='uptripstxtfld' id='to_dateCab_" + i + "' readonly='true' value=" + to_dateCab + "></td></tr>" + "<tr><td class='carriarnametd'>Carrier Name: </td><td><input class='uptripstxtfld' id='carrier_nameCab_" + i + "' readonly='true' value=" + carrier_name + "></td><td>&nbsp;</td><td>&nbsp;</td></tr>" + "</table>" + "</div>" + "</div>" + "</li>";
             } catch (e) {
                 alert("exception in dynamic page : " + e);
             }

             j('#tripList').append(data2);
         }
     }

     if (TravelAccDetails != null && TravelAccDetails.length > 0) {
         for (var i = 0; i < TravelAccDetails.length; i++) {
             var stateArr = new Array();
             stateArr = TravelAccDetails[i];
             var hotel_name_acc = stateArr.hotel_name;
             var location_acc = stateArr.location_acc;
             var from_date_acc = stateArr.from_date;
             var to_date_acc = stateArr.to_date;

             try {
                 var data3 = "<li class='accplan'>" + "<div class='trippreflist'>" + "<span class='pull-left tripreficon'><a href='#'><i class='fa fa-hospital-o'></i></a></span>" + "<div class='pull-left triprefblock'>" + "<table class='uptripstxttable'>" + "<tr><td class='carriarnametd'>Hotel Name: </td><td><input class='uptripstxtfld' id='hotel_name_acc_" + i + "' readonly='true' value=" + hotel_name_acc + "></td><td>Location: </td><td><input class='uptripstxtfld' id='location_acc_" + i + "' readonly='true' value=" + location_acc + "></td></tr>" + "<tr><td>From: </td><td><input class='uptripstxtfld' id='from_date_acc_" + i + "' readonly='true' value=" + from_date_acc + "></td><td>To: </td><td><input class='uptripstxtfld' id='to_date_acc_" + i + "' readonly='true' value=" + to_date_acc + "></td></tr>" + "</table>" + "</div>" + "</div>" + "</li>";
             } catch (e) {
                 alert("exception in dynamic page : " + e);
             }

             j('#tripList').append(data3);
         }
     }
 }

 function fetchRequestNos() {
     var jsonForRequest = new Object();
     jsonForRequest["EmployeeId"] = window.localStorage.getItem("EmployeeId");
     ajaxCallForfetchingRequestNos(jsonForRequest);
 }

 function ajaxCallForfetchingRequestNos(jsonForRequest) {
     urlPath = window.localStorage.getItem("urlPath");
     j.ajax({
         url: urlPath + "FetchRequestNos",
         type: 'POST',
         dataType: 'json',
         crossDomain: true,
         data: JSON.stringify(jsonForRequest),
         success: function(data) {
             if (data.Status == "Success") {
                 var TravelRequestNoArray = data.TravelRequestNoArray;

                 setDynamicRequestNo(TravelRequestNoArray);
             }
         },
         error: function(data) {
             alert(window.lang.translate('Error: Oops something is wrong, Please Contact System Administer'));
         }
     });
 }

 function setDynamicRequestNo(travelRequestNoArray) {

     if (travelRequestNoArray != null && travelRequestNoArray.length > 0) {
         j('#requestClaimsbox').empty();
         for (var i = 0; i < travelRequestNoArray.length; i++) {

             var stateArr = new Array();
             stateArr = travelRequestNoArray[i];
             var travel_no_tr = stateArr.tr_no;
             var travel_title_tr = stateArr.tr_title;
             var from_tr = stateArr.from;
             var to_tr = stateArr.to;
             var iternary_id_tr = stateArr.iternary;

             try {

                 var request = "<li id = 'tripTravelId_" + i + "' onclick ='fetchTicketPreferences(" + i + "," + iternary_id_tr + ")'>" + "<div class='trippreflist'>" + "<span class='pull-left'>" + "<input class='abc' id='travel_no_tr_" + i + "' type=button value=" + travel_no_tr + " >" + "</span>" + "<div class='pull-left'>" + "<table class='uptripstxttable'>" + "<tr><td colspan='4'><input class='sltpreftrip' id='travel_title_tr_" + i + "' readonly='true' value= \"" + travel_title_tr + "\"></td></tr>" + "<tr><td>From: </td><td><input class='fligtprefdate' id='from_tr_" + i + "' readonly='true' value=" + from_tr + "></td><td>To: </td><td><input class='fligtprefdate' id='to_tr_" + i + "' readonly='true' value=" + to_tr + "></td></tr>" + "</div>" + "</div>" + "</li>";

             } catch (e) {
                 alert("exception in dynamic page : " + e);
             }

             j('#requestClaimsbox').append(request);
         }
     } else {
         document.getElementById('tabNoPreferences').style.display = '';
     }
 }

 var divIdForRequestNos;
 var jsonForTicketOptions = new Object();

 function fetchTicketPreferences(i, iternary_id) {

     document.getElementById('firstDiv').style.display = 'none';
     document.getElementById('flightdet').style.display = '';
     document.getElementById('tabFlight1').style.display = '';
     divIdForRequestNos = document.getElementById('tripTravelId_' + i);

     jsonForTicketOptions["iternary_id"] = iternary_id;
     ajaxCallForTicketOptions(jsonForTicketOptions);

 }

 function ajaxCallForTicketOptions(jsonForTicketOptions) {
     urlPath = window.localStorage.getItem("urlPath");
     j.ajax({
         url: urlPath + "FetchTicketOptions",
         type: 'POST',
         dataType: 'json',
         crossDomain: true,
         data: JSON.stringify(jsonForTicketOptions),
         success: function(data) {

             if (data.Status == "Success") {
                 var TravelFlightOptions = data.TravelFlightOptions;
                 showFlightOptions(TravelFlightOptions);
             }

         },
         error: function(data) {
             alert(window.lang.translate('Error: Oops something is wrong, Please Contact System Administer'));
         }
     });

 }

 var flightpreferencesArrayNew = new Array();

 function showFlightOptions(TravelFlightOptions) {

     flightpreferencesArrayNew = TravelFlightOptions;
     if (TravelFlightOptions != null && TravelFlightOptions.length > 0) {
         j('#flightpreferences').empty();
         for (var i = 0; i < TravelFlightOptions.length; i++) {
             var stateArr = new Array();
             stateArr = TravelFlightOptions[i];

             var optionId = stateArr.ticketOptionsId;
             var from_pre = stateArr.from;
             var to_pre = stateArr.to;
             var from_date_pre = stateArr.from_date;
             var to_date_pre = stateArr.to_date;
             var carrier_name_pre = stateArr.carrier_name;
             var amount_pre = stateArr.amount;
             var category_pre = stateArr.category;
             try {
                 var options = "<li class='airplan'>" + "<div class='trippreflist'>" + "<input  id='optionId_" + i + "' value=" + optionId + "  style='display:none;'>" + "<span class='pull-left tripreficon'><input id ='bookingPriority_" + i + "' type='text' value='0' class='selectpreftxt' onkeyUp='validateBookingPriority(" + i + ");' onclick='changeValue(" + i + ");' ></span>" + "<div class='pull-left triprefblock'>" + "<table class='uptripstxttable'>" + "<tr><td>From: </td><td><input class='uptripstxtfld' id='from_pre_" + i + "' readonly='true' value=" + from_pre + "></td><td>To: </td><td><input class='uptripstxtfld' id='to_pre_" + i + "'  readonly='true' value=" + to_pre + "></td></tr>" + "<tr><td>From: </td><td><input class='uptripstxtfld' id='from_date_pre_" + i + "' readonly='true' value=" + from_date_pre + "></td><td>To: </td><td><input class='uptripstxtfld' id='to_date_" + i + "'  readonly='true' value=" + to_date_pre + "></td></tr>" + "<tr><td class='carriarnametd'>Carrier Name: </td><td><input class='uptripstxtfld' id='carrier_name_pre_" + i + "' readonly='true' value=\"" + carrier_name_pre + "\"></td><td class='carriarnametd'>Amount: </td><td><input class='uptripstxtfld' id='amount_pre_" + i + "' readonly='true' value=" + amount_pre + "></td></tr>" + "<tr><td>Category: </td><td><input class='uptripstxtfld' id='category_pre_" + i + "' readonly='true' value=" + category_pre + "></td><td>&nbsp;</td><td>&nbsp;</td></tr>" + "</table>" + "</div>" + "</div>" + "</li>";

             } catch (e) {
                 alert("exception in dynamic page : " + e);
             }
             j('#flightpreferences').append(options);
         }

     }
 }

 function changeValue(i) {
     var valueCheck = document.getElementById("bookingPriority_" + i).value
     if (valueCheck == 0) {
         document.getElementById("bookingPriority_" + i).value = '';
     }

 }

 function populatePriority() {
     var preferencesJSONNew = [];
     var preferencesJSON = new Object();
     var jsonForPreferences = new Object();
     var len = flightpreferencesArrayNew.length;
     var bookingString = '';

     for (var i = 0; i < len; i++) {
         var bookingNo = document.getElementById("bookingPriority_" + i).value;
         var optionId = document.getElementById("optionId_" + i).value;

         if (validatePriority(bookingNo, len, i)) {
             bookingString = bookingString + optionId + "-" + bookingNo;

             if (i == flightpreferencesArrayNew.length - 1) {
                 bookingString = bookingString;
             } else {
                 bookingString = bookingString + ",";
             }
         } else {
             return false;
         }

     }
     preferencesJSON["details"] = bookingString;

     preferencesJSON["iternary_id_update"] = jsonForTicketOptions["iternary_id"];
     ajaxForSettingPriority(preferencesJSON);

 }

 var priorityCount = 0;
 var checkNewArray = new Array();

 function validatePriority(bookingNo, len, n) {

     if (bookingNo == '' || bookingNo == 0) {
         alert("Please fill the Booking Priority.");
         checkNewArray.length = 0;
         return false;

     } else if (bookingNo < 0 || bookingNo > len) {
         alert("The Booking Priority must be between 1 and total number of options.");
         checkNewArray.length = 0;
         return false;

     }

     if (checkNewArray.includes(bookingNo)) {
         alert('Priority should be unique.');
         checkNewArray.length = 0;

         return false;
     }

     checkNewArray[n] = bookingNo;

     return true;
 }

 function ajaxForSettingPriority(jsonForPreferences) {
     urlPath = window.localStorage.getItem("urlPath");
     j.ajax({
         url: urlPath + "SetBookingPriority",
         type: 'POST',
         dataType: 'json',
         crossDomain: true,
         data: JSON.stringify(jsonForPreferences),
         success: function(data) {

             if (data.Status == "Success") {

                 divIdForRequestNos.remove();
                 document.getElementById('flightdet').style.display = 'none';
                 document.getElementById('tabSuccess').style.display = '';
                 checkNewArray.length = 0;

             }
         },

         error: function(data) {
             alert(window.lang.translate('Error: Oops something is wrong, Please Contact System Administer'));
         }
     });

 }

 function validateBookingPriority(i) {

     var bookingPriorityValue = document.getElementById("bookingPriority_" + i).value;
     if (isNumericForDetailQty(bookingPriorityValue, "Booking Priority") == false) {
         document.getElementById("bookingPriority_" + i).value = "";
         return false;
     }

 }

 function isNumericForDetailQty(objectValue, messageContent) {

     if (isNaN(objectValue)) {
         alert(messageContent + " should be numeric.");
         objectValue.value = "";
         return false;
     } else if ((objectValue).indexOf('-') != -1) {
         alert(messageContent + "should not be negative.");
         objectValue.value = "";
         return false;
     } else if ((objectValue).indexOf(' ') != -1) {
         alert(messageContent + "should not contain space.");
         objectValue.value = "";
         return false;
     } else if ((objectValue).indexOf('.') != -1) {
         alert(messageContent + "should not be fractional.");
         objectValue.value = "";
         return false;
     } else {
         return true;
     }
 }

 // *********************************  Upcoming Trips  -- End *******************************************//

 // *********************************   LogOut -- Start ************************************************//

 function logOut() {

     var msg = "Please sync your pending expenses before you exit or they will be lost";

     var entitlementMsg = confirm(msg);

     if (entitlementMsg) {
         deleteLocalDatabase();
     } else {
         closeNav();
     }
 }

 function deleteLocalDatabase() {
     try {
         localStorage.clear();

         if (mydb) {
             mydb.transaction(function(t) {
                 t.executeSql("delete from currencyMst");
                 t.executeSql("delete from accountHeadMst");
                 t.executeSql("delete from expNameMst");
                 t.executeSql("delete from businessExpDetails");
                 t.executeSql("delete from walletMst");
                 t.executeSql("delete from travelModeMst");
                 t.executeSql("delete from travelCategoryMst");
                 t.executeSql("delete from cityTownMst");
                 t.executeSql("delete from travelTypeMst");
                 t.executeSql("delete from travelAccountHeadMst");
                 t.executeSql("delete from travelExpenseNameMst");
                 t.executeSql("delete from travelSettleExpDetails");
                 t.executeSql("delete from travelRequestDetails");
                 t.executeSql("delete from accountHeadEAMst");
                 t.executeSql("delete from advanceType");
                 t.executeSql("delete from employeeAdvanceDetails");
                 t.executeSql("delete from currencyConversionMst");
                 t.executeSql("delete from smsMaster");
                 t.executeSql("delete from smsScrutinizerMst");
                 t.executeSql("delete from profileMst");
             });
         }

         location.reload(true);

         setTimeout(function() {
             init();
         }, 200);

     } catch (e) {
         alert(e);
     }
 }

 function defaultPage() {
     location.reload(true);
     setTimeout(function() {
         init();
     }, 200);
 }
 // *********************************   LogOut -- End ************************************************//

 // *********************************   Profile Page -- Start ************************************************//

 function showProfile() {
     var headerBackBtn = defaultPagePath + 'backbtnPage.html';
     var pageRef = defaultPagePath + 'profilePage.html';
     j(document).ready(function() {
         j('#mainHeader').load(headerBackBtn);
         j('#mainContainer').load(pageRef);
     });
     appPageHistory.push(pageRef);
 }
 // *********************************   Profile Page -- Start ************************************************//

 // *********************************   About Page -- Start ************************************************//

 function showAboutPage() {
     var headerBackBtn = defaultPagePath + 'backbtnPage.html';
     var pageRef = defaultPagePath + 'aboutPage.html';
     j(document).ready(function() {
         j('#mainHeader').load(headerBackBtn);
         j('#mainContainer').load(pageRef);
     });
     appPageHistory.push(pageRef);
 }
 // *********************************   About Page -- Start ************************************************//

 // *********************************  Business Expense Edit  -- Start ******************************************//

 function onloadExpenseElement() {
    var jsonFindBEEditValues = JSON.parse(window.localStorage.getItem("jsonFindBE"));
    var accHeadId = jsonFindBEEditValues.accountHeadId;

     if (mydb) {
         mydb.transaction(function(t) {
             t.executeSql("SELECT * FROM accountHeadMst", [], getAccHeadListForBEEdit);
             t.executeSql("SELECT * FROM currencyMst", [], getCurrencyListForBEEdit);
             t.executeSql("SELECT * FROM expNameMst  where accHeadId=" +accHeadId, [], getExpNameListForBEEdit);
         });
     } else {
         alert('Database not found, your browser does not support web sql!');
     }

 }

 function getAccHeadListForBEEdit(transaction, results) {
     var i;
     var jsonAccHeadArr = [];
     for (i = 0; i < results.rows.length; i++) {
         var row = results.rows.item(i);
         var jsonFindAccHead = new Object();
         jsonFindAccHead["Label"] = row.accountHeadId;
         jsonFindAccHead["Value"] = row.accHeadName;
         jsonAccHeadArr.push(jsonFindAccHead);
     }
     createAccHeadDropDownForBEEdit(jsonAccHeadArr);
 }

 function createAccHeadDropDownForBEEdit(jsonAccHeadArr) {
     var jsonArr = [];

     if (jsonAccHeadArr != null && jsonAccHeadArr.length > 0) {
         for (var i = 0; i < jsonAccHeadArr.length; i++) {
             var stateArr = new Array();
             stateArr = jsonAccHeadArr[i];
             jsonArr.push({
                 id: stateArr.Label,
                 name: stateArr.Value
             });
         }
     }
     jsonArr.sort(function(a, b) { // sort object by Account Head Name
         var nameA = a.name.toLowerCase(),
             nameB = b.name.toLowerCase()
         if (nameA < nameB) //sort string ascending
             return -1
         if (nameA > nameB)
             return 1
         return 0 //default return value (no sorting)
     })
     j("#accountHead").select2({
         data: {
             results: jsonArr,
             text: 'name'
         },
         minimumResultsForSearch: -1,
         placeholder: 'Select Account Head',
         /*initSelection: function (element, callback) {
            callback(jsonArr[1]);
            getExpenseNamesBasedOnAccountHead(jsonArr[1]);
         },*/
         formatResult: function(result) {
             if (!isJsonString(result.id))
                 result.id = JSON.stringify(result.id);
             return result.name;
         }
     });

 }

 function getCurrencyListForBEEdit(transaction, results) {
     var i;
     var jsonCurrencyArr = [];

     for (i = 0; i < results.rows.length; i++) {
         var row = results.rows.item(i);
         var jsonFindCurrHead = new Object();
         jsonFindCurrHead["Value"] = row.currencyId;
         jsonFindCurrHead["Label"] = row.currencyName;

         jsonCurrencyArr.push(jsonFindCurrHead);
     }
     createCurrencyDropDownForBEEdit(jsonCurrencyArr)
 }

 function createCurrencyDropDownForBEEdit(jsonCurrencyArr) {
     var jsonArr = [];
     if (jsonCurrencyArr != null && jsonCurrencyArr.length > 0) {
         for (var i = 0; i < jsonCurrencyArr.length; i++) {
             var stateArr = new Array();
             stateArr = jsonCurrencyArr[i];

             jsonArr.push({
                 id: stateArr.Value,
                 name: stateArr.Label
             });
         }
     }

     j("#currency").select2({
         data: {
             results: jsonArr,
             text: 'name'
         },
         minimumResultsForSearch: -1,
         placeholder: "Currency",
         /*initSelection: function (element, callback) {
                    callback(jsonArr[0]);
         },*/
         formatResult: function(result) {
             if (!isJsonString(result.id))
                 result.id = JSON.stringify(result.id);
             return result.name;
         }
     }).select2("val", "");
 }

 function getExpNameListForBEEdit(transaction, results) {
     var i;
     var jsonExpNameArr = [];
     for (i = 0; i < results.rows.length; i++) {
         var row = results.rows.item(i);
         var jsonFindExpNameHead = new Object();
         jsonFindExpNameHead["ExpenseID"] = row.id;
         jsonFindExpNameHead["ExpenseName"] = row.expName;
         jsonExpNameArr.push(jsonFindExpNameHead);
     }

      setEditBEJSON();
     createExpNameDropDownForBEEdit(jsonExpNameArr);
 }

 function createExpNameDropDownForBEEdit(jsonExpNameArr) {
     var jsonExpArr = [];
     console.log("jsonExpNameArr : "+JSON.stringify(jsonExpNameArr));
     if (jsonExpNameArr != null && jsonExpNameArr.length > 0) {
         for (var i = 0; i < jsonExpNameArr.length; i++) {
             var stateArr = new Array();
             stateArr = jsonExpNameArr[i];
             jsonExpArr.push({
                 id: stateArr.ExpenseID,
                 name: stateArr.ExpenseName
             });
         }
     }

     j("#expenseName").select2({
         data: {
             results: jsonExpArr,
             text: 'name'
         },
         minimumResultsForSearch: -1,
         placeholder: "Select Expense Name",
         /*initSelection: function (element, callback) {
            callback(jsonExpArr[0]);
         },*/
         formatResult: function(result) {
             if (!isJsonString(result.id))
                 result.id = JSON.stringify(result.id);
             return result.name;
         }
     }).select2("val", "");

 }

 function setEditBEJSON() {

     var jsonFindBEEditValues = JSON.parse(window.localStorage.getItem("jsonFindBE"));

     document.getElementById("expNarration").value = jsonFindBEEditValues.narration;

     document.getElementById("expDate").value = jsonFindBEEditValues.expenseDate;

     document.getElementById("busExpDetailId").value = jsonFindBEEditValues.busExpDetailId;

     j("#accountHead").select2("val", jsonFindBEEditValues.accountHeadId);

     if (jsonFindBEEditValues.units != null) {
         document.getElementById("expUnit").value = jsonFindBEEditValues.units;
     }

 /*    if (document.getElementById("expUnit").value == 'undefined') {
         document.getElementById("expUnit").value = "";
         document.getElementById("expUnit").style.display = "none";
     }*/

     document.getElementById("expAmt").value = jsonFindBEEditValues.amount;



setTimeout(function() {
     j("#expenseName").select2("val", jsonFindBEEditValues.expenseId);
}, 50);


     j("#currency").select2("val", jsonFindBEEditValues.currencyId);

     document.getElementById("expFromLoc").value = jsonFindBEEditValues.fromLocation;

     document.getElementById("expToLoc").value = jsonFindBEEditValues.toLocation;

     exceptionStatus = jsonFindBEEditValues.isEntitlementExceeded;

     getPerUnitFromDBForEdit(jsonFindBEEditValues.expenseId);

        if(jsonFindBEEditValues.imageAttach != "" && jsonFindBEEditValues.imageAttach != null)
        {
               smallImageBE.style.display = 'block';
               smallImageBE.src =  jsonFindBEEditValues.imageAttach;

               if(fileTempCameraBE != "" && fileTempCameraBE != null){
                    updateAttachment =  jsonFindBEEditValues.imageAttach;
                    resetImageData();
               }else{
                    updateAttachment =  jsonFindBEEditValues.imageAttach;
                    resetImageData();
               }
        }
 
 }

  function getPerUnitFromDBForEdit(expenseNameID) {
     j('#errorMsgArea').children('span').text("");
     if (mydb) {
         //Get all the employeeDetails from the database with a select statement, set outputEmployeeDetails as the callback function for the executeSql command
         mydb.transaction(function(t) {
             t.executeSql("SELECT * FROM expNameMst where id=" + expenseNameID, [], setPerUnitDetailsForEdit);
         });
     } else {
         alert(window.lang.translate('Database not found, your browser does not support web sql!'));
     }
 }

 function updateBusinessDetails(busExpDetailId) {

     var acc_head_id;
     var acc_head_val;

     var exp_name_id;
     var exp_name_val;

     var currency_id;
     var currency_val;

     var file;

     var busExpDetailId = busExpDetailId.value;

     if (j("#accountHead").select2('data') != null) {
         acc_head_id = j("#accountHead").select2('data').id;
         acc_head_val = j("#accountHead").select2('data').name;
     } else {
         acc_head_id = '-1';
     }

     if (j("#expenseName").select2('data') != null) {
         exp_name_id = j("#expenseName").select2('data').id;
         exp_name_val = j("#expenseName").select2('data').name;
     } else {
         exp_name_id = '-1';
     }

     if (j("#currency").select2('data') != null) {
         currency_id = j("#currency").select2('data').id;
         currency_val = j("#currency").select2('data').name;
     } else {
         currency_id = '-1';
     }

     var exp_date = document.getElementById('expDate').value;

     var exp_from_loc = document.getElementById('expFromLoc').value;

     var exp_to_loc = document.getElementById('expToLoc').value;

     var exp_narration = document.getElementById('expNarration').value;

     var exp_unit = document.getElementById('expUnit').value;

     var exp_amt = document.getElementById('expAmt').value;

     /*     if (fileTempGalleryBE == undefined || fileTempGalleryBE == "") {
          } else if(fileTempGalleryBE != ""){
             alert("in else gal ");
              file = fileTempGalleryBE;
          }

          if (fileTempCameraBE == undefined || fileTempCameraBE == "") {
          } else if(fileTempCameraBE != ""){
             alert("in else cam ");
              file = fileTempCameraBE;
          }*/

     if (updateAttachment != "" && updateAttachment != undefined) {
         file = updateAttachment;
     } else {
         if (fileTempGalleryBE == undefined || fileTempGalleryBE == "") {

         } else {
             file = fileTempGalleryBE;
         }

         if (fileTempCameraBE == undefined || fileTempCameraBE == "") {

         } else {
             file = fileTempCameraBE;
         }

     }

     if (file == undefined) {
         file = "";
     }

     var entitlement_exceeded =  exceptionStatus;

     if (validateExpenseDetails(exp_date, exp_from_loc, exp_to_loc, exp_narration, exp_unit, exp_amt, acc_head_id, exp_name_id, currency_id, file)) {

         if (mydb) {
             mydb.transaction(function(t) {

                 t.executeSql("UPDATE businessExpDetails set accHeadId ='" + acc_head_id + "', expNameId ='" + exp_name_id + "',expDate = '" + exp_date + "'   ,expFromLoc = '" + exp_from_loc + "'   ,expToLoc = '" + exp_to_loc + "'    ,expUnit = '" + exp_unit + "'   , expAmt = '" + exp_amt + "'   ,    expNarration = '" + exp_narration + "' ,currencyId = '" + currency_id + "',  isEntitlementExceeded = '" + entitlement_exceeded + "',busExpAttachment = '" + file + "' where busExpId = " + busExpDetailId + ";");
             });

             alert("Record update successfully");

         } else {
             alert("db not found, your browser does not support web sql!");
         }
         viewBusinessExp();
     }
 }

 function getPrimaryExpenseId(expMstId,accountCodeId,accHeadIdVal) {

     if (mydb) {
         //Get all the employeeDetails from the database with a select statement, set outputEmployeeDetails as the callback function for the executeSql command
         mydb.transaction(function(t) {
             t.executeSql("SELECT id FROM expNameMst where expNameMstId=" + expMstId + " and accCodeId ="+ accountCodeId +" and accHeadId = " +accHeadIdVal, [], getExpId);
         });
     } else {
         alert(window.lang.translate('Database not found, your browser does not support web sql!'));
     }

 }

 function getExpId(transaction, results) {
     var i;
     var jsonFindExpNameHead = new Object();

     for (i = 0; i < results.rows.length; i++) {
         var row = results.rows.item(i);

         jsonFindExpNameHead["ExpenseID"] = row.id;

         editBusiExpMain(row.id);

     }

 }
 // *********************************  Business Expense Edit  -- End ******************************************//

 // *********************************  Travel Last Min Trip Validation -- Start ******************************************//

 function checkLastMinTrip() {
     var current_Date = new Date();
     current_Date.setHours(0, 0, 0, 0);

     var selected_Date = $("#selectDate_One").datepicker("getDate");

     // get days
     var days = (selected_Date - current_Date) / (1000 * 60 * 60 * 24);

     getDelayDays(days);

 }

 function checkLastMinRoundTrip() {
     var current_Date = new Date();
     current_Date.setHours(0, 0, 0, 0);

     var selected_Date = $("#selectDate_Three").datepicker("getDate");

     // get days
     var days = (selected_Date - current_Date) / (1000 * 60 * 60 * 24);

     getDelayDays(days);

 }

 function getDelayDays(days) {
     var i;
     var noOfDays;
     var daysDiff = days;
     var expMsg = "";

     if (mydb) {
         mydb.transaction(function(t) {
             t.executeSql('Select noOfDays from delayMst where processId = 3 and moduleId = 2', [],
                 function(transaction, results) {
                     for (i = 0; i < results.rows.length; i++) {
                         var row = results.rows.item(i);
                         noOfDays = row.noOfDays;

                         if (daysDiff < noOfDays) {

                             j('#validationMsgBox').show();
                             j('#validationMsgBoxRoundTrip').show();

                             expMsg = "This is last minute trip request! You have crossed the time limit of " + noOfDays + " days for trip request.";

                             document.getElementById("delayDaysMsgRoundArea").style.display = "";
                             document.getElementById("delayDaysMsgArea").style.display = "";

                             j('#delayDaysMsgArea').children('span').text(expMsg);
                             j('#delayDaysMsgRoundArea').children('span').text(expMsg);

                             document.getElementById("selectDate_One").style.borderColor = "#960e0e";
                             document.getElementById("selectDate_Three").style.borderColor = "#960e0e";

                         } else {
                             document.getElementById("selectDate_One").style.borderColor = "#cccccc";
                             document.getElementById("selectDate_Three").style.borderColor = "#cccccc";
                             j('#delayDaysMsgArea').children('span').text(expMsg);
                             j('#delayDaysMsgRoundArea').children('span').text(expMsg);
                             disableTableRow();
                         }

                     }
                 });
         });
     } else {
         alert(window.lang.translate('Database not found, your browser does not support web sql!'));
     }
 }

 // *********************************  Travel Last Min Trip Validation -- End ******************************************//

 // *********************************  Travel Date For Overlap Validation -- Start ******************************************//

 function validateDateForOverlapTravel() {
     var tvl_date = document.getElementById('selectDate_One').value;
     var tvl__round_dateOne = document.getElementById('selectDate_Two').value;
     var tvl__round_dateTwo = document.getElementById('selectDate_Three').value;

     if (validateTravelOverLapDetails()) {
         var jsonToSaveTR = new Object();
         jsonToSaveTR["EmployeeId"] = window.localStorage.getItem("EmployeeId");;

         var listItineraryTab = document.getElementById('myTab');
         if (hasClass(listItineraryTab.children[0], "active")) {

             jsonToSaveTR["DepartDate"] = tvl_date;
             jsonToSaveTR["ArriveDate"] = tvl_date;

         } else {
             jsonToSaveTR["ArriveDate"] = tvl__round_dateOne;
             jsonToSaveTR["DepartDate"] = tvl__round_dateTwo;

         }
         dateOverLapMsg(jsonToSaveTR);
     }
 }

 function dateOverLapMsg(jsonToSaveTR) {
     j('#overlapMsgRoundTripArea').children('span').text("");
     j('#overlapMsgArea').children('span').text("");

     var spanValueErrorMsg1 = document.getElementById('errorMsg1').innerHTML;
     var spanValueErrorMsg2 = document.getElementById('errorMsg2').innerHTML;

     var spanValueErrorMsg3 = document.getElementById('errorMsg3').innerHTML;
     var spanValueErrorMsg4 = document.getElementById('errorMsg4').innerHTML;

     j.ajax({
         url: window.localStorage.getItem("urlPath") + "ValidateTravelVoucherForDateRange",
         type: 'POST',
         dataType: 'json',
         crossDomain: true,
         data: JSON.stringify(jsonToSaveTR),
         success: function(data) {
             if (data.Status == "Y") {
                 var overlapMsg = data.Message;
                 if (overlapMsg != "") {
                     j('#validationMsgBox').show();
                     j('#validationMsgBoxRoundTrip').show();

                     document.getElementById("selectDate_One").style.borderColor = "#960e0e";
                     document.getElementById("selectDate_Two").style.borderColor = "#960e0e";
                     document.getElementById("selectDate_Three").style.borderColor = "#960e0e";

                     j('#overlapMsgArea').children('span').text(overlapMsg);
                     j('#overlapMsgRoundTripArea').children('span').text(overlapMsg);

                 }
             } else {

                 if (spanValueErrorMsg1 == "" && spanValueErrorMsg2 == "") {
                     document.getElementById("selectDate_One").style.borderColor = "#cccccc";
                 }

                 if (spanValueErrorMsg3 == "") {
                     document.getElementById("selectDate_Three").style.borderColor = "#cccccc";
                 }

                 if (spanValueErrorMsg4 == "") {
                     document.getElementById("selectDate_Two").style.borderColor = "#cccccc";

                 }
                 j('#overlapMsgArea').children('span').text("");
                 j('#overlapMsgRoundTripArea').children('span').text("");

                 requestRunning = false;
             }
             disableTableRow();
         },
         error: function(data) {
             requestRunning = false;
         }
     });
 }

 function validateTravelOverLapDetails() {
     var listItineraryTab = document.getElementById('myTab');
     if (hasClass(listItineraryTab.children[0], "active")) {

         if (document.getElementById('selectDate_One').value == "Select Date") {
             alert(window.lang.translate('Travel Date is invalid'));
             return false;
         }

     } else {

         if (document.getElementById('selectDate_Two').value == "Select Date") {
             alert(window.lang.translate('Travel Date is invalid'));
             return false;
         }
         if (document.getElementById('selectDate_Three').value == "Select Date") {
             alert(window.lang.translate('Travel Date is invalid'));
             return false;
         }

     }
     return true;
 }

 function disableTableRow() {
     var spanValueErrorMsg1 = document.getElementById('errorMsg1').innerHTML;
     var spanValueErrorMsg2 = document.getElementById('errorMsg2').innerHTML;

     var spanValueErrorMsg3 = document.getElementById('errorMsg3').innerHTML;
     var spanValueErrorMsg4 = document.getElementById('errorMsg4').innerHTML;

     if (spanValueErrorMsg1 == "") {
         document.getElementById("delayDaysMsgArea").style.display = "none";
     }

     if (spanValueErrorMsg3 == "") {
         document.getElementById("delayDaysMsgRoundArea").style.display = "none";
     }

     if (spanValueErrorMsg3 == "" && spanValueErrorMsg4 == "") {
         j("#validationMsgBoxRoundTrip").hide();
     }

     if (spanValueErrorMsg1 == "" && spanValueErrorMsg2 == "") {
         j("#validationMsgBox").hide();
     }
 }

 // *********************************  Travel Date For Overlap Validation -- End ******************************************//

 // *********************************  Travel Settelment Advance Amount -- Start ******************************************//

 function getAdvanceAmountOnChange() {

     var travelRequestId = j("#travelRequestName").select2('data').id;
     getAdvanceAmountfromDBTravel(travelRequestId);
 }

 function getAdvanceAmountfromDBTravel(travelRequestId) {
     if (mydb) {
         mydb.transaction(function(t) {
             var result = t.executeSql("select advanceRequested,advanceAmount from travelRequestDetails where travelRequestId=" + travelRequestId, [], fetchTravelAdvanceDetails);
         });
     } else {
         alert(window.lang.translate('Database not found, your browser does not support web sql!'));
     }
 }

 function fetchTravelAdvanceDetails(transaction, results) {
     var i;
     var jsonExpenseNameArr = [];
     for (i = 0; i < results.rows.length; i++) {
         var row = results.rows.item(i);
         var jsonFindTravelType = new Object();
         var advReq = row.advanceRequested;
         var advAmt = row.advanceAmount;

         if (advReq == "Y") {
             j('#advanceTxtArea').show();
             document.getElementById('advAmt').value = advAmt;
         } else {
             j('#advanceTxtArea').hide();
         }
     }
 }

 // *********************************  Travel Settelment Advance Amount -- End ******************************************//

 // *********************************  Travel Settelment Entitlement -- Start ******************************************//
 function checkEntitlementForTravelSettelment() {
     var travelExpenseReqID;
     var travelModeID;
     var travelCategoryID;
     var cityTownID;
     var cityTownName;
     var travelReqID;
     var travelExpenseReqName;

     if (j("#travelRequestName").select2('data') != null) {
         travelReqID = j("#travelRequestName").select2('data').id;
     }
     if (j("#travelModeForTS").select2('data') != null) {
         travelModeID = j("#travelModeForTS").select2('data').id;
     }
     if (j("#travelCategoryForTS").select2('data') != null) {
         travelCategoryID = j("#travelCategoryForTS").select2('data').id;
     }
     if (j("#Citytown").select2('data') != null) {
         cityTownID = j("#Citytown").select2('data').id;
         cityTownName = j("#Citytown").select2('data').name;
     }
     if (j("#travelExpenseName").select2('data') != null) {
         travelExpenseReqID = j("#travelExpenseName").select2('data').id;
         travelExpenseReqName = j("#travelExpenseName").select2('data').name;
     }

     if (travelReqID != 'undefined' && travelReqID != '-1') {
         setCityTownTypeId(cityTownID, travelReqID, travelModeID, travelCategoryID, travelExpenseReqID, cityTownName, travelExpenseReqName)
     }
 }

 function setCityTownTypeId(cityTownID, travelReqID, travelModeID, travelCategoryID, travelExpenseReqID, cityTownName, travelExpenseReqName){
   if (mydb) {
         mydb.transaction(function(t) {
             t.executeSql("SELECT cityTownTypeId FROM cityTownMst where cityTownId=" + cityTownID, [],
                 function(transaction, results) {

                     for (i = 0; i < results.rows.length; i++) {

                         var row = results.rows.item(i);
                         var cityTownTypeId = row.cityTownTypeId;

                         if (cityTownTypeId != "" && cityTownTypeId != 0) {
                                getExpenseIdForTravelFromDB(travelReqID, travelModeID, travelCategoryID, cityTownTypeId, travelExpenseReqID, cityTownName, travelExpenseReqName);
                         }

                     }
                 });
         });
     } else {
         alert(window.lang.translate('Database not found, your browser does not support web sql!'));
     }
 }

 function getExpenseIdForTravelFromDB(travelReqID, travelModeID, travelCategoryID, cityTownID, travelExpenseReqID, cityTownName, travelExpenseReqName) {

     if (mydb) {
         mydb.transaction(function(t) {
             t.executeSql("SELECT expenseNameId FROM travelExpenseNameMst where id=" + travelExpenseReqID, [],
                 function(transaction, results) {

                     for (i = 0; i < results.rows.length; i++) {

                         var row = results.rows.item(i);
                         var expenseNameId = row.expenseNameId;

                         if (expenseNameId != "" && expenseNameId != 0) {

                             calcuteEntitlementForTS(expenseNameId, travelReqID, travelExpenseReqID, travelModeID, travelCategoryID, cityTownID, cityTownName, travelExpenseReqName);
                         }

                     }
                 });
         });
     } else {
         alert(window.lang.translate('Database not found, your browser does not support web sql!'));
     }

 }

 function calcuteEntitlementForTS(expenseNameId, travelReqID, travelExpenseReqID, travelModeID, travelCategoryID, cityTownID, cityTownName, travelExpenseReqName) {

     //console.log("travelExpenseNameID : " + expenseNameId + " cityTownID : " + cityTownID);

     if (validateValuesForEntitlement(travelReqID, travelModeID, travelCategoryID, cityTownID, travelExpenseReqID)) {
         if (mydb) {
             mydb.transaction(function(t) {
                 t.executeSql("Select amount from perDiemTravelMst where domCityTownId = '" + cityTownID + "' and expenseHeadId ='" + expenseNameId + "'", [],
                     function(transaction, results) {
                         for (i = 0; i < results.rows.length; i++) {

                             var row = results.rows.item(i);
                             var amount = row.amount;
                             var tsAmount = document.getElementById('expAmt').value;
                             var exceptionMessage = "";

                             if (tsAmount > amount) {
                                 exceptionMessage = "(Exceeding Per Diem Entitlement amount defined: " + amount + " for Expense Head :  " + travelExpenseReqName + " and City/Town : " + cityTownName + ")";
                                 j('#travelErrorMsgArea').children('span').text(exceptionMessage);
                                 exceptionStatus = 'Y' ;
                             } else {
                                 j('#travelErrorMsgArea').children('span').text(exceptionMessage);
                                 exceptionStatus = 'N' ;
                             }

                         }
                     });
             });
         } else {
             alert(window.lang.translate('Database not found, your browser does not support web sql!'));
         }
     }
 }

 function validateValuesForEntitlement(travelReqID, cityTownID, travelExpenseReqID) {
     if (travelReqID != "-1" && cityTownID != "-1" && travelExpenseReqID != "-1") {
         return true;
     } else {
         return false;
     }
 }

 function resetAmountAndEntitlementMsg() {
     document.getElementById('expAmt').value = "";
     j('#travelErrorMsgArea').children('span').text('');
 }

 // *********************************  Travel Settelment Entitlement -- End ******************************************//

 // *********************************  Travel Settelment Send For Appoval -- Start ******************************************//
 function tripDetails() {
     var travelRequestId = j("#travelRequestName").select2('data').id;
     alert("travelRequestId : " + travelRequestId);
     var jsonToPopulateTRDetails = new Object();
     jsonToPopulateTRDetails["TravelRequestId"] = travelRequestId;
     checkTRDetailsExist(travelRequestId, jsonToPopulateTRDetails);
 }

 function checkTRDetailsExist(travelRequestId, jsonToPopulateTRDetails) {
     if (mydb) {
         mydb.transaction(function(t) {
             t.executeSql("Select * from travelSettleExpDetails where travelRequestId = '" + travelRequestId + "'", [],
                 function(transaction, results) {
                     alert("results.rows.length : " + results.rows.length);
                     var noOfRows = results.rows.length;
                     if (noOfRows == 0) {
                         populateTravelRequestDetailsAjax(jsonToPopulateTRDetails);
                     } else {
                         return false;
                     }

                 });
         });
     } else {
         alert(window.lang.translate('Database not found, your browser does not support web sql!'));
     }

 }

 function populateTravelRequestDetailsAjax(jsonToPopulateTRDetails) {
     alert("populateTravelRequestDetailsAjax :");
     var pageRefSuccess = defaultPagePath + 'success.html';
     var pageRefFailure = defaultPagePath + 'failure.html';

     j.ajax({
         url: window.localStorage.getItem("urlPath") + "FetchDetailLinesForTS",
         type: 'POST',
         dataType: 'json',
         crossDomain: true,
         data: JSON.stringify(jsonToPopulateTRDetails),
         success: function(data) {
             if (data.Status == "Success") {
                 var travelDetailArray = data.TravelDetailArray;
                 setTRdetailsForSettelment(travelDetailArray);

                 requestRunning = false;
             } else {
                 successMessage = "Error: Oops something is wrong, Please Contact System Administer";
                 requestRunning = false;
             }
         },
         error: function(data) {
             requestRunning = false;
         }
     });
 }

 function setTRdetailsForSettelment(travelDetailArray) {

     alert("travel detail : " + JSON.stringify(travelDetailArray));
     mydb.transaction(function(t) {
         if (travelDetailArray != null && travelDetailArray.length > 0) {
             for (var i = 0; i < travelDetailArray.length; i++) {
                 var detailArr = new Array();
                 detailArr = travelDetailArray[i];
                 var exp_date = detailArr.ExpDate;
                 var travelRequestId = detailArr.TravelReqId;
                 var exp_name_id = detailArr.ExpNameId;
                 var exp_narration = detailArr.Narration;
                 var exp_unit = detailArr.Unit;
                 var exp_amt = detailArr.Amount;
                 var currency_id = detailArr.ExpCurrencyId;
                 var travelMode_id = detailArr.TravelModeId;
                 var travelCategory_id = detailArr.TravelCatgId;
                 var cityTown_id = detailArr.CityTownId;
                 var file = "";

                 t.executeSql("INSERT INTO travelSettleExpDetails  (expDate, travelRequestId,expNameId,expNarration, expUnit,expAmt,currencyId,travelModeId,travelCategoryId,cityTownId,tsExpAttachment) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [exp_date, travelRequestId, exp_name_id, exp_narration, exp_unit, exp_amt, currency_id, travelMode_id, travelCategory_id, cityTown_id, file]);
             }
         }
     });
 }
 // *********************************  Travel Settelment Send For Appoval -- End ******************************************//

 function getDefaultApprovePage() {
     var headerBackBtn = defaultPagePath + 'backbtnPage.html';
     var pageRefSuccess = defaultPagePath + 'success.html';
     successMessage = "Voucher Approved Successfully";

     j('#mainHeader').load(headerBackBtn);
     j('#mainContainer').load(pageRefSuccess);

 }

 //***************************** Profile Image -- Start *******************************************************//
 function findProfileImagedata() {

     try {

         var empId = window.localStorage.getItem("EmployeeId");

         if (mydb) {
             mydb.transaction(function(t) {
                 t.executeSql("Select profileAttachment from profileMst where empId = '" + empId + "'", [],
                     function(transaction, results) {
                         for (i = 0; i < results.rows.length; i++) {

                             var row = results.rows.item(i);

                             if (row.profileAttachment != "" ) {
                                 if (document.getElementById("ProfilePreview") != null) {
                                     document.getElementById("ProfilePreview").src = "data:image/png;base64," + row.profileAttachment;
                                 }
                                 if (document.getElementById("sideNavProfilePreview") != null) {
                                     document.getElementById("sideNavProfilePreview").src = "data:image/png;base64," + row.profileAttachment;
                                 }
                                 if(document.getElementById("ProfilePreview") != null){
                                     var x = document.getElementById("ProfilePreview").complete;
                                     console.log("x = "+x);
                                     if(x == false){
                                         //document.getElementById("ProfilePreview").src =  "images/profilepic.png";
                                     }
                                 }
                                if(document.getElementById("sideNavProfilePreview") != null){
                                     var x = document.getElementById("sideNavProfilePreview").complete;
                                     console.log("x = "+x);
                                     if(x == false){
                                        // document.getElementById("sideNavProfilePreview").src =  "images/profilepic.png";
                                     }
                                 }

                             }
                         }

                     });
             });
         } else {
             alert(window.lang.translate('Database not found, your browser does not support web sql!'));
         }

     } catch (e) {
         console.log(e);
     }

 }

 //***************************** Profile Image -- End *******************************************************//

 //***************************** Agile Merging -- Start *******************************************************//


 function pastVoucherViews() {

     var headerBackBtn = defaultPagePath + 'backbtnPage.html';
     var pageRef = defaultPagePath + 'viewPastVoucher.html';


     j(document).ready(function() {
         j('#mainHeader').load(headerBackBtn);
         j('#mainContainer').load(pageRef);
     });
     appPageHistory.push(pageRef);

 }


 // ******************************** View Past Voucher / For My Approval Header -- Start *********************************************//

 function viewVoucherHeaders(statusOfVoucher) {

     enableDivBasedOnStatus = statusOfVoucher;

     // For My Approval Header Page
     if(statusOfVoucher == 'A'){                                    
         var headerBackBtn = defaultPagePath + 'backbtnPage.html';
         var pageRef = defaultPagePath + 'viewApproverVouchers.html';
         appPageHistory.push(pageRef);
        j('#mainHeader').load(headerBackBtn);
        j('#mainContainer').load(pageRef);
     }

     //  My Expense Pages

     if(statusOfVoucher == 'F' || statusOfVoucher == 'R' || statusOfVoucher == 'P' || statusOfVoucher == 'U' || statusOfVoucher == 'D'){
         var headerBackBtn = defaultPagePath + 'backbtnPage.html';
         var pageRef = defaultPagePath + 'viewApproverPastVouchers.html';
         appPageHistory.push(pageRef);
        j('#mainHeader').load(headerBackBtn);
        j('#mainContainer').load(pageRef);
     }

          if(statusOfVoucher == 'Q'){
       
         var headerBackBtn = defaultPagePath + 'backbtnPage.html';
         var pageRef = defaultPagePath + 'queryMainPage.html';
         appPageHistory.push(pageRef);
        j('#mainHeader').load(headerBackBtn);
        j('#mainContainer').load(pageRef);
     
     }
 }

  function hideTRQuery(){

    if (window.localStorage.getItem("APPLICATION_VERSION") == false || window.localStorage.getItem("versionNumber") > 12.3) {
        if (window.localStorage.getItem("TrRole") == "true") {
            document.getElementById('trQueryTab').style.display = "block";
            document.getElementById('tsQueryTab').style.display = "block";
            } else {
            document.getElementById('trQueryTab').style.display = "none";
            document.getElementById('tsQueryTab').style.display = "none";
            }
        } else {
            document.getElementById('trQueryTab').style.display = "none";
            document.getElementById('tsQueryTab').style.display = "none";
        }
 }

 function syncVoucherHeader(statusOfVoucher) {

     var jsonSentToSync = new Object();
     jsonSentToSync["employeeId"] = window.localStorage.getItem("EmployeeId");
     jsonSentToSync["processId"] = "1";
     jsonSentToSync["vocherStatus"] = statusOfVoucher;

     if (mydb) {
         j.ajax({
             url: window.localStorage.getItem("urlPath") + "SyncVoucherHeaders",
             type: 'POST',
             dataType: 'json',
             crossDomain: true,
             data: JSON.stringify(jsonSentToSync),
             success: function(data) {

                 mydb.transaction(function(t) {
                     t.executeSql("DELETE FROM BEHeader");
                 });

                 if (data.Status == 'Success') {
                     
                     var claimExpArray = data.expenseDetails;

                     mydb.transaction(function(t) {
                         if (claimExpArray != null && claimExpArray.length > 0) {
                             for (var i = 0; i < claimExpArray.length; i++) {
                                 var headArray = new Array();
                                 headArray = claimExpArray[i];

                                 var busExpHeaderId = headArray.busExpHeaderId;
                                 var busExpNumber = headArray.busExpNumber;
                                 var accHeadId = headArray.accHeadId;
                                 var accHeadDesc = headArray.accHeadDesc;
                                 var voucherDate = headArray.voucherDate;
                                 var startDate = headArray.startDate;
                                 var endDate = headArray.endDate;
                                 var currencyId = headArray.currencyId;
                                 var currencyName = headArray.currencyName;
                                 var editorTotalAmt = headArray.editorTotalAmtcurrencyName;
                                 var vocherStatus = headArray.vocherStatus;
                                 var currentOwnerId = headArray.currentOwnerId;
                                 var currentOwnerName = headArray.currentOwnerName;
                                 var rejectionComments = headArray.rejectionComments;
                                 var createdById = headArray.createdById;
                                 var creatorName =  headArray.creatorName;
                                 var query =  headArray.query;
                                 var queryId =  headArray.queryId;
                                 var queryAns =  headArray.queryAns;
                                 var workflowToBeFollowed = headArray.workflowToBeFollowed;
                                 
                                 t.executeSql("INSERT INTO BEHeader (busExpHeaderId ,busExpNumber ,accHeadId ,accHeadDesc ,voucherDate ,startDate ,endDate ,currencyId ,currencyName ,editorTotalAmt ,vocherStatus , currentOwnerId, currentOwnerName, createdById, creatorName , rejectionComments, query, queryId, queryAns, workflowToBeFollowed) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [busExpHeaderId, busExpNumber, accHeadId, accHeadDesc, voucherDate, startDate, endDate, currencyId, currencyName, editorTotalAmt, vocherStatus, currentOwnerId, currentOwnerName, createdById, creatorName , rejectionComments , query, queryId, queryAns, workflowToBeFollowed]);

                             }
                         }
                         requestRunning = false;
                         if (statusOfVoucher == 'F' || statusOfVoucher == 'R' || statusOfVoucher == 'P' || statusOfVoucher == 'U' || statusOfVoucher == 'D') {
                             displayPastVoucherPage(data.Status);
                         } else if(statusOfVoucher == 'Q'){
                            displayQueryPage(data.Status);
                         } else {
                             displayApprovalPage(data.Status);
                         }

                     });

                 } else if (data.Status == 'SUCCESS_NO_DATA') {
                     requestRunning = false;
                     if (statusOfVoucher == 'F' || statusOfVoucher == 'R' || statusOfVoucher == 'P' || statusOfVoucher == 'U' || statusOfVoucher == 'D') {
                         displayPastVoucherPage(data.Status);
                     }  else if(statusOfVoucher == 'Q'){
                        displayQueryPage(data.Status);
                    } else {
                         displayApprovalPage(data.Status);
                     }
                 } else {
                     requestRunning = false;
                     if (statusOfVoucher == 'F' || statusOfVoucher == 'R' || statusOfVoucher == 'P' || statusOfVoucher == 'U' || statusOfVoucher == 'D' ||statusOfVoucher == 'Q') {
                         displayPastVoucherPage(data.Status);
                     } else {
                         displayApprovalPage(data.Status);
                     }
                 }

             },
             error: function(data) {
                 requestRunning = false;
                 if (statusOfVoucher == 'V') {
                     displayPastVoucherPage(data.Status);
                 } else {
                     displayApprovalPage(data.Status);
                 }
             }
         });
     }
 }

 function displayPastVoucherPage(statusOfVoucher) {

     if (statusOfVoucher == "SUCCESS_NO_DATA") {

              var data = "<div style='text-align: center;'>"
                         +"<p  style='text-align: center;'><img src = 'images/noVoucher1.png'></p>"
                         +"<h4><b style='color: darkgrey;'>No expense available.</b></h4>"
                         +"<div>";
              j("#voucherHeader").append(data);

     } else {
                fetchViewForVouchersHeader();
     }

 }

 function displayApprovalPage(statusOfVoucher) {

     if (statusOfVoucher == "SUCCESS_NO_DATA") {
        requestRunning = false;

         j(document).ready(function() {

               var data = "<div style='text-align: center;'>"
                         +"<p  style='text-align: center;'><img src = 'images/noVoucher1.png'></p>"
                         +"<h4><b style='color: darkgrey;'>No expense available.</b></h4>"
                         +"<div>";
              j("#voucherHeader").append(data);

         });

     } else {
         requestRunning = false;
         resetImageData();
                         fetchViewForVouchersHeader();
     }
 }

 function fetchViewForVouchersHeader() {
     mydb.transaction(function(t) {
         t.executeSql('SELECT * FROM BEHeader;', [],
             function(transaction, result) {
                 if (result != null && result.rows != null) {
                     j('#voucherHeader').empty();
                     for (record = 0; record < result.rows.length; record++) {
                         var row = result.rows.item(record);

                         var statusForEdit = "";
                         var pendingAt = "";

                         if (row.vocherStatus == 'R') {
                             statusForEdit = 'Sent Back';
                         } else if (row.vocherStatus == 'P') {
                             statusForEdit = 'Pending';
                         } else if (row.vocherStatus == 'F') {
                             statusForEdit = 'Paid';
                         }  else if (row.vocherStatus == 'U') {
                             statusForEdit = 'Unpaid';
                             pendingAt = 'Payment Desk'
                         }  else if(row.vocherStatus == 'D'){
                             statusForEdit = 'Draft';
                         }  else if(row.vocherStatus == 'Q'){
                             statusForEdit = 'In Queries';
                         }

                         if(enableDivBasedOnStatus == "A"){
                            pendingAt = row.creatorName;
                         }

                        if(pendingAt == ""){
                            pendingAt = row.currentOwnerName;
                        }

                         var defaultCurrency  = window.localStorage.getItem("DefaultCurrencyName");

                         var data =
                             "<div class='col-md-12' onclick='fetchViewForVoucherDetails(" + row.busExpHeaderId + ");'>" 
                             + "<div class='card shadow'>" 
                             + "<div class='card-header' style='font-size: 15px;color: #076473;'>"

                             + "<span style='display: inline;' id = 'isEntitlementExceeded_"+record+"'></span>"
  
                             + row.busExpNumber 
                                + "<h7 style='display: inline;'>&nbsp("+defaultCurrency+")</h7>"
                                + "<label style = 'color:darkorange;float: right;'>" + statusForEdit + "</label></div>" 
                                 + "<div class='card-body' style='padding: 10px;'>" 
                                        + "<div class='row'>" 
                                            + "<div class='col-md-12' style='margin-bottom: 5px;'>"
                                                + "<label>" + row.accHeadDesc + "</label>"  
                                            + "</div>" 
                                        + "</div>" 
                                        + "<div class='row'>"
                                            + "<div class='col-md-12' style='margin-bottom: 5px;'>"
                                                + "<i class='fa fa-user'></i>" 
                                                + "<label style='font-weight: 500;'>&nbsp;" +pendingAt + "</label>"
                                                + "<span style='display: inline; float: right;'>"
                                                    + "<i class='fa fa-money'></i>" 
                                                    + "<label>&nbsp;" 
                                                    + row.editorTotalAmt 
                                                    + "</label>" 
                                                + "</span>"
                                            + "</div>" 
                                         + "</div>" 
                                         + "<div class='row'>" 
                                             + "<div class='col-md-12' style='margin-bottom: 5px;'>"
                                                + "<span style='display: inline-block;'>"
                                                    + "<i class='fa fa-calendar' aria-hidden='true'></i>" 
                                                    + "<label><h5>&nbsp;" + row.startDate + ' - ' + row.endDate + "<h5></label>"
                                                 + "</span>" 
                                            + "</div>"
                                         + "</div>" 
                                 + "</div>" 
                              + "</div>" 
                            + "<br>";


                  

                         j('#voucherHeader').append(data);


            if (row.workflowToBeFollowed == 'D') {
                if (window.localStorage.getItem("APPLICATION_VERSION") == false || window.localStorage.getItem("versionNumber") > 12.4) {

                    var buttonValue =
                        "<i style='font-size: 12px;color: red;float: left;;margin-top: 5px;' class='fa fa-circle'></i>" + "&nbsp;";

                    j('#isEntitlementExceeded_' + record).append(buttonValue);

                }

            }

                     }


                 }


             });

     });
 }

 // ******************************** View Past Voucher  / For My Approval Header -- End *********************************************//


  function fetchCountForMyApproval(statusOfVoucher) {

     var jsonSentToSync = new Object();
     jsonSentToSync["employeeId"] = window.localStorage.getItem("EmployeeId");
     jsonSentToSync["processId"] = "1";
     jsonSentToSync["vocherStatus"] = statusOfVoucher;

     j.ajax({
         url: window.localStorage.getItem("urlPath") + "FetchCount",
         type: 'POST',
         dataType: 'json',
         crossDomain: true,
         data: JSON.stringify(jsonSentToSync),
         success: function(data) {

             if (data.Status == "Success") {

                 var countForVouchers = data.VoucherCount.toString();


                if(statusOfVoucher == 'A' && document.getElementById('count') != null){
                 document.getElementById("count").innerHTML = countForVouchers.match(/\d+/);

                   var totalArray = countForVouchers.split(",");

                    for(var i = 0 ; i < totalArray.length ; i++){
                        if(totalArray[i].includes("Q") && document.getElementById('queryCount') != null){
                            document.getElementById("queryCount").innerHTML = totalArray[i].match(/\d+/);
                     }
                   }
                }else{
                     var arrayOfCount = countForVouchers.split(",");

                     for(var i = 0 ; i < arrayOfCount.length ; i++){

                        if(arrayOfCount[i].includes("D") && document.getElementById('draftCount') != null){
                            document.getElementById("draftCount").innerHTML = arrayOfCount[i].match(/\d+/);
                        }
                        if(arrayOfCount[i].includes("P") && document.getElementById('pendingCount') != null){
                            document.getElementById("pendingCount").innerHTML = arrayOfCount[i].match(/\d+/);
                        }
                        if(arrayOfCount[i].includes("U") && document.getElementById('approvedUnpaidCount') != null){
                            document.getElementById("approvedUnpaidCount").innerHTML = arrayOfCount[i].match(/\d+/);
                        }
                         if(arrayOfCount[i].includes("F") && document.getElementById('approvedPaidCount') != null){
                            document.getElementById("approvedPaidCount").innerHTML = arrayOfCount[i].match(/\d+/);
                        }
                         if(arrayOfCount[i].includes("R") && document.getElementById('sendBackCount') != null){
                            document.getElementById("sendBackCount").innerHTML = arrayOfCount[i].match(/\d+/);
                        }
                          if(arrayOfCount[i].includes("Q") && document.getElementById('queryCount') != null){
                            document.getElementById("queryCount").innerHTML = arrayOfCount[i].match(/\d+/);
                        }

                     }

                }

                 requestRunning = false;
             } else {
                 requestRunning = false;
             }
         },
         error: function(data) {
             requestRunning = false;
         }
     });

 }

 function fetchViewForVoucherDetails(busExpHeaderId) {

     var jsonToPopulateBEDetails = new Object();
     jsonToPopulateBEDetails["processId"] = '1';
     jsonToPopulateBEDetails["voucherId"] = busExpHeaderId;
     jsonToPopulateBEDetails["employeeId"] = window.localStorage.getItem("EmployeeId");

     j.ajax({
         url: window.localStorage.getItem("urlPath") + "SyncVoucherDetails",
         type: 'POST',
         dataType: 'json',
         crossDomain: true,
         data: JSON.stringify(jsonToPopulateBEDetails),
         success: function(data) {
             if (data.Status == "Success") {
                 var voucherDetailArray = data.expenseDetails;
                 setDetailsForHeader(busExpHeaderId, voucherDetailArray);

                 requestRunning = false;
             } else {
                 successMessage = "Error: Oops something is wrong, Please Contact System Administer";
                 requestRunning = false;
             }
         },
         error: function(data) {
             requestRunning = false;
         }
     });

 }


 function setDetailsForHeader(busExpHeaderId, voucherDetailArray) {

    var headerBackBtn = defaultPagePath + 'backbtnPage.html';
    var pageRef = defaultPagePath + 'voucherDetails.html';

    if( !appPageHistory.includes('app/pages/voucherDetails.html')){
            appPageHistory.push(pageRef);
    }

    j(document).ready(function() {
        j('#mainHeader').load(headerBackBtn);
        j('#mainContainer').load(pageRef, function() {
          fetchdetails(busExpHeaderId,voucherDetailArray);
        });
     });
     
 }

 function fetchdetails(busExpHeaderId, voucherDetailArray) {

     try {

         var detailBodyLines = "";

         if (voucherDetailArray != null && voucherDetailArray.length > 0) {
             for (var i = 0; i < voucherDetailArray.length; i++) {
                 var detailArray = new Array();
                 detailArray = voucherDetailArray[i];

                 var attachment = "";

                 var expName = detailArray.expName;

                 var unit = "";
                    if(detailArray.perUnit != null && detailArray.perUnit != 'undefined'){
                        unit = detailArray.perUnit;
                    }

                    var narration = "";
                    if(detailArray.narration != null && detailArray.narration != 'undefined'){
                        narration = detailArray.narration;
                    }

                  var expenseDate = getExpenseDateFromSMS(detailArray.expDate);

                 if (detailArray.attachFileName != null && detailArray.attachFileName != "") {
                     attachment = "<td><i class='fa fa-paperclip' style='font-size:18px;color:#0f97b2;' onclick='fetchReceipt(" + detailArray.attachFileId + ")'></i></td>"
                 } else {
                     attachment = "<td></td>"
                 }

                 if (expName.length > 15) {
                     expName = expName.substr(0, 12) + "..";
                 }

                 var expenseDateForDetail = getDateForDetailLine(detailArray.expDate);

                     detailBody = "<tr>"+ "<td>" + expName + "</td>" 
                                        + "<td>" + expenseDateForDetail + "</td>" 
                                        + "<td>" + detailArray.amount + ' <h6 style=display:inline-block;>'+ detailArray.currencyName + "</h6></span></td>"
                                        + attachment
                                        + "<td  class='expDate displayNone'>"+expenseDate+ "</td>"    
                                        + "<td  class='toLocation displayNone'>"+detailArray.toLocation+"</td>"
                                        + "<td  class='fromLocation displayNone'>"+detailArray.fromLocation+"</td>"
                                        + "<td  class='expNarration1 displayNone'>"+narration+"</td>"
                                        + "<td  class='expAmt1 displayNone'>"+detailArray.amount+"</td>"
                                        + "<td  class='expNameId displayNone'>"+detailArray.expNameId+"</td>"
                                        + "<td  class='expUnit displayNone'>"+unit+"</td>"
                                        + "<td  class='currencyId displayNone'>"+detailArray.currencyId+"</td>"
                                        + "<td  class='accHeadId displayNone'>"+detailArray.accHeadId+"</td>"
                                        + "<td  class='accountCodeId displayNone'>"+detailArray.accCodeId+"</td>"
                                        + "<td  class='busExpId displayNone'>"+detailArray.busExpHeadId+"</td>"
                                        + "<td  class='busExpDetailId displayNone'>"+detailArray.busExpDetailId+"</td>"
                                        + "<td  class='attachFileId displayNone'>"+detailArray.attachFileId+"</td>"   
                                        + "</tr>"

                 detailBodyLines = detailBodyLines + detailBody;
             }
         }

         setHeaderToDetail(busExpHeaderId, voucherDetailArray, detailBodyLines)

     } catch (e) {
         console.log(e);
     }

 }

  function getDateForDetailLine(input) {
    // converts date from dd-MMM-yyyy to dd/mm/yyyy
    var date = new Date(input);

    return( date.getMonth() + 1 + "/" +date.getDate());
}


 function setHeaderToDetail(busExpHeaderId, voucherDetailArray, detailBodyLines) {

     mydb.transaction(function(t) {

         t.executeSql('SELECT * FROM BEHeader where busExpHeaderId = ' + busExpHeaderId, [],
             function(transaction, result) {``
                 if (result != null && result.rows != null) {
                     j('#voucherDetailsTab').empty();
                     for (record = 0; record < result.rows.length; record++) {
                         var row = result.rows.item(record);

                            var statusForEdit = "";
                            var pendingAt = "";
                        
                         if (row.vocherStatus == 'R') {
                             statusForEdit = 'Sent Back';
                         } else if (row.vocherStatus == 'P') {
                             statusForEdit = 'Pending';
                         } else if (row.vocherStatus == 'F') {
                             statusForEdit = 'Paid';
                         }  else if (row.vocherStatus == 'U') {
                             statusForEdit = 'Unpaid';
                             pendingAt = 'Payment Desk'
                         }  else if (row.vocherStatus == 'D') {
                             statusForEdit = 'Draft';
                         }  else if (row.vocherStatus == 'Q') {
                             statusForEdit = 'In Queries';
                         }

                        if(enableDivBasedOnStatus == "A"){
                            pendingAt = row.creatorName;
                         }

                          if(pendingAt == ""){
                            pendingAt = row.currentOwnerName;
                        }


                         var buttonValue = "";

                         var defaultCurrency  = window.localStorage.getItem("DefaultCurrencyName");

                         var data =
                             "<div class='col-md-12'>" 
                             + "<div class='card shadow'>" 
                             + "<div class='card-header' style='font-size: 15px;color: #076473;'>"
                             +"<span style='display: inline;' id = 'isEntitlementExceeded_" + record + "'></span>"
                             + row.busExpNumber 
                             +"<h7 style='display: inline;'>&nbsp("+defaultCurrency+")</h7>"
                             +"<label style = 'color:darkorange;float: right;'>" + statusForEdit + "</label></div>"

                         + "<div class='card-body'>" 
                                 + "<div style='margin-bottom: 5px;'>" 
                                    + "<label style='font-weight: 500;'>" + row.accHeadDesc + "</label>"    
                                 + "</div>" 
                                 + "<div>"
                                 + "<i class='fa fa-user'></i>" 
                                 + "<label style='font-weight: 500;'>&nbsp;" + pendingAt + "</label>"
                                     + "<span style='display: inline; float: right;'>"
                                     + "<i class='fa fa-money'></i>" 
                                     + "<label style='font-weight: 500;'>&nbsp;" 
                                     + row.editorTotalAmt 
                                     + "</label>" 
                                     + "</span>"
                                 + "</div>" 
                             + "</div>" 
                         + "<div class='card-footer' id='buttonsAttached' style='padding-bottom:20px;'>" 
                        
                         + "<span style='width: 25%;display: contents;'>" 
                         + "<i class='fa fa-calendar' aria-hidden='true' style='margin-left: 5px;'></i>" 
                         + "<label><h5 style='padding-bottom: 10%;style='font-weight: 500;''>&nbsp;" + row.startDate + ' - ' + row.endDate + "</h5></label>"
                         + "</span>"

                         + "<div class='table-responsive'>" 
                         + "<table id = 'detailTab' class='table table-bordered tableFixHead' width='100%' cellspacing='0'>" 
                         + "<thead>" 
                         + "<tr role='row'>" 
                         + "<th class='sorting' tabindex='0' aria-controls='dataTable' rowspan='1' colspan='1' aria-label=''>Expense Name" + "</th>" 
                         + "<th class='sorting' tabindex='0' aria-controls='dataTable' rowspan='1' colspan='1' aria-label=''>Date" + "</th>" 
                         + "<th class='sorting' tabindex='0' aria-controls='dataTable' rowspan='1' colspan='1' aria-label=''>Amount" + "</th>" 
                         + "<th class='sorting' tabindex='0' aria-controls='dataTable' rowspan='1' colspan='1' aria-label=''>" + "</th>" 
                         + "</tr>" 
                         + "</thead>" 
                         + "<tbody id='detailBodyId'>" + detailBodyLines + "</tbody>" 
                         + "</table>" 
                         + "</div>" 
                         + "</div>"

                         + "<div id = 'policies' style='display: none;' onclick='fetchException("+busExpHeaderId+","+"1)'>"
                         + "<td><i class='fa fa-plus-square-o' style='font-size:18px;color:#337ab7;padding: 6px;'> Policies</i></td>"
                         + "</div>"
                         + "<div id = 'exceptionMsg' style='padding-left: 5px; padding-bottom: 5px; padding-right:5px;'>"
                         +"</div>"
                         + "</div>"   
                         + "</div>";
                         j('#voucherDetailsTab').append(data);

                         if (window.localStorage.getItem("APPLICATION_VERSION") == false || window.localStorage.getItem("versionNumber") > 12.4) {
                            if (row.workflowToBeFollowed == 'D') {
                                var buttonValue =
                                    "<i style='font-size: 12px;color: red;float: left;margin-top: 5px;' class='fa fa-circle'></i>" + "&nbsp;";

                                j('#isEntitlementExceeded_' + record).append(buttonValue);

                                document.getElementById('policies').style.display = "block";

                            }

                        }

                         if (statusForEdit == 'Sent Back') {

                             buttonValue =   
                                            "<br>"
                                            +"<div style='margin-left: 2%;'><label>Sent Back Comments :</label>"
                                            +"<br>"
                                            +"<div style='border: 1px;background-color: #eeeeee;padding: 10px 0 10px 10px;box-sizing: border-box;width: 98%;padding-left: 10;'>"+row.rejectionComments+"</div>"
                                            +"<div><br>"
                                            +"<div class='col-md-12' id = 'editButton' style='text-align: center;padding-bottom: 20px;'>" 
                                            + "<button type='submit' class='btn btn-primary' onclick='expPrimaryIdSB()'>Edit</button>&nbsp;" 
                                           +"<button type='submit' id = 'sendForApproveBtn' class='btn btn-primary' onclick='approveVoucherWithAdv(" + busExpHeaderId +","+"2)'>Send For Approval</button>&nbsp;" + "</div>";

                             j('#buttonsAttached').append(buttonValue);
                         }

                         if (statusForEdit == 'Draft') {

                             buttonValue =  
                                            "<div class='col-md-12' id = 'editButton' style='text-align: center;padding-bottom: 20px;'>" 
                                            + "<button type='submit' class='btn btn-primary' onclick='expPrimaryIdSB()'>Edit</button>&nbsp;" 
                                         +"<button type='submit' id = 'sendForApproveBtn' class='btn btn-primary' onclick='approveVoucherWithAdv(" + busExpHeaderId +","+"1)'>Send For Approval</button>&nbsp;" + "</div>";

                             j('#buttonsAttached').append(buttonValue);
                         }

                         if(enableDivBasedOnStatus == 'A'){
                            
                            buttonValue =  "<div class='col-md-12' style='text-align: center; padding-bottom: 20px;'>"
                                            +"<button type='submit' id = 'approveBtn' class='btn btn-primary' onclick='approveVoucher("+row.busExpHeaderId+")'>Approve</button>&nbsp;"
                                            +"<button type='button' id = 'RejectedBtn' class='btn btn-primary' data-toggle='modal' data-id="+row.busExpHeaderId+"_1"+" data-target='#myModal'>Send Back</button>"
                                            +"</div>";
                              j('#buttonsAttached').append(buttonValue);

                        }
                         
                         if(statusForEdit =='In Queries' && enableDivBasedOnStatus == 'A'){
                            document.getElementById("RejectedBtn").disabled =true;
                            document.getElementById("approveBtn").disabled =true;
                            }
                          

                        if(row.vocherStatus == 'R' || row.vocherStatus == 'D'){

                            j("#detailBodyId tr").click(function() {
                                 if (j(this).hasClass("selected")) {
                                     j(this).removeClass('selected');
                                     
                                 } else {
                                     j(this).addClass('selected');
                                     
                                 }
                            });
                        }
                        var empId = window.localStorage.getItem("EmployeeId");
                        var len = appPageHistory.length;
                        var pg = appPageHistory[len - 3];
                        if(statusForEdit == 'In Queries'  && (empId==row.createdById) && pg !='app/pages/viewPastVoucher.html'){
                            
                            var ids = row.busExpHeaderId+'&'+row.queryId;
                       
                            if(row.queryAns == "" || row.queryAns=="undefined" ||row.queryAns=="Null"){
                                buttonValue =   
                                            "<br>"
                                            +"<div style='margin-left: 2%;'><label>Query Asked To Me:</label>"
                                            +"<br>"
                                            +"<div style='border: 1px;background-color: #eeeeee;padding: 10px 0 10px 10px;box-sizing: border-box;width: 98%;padding-left: 10;'>"+row.query+"</div>"
                                            +"<div><br>"
                                            +"<div class='col-md-12' style='text-align: center;'>"
                                            +"<button type='button' id = 'QueryBtn' class='btn btn-primary' data-toggle='modal' data-id="+ids+" data-target='#myModalQuery'>Reply</button>"
                                            +"</div>"
                                            ;
                             }else{
                                 buttonValue =   
                                            "<br>"
                                            +"<div style='margin-left: 2%;'><label>Query Asked To Me:</label>"
                                            +"<br>"
                                            +"<div style='border: 1px;background-color: #eeeeee;padding: 10px 0 10px 10px;box-sizing: border-box;width: 98%;padding-left: 10;'>"+row.query+"</div><br>"
                                            +"<div style='margin-right: 2%;'><label>Reply:</label>"
                                            +"<div style='border: 1px;background-color: #eeeeee;padding: 10px 0 10px 10px;box-sizing: border-box;width: 98%;padding-left: 10;'>"+row.queryAns+"</div>"
                                            +"<div><br>"
                                            +"<div class='col-md-12' style='text-align: center;'>"
                                            +"<button type='button' id = 'QueryBtn' class='btn btn-primary' data-toggle='modal' data-id="+ids+" data-target='#myModalQuery'>Edit</button>"
                                            +"</div>"
                                            ;
                             }
                       

                             j('#buttonsAttached').append(buttonValue);
                            
                            }

                     }
                 }

             });
     });

 }


// ************************************** Approve Reject Voucher Start ************************************************ //

function rejectVoucher(){
     var headerBackBtn = defaultPagePath + 'backbtnPage.html';
    var pageRefSuccess = defaultPagePath + 'success.html';
    var busExpHeaderId = j("#RejectedBtn").data('id');
    var comment = j.trim(j("#sendBackComment").val());

    if(comment != ""){

        var res = busExpHeaderId.split("_");
        var jsonToBeSendForApproval = new Object();
        jsonToBeSendForApproval["processId"] = res[1];
        jsonToBeSendForApproval["headerList"] = res[0];
        jsonToBeSendForApproval["employeeId"] = window.localStorage.getItem("EmployeeId");
        jsonToBeSendForApproval["buttonStatus"] = "R";
        jsonToBeSendForApproval["rejectionComment"] = comment;
         
        j('#loading_Cat').show();

        j.ajax({
            url: window.localStorage.getItem("urlPath") + "MobileApproveRejectService",
            type: 'POST',
            dataType: 'json',
            crossDomain: true,
            data: JSON.stringify(jsonToBeSendForApproval),
            success: function(data) {
              
                if (data.Status == "Success") {
                    j('#loading_Cat').hide();

                    if(res[1] == 1){
                        var claimExpArray = data.expenseDetails;

                        mydb.transaction(function(t) {
                            if (claimExpArray != null && claimExpArray.length > 0) {
                                for (var i = 0; i < claimExpArray.length; i++) {
                                    var headArray = new Array();
                                    headArray = claimExpArray[i];
                                    //console.log("headArray : "+headArray);

                                    var approvalMsg = headArray.message;
                                    successMessage = approvalMsg;

                                }
                            }

                            if(successMessage != null && successMessage != ""){
                                j('#loading_Cat').hide();
                                j('#mainHeader').load(headerBackBtn);
                                j('#mainContainer').load(pageRefSuccess);
                            }
                            requestRunning = false;             
                        });
                    }

                    if(res[1] == 3){
                        var travelRequestArray = data.travelRequestDetails;

                        mydb.transaction(function(t) {
                            if (travelRequestArray != null && travelRequestArray.length > 0) {
                                for (var i = 0; i < travelRequestArray.length; i++) {
                                    var headArray = new Array();
                                    headArray = travelRequestArray[i];
                                    //console.log("headArray : "+headArray);

                                    var approvalMsg = headArray.message;
                                    successMessage = approvalMsg;

                                }
                            }

                            if(successMessage != null && successMessage != ""){
                                j('#loading_Cat').hide();
                                j('#mainHeader').load(headerBackBtn);
                                j('#mainContainer').load(pageRefSuccess);
                            }
                            requestRunning = false;             
                        });
                    }

                    if(res[1] == 5){
                        var travelSettlementArray = data.travelSettlement;

                        mydb.transaction(function(t) {
                            if (travelSettlementArray != null && travelSettlementArray.length > 0) {
                                for (var i = 0; i < travelSettlementArray.length; i++) {
                                    var headArray = new Array();
                                    headArray = travelSettlementArray[i];
                                    //console.log("headArray : "+headArray);

                                    var approvalMsg = headArray.message;
                                    successMessage = approvalMsg;

                                }
                            }

                            if(successMessage != null && successMessage != ""){
                                j('#loading_Cat').hide();
                                j('#mainHeader').load(headerBackBtn);
                                j('#mainContainer').load(pageRefSuccess);
                            }
                            requestRunning = false;             
                        });
                    }

                    requestRunning = false;
                    j('#mainHeader').load(headerBackBtn);
                    j('#mainContainer').load(pageRefSuccess);

                } else {
                     j('#loading_Cat').hide();
                    successMessage = "Error: Oops something is wrong, Please Contact System Administer";
                    requestRunning = false;
                }
            },
            error: function(data) {
                 j('#loading_Cat').hide();
                requestRunning = false;
            }
        });
    }else{
        alert("Please enter send back comment.");
    }
}

 function approveVoucher(busExpHeaderId){

    var headerBackBtn = defaultPagePath + 'backbtnPage.html';
    var pageRefSuccess = defaultPagePath + 'success.html';

    var jsonToBeSendForApproval = new Object();
    jsonToBeSendForApproval["processId"] = '1';
    jsonToBeSendForApproval["headerList"] = busExpHeaderId;
    jsonToBeSendForApproval["employeeId"] = window.localStorage.getItem("EmployeeId");
    jsonToBeSendForApproval["buttonStatus"] = "A";
    jsonToBeSendForApproval["rejectionComment"] = "";

     
    j('#loading_Cat').show();

    j.ajax({
        url: window.localStorage.getItem("urlPath") + "MobileApproveRejectService",
         type: 'POST',
         dataType: 'json',
         crossDomain: true,
         data: JSON.stringify(jsonToBeSendForApproval),
         success: function(data) {

             if (data.Status == "Success") {
                j('#loading_Cat').hide();
                var claimExpArray = data.expenseDetails;

                    mydb.transaction(function(t) {
                        if (claimExpArray != null && claimExpArray.length > 0) {
                            for (var i = 0; i < claimExpArray.length; i++) {
                                var headArray = new Array();
                                headArray = claimExpArray[i];
                                //console.log("headArray : "+headArray);

                                var approvalMsg = headArray.message;
                                successMessage = approvalMsg;

                            }
                        }

                        if(successMessage != null && successMessage != ""){
                            j('#loading_Cat').hide();
                            j('#mainHeader').load(headerBackBtn);
                            j('#mainContainer').load(pageRefSuccess);
                        }
                        requestRunning = false;             
                    });

             } else {
                 j('#loading_Cat').hide();
                 successMessage = "Error: Oops something is wrong, Please Contact System Administer";
                 requestRunning = false;
             }
         },
         error: function(data) {
            j('#loading_Cat').hide();
            successMessage = "Error: Oops something is wrong, Please Contact System Administer";
            requestRunning = false;
         }
     });

 }
 
 // ************************************** Approve Reject Voucher End ************************************************ //

 // *********************************  Business Expense Edit Send Back Vouchers(SB) -- Start ******************************************//

 function onloadExpenseElementSB() {
    var jsonFindBEEditValues = JSON.parse(window.localStorage.getItem("jsonUpdateBE"));
    var accHeadId = jsonFindBEEditValues.accountHeadId;

     if (mydb) {
         mydb.transaction(function(t) {
             t.executeSql("SELECT * FROM accountHeadMst", [], getAccHeadListForBEEdit);
             t.executeSql("SELECT * FROM currencyMst", [], getCurrencyListForBEEdit);
             t.executeSql("SELECT * FROM expNameMst  where accHeadId=" +accHeadId, [], getExpNameListForBESBEdit);
         });
     } else {
         alert('Database not found, your browser does not support web sql!');
     }

 }

 function getExpNameListForBESBEdit(transaction, results) {
     var i;
     var jsonExpNameArr = [];
     for (i = 0; i < results.rows.length; i++) {
         var row = results.rows.item(i);
         var jsonFindExpNameHead = new Object();
         jsonFindExpNameHead["ExpenseID"] = row.id;
         jsonFindExpNameHead["ExpenseName"] = row.expName;
         jsonExpNameArr.push(jsonFindExpNameHead);
     }
     createExpNameDropDownForBEEdit(jsonExpNameArr);

     setEditBESBJSON();

 }

 function createExpNameDropDownForBESBEEdit(jsonExpNameArr) {
     var jsonExpArr = [];
     if (jsonExpNameArr != null && jsonExpNameArr.length > 0) {
         for (var i = 0; i < jsonExpNameArr.length; i++) {
             var stateArr = new Array();
             stateArr = jsonExpNameArr[i];
             jsonExpArr.push({
                 id: stateArr.ExpenseID,
                 name: stateArr.ExpenseName
             });
         }
     }

     j("#expenseName").select2({
         data: {
             results: jsonExpArr,
             text: 'name'
         },
         minimumResultsForSearch: -1,
         placeholder: "Select Expense Name",
         /*initSelection: function (element, callback) {
            callback(jsonExpArr[0]);
         },*/
         formatResult: function(result) {
             if (!isJsonString(result.id))
                 result.id = JSON.stringify(result.id);
             return result.name;
         }
     }).select2("val", "");

 }

 function setEditBESBJSON() {

     var jsonFindBEEditValues = JSON.parse(window.localStorage.getItem("jsonUpdateBE"));

     document.getElementById("expNarration").value = jsonFindBEEditValues.narration;

     document.getElementById("expDate").value = jsonFindBEEditValues.expenseDate;

     document.getElementById("busExpHedId").value = jsonFindBEEditValues.busExpId;

     document.getElementById("busExpDetailId").value = jsonFindBEEditValues.busExpDetailId;

      j("#accountHead").select2("val", jsonFindBEEditValues.accountHeadId);
      //j("#accountHead").select2("val", 1);

     if (jsonFindBEEditValues.units != null) {
         document.getElementById("expUnit").value = jsonFindBEEditValues.units;
     }

 /*    if (document.getElementById("expUnit").value == 'undefined') {
         document.getElementById("expUnit").value = "";
         document.getElementById("expUnit").style.display = "none";
     }*/

     document.getElementById("expAmt").value = jsonFindBEEditValues.amount;

    //alert("set expense ka value "+jsonFindBEEditValues.expenseId);
    
    j("#expenseName").select2("val", jsonFindBEEditValues.expenseId);

    j("#currency").select2("val", jsonFindBEEditValues.currencyId);

     document.getElementById("expFromLoc").value = jsonFindBEEditValues.fromLocation;

     document.getElementById("expToLoc").value = jsonFindBEEditValues.toLocation;

     getPerUnitFromDBForEdit(jsonFindBEEditValues.expenseId);

     resetImageData();

    if(jsonFindBEEditValues.attachFileId != "" && jsonFindBEEditValues.attachFileId != null){

            setAttachOnLoadSB(jsonFindBEEditValues.attachFileId);
    }

 }

function setAttachOnLoadSB(attachFileId) {

     var jsonAttach = new Object();
     jsonAttach["fileId"] = attachFileId;

     j.ajax({
         url: window.localStorage.getItem("urlPath") + "FetchAttachment",
         type: 'POST',
         dataType: 'json',
         crossDomain: true,
         data: JSON.stringify(jsonAttach),
         success: function(data) {
             if (data.Status == "Success") {

               var attachmentData = data.attachmentData;

               smallImageBE.style.display = 'block';
               smallImageBE.src =  "data:image/png;base64," + attachmentData;
               updateAttachment = "data:image/jpeg;base64," + attachmentData;
               resetImageData();

               requestRunning = false;
             } else {
                 requestRunning = false;
             }
         },
         error: function(data) {
             requestRunning = false;
         }
     });
 }

function expPrimaryIdSB() {
 
    if (j("#detailBodyId tr.selected").hasClass("selected")) {
        var rowCount = $('#detailBodyId tr.selected').length;
        if (rowCount > 1) {
            alert(window.lang.translate('Select single expense line for edit.'));
        } else {
            j("#detailBodyId tr.selected").each(function(index, row) {
                var expNameID = j(this).find('td.expNameId').text();
                var accHeadIdVal = j(this).find('td.accHeadId').text();

                getPrimaryExpenseIdSB(expNameID,accHeadIdVal);
            });
        }
    } else {
        alert(window.lang.translate('Tap and select expenses to edit.'));
    }
}

function getPrimaryExpenseIdSB(expMstId,accHeadIdVal) {

     if (mydb) {
         //Get all the employeeDetails from the database with a select statement, set outputEmployeeDetails as the callback function for the executeSql command
         mydb.transaction(function(t) {
              t.executeSql("SELECT id FROM expNameMst where expNameMstId=" + expMstId +" and accHeadId = " +accHeadIdVal, [], getExpIdSB);
         });
     } else {
         alert(window.lang.translate('Database not found, your browser does not support web sql!'));
     }

 }

 function getExpIdSB(transaction, results) {
     var i;
     var jsonFindExpNameHead = new Object();

     for (i = 0; i < results.rows.length; i++) {
         var row = results.rows.item(i);

         jsonFindExpNameHead["ExpenseID"] = row.id;

         updateDetailLine(row.id);
     }
 }

 function getPrimaryExpenseIdSBAndUpdate(busExpDetailId) {
    //alert("1 : "+busExpDetailId.value);
    var exp_name_id;
     if (j("#expenseName").select2('data') != null) {
         exp_name_id = j("#expenseName").select2('data').id;
         exp_name_val = j("#expenseName").select2('data').name;
     } else {
         exp_name_id = '-1';
     }

     if (mydb) {
         
         mydb.transaction(function(t) {
             t.executeSql("SELECT expNameMstId FROM expNameMst where id=" + exp_name_id, [], function (transaction, results){

                var i;
                var jsonFindExpNameHead = new Object();
                 for (i = 0; i < results.rows.length; i++) {
                    var row = results.rows.item(i);

                    var  expenseIdNew = row.expNameMstId;
                           
                    updateBusinessDetailsSB(busExpDetailId,expenseIdNew);
                 }
             }, null);
         });
     } else {
         alert(window.lang.translate('Database not found, your browser does not support web sql!'));
     }

 }

 function updateBusinessDetailsSB(busExpDetailId,expenseIdNew) {

     var acc_head_id;
     var acc_head_val;

     var exp_name_id;
     var exp_name_val;

     var currency_id;
     var currency_val;

     var file;

     var busExpDetailId = busExpDetailId.value;

     if (j("#accountHead").select2('data') != null) {
         acc_head_id = j("#accountHead").select2('data').id;
         acc_head_val = j("#accountHead").select2('data').name;
     } else {
         acc_head_id = '-1';
     }

     if (j("#expenseName").select2('data') != null) {
         exp_name_id = j("#expenseName").select2('data').id;
         exp_name_val = j("#expenseName").select2('data').name;
     } else {
         exp_name_id = '-1';
     }

     if (j("#currency").select2('data') != null) {
         currency_id = j("#currency").select2('data').id;
         currency_val = j("#currency").select2('data').name;
     } else {
         currency_id = '-1';
     }

     var exp_date = document.getElementById('expDate').value;

     var exp_from_loc = document.getElementById('expFromLoc').value;

     var exp_to_loc = document.getElementById('expToLoc').value;

     var exp_narration = document.getElementById('expNarration').value;

     var exp_unit = document.getElementById('expUnit').value;

     var exp_amt = document.getElementById('expAmt').value;

     if(updateAttachment != "" && updateAttachment != undefined){
            file = updateAttachment;
     }else{
         if (fileTempGalleryBE == undefined || fileTempGalleryBE == "") {

         } else {
             file = fileTempGalleryBE;
         }

         if (fileTempCameraBE == undefined || fileTempCameraBE == "") {

         } else {
             file = fileTempCameraBE;
         }

     }

     if (file == undefined) {
         file = "";
     }

  
      if (validateExpenseDetails(exp_date, exp_from_loc, exp_to_loc, exp_narration, exp_unit, exp_amt, acc_head_id, exp_name_id, currency_id, file)) {

        var jsonBeDetail = new Object();
        jsonBeDetail["expenseDate"] = exp_date;
        jsonBeDetail["fromLocation"] = exp_from_loc;
        jsonBeDetail["toLocation"] = exp_to_loc;
        jsonBeDetail["narration"] = exp_narration;
        jsonBeDetail["units"] = exp_unit;
        jsonBeDetail["expenseId"] = expenseIdNew;
        jsonBeDetail["expenseName"] = exp_name_val;
        jsonBeDetail["amount"] = exp_amt;
        jsonBeDetail["currencyId"] = currency_id;
        jsonBeDetail["businessExpDetId"] = busExpDetailId;
        var data = file.replace(/data:image\/(png|jpg|jpeg);base64,/, '');
        jsonBeDetail["imageAttach"] = data;

        var pageRefSuccess = defaultPagePath + 'success.html';
        var pageRefFailure = defaultPagePath + 'failure.html';
        //console.log("updateDetailLine : " + JSON.stringify(jsonBeDetail));
        //alert("3");

        callUpdateDetailServiceForBESB(jsonBeDetail, pageRefSuccess, pageRefFailure);
      }
 }

 function callUpdateDetailServiceForBESB(jsonBeDetail, pageRefSuccess, pageRefFailure){
    updateExpDetailLIne(jsonBeDetail,pageRefSuccess,pageRefFailure);
 }

 function updateExpDetailLIne(jsonBeDetail, pageRefSuccess, pageRefFailure) {
    //alert("4");
     //j('#loading_Cat').show();
     var headerBackBtn = defaultPagePath + 'backbtnPage.html';
    
     j.ajax({
         url: window.localStorage.getItem("urlPath") + "UpdateBusinessExpenseDetailLine",
         type: 'POST',
         dataType: 'json',
         crossDomain: true,
         data: JSON.stringify(jsonBeDetail),
         success: function(data) {
            //alert("5 : "+data.Status);
             if (data.Status == "Success") {
                 if (data.hasOwnProperty('DelayStatus')) {
                     setDelayMessage(data, jsonToSaveBE, busExpDetailsArr);
                     j('#loading_Cat').hide();
                 } else {
                     successMessage = "Expense Line Updated Successfully";
                     
                     requestRunning = false;
                     j('#loading_Cat').hide();
                     j('#mainHeader').load(headerBackBtn);
                     j('#mainContainer').load(pageRefSuccess);
                     // appPageHistory.push(pageRef);
                 }
             } else if (data.Status == "Failure") {
                 successMessage = data.Message;
                 requestRunning = false;
                 j('#loading_Cat').hide();
                 j('#mainHeader').load(headerBackBtn);
                 j('#mainContainer').load(pageRefFailure);
             } else {
                 j('#loading_Cat').hide();
                 successMessage = "Oops!! Something went wrong. Please contact system administrator.";
                 requestRunning = false;
                 j('#mainHeader').load(headerBackBtn);
                 j('#mainContainer').load(pageRefFailure);
             }
         },
         error: function(data) {
             j('#loading_Cat').hide();
             requestRunning = false;
             alert(window.lang.translate('Error: Oops something is wrong, Please Contact System Administer'));
         }
     });
 }

 function goBackSB(expHeaderId) {
     var currentUser = getUserID();
     var loginPath = defaultPagePath + 'loginPage.html';
     var headerBackBtn = defaultPagePath + 'backbtnPage.html';
     var headerCatMsg = defaultPagePath + 'categoryMsgPage.html';

     if (currentUser == '') {
         j('#mainContainer').load(loginPath);
     } else {
         //To check if the page that needs to be displayed is login page. So 'historylength-2'
         var historylength = appPageHistory.length;
         var goToPage = appPageHistory[historylength - 2];

         if (goToPage !== null && goToPage == loginPath) {
             return 0;
         } else {
             appPageHistory.pop();
             var len = appPageHistory.length;
             var pg = appPageHistory[len - 1];

             //alert("new appPageHistory : "+appPageHistory);

            j('#mainContainer').load(pg, function() {
                     fetchViewForVoucherDetails(expHeaderId);
            });
                 
            if (!(pg == null)) {
                     j('#mainContainer').load(pg);
            }
         }
     }
 }




// *********************************  Business Expense Edit Send Back Vouchers(SB) -- End ******************************************//

 function updateDetailLine(expPrimaryId){

 j(document).ready(function() {


    j("#detailTab tr").click(function() {
                         //headerOprationBtn = defaultPagePath + 'voucherDetails.html';
                         if (j(this).hasClass("selected")) {
                             var headerBackBtn = defaultPagePath + 'backbtnPage.html';
                             j(this).removeClass('selected');
                             j('#mainHeader').load(headerBackBtn);
                         } else {
                                // j('#mainHeader').load(headerOprationBtn);
                                 j(this).addClass('selected');
                             
                         }
                     });


                if (j("#detailTab tr.selected").hasClass("selected")) {
                    j("#detailTab tr.selected").each(function(index, row) {
        
                    var busExpDetailId = j(this).find('td.busExpDetailId').text();
                    var jsonUpdateBE = new Object();
                    var expDate = j(this).find('td.expDate').text();
                    var expenseDate = expDate;

                    jsonUpdateBE["busExpId"] = j(this).find('td.busExpId').text();
                    jsonUpdateBE["busExpDetailId"] = busExpDetailId;
                    jsonUpdateBE["expenseDate"] = expenseDate;
                    
                    jsonUpdateBE["expenseId"] = expPrimaryId;
                    jsonUpdateBE["ExpenseName"] = j(this).find('td.expName').text();
                    jsonUpdateBE["fromLocation"] = j(this).find('td.fromLocation').text();
                    jsonUpdateBE["toLocation"] = j(this).find('td.toLocation').text();

                    jsonUpdateBE["narration"] = j(this).find('td.expNarration1').text();
                    jsonUpdateBE["accountHeadId"] = j(this).find('td.accHeadId').text();
                    jsonUpdateBE["accountCodeId"] = j(this).find('td.accountCodeId').text();

                    if (j(this).find('td.expUnit').text() != "") {
                        jsonUpdateBE["units"] = j(this).find('td.expUnit').text();
                    }
                    jsonUpdateBE["wayPoint"] = j(this).find('td.wayPoint').text();
                    jsonUpdateBE["amount"] = j(this).find('td.expAmt1').text();
                    jsonUpdateBE["currencyId"] = j(this).find('td.currencyId').text();
                    jsonUpdateBE["perUnitException"] = j(this).find('td.isEntitlementExceeded').text();

/*                    var dataURL = j(this).find('td.busAttachment').text();
                    var attachmentFileId = j(this).find('td.attachFileId').text();

                    //For IOS image save
                    //var data = dataURL.replace(/data:image\/(png|jpg|jpeg);base64,/, '');

                    //For Android image save
                    var data = dataURL.replace(/data:base64,/, '');

                    jsonUpdateBE["imageAttach"] = data;*/

                    jsonUpdateBE["attachFileId"] = j(this).find('td.attachFileId').text();


                    localStorage.setItem("jsonUpdateBE", JSON.stringify(jsonUpdateBE));

                    //console.log(JSON.stringify(jsonUpdateBE));

                    displayUpdateDetailPage();

                    });
                } else {
                    alert(window.lang.translate('Tap and select expense to edit.'));
                }

      });
 }


 function displayUpdateDetailPage() {

     var headerBackBtn = defaultPagePath + 'backbtnPage.html';
     var pageRef = defaultPagePath + 'businessExpenseSendBackEditPage.html';
     j(document).ready(function() {
         j('#mainHeader').load(headerBackBtn);
         j('#mainContainer').load(pageRef);
     });
     appPageHistory.push(pageRef);

 }

 function fetchReceipt(attachFileId) {

     var jsonToBeSendForApproval = new Object();
     jsonToBeSendForApproval["fileId"] = attachFileId;

     j.ajax({
         url: window.localStorage.getItem("urlPath") + "FetchAttachment",
         type: 'POST',
         dataType: 'json',
         crossDomain: true,
         data: JSON.stringify(jsonToBeSendForApproval),
         success: function(data) {
             if (data.Status == "Success") {

                 var attachmentData = data.attachmentData;

                 if (document.getElementById("img01") != null) {
                     document.getElementById("img01").src = "data:image/png;base64," + attachmentData;
                 }

                 var modal = document.getElementById("myModalImg");
                 modal.style.display = "block";

                 requestRunning = false;
             } else {
                 requestRunning = false;
             }
         },
         error: function(data) {
             requestRunning = false;
         }
     });

 }
  //***************************** Agile Merging -- End *******************************************************//
//********************************Query BE COde Added****************************************************//

function queryAnwser(){
    $('.modal-backdrop').remove();
    var headerBackBtn = defaultPagePath + 'backbtnPage.html';
    var pageRefSuccess = defaultPagePath + 'success.html';
    var querBEId = j("#QueryBtn").data('id');
    var beQueryId = querBEId.split("&");
    var busExpHeaderId = beQueryId[0];
    var queryId = beQueryId[1];
    var comment = j.trim(j("#queryRply").val());
    var file = "";

    if(comment != ""){

        var jsonToBeSendForQuery = new Object();
        jsonToBeSendForQuery["processId"] = '1';
        jsonToBeSendForQuery["busExpHeaderId"] = busExpHeaderId;
        jsonToBeSendForQuery["queryId"] = queryId;
        jsonToBeSendForQuery["employeeId"] = window.localStorage.getItem("EmployeeId");
        jsonToBeSendForQuery["queryAnswer"] = comment;

         if (fileTempGalleryBEQ == undefined || fileTempGalleryBEQ == "") {

         } else {
             file = fileTempGalleryBEQ;
         }

         if (fileTempCameraBEQ == undefined || fileTempCameraBEQ == "") {

         } else {
             file = fileTempCameraBEQ;
         }

         if(file != ""){
            file = file.replace(/data:image\/(png|jpg|jpeg);base64,/, '');
         }

        jsonToBeSendForQuery["imageData"] = file;


        j('#loading_Cat').show();

        j.ajax({
            url: window.localStorage.getItem("urlPath") + "SaveQueryFromMobile",
            type: 'POST',
            dataType: 'json',
            crossDomain: true,
            data: JSON.stringify(jsonToBeSendForQuery),
            success: function(data) {
              
                if (data.Status == "Success") { 
                   
                     successMessage = "Query Answered Successfully";
                     
                    
                     resetImageData();
                       j('#loading_Cat').hide();
                        j('#mainHeader').load(headerBackBtn);
                         j('#mainContainer').load(pageRefSuccess);
                          requestRunning = false;

                } else {
                     j('#loading_Cat').hide();
                    successMessage = "Error: Oops something is wrong, Please Contact System Administer";
                    requestRunning = false;
                }
            },
            error: function(data) {
                 j('#loading_Cat').hide();
                requestRunning = false;
            }
        });
    }else{
        alert("Please enter Query Answer");
    }
}


// ---------------------------------------------------  Travel Past -- Start -----------------------------------------------------  //

 function TRTSAllViews() {

     var headerBackBtn = defaultPagePath + 'backbtnPage.html';
     var pageRef = defaultPagePath + 'TRTSAllViews.html';


     j(document).ready(function() {
         j('#mainHeader').load(headerBackBtn);
         j('#mainContainer').load(pageRef);
     });
     appPageHistory.push(pageRef);

 }
 // *************************************** Travel Request Header / Details -- Start *****************************************************//

 function viewTravelVoucherHeaders(statusOfVoucher) {

     enableDivBasedOnStatus = statusOfVoucher;

     // For My Approval Header Page
     if(statusOfVoucher == 'A'){                                    
         var headerBackBtn = defaultPagePath + 'backbtnPage.html';
         var pageRef = defaultPagePath + 'viewTravelApproverVouchers.html';
         appPageHistory.push(pageRef);
        j('#mainHeader').load(headerBackBtn);
        j('#mainContainer').load(pageRef);
     } else if(statusOfVoucher == 'Q'){
         var headerBackBtn = defaultPagePath + 'backbtnPage.html';
         var pageRef = defaultPagePath + 'queryMainPage.html';
         appPageHistory.push(pageRef);
        j('#mainHeader').load(headerBackBtn);
        j('#mainContainer').load(pageRef);
     } else{
         var headerBackBtn = defaultPagePath + 'backbtnPage.html';          //  My Expense Pages
         var pageRef = defaultPagePath + 'viewTravelPastView.html'; 
         appPageHistory.push(pageRef);
        j('#mainHeader').load(headerBackBtn);
        j('#mainContainer').load(pageRef);
     }
 }

 function syncTravelVoucherHeader(statusOfVoucher) {

     var jsonSentToSync = new Object();
     jsonSentToSync["employeeId"] = window.localStorage.getItem("EmployeeId");
     jsonSentToSync["processId"] = "3";
     jsonSentToSync["vocherStatus"] = statusOfVoucher;

     if (mydb) {
         j.ajax({
             url: window.localStorage.getItem("urlPath") + "SyncVoucherHeaders",
             type: 'POST',
             dataType: 'json',
             crossDomain: true,
             data: JSON.stringify(jsonSentToSync),
             success: function(data) {

                 mydb.transaction(function(t) {
                     t.executeSql("DELETE FROM TravelHeader");
                 });

                 if (data.Status == 'Success') {
                     
                     var claimExpArray = data.expenseDetails;

                     mydb.transaction(function(t) {
                         if (claimExpArray != null && claimExpArray.length > 0) {
                             for (var i = 0; i < claimExpArray.length; i++) {
                                 var headArray = new Array();
                                 headArray = claimExpArray[i];

                                 var headerId = headArray.headerId;
                                 var voucherNumber = headArray.voucherNumber;
                                 var accHeadId = headArray.accHeadId;
                                 var accHeadDesc = headArray.accHeadDesc;
                                 var voucherDate = headArray.voucherDate;
                                 var startDate = headArray.startDate;
                                 var endDate = headArray.endDate;
                                 var currencyId = headArray.currencyId;
                                 var currencyName = headArray.currencyName;
                                 var editorTotalAmt = headArray.editorTotalAmtcurrencyName;
                                 var vocherStatus = headArray.vocherStatus;
                                 var currentOwnerId = headArray.currentOwnerId;
                                 var currentOwnerName = headArray.currentOwnerName;
                                 var rejectionComments = headArray.rejectionComments;
                                 var createdById = headArray.createdById;
                                 var creatorName =  headArray.creatorName;
                                 var iternaryType =  headArray.iternaryType;
                                 var toLocation =  headArray.toLocation;
                                 var fromLocation =  headArray.fromLocation;
                                 var travelType =  headArray.travelType;           
                                 var query =  headArray.query;
                                 var queryId =  headArray.queryId;
                                 var queryAns =  headArray.queryAns;
                                 var workflowToBeFollowed = headArray.workflowToBeFollowed;

                                 t.executeSql("INSERT INTO TravelHeader (headerId ,voucherNumber ,accHeadId ,accHeadDesc ,voucherDate ,startDate ,endDate ,currencyId ,currencyName ,editorTotalAmt ,vocherStatus , currentOwnerId, currentOwnerName, createdById, creatorName , rejectionComments, iternaryType, toLocation, fromLocation, travelType, query, queryId, queryAns, workflowToBeFollowed) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [headerId, voucherNumber, accHeadId, accHeadDesc, voucherDate, startDate, endDate, currencyId, currencyName, editorTotalAmt, vocherStatus, currentOwnerId, currentOwnerName, createdById, creatorName , rejectionComments , iternaryType, toLocation, fromLocation, travelType, query ,queryId, queryAns, workflowToBeFollowed]);

                             }
                         }
                         requestRunning = false;
                         if (statusOfVoucher == 'F' || statusOfVoucher == 'R' || statusOfVoucher == 'P' || statusOfVoucher == 'U' || statusOfVoucher == 'D') {
                             displayTravelPastVoucherPage(data.Status);
                         }  else if(statusOfVoucher == 'Q'){
                            displayQueryVoucherPage(data.Status);
                        } else {
                             displayTravelApprovalPage(data.Status);
                         }

                     });

                 } else if (data.Status == 'SUCCESS_NO_DATA') {
                     requestRunning = false;
                     if (statusOfVoucher == 'F' || statusOfVoucher == 'R' || statusOfVoucher == 'P' || statusOfVoucher == 'U' || statusOfVoucher == 'D') {
                         displayTravelPastVoucherPage(data.Status);
                     } else if(statusOfVoucher == 'Q'){
                            displayQueryVoucherPage(data.Status);
                    }else {
                         displayTravelApprovalPage(data.Status);
                     }
                 } else {
                     requestRunning = false;
                     if (statusOfVoucher == 'F' || statusOfVoucher == 'R' || statusOfVoucher == 'P' || statusOfVoucher == 'U' || statusOfVoucher == 'D' ||statusOfVoucher == 'Q') {
                         displayTravelPastVoucherPage(data.Status);
                     } else {
                         displayTravelApprovalPage(data.Status);
                     }
                 }

             },
             error: function(data) {
                 requestRunning = false;
                 if (statusOfVoucher == 'V') {
                     displayTravelPastVoucherPage(data.Status);
                 } else {
                     displayTravelApprovalPage(data.Status);
                 }
             }
         });
     }
 }

 function displayTravelPastVoucherPage(statusOfVoucher) {

     if (statusOfVoucher == "SUCCESS_NO_DATA") {

              var data = "<div style='text-align: center;'>"
                         +"<p  style='text-align: center;'><img src = 'images/noVoucher1.png'></p>"
                         +"<h4><b style='color: darkgrey;'>No expense available.</b></h4>"
                         +"<div>";
              j("#voucherHeader").append(data);

     } else {
                fetchViewForTravelVouchersHeader();
     }

 }

 function displayTravelApprovalPage(statusOfVoucher) {

     if (statusOfVoucher == "SUCCESS_NO_DATA") {
        requestRunning = false;

         j(document).ready(function() {

               var data = "<div style='text-align: center;'>"
                         +"<p  style='text-align: center;'><img src = 'images/noVoucher1.png'></p>"
                         +"<h4><b style='color: darkgrey;'>No expense available.</b></h4>"
                         +"<div>";
              j("#trVoucherHeader").append(data);

         });

     } else {
         requestRunning = false;
         resetImageData();
         fetchViewForTravelApproveVouchersHeader();
     }
 }

 function fetchViewForTravelVouchersHeader() {
     
     mydb.transaction(function(t) {
         t.executeSql('SELECT * FROM TravelHeader;', [],
             function(transaction, result) {
                 if (result != null && result.rows != null) {
                     j('#voucherHeader').empty();
                     for (record = 0; record < result.rows.length; record++) {
                         var row = result.rows.item(record);

                         var pendingAt = "";
                         var statusForEdit = "";

                         if (row.vocherStatus == 'R') {
                             statusForEdit = 'Sent Back';
                         } else if (row.vocherStatus == 'P') {
                             statusForEdit = 'Pending';
                         } else if (row.vocherStatus == 'F') {
                             statusForEdit = 'Paid';
                         }  else if (row.vocherStatus == 'U') {
                             statusForEdit = 'Unpaid';
                             pendingAt = 'Payment Desk'
                         }  else if(row.vocherStatus == 'D'){
                             statusForEdit = 'Draft';
                         }  else if(row.vocherStatus == 'Q'){
                             statusForEdit = 'In Queries';
                         }

                         if(enableDivBasedOnStatus == "A"){
                            pendingAt = row.creatorName;
                         }

                        if(pendingAt == ""){
                            pendingAt = row.currentOwnerName;
                        }

                          var travelType = row.travelType;

                        if (travelType.length > 12) {
                            travelType = travelType.substr(0, 11) + "..";
                        }

                         var defaultCurrency  = window.localStorage.getItem("DefaultCurrencyName");


                         var data =
                             "<div class='col-md-12' onclick='fetchViewForTravelDetails(" + row.headerId+ ");'>" 
                                + "<div class='card shadow'>" 
                                    + "<div class='card-header' style='font-size: 15px;color: #076473;'>"
                                    + "<span style='display: inline;' id = 'isEntitlementExceeded_"+record+"'></span>"
                                          + row.voucherNumber 
                                            +"<h7 style='display: inline;'>&nbsp("+defaultCurrency+")</h7>"
                             + "<label style = 'color:darkorange;float: right;'>" + statusForEdit + "</label></div>" 
                             + "<div class='card-body' style='padding: 10px;''>" 
                                + "<div class='row'>"
                                     + "<div class='col-md-12' style='margin-bottom: 5px;'>"
                                        + "<span style='display: inline-block;'>"
                                            + "<i class='fa fa-user'></i>" 
                                            + "<label><b>&nbsp;" +pendingAt + "</b></label>"
                                         + "</span>" 
                                         + "<span style='display: inline-block; float:right;'>"
                                            + "<i class='fa fa-money'></i>" + "<label>&nbsp;" + row.editorTotalAmt + "</label>" 
                                         + "</span>" 
                                    + "</div>"

                                    + "<div class='col-md-12' style='margin-bottom: 5px;''>"
                                        + "<span style='display: inline-block;'>"
                                            + "<i class='fa fa-plane' aria-hidden='true'></i>" 
                                            + "<label>&nbsp;" + row.fromLocation + ' - ' + row.toLocation + "</label>"
                                         + "</span>" 
                                         + "<span style='display: inline-block; float:right;'>"
                                            + "<label style='float: right;'>" + row.iternaryType + "</label>"
                                         + "</span>" 
                                    + "</div>"

                                    + "<div class='col-md-12' style='margin-bottom: 5px;'>"
                                        + "<span style='display: inline-block;'>"
                                            + "<i class='fa fa-calendar' aria-hidden='true'></i>" 
                                            + "<label><h5>&nbsp;" + row.startDate + ' - ' + row.endDate + "<h5></label>"
                                         + "</span>" 
                                    + "</div>" 
                                + "</div>"
                             + "</div>"
                         + "</div>" 
                     + "</div>" 
                 + "<br>";

                         j('#voucherHeader').append(data);

        if (row.workflowToBeFollowed == 'D') {
            if (window.localStorage.getItem("APPLICATION_VERSION") == false || window.localStorage.getItem("versionNumber") > 12.4) {

                var buttonValue =
                    "<i style='font-size: 12px;color: red;float: left;;margin-top: 5px;' class='fa fa-circle'></i>" + "&nbsp;";

                j('#isEntitlementExceeded_' + record).append(buttonValue);

            }

        }

                     }
                 }

             });

     });
 }

 function fetchViewForTravelDetails(headerId) {

     var jsonToPopulateBEDetails = new Object();
     jsonToPopulateBEDetails["processId"] = '3';
     jsonToPopulateBEDetails["voucherId"] = headerId;
     jsonToPopulateBEDetails["employeeId"] = window.localStorage.getItem("EmployeeId");

     j.ajax({
         url: window.localStorage.getItem("urlPath") + "SyncVoucherDetails",
         type: 'POST',
         dataType: 'json',
         crossDomain: true,
         data: JSON.stringify(jsonToPopulateBEDetails),
         success: function(data) {
             if (data.Status == "Success") {
                 var voucherDetailArray = data.expenseDetails;
                 setDetailsForTravelHeader(headerId, voucherDetailArray);

                 requestRunning = false;
             } else {
                 successMessage = "Error: Oops something is wrong, Please Contact System Administer";
                 requestRunning = false;
             }
         },
         error: function(data) {
             requestRunning = false;
         }
     });

 }


 function setDetailsForTravelHeader(headerId, voucherDetailArray) {

    var headerBackBtn = defaultPagePath + 'backbtnPage.html';
    var pageRef = defaultPagePath + 'voucherDetails.html';
    

    if( !appPageHistory.includes('app/pages/voucherDetails.html')){
            appPageHistory.push(pageRef);
    }

    j(document).ready(function() {
        j('#mainHeader').load(headerBackBtn);
        j('#mainContainer').load(pageRef, function() {
          fetchTravelDetails(headerId,voucherDetailArray);
        });
     });
 }

 function fetchTravelDetails(headerId, voucherDetailArray) {

     try {

         var detailBodyLines = "";

         if (voucherDetailArray != null && voucherDetailArray.length > 0) {
             for (var i = 0; i < voucherDetailArray.length; i++) {
                 var detailArray = new Array();
                 detailArray = voucherDetailArray[i];

                 var accHead = detailArray.accHead;
                 var accCode = detailArray.accCode;
                  var cityTownName = detailArray.cityTownName;


                 if (accHead.length > 15) {
                     accHead = accHead.substr(0, 12) + "..";
                 }
                 if (accCode.length > 15) {
                     accCode = accCode.substr(0, 12) + "..";
                 }

                     detailBody = "<tr>"+ "<td>" + accHead + "</td>" 
                                        + "<td>" + detailArray.cityTownName + "</td>"
                                        + "<td>"+detailArray.noOfDays+"</td>"
                                        + "<td>"+detailArray.approxAmt+"</td>"
                                        + "<td class='accCode displayNone'>" + accCode + "</td>" 
                                        + "<td  class='travelExpDetailId displayNone'>"+detailArray.travelExpDetailId+"</td>" 
                                        + "</tr>"

                 detailBodyLines = detailBodyLines + detailBody;
             }
         }

         setTravelHeaderToDetail(headerId, voucherDetailArray, detailBodyLines)

     } catch (e) {
         console.log(e);
     }

 }

function setTravelHeaderToDetail(headerId, voucherDetailArray, detailBodyLines) {

     mydb.transaction(function(t) {

         t.executeSql('SELECT * FROM TravelHeader where headerId = ' + headerId, [],
             function(transaction, result) {``
                 if (result != null && result.rows != null) {
                     j('#voucherDetailsTab').empty();
                     for (record = 0; record < result.rows.length; record++) {
                         var row = result.rows.item(record);
                        
                             var statusForEdit = "";
                             var pendingAt = "";

                         if (row.vocherStatus == 'R') {
                             statusForEdit = 'Sent Back';
                         } else if (row.vocherStatus == 'P') {
                             statusForEdit = 'Pending';
                         } else if (row.vocherStatus == 'F') {
                             statusForEdit = 'Paid';
                         }  else if (row.vocherStatus == 'U') {
                             statusForEdit = 'Unpaid';
                             pendingAt = 'Payment Desk'
                         }  else if (row.vocherStatus == 'D') {
                             statusForEdit = 'Draft';
                         }  else if (row.vocherStatus == 'Q') {
                             statusForEdit = 'In Queries';
                         }

                        if(enableDivBasedOnStatus == "A"){
                            pendingAt = row.creatorName;
                         }

                          if(pendingAt == ""){
                            pendingAt = row.currentOwnerName;
                        }


                         var buttonValue = "";

                         var defaultCurrency  = window.localStorage.getItem("DefaultCurrencyName");

                         var data =

                            "<div class='col-md-12'>" 
                                + "<div class='card shadow'>" 
                                    + "<div class='card-header' style='font-size: 15px;color: #076473;'>" 
                                        + "<span style='display: inline;' id = 'isEntitlementExceeded_"+record+"'></span>"
                                         + row.voucherNumber 
                                            +"<h7 style='display: inline;'>&nbsp("+defaultCurrency+")</h7>"
                             + "<label style='color:darkorange;float: right;'>" + statusForEdit + "</label></div>" 

                             + "<div class='card-body' style='padding: 10px;''>" 
                                + "<div class='row'>"
                                     + "<div class='col-md-12' style='margin-bottom: 5px;'>"
                                        + "<span style='display: inline-block;'>"
                                            + "<i class='fa fa-user'></i>" 
                                            + "<label style='font-weight: 500;'>&nbsp;" +pendingAt + "</label>"
                                         + "</span>" 
                                         + "<span style='display: inline-block; float:right;'>"
                                            + "<i class='fa fa-money'></i>" + "<label style='font-weight: 500;'>&nbsp;" + row.editorTotalAmt + "</label>" 
                                         + "</span>" 
                                    + "</div>"

                                    + "<div class='col-md-12' style='margin-bottom: 5px;''>"
                                        + "<span style='display: inline-block;'>"
                                            + "<i class='fa fa-plane' aria-hidden='true'></i>" 
                                            + "<label style='font-weight: 500;'>&nbsp;" + row.fromLocation + ' - ' + row.toLocation + "</label>"
                                         + "</span>" 
                                         + "<span style='display: inline-block; float:right;'>"
                                            + "<label style='float: right; font-weight: 500;'>" + row.iternaryType + "</label>"
                                         + "</span>" 
                                    + "</div>"

                                     + "<div class='col-md-12'>"
                                         + "<span style='display: inline-block;'>"
                                            + "<label style='float: right; font-weight: 500;'>" + row.travelType + "</label>"
                                         + "</span>" 
                                    + "</div>" 
                                    + "<div class='col-md-12' style='margin-bottom: 5%;'>"
                                        + "<span style='display: inline-block;'>"
                                            + "<i class='fa fa-calendar' aria-hidden='true'></i>" 
                                            + "<label style='font-weight: 500;'><h5>&nbsp;" + row.startDate + ' - ' + row.endDate + "</h5></label>"
                                         + "</span>"
                                         + "</div>"
                                    
                         + "<div class='card-footer' id = 'buttonsAttached' style='padding-bottom:20px;'>" 

                         + "<div class='table-responsive'>" 
                         + "<table id = 'detailTab' class='table table-bordered tableFixHead' width='100%' cellspacing='0'>" 
                         + "<thead>" 
                         + "<tr role='row'>" 
                         + "<th class='sorting' tabindex='0' aria-controls='dataTable' rowspan='1' colspan='1' aria-label=''>Exp Head" + "</th>" 
                         + "<th class='sorting' tabindex='0' aria-controls='dataTable' rowspan='1' colspan='1' aria-label=''>CityTown" + "</th>" 
                         + "<th class='sorting' tabindex='0' aria-controls='dataTable' rowspan='1' colspan='1' aria-label=''>Unit" + "</th>" 
                         + "<th class='sorting' tabindex='0' aria-controls='dataTable' rowspan='1' colspan='1' aria-label=''>Amt" + "</th>" 
                         + "</tr>" 
                         + "</thead>" 
                         + "<tbody id='detailBodyId'>" + detailBodyLines + "</tbody>" 
                         + "</table>" 
                         + "</div>"
                         + "</div>"


                         + "<div id = 'policies' style='display: none;' onclick='fetchException("+headerId+","+"3)'>"
                         + "<td><i class='fa fa-plus-square-o' style='font-size:18px;color:#337ab7;padding: 6px;'> Policies</i></td>"
                         + "</div>"

                         + "<div id = 'exceptionMsg' style='padding-left: 5px; padding-right:5px;'>"
                         + "</div>"
                        
                         +"</div>"
                         + "</div>" 
                     + "</div>" 
                 + "<br>";

                         j('#voucherDetailsTab').append(data);


                            if (window.localStorage.getItem("APPLICATION_VERSION") == false || window.localStorage.getItem("versionNumber") > 12.4) {
                                if (row.workflowToBeFollowed == 'D') {
                                    var buttonValue =
                                        "<i style='font-size: 12px;color: red;float: left;margin-top: 5px;' class='fa fa-circle'></i>" + "&nbsp;";

                                    j('#isEntitlementExceeded_' + record).append(buttonValue);

                                    document.getElementById('policies').style.display = "block";

                                }

                            }

                         if (statusForEdit == 'Sent Back') {

                             buttonValue =   
                                            "<br>"
                                            +"<div style='margin-left: 2%;'><label>Sent Back Comments :</label>"
                                            +"<br>"
                                            +"<div style='border: 1px;background-color: #eeeeee;padding: 10px 0 10px 10px;box-sizing: border-box;width: 98%;padding-left: 10;'>"+row.rejectionComments+"</div>"
                                            +"<div><br>"
                                          +"<div class='col-md-12' id = 'editButton' style='text-align: center;padding-bottom: 20px;'>"
                                            /*   + "<button type='submit' class='btn btn-primary' onclick='expPrimaryIdTR()'>Edit</button>&nbsp;" */  
                                          +"<button type='submit' id = 'sendForApproveBtn' class='btn btn-primary' onclick='approveTRVoucher(" + row.headerId + ")'>Send For Approval</button>&nbsp;" + "</div>";

                             j('#buttonsAttached').append(buttonValue);
                         }

                         if (statusForEdit == 'Draft') {

                             buttonValue =  
                                           "<div class='col-md-12' id = 'editButton' style='text-align: center;padding-bottom: 20px;'>" 
                                            /* + "<button type='submit' class='btn btn-primary' onclick='expPrimaryIdTR()'>Edit</button>&nbsp;"  */
                                            +"<button type='submit' id = 'sendForApproveBtn' class='btn btn-primary' onclick='approveTRVoucher(" + row.headerId + ")'>Send For Approval</button>&nbsp;" + "</div>";

                             j('#buttonsAttached').append(buttonValue);
                         }

                         if(enableDivBasedOnStatus == 'A'){
                             buttonValue =  "<div class='col-md-12' style='text-align: center; padding-bottom: 20px;'>"
                                            +"<button type='submit' id = 'approveBtn' class='btn btn-primary' onclick='approveTRVoucher("+row.headerId+")'>Approve</button>&nbsp;"
                                            +"<button type='button' id = 'RejectedBtn' class='btn btn-primary' data-toggle='modal' data-id="+row.headerId+"_3"+" data-target='#myModal'>Send Back</button>"
                                            +"</div>";

                             j('#buttonsAttached').append(buttonValue);

                        }

                        if(row.vocherStatus == 'R' || row.vocherStatus == 'D'){

                            j("#detailBodyId tr").click(function() {
                                 if (j(this).hasClass("selected")) {
                                     j(this).removeClass('selected');
                                     
                                 } else {
                                     j(this).addClass('selected');
                                     
                                 }
                            });
                        }

                           if(statusForEdit =='In Queries' && enableDivBasedOnStatus == 'A'){
                             document.getElementById("RejectedBtn").disabled =true;
                            document.getElementById("approveBtn").disabled =true;
                            }

                        var empId = window.localStorage.getItem("EmployeeId");

                        var len = appPageHistory.length;
                        var pg = appPageHistory[len - 3];

                        if(statusForEdit == 'In Queries'  && (empId==row.createdById) && pg !='app/pages/TRTSAllViews.html'){
                            
                            var ids = row.headerId+'&'+row.queryId;
                       
                        if(row.queryAns == "" || row.queryAns=="undefined" ||row.queryAns=="Null"){
                                buttonValue =   
                                            "<br>"
                                            +"<div style='margin-left: 2%;'><label>Query Asked To Me:</label>"
                                            +"<br>"
                                            +"<div style='border: 1px;background-color: #eeeeee;padding: 10px 0 10px 10px;box-sizing: border-box;width: 98%;padding-left: 10;'>"+row.query+"</div>"
                                            +"<div><br>"
                                            +"<div class='col-md-12' style='text-align: center;'>"
                                            +"<button type='button' id = 'QueryTrBtn' class='btn btn-primary' data-toggle='modal' data-id="+ids+" data-target='#myModalTrQuery'>Reply</button>"
                                            +"</div>"
                                            ;
                             }else{
                                 buttonValue = 
                                            "</br>" 
                                            +"<div style='margin-left: 2%;'><label>Query Asked To Me:</label>"
                                            +"<br>"
                                            +"<div style='border: 1px;background-color: #eeeeee;padding: 10px 0 10px 10px;box-sizing: border-box;width: 98%;padding-left: 10;'>"+row.query+"</div><br>"
                                            +"<div style='margin-right: 2%;'><label>Reply:</label>"
                                            +"<div style='border: 1px;background-color: #eeeeee;padding: 10px 0 10px 10px;box-sizing: border-box;width: 98%;padding-left: 10;'>"+row.queryAns+"</div>"
                                            +"<div><br>"
                                            +"<div class='col-md-12' style='text-align: center;'>"
                                            +"<button type='button' id = 'QueryTrBtn' class='btn btn-primary' data-toggle='modal' data-id="+ids+" data-target='#myModalTrQuery'>Edit</button>"
                                            +"</div>"
                                            ;
                             }

                             j('#buttonsAttached').append(buttonValue);
                            
                            }

                     }
                 }

             });
     });

 }

  // *************************************** Travel Request Header / Details -- End *****************************************************//

// ---------------------------------------------------  Profile -- End -----------------------------------------------------  //
function updateProfilePicture(imageData){
     try {
         var empId = window.localStorage.getItem("EmployeeId");

         if (mydb) {

             if (imageData != "") {

                 var jsonToUpdateProfileImg = new Object();
                 jsonToUpdateProfileImg["employeeId"] = empId;
                 jsonToUpdateProfileImg["profileData"] = imageData;

                 mydb.transaction(function(t) {
                     t.executeSql("UPDATE profileMst set profileAttachment ='"+imageData+ "'  where empId = " + empId + ";");
                     updateEmpProfile(jsonToUpdateProfileImg);
                 });
             }
         } else {
             alert(window.lang.translate('Database not found, your browser does not support web sql!'));
         }
     } catch (e) {
         console.log(e);
     }
}

 function updateEmpProfile(jsonToUpdateProfileImg) {

     j.ajax({
         url: window.localStorage.getItem("urlPath") + "UpdateProfilePicture",
         type: 'POST',
         dataType: 'json',
         crossDomain: true,
         data: JSON.stringify(jsonToUpdateProfileImg),
         success: function(data) {
            
             if (data.Status == "Success") {
                alert("Profile Picture uploaded successfully");

                 requestRunning = false;
             } else {
                 successMessage = "Error: Oops something is wrong, Please Contact System Administer";
                 requestRunning = false;
             }
         },
         error: function(data) {
             requestRunning = false;
         }
     });

 }

 function displayEmpAdvForTS() {
    var headerBackBtn = defaultPagePath + 'backbtnPage.html';
    var pageRef = defaultPagePath + "travelSettlementTable.html";
    j(document).ready(function() {
        j('#mainHeader').load(headerBackBtn);
    });
    document.getElementById('TS').style.display = "none";
    document.getElementById('EA').style.display = "";

    if(document.getElementById('helpimage') != null){
        document.getElementById('helpimage').style.display = "none";
    }
    
    appPageHistory.push(pageRef);

}

function submitTSWithEA(){

            var jsonTravelSettlementDetailsArr = [];
        var travelSettleExpDetailsArr = [];
        minExpenseClaimDate = new Object;
         if(validateTravelSettelment() == true){
            if (j("#source tr.selected").hasClass("selected")) {
            j("#source tr.selected").each(function(index, row) {
                if (requestRunning) {
                    return;
                }
                var travelSettleDetailId = j(this).find('td.tsExpId').text();
                var jsonFindTS = new Object();
                var expDate = j(this).find('td.expDate1').text();

                var expenseDate = expDate;

                jsonFindTS["expenseDate"] = expenseDate;
                jsonFindTS["travelRequestId"] = j(this).find('td.travelRequestId').text();
                jsonFindTS["accountCodeId"] = j(this).find('td.accountCodeId').text();
                jsonFindTS["expenseId"] = j(this).find('td.expNameId').text();
                jsonFindTS["ExpenseName"] = j(this).find('td.expName').text();
                jsonFindTS["travelModeId"] = j(this).find('td.modeId').text();
                jsonFindTS["travelCategoryId"] = j(this).find('td.categoryId').text();
                jsonFindTS["cityTownId"] = j(this).find('td.fromcityTownId').text();
                jsonFindTS["isModeCategory"] = j(this).find('td.isModeCategory').text();
                jsonFindTS["narration"] = j(this).find('td.expNarration1').text();
                jsonFindTS["units"] = j(this).find('td.expUnit').text();
                jsonFindTS["amount"] = j(this).find('td.expAmt1').text();
                jsonFindTS["currencyId"] = j(this).find('td.currencyId').text();
                jsonFindTS["perUnitStatus"] = j(this).find('td.isEntitlementExceeded').text();
                var dataURL = j(this).find('td.tsExpAttachment').text();
                //For IOS image save
                var data = dataURL.replace(/data:image\/(png|jpg|jpeg);base64,/, '');

                //For Android image save
                //var data = dataURL.replace(/data:base64,/, '');

                jsonFindTS["imageAttach"] = data;

                jsonTravelSettlementDetailsArr.push(jsonFindTS);

                travelSettleExpDetailsArr.push(travelSettleDetailId);
            });
                if (travelSettleExpDetailsArr.length > 0) {
                saveTravelSettle(jsonTravelSettlementDetailsArr, travelSettleExpDetailsArr,"N");
                }
                } else {
                requestRunning = false;
                alert(window.lang.translate('Tap and select Expenses to synch with server.'));
                }
        }else{
            if (exceptionMessage == '') {
                exceptionMessage = "Selected expenses should be mapped under Single Travel Request."
                requestRunning = false;
                alert(exceptionMessage);
            }
        }
}

 function validateTravelSettelment() {
     var map = new Map();

     if (j("#source tr.selected").hasClass("selected")) {
         j("#source tr.selected").each(function(index, row) {

             var currentTravelReqID = j(this).find('td.travelRequestId').text();

             if (map.has(currentTravelReqID)) {
                 var value = map.get(currentTravelReqID);

                 map.set(currentTravelReqID, currentTravelReqID);
             } else {
                 map.set(currentTravelReqID, currentTravelReqID);
             }

         });
     }
     if (map.size == 1) {
         return true;
     } else {
         return false;
     }
 }

 /********************    Kunal Coding For Approve Voucher start   *************************/

function fetchViewForTravelApproveVouchersHeader() {
     
     
     mydb.transaction(function(t) {
         t.executeSql('SELECT * FROM TravelHeader;', [],
             function(transaction, result) {
                 if (result != null && result.rows != null) {
                     j('#voucherHeader').empty();
                     for (record = 0; record < result.rows.length; record++) {
                         var row = result.rows.item(record);

                         var pendingAt = "";
                         var statusForEdit = "";

                         if (row.vocherStatus == 'R') {
                             statusForEdit = 'Sent Back';
                         } else if (row.vocherStatus == 'P') {
                             statusForEdit = 'Pending';
                         } else if (row.vocherStatus == 'F') {
                             statusForEdit = 'Paid';
                         }  else if (row.vocherStatus == 'U') {
                             statusForEdit = 'Unpaid';
                             pendingAt = 'Payment Desk'
                         }  else if(row.vocherStatus == 'D'){
                             statusForEdit = 'Draft';
                         }  else if(row.vocherStatus == 'Q'){
                             statusForEdit = 'In Queries';
                         }

                         if(enableDivBasedOnStatus == "A"){
                            pendingAt = row.creatorName;
                         }

                        if(pendingAt == ""){
                            pendingAt = row.currentOwnerName;
                        }

                          var travelType = row.travelType;

                        if (travelType.length > 12) {
                            travelType = travelType.substr(0, 11) + "..";
                        }

                         var defaultCurrency  = window.localStorage.getItem("DefaultCurrencyName");

                         var data =
                             "<div class='col-md-12' onclick='fetchViewForTravelDetails(" + row.headerId + ");'>" 
                                + "<div class='card shadow'>" 
                                    + "<div class='card-header' style='font-size: 15px;color: #076473;'>"
                                    + "<span style='display: inline;' id = 'isEntitlementExceededTR_"+record+"'></span>"
                                         + row.voucherNumber 
                                            +"<h7 style='display: inline;'>&nbsp("+defaultCurrency+")</h7>"
                             + "<label style = 'color:darkorange;float: right;'>" + statusForEdit + "</label></div>" 
                             + "<div class='card-body' style='padding: 10px;''>" 
                                + "<div class='row'>"
                                     + "<div class='col-md-12' style='margin-bottom: 5px;'>"
                                        + "<span style='display: inline-block;'>"
                                            + "<i class='fa fa-user'></i>" 
                                            + "<label><b>&nbsp;" +pendingAt + "</b></label>"
                                         + "</span>" 
                                         + "<span style='display: inline-block; float:right;'>"
                                            + "<i class='fa fa-money'></i>" + "<label>&nbsp;" + row.editorTotalAmt + "</label>" 
                                         + "</span>" 
                                    + "</div>"

                                    + "<div class='col-md-12' style='margin-bottom: 5px;''>"
                                        + "<span style='display: inline-block;'>"
                                            + "<i class='fa fa-plane' aria-hidden='true'></i>" 
                                            + "<label>&nbsp;" + row.fromLocation + ' - ' + row.toLocation + "</label>"
                                         + "</span>" 
                                         + "<span style='display: inline-block; float:right;'>"
                                            + "<label style='float: right;'>" + row.iternaryType + "</label>"
                                         + "</span>" 
                                    + "</div>"

                                    + "<div class='col-md-12' style='margin-bottom: 5px;'>"
                                        + "<span style='display: inline-block;'>"
                                            + "<i class='fa fa-calendar' aria-hidden='true'></i>" 
                                            + "<label><h5>&nbsp;" + row.startDate + ' - ' + row.endDate + "<h5></label>"
                                         + "</span>" 
                                    + "</div>" 
                                + "</div>"
                             + "</div>"
                         + "</div>" 
                     + "</div>" 
                 + "<br>";

                         j('#trVoucherHeader').append(data);

                         if (row.workflowToBeFollowed == 'D') {
                            if (window.localStorage.getItem("APPLICATION_VERSION") == false || window.localStorage.getItem("versionNumber") > 12.4) {

                                var buttonValue =
                                    "<i style='font-size: 12px;color: red;float: left;;margin-top: 5px;' class='fa fa-circle'></i>" + "&nbsp;";

                                j('#isEntitlementExceededTR_' + record).append(buttonValue);

                            }

                        }

                     }
                 }

             });

     });
 }


 function approveTRVoucher(travelRequestId){

    var headerBackBtn = defaultPagePath + 'backbtnPage.html';
    var pageRefSuccess = defaultPagePath + 'success.html';

    var jsonToBeSendForApproval = new Object();
    jsonToBeSendForApproval["processId"] = '3';
    jsonToBeSendForApproval["headerList"] = travelRequestId;
    jsonToBeSendForApproval["employeeId"] = window.localStorage.getItem("EmployeeId");
    jsonToBeSendForApproval["buttonStatus"] = "A";
    jsonToBeSendForApproval["rejectionComment"] = "";

     
    j('#loading_Cat').show();

    j.ajax({
        url: window.localStorage.getItem("urlPath") + "MobileApproveRejectService",
         type: 'POST',
         dataType: 'json',
         crossDomain: true,
         data: JSON.stringify(jsonToBeSendForApproval),
         success: function(data) {

             if (data.Status == "Success") {
                j('#loading_Cat').hide();
                var travelRequestArray = data.travelRequestDetails;

                    mydb.transaction(function(t) {
                        if (travelRequestArray != null && travelRequestArray.length > 0) {
                            for (var i = 0; i < travelRequestArray.length; i++) {
                                var headArray = new Array();
                                headArray = travelRequestArray[i];
                                //console.log("headArray : "+headArray);

                                var approvalMsg = headArray.message;
                                successMessage = approvalMsg;

                            }
                        }

                        if(successMessage != null && successMessage != ""){
                            j('#loading_Cat').hide();
                            j('#mainHeader').load(headerBackBtn);
                            j('#mainContainer').load(pageRefSuccess);
                        }
                        requestRunning = false;             
                    });

             } else {
                 j('#loading_Cat').hide();
                 successMessage = "Error: Oops something is wrong, Please Contact System Administer";
                 requestRunning = false;
             }
         },
         error: function(data) {
            j('#loading_Cat').hide();
            successMessage = "Error: Oops something is wrong, Please Contact System Administer";
            requestRunning = false;
         }
     });

 }

 function fetchCountForTravelMyApproval(statusOfVoucher) {

     var jsonSentToSync = new Object();
     jsonSentToSync["employeeId"] = window.localStorage.getItem("EmployeeId");
     jsonSentToSync["processId"] = "";
     jsonSentToSync["vocherStatus"] = statusOfVoucher;

     j.ajax({
         url: window.localStorage.getItem("urlPath") + "FetchCount",
         type: 'POST',
         dataType: 'json',
         crossDomain: true,
         data: JSON.stringify(jsonSentToSync),
         success: function(data) {

             if (data.Status == "Success") {

                 var countForVouchers = data.VoucherCount.toString();


                if(statusOfVoucher == 'A' && document.getElementById('travelCount') != null){
                 document.getElementById("travelCount").innerHTML = countForVouchers;
                }

                requestRunning = false;
             } else {
                 requestRunning = false;
             }
         },
         error: function(data) {
             requestRunning = false;
         }
     });

 }

 /********************    Kunal Coding For Approve Voucher end   *************************/

/**********************  Tejashree  Start ************************/


   function displayQueryPage(statusOfVoucher) {
     if (statusOfVoucher == "SUCCESS_NO_DATA") {
              var data = "<div style='text-align: center;'>"
                         +"<p  style='text-align: center;'><img src = 'images/noVoucher1.png'></p>"
                         +"<h4><b style='color: darkgrey;'>No expense available.</b></h4>"
                         +"<div>";
              j("#beQueryData").append(data);

     } else {
                fetchViewForQueryVouchersHeader();
     }
 }


 function fetchViewForQueryVouchersHeader() {

     mydb.transaction(function(t) {
         t.executeSql('SELECT * FROM BEHeader;', [],
             function(transaction, result) {
                 if (result != null && result.rows != null) {
                     j('#beQueryData').empty();
                     for (record = 0; record < result.rows.length; record++) {
                         var row = result.rows.item(record);

                         var statusForEdit = "";
                         var pendingAt = "";

                         if (row.vocherStatus == 'R') {
                             statusForEdit = 'Sent Back';
                         } else if (row.vocherStatus == 'P') {
                             statusForEdit = 'Pending';
                         } else if (row.vocherStatus == 'F') {
                             statusForEdit = 'Paid';
                         }  else if (row.vocherStatus == 'U') {
                             statusForEdit = 'Unpaid';
                             pendingAt = 'Payment Desk'
                         }  else if(row.vocherStatus == 'D'){
                             statusForEdit = 'Draft';
                         }  else if(row.vocherStatus == 'Q'){
                             statusForEdit = 'In Queries';
                         }

                         if(enableDivBasedOnStatus == "A"){
                            pendingAt = row.creatorName;
                         }

                        if(pendingAt == ""){
                            pendingAt = row.currentOwnerName;
                        }


                         var defaultCurrency  = window.localStorage.getItem("DefaultCurrencyName");

                         var data =
                             "<div class='col-md-12' onclick='fetchViewForVoucherDetails(" + row.busExpHeaderId + ");'>" 
                             + "<div class='card shadow'>" 
                             + "<div class='card-header' style='font-size: 15px;color: #076473;'>"
                             + "<span style='display: inline;' id = 'isEntitlementExceeded_"+record+"'></span>"
                             + row.busExpNumber 
                                + "<h7 style='display: inline;'>&nbsp("+defaultCurrency+")</h7>"
                                + "<label style = 'color:darkorange;float: right;'>" + statusForEdit + "</label></div>" 
                                 + "<div class='card-body' style='padding: 10px;'>" 
                                        + "<div class='row'>" 
                                            + "<div class='col-md-12' style='margin-bottom: 5px;'>"
                                                + "<label>" + row.accHeadDesc + "</label>"    
                                            + "</div>" 
                                        + "</div>" 
                                        + "<div class='row'>"
                                            + "<div class='col-md-12' style='margin-bottom: 5px;'>"
                                                + "<i class='fa fa-user'></i>" 
                                                + "<label style='font-weight: 500;'>&nbsp;" +pendingAt + "</label>"
                                                + "<span style='display: inline; float: right;'>"
                                                    + "<i class='fa fa-money'></i>" 
                                                    + "<label>&nbsp;" 
                                                    + row.editorTotalAmt 
                                                    + "</label>" 
                                                + "</span>"
                                            + "</div>" 
                                         + "</div>" 
                                         + "<div class='row'>" 
                                             + "<div class='col-md-12' style='margin-bottom: 5px;'>"
                                                + "<span style='display: inline-block;'>"
                                                    + "<i class='fa fa-calendar' aria-hidden='true'></i>" 
                                                    + "<label><h5>&nbsp;" + row.startDate + ' - ' + row.endDate + "<h5></label>"
                                                 + "</span>" 
                                            + "</div>"
                                         + "</div>" 
                                 + "</div>" 
                              + "</div>" 
                            + "<br>";

                         j('#beQueryData').append(data);


        if (row.workflowToBeFollowed == 'D') {
            if (window.localStorage.getItem("APPLICATION_VERSION") == false || window.localStorage.getItem("versionNumber") > 12.4) {

                var buttonValue =
                    "<i style='font-size: 12px;color: red;float: left;;margin-top: 5px;' class='fa fa-circle'></i>" + "&nbsp;";

                j('#isEntitlementExceeded_' + record).append(buttonValue);

            }

        }

                     }
                 }

             });

     });
 }

//********************************Query TR Answer COde Added****************************************************//

function queryTrAnwser(){
    $('.modal-backdrop').remove();
    var headerBackBtn = defaultPagePath + 'backbtnPage.html';
    var pageRefSuccess = defaultPagePath + 'success.html';
    var querTRId = j("#QueryTrBtn").data('id');
    var trQueryId = querTRId.split("&");
    var travelrequestId = trQueryId[0];
    var queryId = trQueryId[1];
    var comment = j.trim(j("#queryTrRply").val());
    var file = "";

    if(comment != ""){

        var jsonToTrSendForQuery = new Object();
        jsonToTrSendForQuery["processId"] = '3';
        jsonToTrSendForQuery["travelrequestId"] = travelrequestId;
        jsonToTrSendForQuery["queryId"] = queryId;
        jsonToTrSendForQuery["employeeId"] = window.localStorage.getItem("EmployeeId");
        jsonToTrSendForQuery["queryAnswer"] = comment;

         if (fileTempGalleryTRQ == undefined || fileTempGalleryTRQ == "") {

         } else {
             file = fileTempGalleryTRQ;
         }

         if (fileTempCameraTRQ == undefined || fileTempCameraTRQ == "") {

         } else {
             file = fileTempCameraTRQ;
         }

         if(file != ""){
            file = file.replace(/data:image\/(png|jpg|jpeg);base64,/, '');
         }

        jsonToTrSendForQuery["imageData"] = file;


        j('#loading_Cat').show();

        j.ajax({
            url: window.localStorage.getItem("urlPath") + "SaveQueryFromMobile",
            type: 'POST',
            dataType: 'json',
            crossDomain: true,
            data: JSON.stringify(jsonToTrSendForQuery),
            success: function(data) {
              
                if (data.Status == "Success") { 
                   
                     successMessage = "Query Answered Successfully";
                     
                     requestRunning = false;
                     resetImageData();
                     j('#loading_Cat').hide();
                     j('#mainHeader').load(headerBackBtn);
                     j('#mainContainer').load(pageRefSuccess);
                } else {
                     j('#loading_Cat').hide();
                    successMessage = "Error: Oops something is wrong, Please Contact System Administer";
                    requestRunning = false;
                }
            },
            error: function(data) {
                 j('#loading_Cat').hide();
                requestRunning = false;
            }
        });
    }else{
        alert("Please enter Query Answer");
    }
}

//********************************Query TS Answer COde Added****************************************************//

function queryTsAnwser(){
    $('.modal-backdrop').remove();
    var headerBackBtn = defaultPagePath + 'backbtnPage.html';
    var pageRefSuccess = defaultPagePath + 'success.html';
    var querTSId = j("#QueryTsBtn").data('id');
    var tsQueryId = querTSId.split("&");
    var travelSettleId = tsQueryId[0];
    var queryId = tsQueryId[1];
    var comment = j.trim(j("#queryTsRply").val());
    var file = "";

    if(comment != ""){

        var jsonToTsSendForQuery = new Object();
        jsonToTsSendForQuery["processId"] = '5';
        jsonToTsSendForQuery["travelSettleId"] = travelSettleId;
        jsonToTsSendForQuery["queryId"] = queryId;
        jsonToTsSendForQuery["employeeId"] = window.localStorage.getItem("EmployeeId");
        jsonToTsSendForQuery["queryAnswer"] = comment;

         if (fileTempCameraTSQ == undefined || fileTempCameraTSQ == "") {

         } else {
             file = fileTempCameraTSQ;
         }

         if (fileTempGalleryTSQ == undefined || fileTempGalleryTSQ == "") {

         } else {
             file = fileTempGalleryTSQ;
         }

         if(file != ""){
            file = file.replace(/data:image\/(png|jpg|jpeg);base64,/, '');
         }

        jsonToTsSendForQuery["imageData"] = file;


        j('#loading_Cat').show();
       
        j.ajax({
          
            url: window.localStorage.getItem("urlPath") + "SaveQueryFromMobile",
            type: 'POST',
            dataType: 'json',
            crossDomain: true,
            data: JSON.stringify(jsonToTsSendForQuery),
            success: function(data) {
             
                if (data.Status == "Success") { 
                   
                     successMessage = "Query Answered Successfully";
                     
                     requestRunning = false;
                     resetImageData();
                     j('#loading_Cat').hide();
                     j('#mainHeader').load(headerBackBtn);
                     j('#mainContainer').load(pageRefSuccess);
                } else {
                     j('#loading_Cat').hide();
                    successMessage = "Error: Oops something is wrong, Please Contact System Administer";
                    requestRunning = false;
                }
            },
            error: function(data) {
                 j('#loading_Cat').hide();
                requestRunning = false;
            }
        });
    }else{
        alert("Please enter Query Answer");
    }
}

  function displayQueryVoucherPage(statusOfVoucher) {
     if (statusOfVoucher == "SUCCESS_NO_DATA") {
        j('#trQueryData').empty();
              var data = "<div style='text-align: center;'>"
                         +"<p  style='text-align: center;'><img src = 'images/noVoucher1.png'></p>"
                         +"<h4><b style='color: darkgrey;'>No expense available.</b></h4>"
                         +"<div>";
              j("#trQueryData").append(data);

     } else {
                fetchViewForQueryTravelVouchersHeader();
     }

 }

function fetchViewForQueryTravelVouchersHeader() {
     mydb.transaction(function(t) {
         t.executeSql('SELECT * FROM TravelHeader;', [],
             function(transaction, result) {
                 if (result != null && result.rows != null) {
                     j('#trQueryData').empty();
                     for (record = 0; record < result.rows.length; record++) {
                         var row = result.rows.item(record);

                        var statusForEdit = "";
                        var pendingAt = "";

                         if (row.vocherStatus == 'R') {
                             statusForEdit = 'Sent Back';
                         } else if (row.vocherStatus == 'P') {
                             statusForEdit = 'Pending';
                         } else if (row.vocherStatus == 'F') {
                             statusForEdit = 'Paid';
                         }  else if (row.vocherStatus == 'U') {
                             statusForEdit = 'Unpaid';
                             pendingAt = 'Payment Desk'
                         }  else if(row.vocherStatus == 'D'){
                             statusForEdit = 'Draft';
                         }  else if(row.vocherStatus == 'Q'){
                             statusForEdit = 'In Queries';
                         }

                         if(enableDivBasedOnStatus == "A"){
                            pendingAt = row.creatorName;
                         }

                        if(pendingAt == ""){
                            pendingAt = row.currentOwnerName;
                        }

                          var travelType = row.travelType;

                        if (travelType.length > 12) {
                            travelType = travelType.substr(0, 11) + "..";
                        }

                         var defaultCurrency  = window.localStorage.getItem("DefaultCurrencyName");

                         var data =
                             "<div class='col-md-12' onclick='fetchViewForTravelDetails(" + row.headerId + ");'>" 
                                + "<div class='card shadow'>" 
                                    + "<div class='card-header' style='font-size: 15px;color: #076473;'>"
                                    + "<span style='display: inline;' id = 'trEntitlementExceeded_"+record+"'></span>"
                                         + row.voucherNumber 
                                            +"<h7 style='display: inline;'>&nbsp("+defaultCurrency+")</h7>"
                             + "<label style = 'color:darkorange;float: right;'>" + statusForEdit + "</label></div>" 
                             + "<div class='card-body' style='padding: 10px;''>" 
                                + "<div class='row'>"
                                     + "<div class='col-md-12' style='margin-bottom: 5px;'>"
                                        + "<span style='display: inline-block;'>"
                                            + "<i class='fa fa-user'></i>" 
                                            + "<label><b>&nbsp;" +pendingAt + "</b></label>"
                                         + "</span>" 
                                         + "<span style='display: inline-block; float:right;'>"
                                            + "<i class='fa fa-money'></i>" + "<label>&nbsp;" + row.editorTotalAmt + "</label>" 
                                         + "</span>" 
                                    + "</div>"

                                    + "<div class='col-md-12' style='margin-bottom: 5px;''>"
                                        + "<span style='display: inline-block;'>"
                                            + "<i class='fa fa-plane' aria-hidden='true'></i>" 
                                            + "<label>&nbsp;" + row.fromLocation + ' - ' + row.toLocation + "</label>"
                                         + "</span>" 
                                         + "<span style='display: inline-block; float:right;'>"
                                            + "<label style='float: right;'>" + row.iternaryType + "</label>"
                                         + "</span>" 
                                    + "</div>"

                                    + "<div class='col-md-12' style='margin-bottom: 5px;'>"
                                        + "<span style='display: inline-block;'>"
                                            + "<i class='fa fa-calendar' aria-hidden='true'></i>" 
                                            + "<label><h5>&nbsp;" + row.startDate + ' - ' + row.endDate + "<h5></label>"
                                         + "</span>" 
                                    + "</div>" 
                                + "</div>"
                             + "</div>"
                         + "</div>" 
                     + "</div>" 
                 + "<br>";
                    
                         j('#trQueryData').append(data);

                if (row.workflowToBeFollowed == 'D') {
                    if (window.localStorage.getItem("APPLICATION_VERSION") == false || window.localStorage.getItem("versionNumber") > 12.4) {

                        var buttonValue =
                            "<i style='font-size: 12px;color: red;float: left;;margin-top: 5px;' class='fa fa-circle'></i>" + "&nbsp;";

                        j('#trEntitlementExceeded_'+record).append(buttonValue);

                    }

                }

                     }
                 }

             });

     });
 }

function fetchException(headerId,processId){
  var headerBackBtn = defaultPagePath + 'backbtnPage.html';
    var pageRefSuccess = defaultPagePath + 'success.html';

    var jsonToBeSend = new Object();

    jsonToBeSend["processId"] = processId;
    jsonToBeSend["voucherId"] = headerId;
    jsonToBeSend["employeeId"] = window.localStorage.getItem("EmployeeId");


 var expContent = document.getElementById("exceptionMsg").textContent;
  $( "#exceptionMsg" ).toggle();

 if(expContent == ""){
    j.ajax({
        url: window.localStorage.getItem("urlPath") + "FetchExceptionMessages",
         type: 'POST',
         dataType: 'json',
         crossDomain: true,
         data: JSON.stringify(jsonToBeSend),
         success: function(data) {

             if (data.Status == "Success") {

                    var entitlementExceeded = data.exceptionMessage;


                    $( "#exceptionMsg" ).toggle();

                    var buttonValue = "<div style='border: 1px;background-color: #eeeeee;padding: 10px 0 10px 10px;box-sizing: border-box;width: 100%;'><h5>"+entitlementExceeded+"</h5></div>"

                    j('#exceptionMsg').append(buttonValue);
                   
                requestRunning = false;

             } else {
                 j('#loading_Cat').hide();
                 successMessage = "Error: Oops something is wrong, Please Contact System Administer";
                 requestRunning = false;
             }
         },
         error: function(data) {
            j('#loading_Cat').hide();
            successMessage = "Error: Oops something is wrong, Please Contact System Administer";
            requestRunning = false;
             }
         });

    }
}

//------------------------------  Advance For Draft and SendBack -- Start ----------------------------------------//
function approveVoucherWithAdv(busExpHeaderId,vocherStatus){

    if (window.localStorage.getItem("EaInMobile") == "true" && window.localStorage.getItem("versionNumber") > 12.4) {
     var headerBackBtn = defaultPagePath + 'backbtnPage.html';
     var pageRef = defaultPagePath + 'BEadvanceSettelmentPage.html';
     j(document).ready(function() {
         j('#mainHeader').load(headerBackBtn);
        j('#mainContainer').load(pageRef, function() {
         loadDateForAdvance(busExpHeaderId,vocherStatus);
        });
     });
     appPageHistory.push(pageRef);
     }else{
        approveVoucher(busExpHeaderId);
     }
}


function loadDateForAdvance(busExpHeaderId,vocherStatus){
     var jsonSentToSync = new Object();
     jsonSentToSync["employeeId"] = window.localStorage.getItem("EmployeeId");
     jsonSentToSync["processId"] = "1";
     if(vocherStatus == 1){
        jsonSentToSync["vocherStatus"] = 'D';
    }else{
        jsonSentToSync["vocherStatus"] = 'R';
    }
     
     jsonSentToSync["versionNumber"] = window.localStorage.getItem("versionNumber");

     if (mydb) {
         j.ajax({
             url: window.localStorage.getItem("urlPath") + "SyncVoucherHeaders",
             type: 'POST',
             dataType: 'json',
             crossDomain: true,
             data: JSON.stringify(jsonSentToSync),
             success: function(data) {

                 if (data.Status == 'Success') {
                     
                     var claimExpArray = data.expenseDetails;

                     mydb.transaction(function(t) {
                         if (claimExpArray != null && claimExpArray.length > 0) {
                             for (var i = 0; i < claimExpArray.length; i++) {
                                 var headArray = new Array();
                                 headArray = claimExpArray[i];

                                 if(busExpHeaderId == headArray.busExpHeaderId)
                                 {
                                 var voucherNumber = headArray.voucherNumber;
                                 var editorTotalAmt = headArray.editorTotalAmtcurrencyName;
                                 var empAdvArray = headArray.EmpAdvArray;

                                 document.getElementById("totalAmount").value = editorTotalAmt;
                                 document.getElementById("busExpHeaderId").value = busExpHeaderId;

                                if (empAdvArray != null && empAdvArray.length > 0) {
                                    var advAmount = 0;
                                for (var i = 0; i < empAdvArray.length; i++) {
                                     var advArray = new Array();
                                     advArray = empAdvArray[i];
                                     advAmount = parseFloat(advAmount) + parseFloat(advArray.Amount);
                                     
                                    }

                                    if(editorTotalAmt < advAmount){
                                         document.getElementById("recoverFromEmp").value = parseFloat(advAmount) - parseFloat(editorTotalAmt);
                                     }else{
                                         document.getElementById("refundToEmp").value = parseFloat(editorTotalAmt) - parseFloat(advAmount);

                                     }

                                    document.getElementById("isAdvAvailable").value = 'Y';
                                     document.getElementById("availableAdvAmount").value = advArray.Amount;
                                     document.getElementById("unsetAdvAmount").value = advArray.Amount;

                                }else{
                                      document.getElementById("isAdvAvailable").value = 'N';
                                     document.getElementById("availableAdvAmount").value = 0;
                                    document.getElementById("unsetAdvAmount").value = 0;
                                }
                                 
                                 }
                                 
                             }
                         }
                         requestRunning = false;

                     });

                 }

             },
             error: function(data) {
                 requestRunning = false;
             }
         });
     }
 }

 function hideEmployeeAdvanceSB() {
    if (window.localStorage.getItem("EaInMobile") == "true") {
        setEmpAdvForSB();
        document.getElementById('helpimage').style.display = "";
    }
}


function setEmpAdvForSB(){

    mainTable = j('<table></table>').attr({
         id: "abc",
         class: ["table", "table-striped", "table-bordered"].join(' ')
     });
     table1 = j('<table></table>').attr({
         class: ["table", "table1", "table-striped", "table-bordered"].join(' ')
     }).appendTo(mainTable);
     var rowThead = j("<thead></thead>").appendTo(table1);
     var rowTh = j('<tr></tr>').attr({
         class: ["test"].join(' ')
     }).appendTo(rowThead);

     j('<th lang=\'en\' ></th>').text("Voucher No.").appendTo(rowTh);
     //j('<th></th>').text("Title").appendTo(rowTh);
     j('<th lang=\'en\' ></th>').text("Amount").appendTo(rowTh);

     table2 = j('<table></table>').attr({
         id: "source1",
         class: ["table", "table-striped", "table-bordered"].join(' ')
     }).appendTo(mainTable);
     var rowThead1 = j("<thead></thead>").appendTo(table2);

     mydb.transaction(function(t) {
         var headerOprationBtn;
         t.executeSql('SELECT * FROM employeeAdvanceDetails;', [],
             function(transaction, result) {
                 if (result != null && result.rows != null) {

                     for (var i = 0; i < result.rows.length; i++) {

                         var row = result.rows.item(i);

                         var rowss = j('<tr></tr>').attr({
                             class: ["test"].join(' ')
                         }).appendTo(rowThead1);

                         j('<td></td>').attr({
                             class: ["empAdvID", "displayNone"].join(' ')
                         }).text(row.empAdvID).appendTo(rowss);
                         j('<td></td>').attr({
                             class: ["emplAdvVoucherNo"].join(' ')
                         }).text(row.emplAdvVoucherNo).appendTo(rowss);
                         j('<td></td>').attr({
                             class: ["empAdvTitle", "displayNone"].join(' ')
                         }).text(row.empAdvTitle).appendTo(rowss);
                         j('<td></td>').attr({
                             class: ["Amount"].join(' ')
                         }).text(row.Amount).appendTo(rowss);
                     }
                     $("#header tr").click(function() {
                         $("tr").attr('onclick', '');
                     });

                     j("#source1 tr").click(function() {
                         if (j(this).hasClass("selected")) {
                             j(this).removeClass('selected');
                             populateEAAmountSB();
                             calculateAmount();
                         } else {
                             j(this).addClass('selected');
                             populateEAAmountSB();
                             calculateAmount();
                         }
                     });
                 }
             });
     });
     mainTable.appendTo("#box1");
 }

 function populateEAAmountSB() {
    var EAAmount = document.getElementById("availableAdvAmount").value;
    var advanceAvailable = document.getElementById("availableAdvAmount").value;
    if (j("#source1 tr.selected").hasClass("selected")) {
        j("#source1 tr.selected").each(function(index, row) {
            var Amount = j(this).find('td.Amount').text();
            //get Amount 
            EAAmount = parseFloat(EAAmount) + parseFloat(Amount);
        });

        if (EAAmount != "") {
            document.getElementById("unsetAdvAmount").value = EAAmount;
        }
    } else {
        alert("advanceAvailable " +advanceAvailable);
        if(advanceAvailable != ""){
            document.getElementById("unsetAdvAmount").value = parseFloat(advanceAvailable) ;
        }else{
             document.getElementById("unsetAdvAmount").value = "";
        }
    }
}

function submitBEWithAdvance() {
    var jsonToSaveBE = new Object();
    var jsonEmplAdvanceArr = [];
    var emplAdvanceDetailsArr = [];
    var totalAmount = 0;
    var unsetAdvAmount = 0;
    var refundToEmp = 0;
    var recoverFromEmp = 0;

           if (j("#source1 tr.selected").hasClass("selected")) {
            j("#source1 tr.selected").each(function(index, row) {
                var jsonFindEA = new Object();
                jsonFindEA["empAdvID"] = j(this).find('td.empAdvID').text();
                jsonFindEA["emplAdvVoucherNo"] = j(this).find('td.emplAdvVoucherNo').text();
                jsonFindEA["empAdvTitle"] = j(this).find('td.empAdvTitle').text();
                jsonFindEA["Amount"] = j(this).find('td.Amount').text();
                emplAdvanceDetailsArr.push(j(this).find('td.empAdvID').text());
                jsonEmplAdvanceArr.push(jsonFindEA);
            });

        }

    totalAmount = document.getElementById("totalAmount").value;
    unsetAdvAmount = document.getElementById("unsetAdvAmount").value;
    refundToEmp = document.getElementById("refundToEmp").value;
    recoverFromEmp = document.getElementById("recoverFromEmp").value;

    var busExpHeaderId = document.getElementById("busExpHeaderId").value;

    jsonToSaveBE["employeeId"] = window.localStorage.getItem("EmployeeId");
    jsonToSaveBE["expenseDetails"] = jsonBEArr;
    jsonToSaveBE["totalAmount"] = totalAmount;
    jsonToSaveBE["unsetAdvAmount"] = unsetAdvAmount;
    jsonToSaveBE["refundToEmp"] = refundToEmp;
    jsonToSaveBE["recoverFromEmp"] = recoverFromEmp;
    jsonToSaveBE["employeeAdvDeatils"] = jsonEmplAdvanceArr;


        if (jsonToSaveBE != "") {
                approveVoucherAdvSB(busExpHeaderId,jsonToSaveBE)
        }
    }

    function approveVoucherAdvSB(busExpHeaderId,jsonToBeSendForApproval){

    var headerBackBtn = defaultPagePath + 'backbtnPage.html';
    var pageRefSuccess = 'app/pages/success.html';

    jsonToBeSendForApproval["processId"] = '1';
    jsonToBeSendForApproval["headerList"] = busExpHeaderId;
    jsonToBeSendForApproval["employeeId"] = window.localStorage.getItem("EmployeeId");
    jsonToBeSendForApproval["buttonStatus"] = "A";
    jsonToBeSendForApproval["rejectionComment"] = "";
    jsonToBeSendForApproval["versionNumber"] = window.localStorage.getItem("versionNumber");

    j('#loading_Cat').show();

    j.ajax({
        url: window.localStorage.getItem("urlPath") + "MobileApproveRejectService",
         type: 'POST',
         dataType: 'json',
         crossDomain: true,
         data: JSON.stringify(jsonToBeSendForApproval),
         success: function(data) {

             if (data.Status == "Success") {
                j('#loading_Cat').hide();
                var claimExpArray = data.expenseDetails;

                    mydb.transaction(function(t) {
                        if (claimExpArray != null && claimExpArray.length > 0) {
                            for (var i = 0; i < claimExpArray.length; i++) {
                                var headArray = new Array();
                                headArray = claimExpArray[i];

                                var approvalMsg = headArray.message;
                                successMessage = approvalMsg;

                            }
                        }

                        if(successMessage != null && successMessage != ""){
                            j('#loading_Cat').hide();
                            j('#mainHeader').load(headerBackBtn);
                            j('#mainContainer').load(pageRefSuccess);
                        }
                        console.log("appPageHistory : "+appPageHistory);
                        requestRunning = false;             
                    });

             } else {
                 j('#loading_Cat').hide();
                 successMessage = "Error: Oops something is wrong, Please Contact System Administer";
                 requestRunning = false;
             }
         },
         error: function(data) {
            j('#loading_Cat').hide();
            successMessage = "Error: Oops something is wrong, Please Contact System Administer";
            requestRunning = false;
         }
     });

 }

//------------------------------  Advance For Draft and SendBack -- End ----------------------------------------//