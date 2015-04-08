
function ajax(url, data, rawtx) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            console.log(xhr.responseText);
            
            var newTxid = rawtotxid(rawtx);        
            console.log(newTxid);
            
            if ($("#sendbroadcastbutton").html() == "Sending Broadcast..."){
                
                $("#sendbroadcastbutton").html("Sent! Refresh to continue...");
                
                $("#sendinfomessage").html("Broadcast will appear after one confirmation");
                
            } else {
                
                $("#sendtokenbutton").html("Sent! Refresh to continue...");
                
                $("#sendinfomessage").html("Balance will update after one confirmation");
                
            }
            
            $("#sendbroadcastbutton").prop('disabled', true);
            $("#sendtokenbutton").prop('disabled', true);
            
            $("#freezeUnconfirmed").css("display", "block");
            $("#mainDisplay").css("display", "none");
            $("#yourtxid").html("<a href='https://blockchain.info/tx/"+newTxid+"'>View Transaction</a>");
            
            xhr.close;
        }
    }
    xhr.open(data ? "POST" : "GET", url, true);
    if (data) xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.send(data);
}


function sendBTCpush(hextx) {
    url = 'http://blockchain.info/pushtx';
    postdata = 'tx=' + hextx;
    if (url != null && url != "")
    {
        ajax(url, postdata, hextx);
    }
}


function sendBTC(add_from, add_to, sendtotal, transfee) {
    
    var source_html = "https://insight.bitpay.com/api/addr/"+add_from+"/utxo";
    
    var total_utxo = new Array();
    var transfee_satoshis = parseFloat(transfee).toFixed(8) * 100000000; 
    var sendtotal_satoshis = parseFloat(sendtotal).toFixed(8) * 100000000;   
    
    sendtotal_satoshis = Math.round(sendtotal_satoshis);

                
    
    var mnemonic = $("#newpassphrase").html();
    
    var privkey = getprivkey(add_from, mnemonic);
    
    
    $.getJSON( source_html, function( data ) {
        
        //var amountremaining = (parseFloat(sendtotal) + parseFloat(transfee));
        
        var amountremaining_satoshis = sendtotal_satoshis + transfee_satoshis;
        
        data.sort(function(a, b) {
            return b.amount - a.amount;
        });
        
        $.each(data, function(i, item) {
            
             var txid = data[i].txid;
             var vout = data[i].vout;
             var script = data[i].scriptPubKey;
            
            
             var amount_satoshis = parseFloat(data[i].amount).toFixed(8) * 100000000;
            
             var amount = amount_satoshis / 100000000;
             
             amountremaining_satoshis = amountremaining_satoshis - amount_satoshis;      
            
    
             var obj = {
                "txid": txid,
                "address": add_from,
                "vout": vout,
                "scriptPubKey": script,
                "amount": amount
             };
            
             total_utxo.push(obj);
              
             //dust limit = 5460 
            
             if (amountremaining_satoshis == 0 || amountremaining_satoshis < -5460) {                                 
                 return false;
             }
             
        });
        
        console.log(total_utxo);
        
        if (amountremaining_satoshis < 0) {
            var satoshi_change = -amountremaining_satoshis;
        } else {
            var satoshi_change = 0;
        }
        
        console.log(satoshi_change);
        
        var transaction = new bitcore.Transaction();
            
        for (i = 0; i < total_utxo.length; i++) {
            transaction.from(total_utxo[i]);
        }
        
        
        
        transaction.to(add_to, sendtotal_satoshis);
            
        if (satoshi_change > 5459) {
            transaction.to(add_from, satoshi_change);
        }
        transaction.sign(privkey);

        var final_trans = transaction.serialize();
        
        console.log(final_trans);
        
        sendBTCpush(final_trans);
    });
       
}

    
