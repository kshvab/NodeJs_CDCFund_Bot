const TelegramBot = require('node-telegram-bot-api');
const token = '';

const bot = new TelegramBot(token, {polling: true});



bot.on('message', (msg) => {
	fPokazMainButton(msg)
});




function fPokazMainButton(msg){

	var topMes;
	//if (msg.text == "") {
	
	switch (msg.text) {
  		case '/MENU':
    		topMes = "🔘 МЕНЮ 🔘";
    		break;
  		case undefined:
   			topMes = "💬 Ok, зараз усьо буде...";
    		break;
  		case 'Відміна':
   			topMes = "💬 Даремно відмовився, тепер фіг узнаєш...Аха)";
    		break;			
  		default:
    		topMes = "💬 Sorry, no time for chatting, need to manage yor funds 😎";
	}
	

	const keyboard = {
            reply_markup: {
            resize_keyboard: true,
            one_time_keyboard: true,
            keyboard: [["/MENU"]]
        	}
	};
	
	chatId = msg.hasOwnProperty('chat') ? msg.chat.id : msg.from.id;
	bot.sendMessage(chatId, topMes, keyboard);
	
};



bot.onText(/\/MENU/, (msg,) => {
	fPokazMenu(msg);
});



function fPokazMenu(msg){

 var text = '💬 What interests you?';
	
  var keyboardStr = JSON.stringify({
      inline_keyboard: [
        [
      	    {text:'💰 Статус фонду',callback_data:'1'},
        	{text:'📈 Курси валю',callback_data:'2'},
			{text:'♥️ My Info',callback_data:'3'}			
        ]
		
	  ]
  });
 
  var keyboard = {reply_markup: JSON.parse(keyboardStr)};

  chat = msg.hasOwnProperty('chat') ? msg.chat.id : msg.from.id;
  bot.sendMessage(chat, text, keyboard);
};




bot.on('callback_query', function (msg) {
 
  var buttonPressed = msg.data;
 
  
  	if (buttonPressed==1){
    	fFundStatus(msg.message.chat.id);
  	}
 
	if (buttonPressed==2){
    	fKursyValyut(msg.message.chat.id);
  	}
	
	if (buttonPressed==3){
    	fMyInfo(msg.message.chat.id);
  	}	

	console.log('\n*****msg******->   ' + JSON.stringify(msg) + "\n\n");

	
	//bot.answerCallbackQuery(msg.id, 'You hit a button!', false); //маленький алерт
	//bot.answerCallbackQuery(msg.id, 'Вы выбрали: '+ msg.data, true); //ALERT - як у браузері
	
  	//bot.on('callback_query', function (msg) {
	//	bot.answerCallbackQuery(msg.id, 'You hit a button!', false); //маленький алерт
	//});
	
	
 
});




bot.onText(/\/fundstatus/, (msg,) => {
  // 'msg' is the received Message from Telegram
  // 'match' is the result of executing the regexp above on the text content
  // of the message

  fFundStatus(msg.chat.id); //chatId - у тій функції.
});




bot.onText(/\/exchangerates/, (msg,) => {
  // 'msg' is the received Message from Telegram
  // 'match' is the result of executing the regexp above on the text content
  // of the message


  fKursyValyut(msg.chat.id);
});



function fFundStatus(chatId){
	//---------------------REQUEST------------------------------------------
	var request = require('request');
	recUrl='https://docs.google.com/spreadsheets/d/e/2PACX-1vTQXFf4mdtFwiphcqUpQRH9DAjn6c1Qll8yilxKJAxUPf5kDWozE1yZzfajlxCNASJcWO9fxINg98G8/pub?gid=221700532&single=true&output=tsv';
	request(recUrl, function (error, response, body) {
		//console.log('error:', error); // Print the error if one occurred
		//console.log('statusCode:', response && response.statusCode);   // Print the response status code if a response was received
		//console.log('body:', body);
		//console.log('body:', body); // Print the HTML for the Google homepage.
		var myObj=JSON.parse(body);
		
		
		bot.sendMessage(chatId, "💬 СТАТУС ФОНДУ\n🔸 Капіталізація: $"+ myObj.fundCap + '\n' + "🔸 Зміна вартості CDCt: " + myObj.CDCtHistoryGrowth + '%\n' + "🔸 Ціна CDCt: $" + myObj.cdcTokenPrice);
		
	});
	//---------------------/REQUEST-----------------------------------------8
	
}


