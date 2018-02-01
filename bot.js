'use strict';

process.env['NTBA_FIX_319'] = 1;
const emoji = require('node-emoji');
const fs = require('fs');
const TelegramBot = require('node-telegram-bot-api');
const token = '510395439:AAHkx6_gsZoDTrwcJfRduTqJ9mnArkNQNRo';
const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/start/, msg => {
  const chatId = msg.chat.id;
  const greet = `Привет ${emoji.get('heart')} \nМеня зовут Добби. \
И я уже вычислил твой ID: ` + msg.chat.id + `. ${emoji.get('kiss')}\
\nСо мной ты можешь:\n${emoji.get('pushpin')}   сделать напоминалку(/donote);\n\
${emoji.get('book')}   прочитать книгу(/readbook);\n\
${emoji.get('frame_with_picture')}   посмотреть на гифку со мной(или нет)\
(/gif);\n${emoji.get('banana')}   banana(/banana).`;
  bot.sendMessage(chatId, greet);
});

bot.onText(/\/banana/, msg => {
  const chatId = msg.chat.id;
  const gif = '8.gif';
  const song = 'banana.mp3';
  bot.sendDocument(chatId, gif);
  bot.sendAudio(chatId, song);
  const timerId = setInterval(() => {
    bot.sendMessage(chatId, `${emoji.get('banana')}`);
  }, 3000);
  setTimeout(() =>  clearInterval(timerId), 60000);
});

function rand(n, m) {
  return Math.round(Math.random() * (m - n) + n);
}

bot.onText(/\/gif/, msg => {
  const chatId = msg.chat.id;
  const n = rand(1, 17);
  const gif = n + '.gif';
  bot.sendDocument(chatId, gif);
});

const rye = fs.readFileSync('ray.txt').toString();
const pages = rye.match(/[\S\s]{1,700}/g);

function getPagination(current) {
  const keys = [];
  if (current > 0) {
    keys.push({ text: `${emoji.get('arrow_left')}`,
      callback_data: (current - 1).toString() });
  }
  keys.push({ text: `-${current + 1}-`, callback_data: current.toString() });
  if (current < pages.length - 1) {
    keys.push({ text: `${emoji.get('arrow_right')}`,
      callback_data: (current + 1).toString() });
  }
  return {
    reply_markup: JSON.stringify({
      inline_keyboard: [ keys ]
    })
  };
}

bot.onText(/\/readbook/, msg => {
  const chatId = msg.chat.id;
  const bookInstr = `${emoji.get('book')}  Просто отправь сообщение:\n\n\
  /book 'номер страницы'\n\nИ я открою книгу Сэлинджера 'Над пропастью во ржи'\
   на нужной странице (доступных книг больше пока что нет, но будут (или нет \
  ${emoji.get('heart')} )).`;
  bot.sendMessage(chatId, bookInstr);
});

bot.onText(/\/book/, msg => {
  const message = msg.text;
  let number = parseInt(message.toString().split(' ')[1]) - 1;
  isNaN(number) ? number = 0 : number;
  bot.sendMessage(msg.chat.id, pages[number],
    getPagination(number));
});

bot.on('callback_query', message => {
  const msg = message.message;
  const editOptions = Object.assign({}, getPagination(parseInt(message.data)),
    { chat_id: msg.chat.id, message_id: msg.message_id });
  bot.editMessageText(pages[parseInt(message.data)], editOptions);
});

bot.onText(/\/donote/, msg => {
  const chatId = msg.chat.id;
  const noteInstr = `${emoji.get('pushpin')}  Просто отправь сообщение:\
  \n\nнапомни 'что-то' в 'ч:мм'\n\nИ я напомню тебе об этом.`;
  bot.sendMessage(chatId, noteInstr);
});

const notes = [];

bot.onText(/напомни (.+) в (.+)/, (msg, match) => {
  const userId = msg.chat.id;
  const text = match[1];
  const time = match[2];
  notes.push({ 'uid': userId, time, text });
  const cat = '14.gif';
  bot.sendDocument(userId, cat, { caption: `${emoji.get('heavy_check_mark')}\
  Обязательно напомню.\n (или нет ${emoji.get('upside_down_face')})` });
});

setInterval(() => {
  for (const i of notes) {
    const curDate = new Date().getHours() + ':' + new Date().getMinutes();
    if (i['time'] === curDate) {
      bot.sendMessage(i['uid'], 'Напоминаю, что вы должны: ' +
      i['text'] + ' сейчас.');
      notes.splice(i, 1);
    }
  }
}, 1000);
