# Card Game "Scooby"

## Welcome to Scooby
> This is one of the Race projects during FullStack marathon in Innovation campus. It is a web application that works as a card game.
> Project was created by @annatrubnikova - Fullstack, @DarunkaKa - Fullstack, @appol1nar1a - Designer UI/UX 

## Explaining the project and the database
This game works as usual card game, where you can:
1. Authorization:
    - Sign up
    - Sign in
    - Change your account information
    - Reset password
    - Change avatar
2. Game:
    - You can play with other person or computer
    - Game contains 20 different cards.
    - Cards contains information: name of a villian, points of attack, points of defense and price.
3. Chat:
    - There is also chat during the game.
    - You can send a message or receive it.
4. Rules:
    - At the beggining you have 20 hp, 10 cards and random amount of coins.
    - Your purpose is to leave an opponent without health.
    - Each card have information about itself on it: attack, defense and cost.
    - Defense only works when your hp is lower than 5.
5. Other features:
    - You can turn off or turn on music in main menu.
    - There is also statistics about you counts of wins and losses.

### Database:
We needed three tables for our database:

- First table Users. Simple table for storing info about users.

- Second table is chat_rooms. It stores correct information for choosing clothes type. It is done by us.

- Third table is Users_Item. It stores information about every user's clothes.

- Fourth table is Users_Outfits. It stores information about user's outfits.

- Fifth table is Outfits_Item. It manages to merge multiple items into one outfit.

<img src="https://i.imgur.com/VvUETnL.png">

## Start
First. You need to download Node JS and then run this command, which also download all dependecies.
```
npm install
```
Then just run this.
```
npm start
```
## Screenshots

| Home page | Rules |
| :---: |  :---: |
| <img src="https://i.imgur.com/qO3GWgj.png">  | <img src="https://i.imgur.com/4Ze9tDp.png">|


| Settings | Game with computer |
| :---: |  :---: |
| <img src="https://i.imgur.com/JlRK9TG.png">  | <img src="https://i.imgur.com/Hh6BX8f.png">|

## Cards
| Lord Infernicus | Dark Lilith |
| :---: |  :---: |
| <img src="https://i.imgur.com/6bSyotS.png">  | <img src="https://i.imgur.com/0wwzHkX.png">|

All cards designed by Polina Markova.
## Features

- HTML5
- CSS3
- JavaScript (Node JS)