function fKursyValyut(chatId){

	//---------------------REQUEST------------------------------------------
	var request = require('request');
	recUrl='https://docs.google.com/spreadsheets/d/e/2PACX-1vTQXFf4mdtFwiphcqUpQRH9DAjn6c1Qll8yilxKJAxUPf5kDWozE1yZzfajlxCNASJcWO9fxINg98G8/pub?gid=221700532&single=true&output=tsv';
	request(recUrl, function (error, response, body) {
		//console.log('error:', error); // Print the error if one occurred
		//console.log('statusCode:', response && response.statusCode);   // Print the response status code if a response was received
		//console.log('body:', body);
		//console.log('body:', body); // Print the HTML for the Google homepage.
		var myObj=JSON.parse(body);
		
		var B1,
			B2,
			E1,
			E2,
			Z1,
			Z2;
		
		if (myObj.Bitcoin.change24h>0){
			B1="🎾 BTC: $";
			B2=' (+';
		}
		else {
			B1="🔴 BTC: $";
			B2=' (';
		};
		
		if (myObj.Ethereum.change24h>0){
			E1="🎾 ETH: $";
			E2=' (+';
		}
		else {
			E1="🔴 ETH: $";
			E2=' (';
		};
		
		if (myObj.Zcash.change24h>0){
			Z1="🎾 ZEC: $";
			Z2=' (+';
		}
		else {
			Z1="🔴 ZEC: $";
			Z2=' (';
		};
		
		
		bot.sendMessage(chatId, "💬 КУРС ВАЛЮТ\n" + B1 + myObj.Bitcoin.priceUSD + B2 + myObj.Bitcoin.change24h + ')\n' + E1 + myObj.Ethereum.priceUSD + E2 + myObj.Ethereum.change24h + ')\n' + Z1 + myObj.Zcash.priceUSD + Z2 + myObj.Zcash.change24h +')');
		

	});
	//---------------------/REQUEST-----------------------------------------
}


function fMyInfo (chatId){
var option = {
        "parse_mode": "Markdown",
        "reply_markup": {
            "one_time_keyboard": true,
            "keyboard": [[{
                text: "Надати номер телефону",
                request_contact: true
            }], ["Відміна"]]
        }
    }
	
bot.sendMessage(chatId, "💬 Щоб перевірити Вашу участь у фонді, мені потрібен Ваш номер телефону. Натисніть на кнопку для підтвердження:", option).then(() => {
      
    })

}

bot.on("contact",(msg)=>{
	
	var userDataUrl="https://docs.google.com/spreadsheets/d/e/2PACX-1vTQXFf4mdtFwiphcqUpQRH9DAjn6c1Qll8yilxKJAxUPf5kDWozE1yZzfajlxCNASJcWO9fxINg98G8/pub?gid=471041265&single=true&output=tsv";
	
	//---------------------REQUEST------------------------------------------
	var request = require('request');
	
	request(userDataUrl, function (error, response, body) {
		//console.log('error:', error); // Print the error if one occurred
		//console.log('statusCode:', response && response.statusCode);   // Print the response status code if a response was received
		//console.log('body:', body);
		//console.log('body:', body); // Print the HTML for the Google homepage.
		var myObj=JSON.parse(body);
		
		var usrRealPhNumber;
		
		if (msg.contact.phone_number[0]=='+'){
			usrRealPhNumber = msg.contact.phone_number.slice(1);
		}
		else {
			usrRealPhNumber = msg.contact.phone_number;
		}
		
		
		if (myObj[usrRealPhNumber] == undefined) {
			bot.sendMessage(msg.chat.id, "💬 Нажаль, Ваш номер телефону (" + usrRealPhNumber + ") не зареєстровано в базі. Функція персональної інформації для цього номеру недоступна, зверніться до адміністратора!");
		}
		
		else {
			var usrBal=Number(myObj[usrRealPhNumber]);
			bot.sendMessage(msg.chat.id, "💬 Ваш номер телефону (" + usrRealPhNumber + ") пройшов перевірку.\n🔔 Ваш поточний баланс становить $" + usrBal.toFixed(2));
		}

	});
	//---------------------/REQUEST------------------------------------------
	
})



	//console.log("qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq" + myObj['sd']);
	//console.log("777777777777888888888777777777" + msg.contact.phone_number);
	//console.log('msg******->   ' + JSON.stringify(msg));
  	//console.log("777777777777msg.text777777777--->" + msg.text + "<--->" + topMes + "<--->");
	//console.log('qqqqq   ' + msg.data);
	//console.log('msg******->   ' + JSON.stringify(msg));
	//console.log('msg.message.chat.id: ' + msg.message.chat.id);
  	//console.log('msg.message.chat.first_name: ' + msg.message.chat.first_name);
  	//console.log('msg.data: ' + msg.data);


