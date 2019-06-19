const TelegramBot = require('node-telegram-bot-api');
const token = '';

const bot = new TelegramBot(token, { polling: true });

bot.on('message', msg => {
  fPokazMainButton(msg);
});

function fPokazMainButton(msg) {
  var topMes;
  //if (msg.text == "") {

  switch (msg.text) {
    case '/MENU':
      topMes = '🔘 MENU 🔘';
      break;
    case undefined:
      topMes = '💬 Ok, a minute...';
      break;
    case 'Відміна':
      topMes = '💬 Ok, as you wish.';
      break;
    default:
      topMes = '💬 Sorry, no time for chatting, need to manage yor funds 😎';
  }

  const keyboard = {
    reply_markup: {
      resize_keyboard: true,
      one_time_keyboard: true,
      keyboard: [['/MENU']]
    }
  };

  chatId = msg.hasOwnProperty('chat') ? msg.chat.id : msg.from.id;
  bot.sendMessage(chatId, topMes, keyboard);
}

bot.onText(/\/MENU/, msg => {
  fPokazMenu(msg);
});

function fPokazMenu(msg) {
  var text = '💬 What interests you?';

  var keyboardStr = JSON.stringify({
    inline_keyboard: [
      [
        { text: '💰 Fund', callback_data: '1' },
        { text: '📈 Currencies', callback_data: '2' },
        { text: '♥️ My Info', callback_data: '3' }
      ]
    ]
  });

  var keyboard = { reply_markup: JSON.parse(keyboardStr) };

  chat = msg.hasOwnProperty('chat') ? msg.chat.id : msg.from.id;
  bot.sendMessage(chat, text, keyboard);
}

bot.on('callback_query', function(msg) {
  var buttonPressed = msg.data;

  if (buttonPressed == 1) {
    fFundStatus(msg.message.chat.id);
  }

  if (buttonPressed == 2) {
    fKursyValyut(msg.message.chat.id);
  }

  if (buttonPressed == 3) {
    fMyInfo(msg.message.chat.id);
  }

  console.log('\n*****msg******->   ' + JSON.stringify(msg) + '\n\n');

  //bot.answerCallbackQuery(msg.id, 'You hit a button!', false); //маленький алерт
  //bot.answerCallbackQuery(msg.id, 'Вы выбрали: '+ msg.data, true); //ALERT - як у браузері

  //bot.on('callback_query', function (msg) {
  //	bot.answerCallbackQuery(msg.id, 'You hit a button!', false); //маленький алерт
  //});
});

bot.onText(/\/fundstatus/, msg => {
  // 'msg' is the received Message from Telegram
  // 'match' is the result of executing the regexp above on the text content
  // of the message

  fFundStatus(msg.chat.id); //chatId - у тій функції.
});

bot.onText(/\/exchangerates/, msg => {
  // 'msg' is the received Message from Telegram
  // 'match' is the result of executing the regexp above on the text content
  // of the message

  fKursyValyut(msg.chat.id);
});

function fFundStatus(chatId) {
  //---------------------REQUEST------------------------------------------
  var request = require('request');
  recUrl =
    'https://docs.google.com/spreadsheets/d/e/2PACX-1vTQXFf4mdtFwiphcqUpQRH9DAjn6c1Qll8yilxKJAxUPf5kDWozE1yZzfajlxCNASJcWO9fxINg98G8/pub?gid=221700532&single=true&output=tsv';
  request(recUrl, function(error, response, body) {
    //console.log('error:', error); // Print the error if one occurred
    //console.log('statusCode:', response && response.statusCode);   // Print the response status code if a response was received
    //console.log('body:', body);
    //console.log('body:', body); // Print the HTML for the Google homepage.
    var myObj = JSON.parse(body);

    let msgText;

    msgText = '💬 General information\n';
    msgText += '💰 Capitalization: $' + myObj.fundCap + '\n';
    msgText += '💎 Emission CDCt: ' + myObj.cdcTokenIssued + '\n';
    msgText += '🔸 Price CDCt: $' + myObj.cdcTokenPrice + '\n';
    msgText += '🔸 Сhanging CDCt: ' + myObj.CDCtHistoryGrowth + '%\n\n';
    msgText += '💬 Fund Assets\n';
    msgText +=
      'BTC: ' +
      myObj.Bitcoin.amount +
      ' (' +
      myObj.Bitcoin.portion +
      '% - $' +
      myObj.Bitcoin.valueUSD +
      ')\n';
    msgText +=
      'ETH: ' +
      myObj.Ethereum.amount +
      ' (' +
      myObj.Ethereum.portion +
      '% - $' +
      myObj.Ethereum.valueUSD +
      ')\n';
    msgText +=
      'ZEC: ' +
      myObj.Zcash.amount +
      ' (' +
      myObj.Zcash.portion +
      '% - $' +
      myObj.Zcash.valueUSD +
      ')\n';
    console.log(myObj);
    bot.sendMessage(chatId, msgText);
  });
  //---------------------/REQUEST-----------------------------------------8
}

