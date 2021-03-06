var bitcore = require('bitcore');

$( document ).ready(function() {
    $('#alltransactions').hide();
    
    $('#yourtxid').on('click', 'a', function(){
     chrome.tabs.create({url: $(this).attr('href')});
     return false;
   });
    
    $('#alltransactions').on('click', 'a', function(){
     chrome.tabs.create({url: $(this).attr('href')});
     return false;
   });
    
    $("#pinsplash").hide();
    $('#alltransactions').hide();
    
    getStorage();
    //setEncryptedTest();
    
    //on open
    var manifest = chrome.runtime.getManifest();
    
    var infobutton = "<div style='display: inline-block; padding-left: 5px;'><a id='infoButton' href='#infoPage' data-toggle='tab'><img src='info-icon.png' height='16' width='16'></a></div>";

       $("#nameversion").html("XCP Wallet for Chrome v" + manifest.version + infobutton);
    
       var JsonFormatter = {
        stringify: function (cipherParams) {
            // create json object with ciphertext
            var jsonObj = {
                ct: cipherParams.ciphertext.toString(CryptoJS.enc.Base64)
            };

            return JSON.stringify(jsonObj);
        },

        parse: function (jsonStr) {
            // parse json string
            var jsonObj = JSON.parse(jsonStr);

            // extract ciphertext from json object, and create cipher params object
            var cipherParams = CryptoJS.lib.CipherParams.create({
                ciphertext: CryptoJS.enc.Base64.parse(jsonObj.ct)
            });

            return cipherParams;
        }
        };
    
    $("form").submit(function (e) {
      e.preventDefault();
    //};


   // $("#pinButton").click(function () {
        
        var pin = $("#inputPin").val();
        
        $("#inputPin").val("");
        
        chrome.storage.local.get(["passphrase"], function (data)
        {         
            var decrypted = CryptoJS.AES.decrypt(data.passphrase, pin, { format: JsonFormatter });          
            var decrypted_passphrase = decrypted.toString(CryptoJS.enc.Utf8);
            
            console.log(decrypted_passphrase.length);
            
            if (decrypted_passphrase.length > 0) {
                
                $("#pinsplash").hide();
                $(".hideEncrypted").hide();
                
                $("#priceBox").show();
            
                existingPassphrase(decrypted.toString(CryptoJS.enc.Utf8));
                
            }
        });
    });
    
    $('#myTab a').click(function (e) {
        e.preventDefault()
        $(this).tab('show')
    });
    
    $( "#walletaddresses" ).change(function () {
    
    var addr = $(this).val();
    
//    chrome.storage.local.set(
//                    {
//                        'lastAddress': addr
//                    }, function () {
                    
                        $("#xcpaddress").html(addr);
    
                        getPrimaryBalance(addr);
                    
//                    });
    
    });
    
    $('#copyButton').click(function (){
        
        var address = $("#walletaddresses").val();
        
        copyToClipboard(address);
        
        $('#xcpaddressTitle').hide(); 
        $('#addresscopied').show();
        setTimeout(function(){ 
            $('#addresscopied').hide(); 
            $('#xcpaddressTitle').show();
        }, 1500);
        
    });
    
    $('#assettransactiontoggle').click(function ()
        { 
            if ($('#assettransactiontoggle').html() == "View Assets") {
                $('#assettransactiontoggle').html("View Asset Transaction History");
                $('#alltransactions').hide();
                $('#allassets').show();
            } else {
                $('#assettransactiontoggle').html("View Assets");
                $('#alltransactions').show();
                $('#allassets').hide();
            }
        });
    
    $('.resetAddress').click(function ()
        {
            newPassphrase();
        });
    
    $('#revealPassphrase').click( function ()
        {
            if($("#newpassphrase").is(":visible")) {
                $("#passphrasebox").hide();
                $("#revealPassphrase").html("Reveal Passphrase");
            } else {
                $("#passphrasebox").show(); 
                $("#revealPassphrase").html("Hide Passphrase");
            }
        });
    
    $('#manualPassphrase').click( function ()
        {
            if($("#manualPassBox").is(":visible")) {
                $("#manualPassBox").hide();
                //$("#revealPassphrase").html("Reveal Passphrase");
            } else {
                $("#manualPassBox").show(); 
                //$("#newpassphrase").hide();
                //$("#revealPassphrase").html("Hide Passphrase");
            }    
        });
    
     $('#encryptPassphrase').click( function ()
        {
            if($("#encryptPassphraseBox").is(":visible")) {
                $("#encryptPassphraseBox").hide();
                //$("#revealPassphrase").html("Reveal Passphrase");
            } else {
                $("#encryptPassphraseBox").show(); 
                //$("#newpassphrase").hide();
                //$("#revealPassphrase").html("Hide Passphrase");
            }    
        });
    
    $('#broadcastbutton').click( function () {
        $("#broadcastbox").toggle();
        if($("#moreBTCinfo").is(":visible")) {
            $("#moreBTCinfo").hide();
        }
        if($("#btcsendbox").is(":visible")) {
            $("#btcsendbox").hide();
        }
        
    });
    
    
    $('#sendAssetButton').click( function () {
        $("#btcsendbox").toggle();
        if($("#moreBTCinfo").is(":visible")) {
            $("#moreBTCinfo").hide();
        }
        if($("#broadcastbox").is(":visible")) {
            $("#broadcastbox").hide();
        }
    });
    
    $('#manualAddressButton').click( function ()
        {
            manualPassphrase();
        });
 
      $(document).on("click", '#depositBTC', function (event)
  {
            if($("#btcsendbox").is(":visible")) {
                $("#btcsendbox").hide();
            }
      if($("#broadcastbox").is(":visible")) {
            $("#broadcastbox").hide();
        }
      
      
        if ($("#moreBTCinfo").length){
          
            $("#moreBTCinfo").toggle();
            
            
          
        } else {
      
            var currentaddr = $("#walletaddresses").val();
            $("#btcbalance").append("<div id='moreBTCinfo'><div style='margin: 20px 0 10px 0; font-size: 10px; font-weight: bold;'>"+currentaddr+"</div><div id='btcqr' style='margin: 10px auto 20px auto; height: 100px; width: 100px;'></div><div>Cost per transaction is 0.0001547 BTC.</div></div>");  
            var qrcode = new QRCode(document.getElementById("btcqr"), {
    			text: currentaddr,
    			width: 100,
    			height: 100,
    			colorDark : "#000000",
    			colorLight : "#ffffff",
    			correctLevel : QRCode.CorrectLevel.H
				});
        }
        });

    
 
  $(document).on("click", '#refreshWallet', function (event)
  {
      
      $("#freezeUnconfirmed").css("display", "none");
      $("#mainDisplay").css("display", "block");
      
      $("#sendtokenbutton").html("Send Token");
      $("#sendtokenbutton").prop('disabled', false);
      $("#sendbroadcastbutton").html("Send Broadcast");
      $("#sendbroadcastbutton").prop('disabled', true);
      $("#sendtoaddress").prop('disabled', false);
      $("#sendtoamount").prop('disabled', false);
      
      $("#sendtoaddress").val("");
      $("#sendtoamount").val("");
      
      $("#broadcastmessage").val("");
      $("#broadcastvalue").val("-1");
      $("#broadcastfeefraction").val("0");
      $("#broadcastbox").css("display", "none");
      
      var assetbalance = $("#xcpbalance").html();
      var array = assetbalance.split(" ");
      
      
      var pubkey = $("#walletaddresses").val();
      var currenttoken = $(".currenttoken").html();
      
      getRate(array[0], pubkey, currenttoken);
      
      getPrimaryBalance(pubkey);
  });
    
  $('#switchtoxcp').click(function ()
  {
      $(".currenttoken").html("XCP");     
      var pubkey = $("#walletaddresses").val();
      getPrimaryBalance(pubkey);
      $('#allTabs a:first').tab('show');
  });


//  $('#txHistory').click(function ()
//  {
//    var address = $("#walletaddresses").val();
//    chrome.tabs.create(
//    {
//      url: "http://blockscan.com/address/" + address
//    });
//  });

//  $('#contact').click(function ()
//  {
//    chrome.tabs.create({ url: "mailto:support@letstalkbitcoin.com" });
//  });

    
//  $('#refresharrow').click(function ()
//  {
//    var pubkey = $("#walletaddresses").val();
//    getPrimaryBalance(pubkey);
//  });
    
  
   $(document).on("click", '.movetowallet', function (event)
  {  
  
      var $assetdiv = $( this ).prev();
      var currentasset = $assetdiv.html();
      $(".currenttoken").html(currentasset);
      //$(".currenttoken").html("WORKS");
      
      
      var pubkey = $("#walletaddresses").val();
      
      
      getPrimaryBalance(pubkey);
      
      
      $('#allTabs a:first').tab('show');
      
  });


  $('#inventoryTab').click(function ()
  {
    
    var address = $("#walletaddresses").val();
      
    //$("#alltransactions").hide();
      
    loadAssets(address);
    
      
  });  
   
 $('#broadcastTab').click(function ()
  {    
    var address = $("#walletaddresses").val();
    $("#broadcastListAll").html("");
    loadBroadcasts(address);
    //loadBroadcasts();
});
    
   $(document).on("click", '#encryptPasswordButton', function (event) 
    {
        chrome.storage.local.get(["passphrase"], function (data)
        {       
            
            var password = $("#encryptPassword").val();
            $("#encryptPassword").val("");
            var encrypted = CryptoJS.AES.encrypt(data.passphrase, password, { format: JsonFormatter });
               
            chrome.storage.local.set(
                    {
                        
                        'passphrase': encrypted,
                        'encrypted': true
                        
                    }, function () {
                    
                        $(".hideEncrypted").hide();
                    
                    });
        
        });
    });

    $('#signMessageButton').click(function ()
        {
            var inputaddr = $("#signPubAddress").val();
            var inputpassphrase = $("#newpassphrase").html();
            var message = $("#messagetosign").val();
            
            var privkey = getprivkey(inputaddr, inputpassphrase);
            var signed = signwith(privkey, inputaddr, message)
            
            $("#postSign").html(signed);
            
            $("#postSign").show();
            $("#resetsignbox").show();
            
            $("#preSign").hide();
             
        });
    
    $('#resetSignButton').click(function ()
        {
            $("#messagetosign").val("");
            $("#resetsignbox").hide();
            $("#postSign").hide();
            
            $("#preSign").show();            
        });   
    
    
    $('#sendbroadcastbutton').click(function ()
        {
            var txsAvailable = $("#txsAvailable").html();
            var broadcastvalue = $("#broadcastvalue").val();
            var broadcastfeefraction = $("#broadcastfeefraction").val();
            
            if ($.isNumeric(broadcastvalue) == true && $.isNumeric(broadcastfeefraction) == true && txsAvailable > 1) {
            
                $("#sendbroadcastbutton").prop('disabled', true);
                $("#sendbroadcastbutton").html("Sending Broadcast...");
            
                var pubkey = $("#walletaddresses").val();
                var broadcastmessage = $("#broadcastmessage").val();
                             
                console.log("sent!");

                var minersfee = 0.0001;
                var msig_total = 0.000078;  //total btc to multisig output (returned to sender)
                var mnemonic = $("#newpassphrase").html();
            
                sendBroadcast(pubkey, broadcastmessage, broadcastvalue, broadcastfeefraction, msig_total, minersfee, mnemonic);
            }
            
        });
    
    $('#sendtokenbutton').click(function ()
        {
            $("#sendtokenbutton").html("Sending...");
            $("#sendtokenbutton").prop('disabled', true);
             
            var btcbalance = $("#btcbalhide").html();
            var btcbal = parseFloat(btcbalance);
            
            console.log(btcbal);
            
            var assetbalance = $("#xcpbalance").html();
            var array = assetbalance.split(" ");
            var currentbalance = parseFloat(array[0]);
      
            var pubkey = $("#walletaddresses").val();
            var currenttoken = $(".currenttoken").html();
            
            var sendtoaddress = $("#sendtoaddress").val();
            var sendtoamount_text = $("#sendtoamount").val();
            var sendtoamount = parseFloat(sendtoamount_text);
                       
            if($("#isdivisible").html() == "no"){
            
                sendtoamount = Math.floor(sendtoamount) / 100000000;
            
            } 
            
            console.log(sendtoamount);
            
            var minersfee = 0.0001;
            
            if (currenttoken == "BTC") {
                var totalsend = parseFloat(sendtoamount) + minersfee;
            
            } else {
                var totalsend = parseFloat(sendtoamount);
            
            }
            
        if (btcbal > 0.0002327) { 
            
            if (bitcore.Address.isValid(sendtoaddress)){
                
                if (isNaN(sendtoamount) == true || sendtoamount <= 0 || $.isNumeric( sendtoamount ) == false) {
                
                    $("#sendtoamount").val("Invalid Amount");
                    $("#sendtokenbutton").html("Refresh to continue");
                
                } else {
            
                    if (totalsend > currentbalance) {
            
                        $("#sendtoamount").val("Insufficient Funds");
                        $("#sendtokenbutton").html("Refresh to continue");
                
                    } else {
                        
                        var txsAvailable = $("#txsAvailable").html();
                        
                        if (currenttoken == "BTC") {
                    
                            sendBTC(pubkey, sendtoaddress, sendtoamount, minersfee);
                        
                        } else if (txsAvailable > 1) {
                            
                            var btc_total = 0.0000547;  //total btc to receiving address
                            var msig_total = 0.000078;  //total btc to multisig output (returned to sender)
                            var mnemonic = $("#newpassphrase").html();
                            
                            $("#sendtokenbutton").html("Sending...");
                            
                            //sendXCP(pubkey, sendtoaddress, currenttoken, sendtoamount, btc_total, msig_total, minersfee, mnemonic); 
                            
                            sendXCP_opreturn(pubkey, sendtoaddress, currenttoken, sendtoamount, btc_total, minersfee, mnemonic); 
                            
                            
                            
                            //console.log(sendtoamount);
                            
                            //setUnconfirmed(pubkey, currenttoken, sendtoamount);
                            
                        }
                        
                         $("#sendtoaddress").prop('disabled', true);
                         $("#sendtoamount").prop('disabled', true);
                
                        //$("#sendtokenbutton").html("Sent! Refresh to continue...");
                
                    }
                
                }
                
            } else {
                
                $("#sendtoaddress").val("Invalid Address");
                $("#sendtokenbutton").html("Refresh to continue");
                
            }
        } else {
            
            $("#sendtoaddress").val("Not enough BTC");
            $("#sendtokenbutton").html("Refresh to continue");
            
        }
            
            
        });
    
    $(document).on("keyup", '#sendtoamount', function (event)
    { 
        var sendamount = parseFloat($("#sendtoamount").val());
        var currenttoken = $(".currenttoken").html();
        
        if (currenttoken == "BTC") {
            var currentbalance = parseFloat($("#btcbalhide").html());
        } else {
            var currentbalance = parseFloat($("#assetbalhide").html());
        }
        
        //console.log(sendamount);
        //console.log(currentbalance);
        
        if (sendamount > currentbalance) {
            $('#sendtokenbutton').prop('disabled', true);
       	} else {
            $("#sendtokenbutton").removeAttr("disabled");
        }
        
        
        
    });
    
    $(document).on("keyup", '#broadcastmessage', function (event)
    { 
        var message = $("#broadcastmessage").val();
        var broadcastvalue = $("#broadcastvalue").val();
        var broadcastfeefraction = $("#broadcastfeefraction").val();
        
        
        if (message.length > 0){
            $("#sendbroadcastbutton").removeAttr("disabled");    
       	} else { 
            $('#sendbroadcastbutton').prop('disabled', true);
        }      
        
        
    });
    
    
    
    
                
    

       
});