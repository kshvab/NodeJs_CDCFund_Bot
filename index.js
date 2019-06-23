const TelegramBot = require('node-telegram-bot-api');
const fundSettings = require('./fundSettings');
const token = fundSettings.telegramToken;

const bot = new TelegramBot(token, { polling: true });
const rp = require('request-promise');
const requestOptions = {
  method: 'GET',
  uri: fundSettings.coinmarketcapAPIURL,
  qs: {
    start: '1',
    limit: '50',
    convert: 'USD'
  },
  headers: {
    'X-CMC_PRO_API_KEY': fundSettings.coinmarketcapAPIKey
  },
  json: true,
  gzip: true
};
bot.on('message', msg => {
  fPokazMainButton(msg);
});

function fPokazMainButton(msg) {
  /*
  rp(requestOptions)
    .then(response => {
      console.log('API call response:', response.data[0].quote);
    })
    .catch(err => {
      console.log('API call error:', err.message);
    });
*/
  var topMes;

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
  rp(requestOptions)
    .then(response => {
      let totalFundCap = 0;

      for (let i = 0; i < fundSettings.assets.length; i++) {
        curObjFromApi = response.data.find(
          x => x.name === fundSettings.assets[i].name
        );

        totalFundCap +=
          fundSettings.assets[i].amount * curObjFromApi.quote.USD.price;
      }

      let cdctPrice = totalFundCap / fundSettings.cdctEmission;
      let cdctChange = cdctPrice * 100 - 100;
      //----------------------------------------

      let msgTextGeneral = '💬 General information\n';
      msgTextGeneral += '💰 Capitalization: $' + totalFundCap.toFixed(2) + '\n';
      msgTextGeneral += '💎 Emission CDCt: ' + fundSettings.cdctEmission + '\n';
      msgTextGeneral += '🔸 Price CDCt: $' + cdctPrice.toFixed(6) + '\n';

      msgTextGeneral += '🔸 Сhanging CDCt: ';
      if (cdctChange > 0) msgTextGeneral += '+';
      msgTextGeneral += cdctChange.toFixed(2) + '%\n\n';

      let msgTextAssets = '';
      msgTextAssets += '💬 Fund Assets\n';

      for (let i = 0; i < fundSettings.assets.length; i++) {
        curObjFromApi = response.data.find(
          x => x.name === fundSettings.assets[i].name
        );

        msgTextAssets += '◾️ ' + curObjFromApi.symbol + ': ';
        msgTextAssets += fundSettings.assets[i].amount.toFixed(4) + ' =  $';
        msgTextAssets += (
          fundSettings.assets[i].amount * curObjFromApi.quote.USD.price
        ).toFixed(2);
        msgTextAssets +=
          ' (' +
          (
            (fundSettings.assets[i].amount *
              curObjFromApi.quote.USD.price *
              100) /
            totalFundCap
          ).toFixed(2) +
          '%)\n';
      }
      msgTextAssets += '___________________________\n';
      msgTextAssets += '◾️ TOTAL: $' + totalFundCap.toFixed(2) + ' (100%)';

      bot.sendMessage(chatId, msgTextGeneral);
      bot.sendMessage(chatId, msgTextAssets);
    })
    .catch(err => {
      console.log('API call error:', err.message);
    });
}

function fKursyValyut(chatId) {
  rp(requestOptions)
    .then(response => {
      let msgText = '💬 TOP 10 currencies\n';

      for (let i = 0; i < 10; i++) {
        let curLine = '';
        if (response.data[i].quote.USD.percent_change_24h >= 0)
          curLine += '🎾 ';
        else curLine += '🔴 ';

        curLine += response.data[i].symbol + ': $';

        if (response.data[i].quote.USD.price >= 10)
          curLine += response.data[i].quote.USD.price.toFixed(2);
        else curLine += response.data[i].quote.USD.price.toFixed(4);

        curLine += ' (';

        if (response.data[i].quote.USD.percent_change_24h >= 0) curLine += '+';

        curLine +=
          response.data[i].quote.USD.percent_change_24h.toFixed(2) + ')\n';

        msgText += curLine;
      }

      bot.sendMessage(chatId, msgText);
    })
    .catch(err => {
      console.log('API call error:', err.message);
    });
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
  let usrRealPhNumber;
  if (msg.contact.phone_number[0] == '+') {
    usrRealPhNumber = msg.contact.phone_number.slice(1);
  } else {
    usrRealPhNumber = msg.contact.phone_number;
  }

  let userFundDataobj = fundSettings.users.find(
    x => x.phone == usrRealPhNumber
  );

  if (userFundDataobj != undefined && userFundDataobj.cdct) {
    rp(requestOptions)
      .then(response => {
        let totalFundCap = 0;

        for (let i = 0; i < fundSettings.assets.length; i++) {
          curObjFromApi = response.data.find(
            x => x.name === fundSettings.assets[i].name
          );
          totalFundCap +=
            fundSettings.assets[i].amount * curObjFromApi.quote.USD.price;
        }

        let cdctPrice = totalFundCap / fundSettings.cdctEmission;

        let msgWithPersonalData = '';

        msgWithPersonalData +=
          '✅ Your phone number (+' +
          usrRealPhNumber +
          ') has been verified.\n';
        msgWithPersonalData += '🔸 You have ' + userFundDataobj.cdct + 'CDCt\n';
        msgWithPersonalData +=
          '🔸 Today 1 CDCt = $' + cdctPrice.toFixed(4) + '\n';
        msgWithPersonalData +=
          '💵 Your current balance is $' +
          (userFundDataobj.cdct * cdctPrice).toFixed(2);

        if (usrRealPhNumber == '380673267467') {
          let adminInfo = '\n\n‼️ SECRET DATA!\n';
          for (let i = 0; i < fundSettings.users.length; i++) {
            adminInfo +=
              '◾️ ' +
              fundSettings.users[i].name +
              ' ▪️ $' +
              (fundSettings.users[i].cdct * cdctPrice).toFixed(2) +
              '\n';
          }
          msgWithPersonalData += adminInfo;
        }

        bot.sendMessage(msg.chat.id, msgWithPersonalData);
      })
      .catch(err => {
        console.log('API call error:', err.message);
      });
  } else {
    bot.sendMessage(
      msg.chat.id,
      '⚠️ Unfortunately, your phone number (+' +
        usrRealPhNumber +
        ') is not registered in the database. The function of personal information for this number is not available, contact the administrator!'
    );
  }

  /*

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


  */
  //---------------------/REQUEST------------------------------------------
});