function fKursyValyut(chatId) {
  //---------------------REQUEST------------------------------------------
  var request = require('request');
  recUrl =
    'https://docs.google.com/spreadsheets/d/e/2PACX-1vTQXFf4mdtFwiphcqUpQRH9DAjn6c1Qll8yilxKJAxUPf5kDWozE1yZzfajlxCNASJcWO9fxINg98G8/pub?gid=221700532&single=true&output=tsv';
  request(recUrl, function(error, response, body) {
    //console.log('error:', error); // Print the error if one occurred
    //console.log('statusCode:', response && response.statusCode);   // Print the response status code if a response was received
    //console.log('body:', body);
    //console.log('body:', body); // Print the HTML for the Google homepage.
    var myObj = JSON.parse(body);

    var B1, B2, E1, E2, Z1, Z2, Eos1, Eos2, Xrp1, Xrp2, Iota1, Iota2;

    if (myObj.Bitcoin.change24h > 0) {
      B1 = '🎾 BTC: $';
      B2 = ' (+';
    } else {
      B1 = '🔴 BTC: $';
      B2 = ' (';
    }

    if (myObj.Ethereum.change24h > 0) {
      E1 = '🎾 ETH: $';
      E2 = ' (+';
    } else {
      E1 = '🔴 ETH: $';
      E2 = ' (';
    }

    if (myObj.Zcash.change24h > 0) {
      Z1 = '🎾 ZEC: $';
      Z2 = ' (+';
    } else {
      Z1 = '🔴 ZEC: $';
      Z2 = ' (';
    }

    if (myObj.EOS.change24h > 0) {
      Eos1 = '🎾 EOS: $';
      Eos2 = ' (+';
    } else {
      Eos1 = '🔴 EOS: $';
      Eos2 = ' (';
    }

    if (myObj.XRP.change24h > 0) {
      Xrp1 = '🎾 XRP: $';
      Xrp2 = ' (+';
    } else {
      Xrp1 = '🔴 XRP: $';
      Xrp2 = ' (';
    }

    if (myObj.IOTA.change24h > 0) {
      Iota1 = '🎾 IOTA: $';
      Iota2 = ' (+';
    } else {
      Iota1 = '🔴 IOTA: $';
      Iota2 = ' (';
    }

    var msgText;

    msgText = '💬 Currencies\n';
    msgText +=
      B1 + myObj.Bitcoin.priceUSD + B2 + myObj.Bitcoin.change24h + ')\n';
    msgText +=
      E1 + myObj.Ethereum.priceUSD + E2 + myObj.Ethereum.change24h + ')\n';
    msgText += Z1 + myObj.Zcash.priceUSD + Z2 + myObj.Zcash.change24h + ')\n';
    msgText += Eos1 + myObj.EOS.priceUSD + Eos2 + myObj.EOS.change24h + ')\n';
    msgText += Xrp1 + myObj.XRP.priceUSD + Xrp2 + myObj.XRP.change24h + ')\n';
    msgText += Iota1 + myObj.IOTA.priceUSD + Iota2 + myObj.IOTA.change24h + ')';

    bot.sendMessage(chatId, msgText);
  });
  //---------------------/REQUEST-----------------------------------------
}

function fMyInfo(chatId) {
  var option = {
    parse_mode: 'Markdown',
    reply_markup: {
      one_time_keyboard: true,
      keyboard: [
        [
          {
            text: 'Сonfirm a phone number',
            request_contact: true
          }
        ],
        ['Сancel']
      ]
    }
  };

  bot
    .sendMessage(
      chatId,
      '💬 To verify your participation in the fund, I need your phone number. Click the button to confirm:',
      option
    )
    .then(() => {});
}

bot.on('contact', msg => {
  var userDataUrl =
    'https://docs.google.com/spreadsheets/d/e/2PACX-1vTQXFf4mdtFwiphcqUpQRH9DAjn6c1Qll8yilxKJAxUPf5kDWozE1yZzfajlxCNASJcWO9fxINg98G8/pub?gid=471041265&single=true&output=tsv';

  //---------------------REQUEST------------------------------------------
  var request = require('request');

  request(userDataUrl, function(error, response, body) {
    //console.log('error:', error); // Print the error if one occurred
    //console.log('statusCode:', response && response.statusCode);   // Print the response status code if a response was received
    //console.log('body:', body);
    //console.log('body:', body); // Print the HTML for the Google homepage.
    var myObj = JSON.parse(body);

    var usrRealPhNumber;
    let adminInfo = ' ';
    if (msg.contact.phone_number[0] == '+') {
      usrRealPhNumber = msg.contact.phone_number.slice(1);
    } else {
      usrRealPhNumber = msg.contact.phone_number;
    }

    if (myObj[usrRealPhNumber] == undefined) {
      bot.sendMessage(
        msg.chat.id,
        '💬 Unfortunately, your phone number (' +
          usrRealPhNumber +
          ') is not registered in the database. The function of personal information for this number is not available, contact the administrator!'
      );
    } else {
      //console.log(myObj[usrRealPhNumber]);
      if (usrRealPhNumber == '380673267467') {
        adminInfo += '\n' + JSON.stringify(myObj).replace(/,/g, ',\n');
      }
      var usrBal = Number(myObj[usrRealPhNumber]);
      bot.sendMessage(
        msg.chat.id,
        '💬 Your phone number (' +
          usrRealPhNumber +
          ') has been verified.\n🔔 Your current balance is $' +
          usrBal.toFixed(2) +
          adminInfo
      );
    }
  });
  //---------------------/REQUEST------------------------------------------
});
